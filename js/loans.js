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
    saveSession({
      access: data.access_token,
      refresh: data.refresh_token,
      expires: Date.now() + data.expires_in * 1000,
      email: data.user && data.user.email,
    });
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
    const headers = { apikey: supabaseAnonKey, "Content-Type": "application/json" };
    if (admin) headers.Authorization = `Bearer ${await accessToken()}`;
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

  return {
    enabled,
    get user() {
      return session && session.email;
    },
    signIn: (email, password) => signInWith("password", { email, password }),
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
