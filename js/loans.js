// Board game loans, stored in Supabase (setup: docs/SUPABASE.md, tables: supabase/schema.sql).
// Talks to Supabase's REST API with plain fetch, so no extra library is needed.
// Until config.js has supabaseUrl and supabaseAnonKey, `enabled` is false and the site hides loans.
window.HVLoans = (() => {
  const { supabaseUrl, supabaseAnonKey } = window.HV_CONFIG;
  const enabled = Boolean(supabaseUrl && supabaseAnonKey);
  // Just the project address; a pasted ".../rest/v1/" ending is removed.
  const base = (supabaseUrl || "").replace(/\/+$/, "").replace(/\/(rest|auth)\/v1$/, "");
  const STORE_KEY = "hv-admin-session";
  const LOAN_FIELDS = "id,game_id,borrower,quantity,loaned_at,due_date,returned_at";
  // Rulebooks live in the public Storage bucket "rulebooks", one PDF per game: <game id>.pdf
  const RULEBOOKS = "rulebooks";
  const RULEBOOK_MAX = 50 * 1024 * 1024; // the free plan's per-file limit
  const rulebookPath = (gameId) => `${RULEBOOKS}/${encodeURIComponent(gameId)}.pdf`;
  // Event organizers (负责人) and their QR code pictures.
  const STAFF_FIELDS = "id,name,phone,wechat,xhs,wechat_qr,xhs_qr";
  const QR_BUCKET = "staff-qr";

  function readSession() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY));
    } catch {
      return null;
    }
  }
  function saveSession(s) {
    session = s;
    try {
      s ? localStorage.setItem(STORE_KEY, JSON.stringify(s)) : localStorage.removeItem(STORE_KEY);
    } catch {}
  }
  let session = readSession();

  async function parse(res) {
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {}
    if (!res.ok) {
      const err = new Error((data && (data.error_description || data.msg || data.message || data.error)) || `HTTP ${res.status}`);
      err.status = res.status;
      err.code = data && data.code; // e.g. "HVC01" = not enough sets left, "HVC02" = fewer sets than on loan, "42501" = not an admin
      throw err;
    }
    return data;
  }

  async function signInWith(grant, body) {
    const res = await fetch(`${base}/auth/v1/token?grant_type=${grant}`, {
      method: "POST",
      headers: { apikey: supabaseAnonKey, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await parse(res);
    keepSession(data);
  }
  function keepSession(data) {
    saveSession({
      access: data.access_token,
      refresh: data.refresh_token,
      expires: Date.now() + Number(data.expires_in || 3600) * 1000,
      email: data.user && data.user.email,
      id: data.user && data.user.id,
    });
  }
  // The signed-in user's id: saved at sign-in, or read from the token for sign-ins saved by older versions.
  function userIdOf(s) {
    if (!s) return null;
    if (s.id) return s.id;
    try {
      const part = s.access.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(decodeURIComponent(escape(atob(part)))).sub || null;
    } catch {
      return null;
    }
  }
  // Auth API calls (sign-up, password reset); redirectTo is where the email link opens.
  async function auth(path, { method = "POST", body, token, redirectTo } = {}) {
    const headers = { apikey: supabaseAnonKey, "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    const q = redirectTo ? `${path.includes("?") ? "&" : "?"}redirect_to=${encodeURIComponent(redirectTo)}` : "";
    return parse(await fetch(`${base}/auth/v1${path}${q}`, { method, headers, body: body ? JSON.stringify(body) : undefined }));
  }

  // Refreshes the login a minute before it expires; a failed refresh signs the admin out.
  async function accessToken() {
    if (!session) throw Object.assign(new Error("Not signed in"), { status: 401 });
    if (Date.now() > session.expires - 60000) {
      try {
        await signInWith("refresh_token", { refresh_token: session.refresh });
      } catch (e) {
        saveSession(null);
        throw e;
      }
    }
    return session.access;
  }

  // { present, storage, withOwner, owner } -> a game_copies row. A blank owner is stored as null.
  function toRow(gameId, { present = 0, storage = 0, withOwner = 0, owner = "", rulebookFrom = null }) {
    const name = String(owner || "").trim();
    return {
      game_id: gameId,
      copies: present + storage + withOwner,
      storage_copies: storage,
      owner_copies: withOwner,
      owner: name || null,
      rulebook_from: rulebookFrom ?? null, // null = default from games.json, "" = none
    };
  }

  async function request(path, { method = "GET", body, admin = false, prefer } = {}) {
    // Public reads send only the apikey header, which works with both the newer publishable key (sb_publishable_…)
    // and the legacy anon key. Admin calls add the signed-in user's token.
    // admin: "ifSignedIn" sends the token only when someone is signed in (for reads admins see more of).
    const headers = { apikey: supabaseAnonKey, "Content-Type": "application/json" };
    if (admin === "ifSignedIn") {
      if (session) {
        try {
          headers.Authorization = `Bearer ${await accessToken()}`;
        } catch {}
      }
    } else if (admin) headers.Authorization = `Bearer ${await accessToken()}`;
    if (prefer) headers.Prefer = prefer;
    const res = await fetch(base + path, { method, headers, body: body ? JSON.stringify(body) : undefined, cache: "no-store" });
    return parse(res);
  }

  // Storage API calls. Uploads send the file itself, not JSON.
  async function storage(path, { method = "GET", admin = false, json, body, headers: extra = {} } = {}) {
    const headers = { apikey: supabaseAnonKey, ...extra };
    if (admin) headers.Authorization = `Bearer ${await accessToken()}`;
    // The legacy anon key is a JWT and Storage also expects it as the bearer token; publishable keys go in apikey only.
    else if (/^eyJ/.test(supabaseAnonKey)) headers.Authorization = `Bearer ${supabaseAnonKey}`;
    if (json !== undefined) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(json);
    }
    return parse(await fetch(base + "/storage/v1" + path, { method, headers, body, cache: "no-store" }));
  }

  // Deletes one row as an admin. "select=id" keeps the reply to columns the website may read.
  async function adminDelete(table, id) {
    const rows = await request(`/rest/v1/${table}?id=eq.${encodeURIComponent(id)}&select=id`, {
      method: "DELETE",
      admin: true,
      prefer: "return=representation",
    });
    if (!rows.length) throw Object.assign(new Error("Nothing deleted"), { code: "nothing-updated" });
  }

  return {
    enabled,
    get user() {
      return session && session.email;
    },
    get userId() {
      return userIdOf(session);
    },
    signIn: (email, password) => signInWith("password", { email, password }),
    // ---------- player accounts ----------
    // Returns { signedIn: true } when the account can be used at once, or { confirm: true } when Supabase sent a
    // confirmation email first (the "Confirm email" setting).
    async signUp(email, password, redirectTo) {
      const data = await auth("/signup", { body: { email, password }, redirectTo });
      if (data && data.access_token) {
        keepSession(data);
        return { signedIn: true };
      }
      return { confirm: true };
    },
    // Sends a password reset email; its link opens redirectTo signed in, to choose a new password.
    sendPasswordReset: (email, redirectTo) => auth("/recover", { body: { email }, redirectTo }),
    // After an email link (sign-up confirmation or password reset) the address ends with
    // #access_token=…&refresh_token=…&type=signup|recovery. Signs in from it and returns the type, or null.
    async signInFromLink(hash) {
      const h = new URLSearchParams(String(hash || "").replace(/^#/, ""));
      if (h.get("error_description")) throw Object.assign(new Error(h.get("error_description")), { code: "link-error" });
      const access = h.get("access_token");
      if (!access) return null;
      const user = await auth("/user", { method: "GET", token: access });
      keepSession({ access_token: access, refresh_token: h.get("refresh_token"), expires_in: h.get("expires_in"), user });
      return h.get("type") || "signup";
    },
    async changePassword(password) {
      await auth("/user", { method: "PUT", token: await accessToken(), body: { password } });
    },
    // Profiles: { user_id, name, aliases: [], bio }. null when the player hasn't made one yet.
    async profile(userId) {
      const rows = await request(`/rest/v1/profiles?user_id=eq.${encodeURIComponent(userId)}&select=user_id,name,aliases,bio,created_at`);
      return rows[0] || null;
    },
    // Saves the signed-in player's profile: { name, aliases, bio }.
    async saveProfile(fields, exists) {
      const id = userIdOf(session);
      const rows = await request(exists ? `/rest/v1/profiles?user_id=eq.${encodeURIComponent(id)}&select=user_id,name,aliases,bio,created_at` : "/rest/v1/profiles?select=user_id,name,aliases,bio,created_at", {
        method: exists ? "PATCH" : "POST",
        admin: true,
        prefer: "return=representation",
        body: exists ? fields : { user_id: id, ...fields },
      });
      if (!rows.length) throw Object.assign(new Error("Nothing saved"), { code: "nothing-updated" });
      return rows[0];
    },
    // Every saved game record with one of these player names, newest first.
    playerScores: (names) => request("/rest/v1/rpc/player_scores", { method: "POST", body: { p_names: names } }),
    // The signed-in player's event sign-ups, and their sign-up ids at one event.
    mySignups: () => request("/rest/v1/rpc/my_event_signups", { method: "POST", admin: true, body: {} }),
    myEventPlayerIds: (eventId) => request("/rest/v1/rpc/my_event_player_ids", { method: "POST", admin: true, body: { p_event: eventId } }),
    signOut() {
      if (session) {
        fetch(`${base}/auth/v1/logout`, {
          method: "POST",
          headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${session.access}` },
        }).catch(() => {});
      }
      saveSession(null);
    },
    // True if the signed-in account is in public.admins (asks the database, so it can't be faked in the browser).
    async isAdmin() {
      return (await request("/rest/v1/rpc/is_admin", { method: "POST", admin: true, body: {} })) === true;
    },
    // Open loans grouped by game id, oldest first: { "catan": [{ id, borrower, quantity, loaned_at, due_date }, ...], ... }
    async active() {
      const rows = await request(`/rest/v1/loans?returned_at=is.null&order=loaned_at.asc&select=${LOAN_FIELDS}`);
      const byGame = {};
      for (const r of rows) (byGame[r.game_id] ||= []).push(r);
      return byGame;
    },
    // Sets per location and the owner, saved by an admin:
    // { "catan": { present: 1, storage: 1, withOwner: 0, owner: "" }, ... }. Games not listed have 1 set, present.
    async gameInfo() {
      const rows = await request("/rest/v1/game_copies?select=game_id,copies,storage_copies,owner_copies,owner,rulebook_from");
      return Object.fromEntries(
        rows.map((r) => [
          r.game_id,
          {
            present: r.copies - r.storage_copies - (r.owner_copies || 0),
            storage: r.storage_copies,
            withOwner: r.owner_copies || 0,
            owner: r.owner || "",
            rulebookFrom: r.rulebook_from, // null = default from games.json, "" = none, else a game id
          },
        ])
      );
    },
    // Saves many games in one request: [{ game_id, present, storage, withOwner, owner }, ...]. All or nothing: if one row is
    // refused (e.g. fewer sets than are on loan), none are saved.
    async saveGameInfoMany(rows) {
      if (!rows.length) return;
      await request("/rest/v1/game_copies?on_conflict=game_id", {
        method: "POST",
        admin: true,
        prefer: "resolution=merge-duplicates,return=minimal",
        body: rows.map((r) => toRow(r.game_id, r)),
      });
    },
    async saveGameInfo(gameId, sets) {
      await request("/rest/v1/game_copies?on_conflict=game_id", {
        method: "POST",
        admin: true,
        prefer: "resolution=merge-duplicates,return=minimal",
        body: toRow(gameId, sets),
      });
    },
    // Rulebooks that exist: { "catan": { updated: "2026-11-06T…", size: 1234567 }, ... }
    async rulebooks() {
      const items = await storage(`/object/list/${RULEBOOKS}`, {
        method: "POST",
        json: { prefix: "", limit: 1000, offset: 0, sortBy: { column: "name", order: "asc" } },
      });
      const out = {};
      for (const it of items || []) {
        if (!/\.pdf$/i.test(it.name) || !it.id) continue; // skip folders
        out[decodeURIComponent(it.name.replace(/\.pdf$/i, ""))] = { updated: it.updated_at, size: it.metadata && it.metadata.size };
      }
      return out;
    },
    // Public link; "?v=" changes when the file is replaced, so browsers don't show an old copy.
    rulebookUrl(gameId, info) {
      const v = info && info.updated ? `?v=${Date.parse(info.updated)}` : "";
      return `${base}/storage/v1/object/public/${rulebookPath(gameId)}${v}`;
    },
    // Uploads (or replaces) a game's rulebook. Admins only (Storage policies in schema.sql).
    async uploadRulebook(gameId, file) {
      if (!file) throw Object.assign(new Error("No file"), { code: "rulebook-none" });
      if (file.type !== "application/pdf" && !/\.pdf$/i.test(file.name)) throw Object.assign(new Error("Not a PDF"), { code: "rulebook-not-pdf" });
      if (file.size > RULEBOOK_MAX) throw Object.assign(new Error("Too big"), { code: "rulebook-too-big" });
      await storage(`/object/${rulebookPath(gameId)}`, {
        method: "POST",
        admin: true,
        body: file,
        headers: { "Content-Type": "application/pdf", "x-upsert": "true", "cache-control": "max-age=300" },
      });
    },
    async deleteRulebook(gameId) {
      await storage(`/object/${rulebookPath(gameId)}`, { method: "DELETE", admin: true });
    },
    history: (gameId, limit = 10) =>
      request(`/rest/v1/loans?game_id=eq.${encodeURIComponent(gameId)}&order=loaned_at.desc&limit=${limit}&select=${LOAN_FIELDS}`),
    // loanedAt: an ISO timestamp to backdate the loan; leave it out for "now".
    async lend(gameId, borrower, dueDate, quantity = 1, loanedAt = null) {
      const rows = await request("/rest/v1/loans", {
        method: "POST",
        admin: true,
        prefer: "return=representation",
        body: { game_id: gameId, borrower, due_date: dueDate || null, quantity, ...(loanedAt ? { loaned_at: loanedAt } : {}) },
      });
      return rows[0];
    },
    // Score records (table game_scores), newest first. Anyone can read and save; only admins can change or delete.
    scores: (gameId, limit = 500) =>
      request(`/rest/v1/game_scores?game_id=eq.${encodeURIComponent(gameId)}&order=played_at.desc&limit=${limit}` +
        "&select=id,game_id,played_at,played_on,details,target,players,rounds,winner,top_score,round_count"),
    // record: { game_id, target, players: [{ name, total }], rounds: [[{ s, b, f }, ...], ...], winner, top_score, round_count }
    async saveScore(record) {
      const rows = await request("/rest/v1/game_scores", { method: "POST", prefer: "return=representation", body: record });
      return rows[0];
    },
    // changes: any of { played_on, details, target, players, rounds, winner, top_score, round_count }
    async updateScore(id, changes) {
      const rows = await request(`/rest/v1/game_scores?id=eq.${encodeURIComponent(id)}`, {
        method: "PATCH",
        admin: true,
        prefer: "return=representation",
        body: changes,
      });
      if (!rows.length) throw Object.assign(new Error("Nothing updated"), { code: "nothing-updated" });
      return rows[0];
    },
    async deleteScore(id) {
      const rows = await request(`/rest/v1/game_scores?id=eq.${encodeURIComponent(id)}`, {
        method: "DELETE",
        admin: true,
        prefer: "return=representation",
      });
      if (!rows.length) throw Object.assign(new Error("Nothing deleted"), { code: "nothing-updated" });
    },
    // ---------- events and sign-ups (events.html) ----------
    // Every event with its tables and how many joined each: [{ id, title, event_date, start_time, end_time, location, description,
    // event_tables: [{ id, on_site, max_players, event_players: [{ id }] }] }], soonest first.
    events: () =>
      request("/rest/v1/events?order=event_date.asc,start_time.asc.nullsfirst,id.asc" +
        "&select=id,title,event_date,start_time,end_time,location,description,event_tables(id,game_id,game_name,on_site,max_players,event_players(id))"),
    // The next upcoming events (from `fromDay`, "YYYY-MM-DD"), with their tables and main organizer, for the home page.
    upcomingEvents: (fromDay, limit = 2) =>
      request(`/rest/v1/events?event_date=gte.${fromDay}&order=event_date.asc,start_time.asc.nullsfirst,id.asc&limit=${limit}` +
        "&select=id,title,event_date,start_time,end_time,location,event_tables(id,event_players(id)),event_staff(is_lead,sort,staff(name))"),
    // One event with its tables, players and organizers, or null. Organizers are null for visitors once the event is
    // over (see the staff policy in schema.sql).
    async event(id) {
      const rows = await request(`/rest/v1/events?id=eq.${encodeURIComponent(id)}` +
        "&select=id,title,event_date,start_time,end_time,location,map_url,description," +
        "event_tables(id,game_id,game_name,on_site,max_players,note,created_at,start_time,host_player,event_players(id,name,joined_at))," +
        "event_staff(is_lead,sort,staff(id,name,phone,wechat,xhs,wechat_qr,xhs_qr))", { admin: "ifSignedIn" });
      const ev = rows[0] || null;
      if (ev) {
        ev.event_staff = (ev.event_staff || []).sort((a, b) => b.is_lead - a.is_lead || a.sort - b.sort);
        // Earliest start first; tables without a start time after those, in the order they were opened.
        ev.event_tables.sort(
          (a, b) => (a.start_time == null) - (b.start_time == null) || (a.start_time || "").localeCompare(b.start_time || "") ||
            a.created_at.localeCompare(b.created_at) || a.id - b.id
        );
        for (const t of ev.event_tables) t.event_players.sort((a, b) => a.joined_at.localeCompare(b.joined_at) || a.id - b.id);
      }
      return ev;
    },
    // fields: { title, event_date, start_time, end_time, location, map_url, description }. With an id it changes that event. Admins only.
    async saveEvent(fields, id = null) {
      const rows = await request(id ? `/rest/v1/events?id=eq.${encodeURIComponent(id)}` : "/rest/v1/events", {
        method: id ? "PATCH" : "POST",
        admin: true,
        prefer: "return=representation",
        body: fields,
      });
      if (!rows.length) throw Object.assign(new Error("Nothing saved"), { code: "nothing-updated" });
      return rows[0];
    },
    deleteEvent: (id) => adminDelete("events", id),
    // table: { game_id, game_name, on_site, max_players, note, start_time ("HH:MM" or null) }. Returns { table_id, player_id }.
    openTable: (eventId, table, name, token) =>
      request("/rest/v1/rpc/open_event_table", {
        method: "POST",
        admin: "ifSignedIn",
        body: {
          p_event: eventId,
          p_game_id: table.game_id || null,
          p_game_name: table.game_name,
          p_on_site: Boolean(table.on_site),
          p_max_players: table.max_players || null,
          p_note: table.note || "",
          p_name: name,
          p_token: token,
          p_start_time: table.start_time || null,
        },
      }),
    // Changes a table's start time ("HH:MM" or null) as its current host. Returns false if this browser isn't the host.
    setTableTime: (tableId, token, time) =>
      request("/rest/v1/rpc/set_event_table_time", { method: "POST", admin: "ifSignedIn", body: { p_table: tableId, p_token: token, p_start_time: time || null } }),
    // Deletes a table this browser (or signed-in account) is the host of. Returns false if it isn't.
    deleteOwnTable: (tableId, token) =>
      request("/rest/v1/rpc/delete_event_table", { method: "POST", admin: "ifSignedIn", body: { p_table: tableId, p_token: token } }),
    // Returns the new player id.
    joinTable: (tableId, name, token) =>
      request("/rest/v1/rpc/join_event_table", { method: "POST", admin: "ifSignedIn", body: { p_table: tableId, p_name: name, p_token: token } }),
    // Returns true if this browser's sign-up was removed. A host can name the player who takes over (nextId);
    // without one, the next person who joined does.
    leaveTable: (playerId, token, nextId) =>
      request("/rest/v1/rpc/leave_event_table", {
        method: "POST",
        admin: "ifSignedIn",
        body: nextId ? { p_player: playerId, p_token: token, p_next: nextId } : { p_player: playerId, p_token: token },
      }),
    // ---------- event wishes (期望活动) ----------
    // Most "+1" votes first, then newest: [{ id, name, title, description, status: "open" | "adopted" | "rejected",
    // votes, created_at }]. Optional limit.
    wishes: (limit) =>
      request("/rest/v1/event_wishes?select=id,name,title,description,status,votes,created_at&order=votes.desc,created_at.desc,id.desc" + (limit ? `&limit=${limit}` : "")),
    // Anyone (the browser's secret, and the account when signed in, let them change or delete it later). Returns the new id.
    addWish: (name, title, description, token) =>
      request("/rest/v1/rpc/add_event_wish", { method: "POST", admin: "ifSignedIn", body: { p_name: name, p_title: title, p_description: description, p_token: token } }),
    // The person who suggested it. Return false if this browser / account didn't suggest it.
    updateWish: (id, name, title, description, token) =>
      request("/rest/v1/rpc/update_event_wish", { method: "POST", admin: "ifSignedIn", body: { p_wish: id, p_token: token, p_name: name, p_title: title, p_description: description } }),
    deleteOwnWish: (id, token) =>
      request("/rest/v1/rpc/delete_event_wish", { method: "POST", admin: "ifSignedIn", body: { p_wish: id, p_token: token } }),
    // "我也想参加 +1": adds this browser's / account's vote, or takes it back. Returns { voted, votes }.
    toggleWishVote: (id, token) =>
      request("/rest/v1/rpc/toggle_event_wish_vote", { method: "POST", admin: "ifSignedIn", body: { p_wish: id, p_token: token } }),
    // Which wishes this browser / account suggested and voted for: { mine: [ids], voted: [ids] }.
    wishState: (token) => request("/rest/v1/rpc/my_event_wish_state", { method: "POST", admin: "ifSignedIn", body: { p_token: token } }),
    // Admins: adopt ("adopted"), decline ("rejected") or undecided again ("open"), or delete.
    async setWishStatus(id, status) {
      const rows = await request(`/rest/v1/event_wishes?id=eq.${encodeURIComponent(id)}&select=id`, { method: "PATCH", admin: true, prefer: "return=representation", body: { status } });
      if (!rows.length) throw Object.assign(new Error("Nothing updated"), { code: "nothing-updated" });
    },
    deleteWish: (id) => adminDelete("event_wishes", id),
    // Admins: make another player at the table its host. Returns false if that player isn't at the table (any more).
    setTableHost: (tableId, playerId) =>
      request("/rest/v1/rpc/set_event_table_host", { method: "POST", admin: true, body: { p_table: tableId, p_player: playerId } }),
    // Admins: change a table (any of { game_name, on_site, max_players, note }), remove a table or one player.
    async updateTable(id, changes) {
      const rows = await request(`/rest/v1/event_tables?id=eq.${encodeURIComponent(id)}&select=id`, {
        method: "PATCH",
        admin: true,
        prefer: "return=representation",
        body: changes,
      });
      if (!rows.length) throw Object.assign(new Error("Nothing updated"), { code: "nothing-updated" });
    },
    deleteTable: (id) => adminDelete("event_tables", id),
    removePlayer: (id) => adminDelete("event_players", id),
    // ---------- event organizers (负责人), admins only ----------
    staffList: () => request(`/rest/v1/staff?select=${STAFF_FIELDS}&order=name.asc,id.asc`, { admin: true }),
    // fields: { name, phone, wechat, xhs, wechat_qr, xhs_qr }. With an id it changes that person.
    async saveStaff(fields, id = null) {
      const rows = await request(id ? `/rest/v1/staff?id=eq.${encodeURIComponent(id)}&select=${STAFF_FIELDS}` : `/rest/v1/staff?select=${STAFF_FIELDS}`, {
        method: id ? "PATCH" : "POST",
        admin: true,
        prefer: "return=representation",
        body: fields,
      });
      if (!rows.length) throw Object.assign(new Error("Nothing saved"), { code: "nothing-updated" });
      return rows[0];
    },
    deleteStaff: (id) => adminDelete("staff", id),
    // Event templates (a saved name, description, times, place and map link), admins only.
    templates: () => request("/rest/v1/event_templates?select=id,title,description,start_time,end_time,location,map_url&order=title.asc,id.asc", { admin: true }),
    // fields: { title, description, start_time, end_time, location, map_url }. With an id it replaces that template.
    async saveTemplate(fields, id = null) {
      const body = id ? { ...fields, updated_at: new Date().toISOString() } : fields;
      const rows = await request(id ? `/rest/v1/event_templates?id=eq.${encodeURIComponent(id)}&select=id,title,description,start_time,end_time,location,map_url` : "/rest/v1/event_templates?select=id,title,description,start_time,end_time,location,map_url", {
        method: id ? "PATCH" : "POST",
        admin: true,
        prefer: "return=representation",
        body,
      });
      if (!rows.length) throw Object.assign(new Error("Nothing saved"), { code: "nothing-updated" });
      return rows[0];
    },
    deleteTemplate: (id) => adminDelete("event_templates", id),
    // One main organizer and the deputies (in order) for an event.
    setEventStaff: (eventId, leadId, deputyIds) =>
      request("/rest/v1/rpc/set_event_staff", { method: "POST", admin: true, body: { p_event: eventId, p_lead: leadId, p_deputies: deputyIds } }),
    // QR code pictures in the public "staff-qr" bucket, under random names. Returns the stored name.
    async uploadQr(blob) {
      const ext = blob.type === "image/png" ? "png" : blob.type === "image/webp" ? "webp" : "jpg";
      const bytes = new Uint8Array(12);
      crypto.getRandomValues(bytes);
      const name = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("") + "." + ext;
      await storage(`/object/${QR_BUCKET}/${name}`, {
        method: "POST",
        admin: true,
        body: blob,
        headers: { "Content-Type": blob.type || "image/jpeg", "cache-control": "max-age=31536000" },
      });
      return name;
    },
    deleteQr: (name) => storage(`/object/${QR_BUCKET}/${encodeURIComponent(name)}`, { method: "DELETE", admin: true }),
    qrUrl: (name) => `${base}/storage/v1/object/public/${QR_BUCKET}/${encodeURIComponent(name)}`,
    async returnLoan(loanId) {
      const rows = await request(`/rest/v1/loans?id=eq.${encodeURIComponent(loanId)}&returned_at=is.null`, {
        method: "PATCH",
        admin: true,
        prefer: "return=representation",
        body: { returned_at: new Date().toISOString() },
      });
      // No row back means it was already returned, or this account isn't an admin.
      if (!rows.length) throw Object.assign(new Error("Nothing updated"), { code: "nothing-updated" });
      return rows[0];
    },
  };
})();
