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

  async function request(path, { method = "GET", body, admin = false, prefer } = {}) {
    // Public reads send only the apikey header, which works with both the newer publishable key (sb_publishable_…)
    // and the legacy anon key. Admin calls add the signed-in user's token.
    const headers = { apikey: supabaseAnonKey, "Content-Type": "application/json" };
    if (admin) headers.Authorization = `Bearer ${await accessToken()}`;
    if (prefer) headers.Prefer = prefer;
    const res = await fetch(base + path, { method, headers, body: body ? JSON.stringify(body) : undefined, cache: "no-store" });
    return parse(res);
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
    // Sets per location, saved by an admin: { "catan": { present: 1, storage: 1 }, ... }
    // Games not listed have 1 set, present.
    async gameInfo() {
      const rows = await request("/rest/v1/game_copies?select=game_id,copies,storage_copies");
      return Object.fromEntries(
        rows.map((r) => [r.game_id, { present: r.copies - r.storage_copies, storage: r.storage_copies }])
      );
    },
    // Saves many games in one request: [{ game_id, present, storage }, ...]. All or nothing: if one row is
    // refused (e.g. fewer sets than are on loan), none are saved.
    async saveGameInfoMany(rows) {
      if (!rows.length) return;
      await request("/rest/v1/game_copies?on_conflict=game_id", {
        method: "POST",
        admin: true,
        prefer: "resolution=merge-duplicates,return=minimal",
        body: rows.map((r) => ({ game_id: r.game_id, copies: r.present + r.storage, storage_copies: r.storage })),
      });
    },
    async saveGameInfo(gameId, { present, storage }) {
      await request("/rest/v1/game_copies?on_conflict=game_id", {
        method: "POST",
        admin: true,
        prefer: "resolution=merge-duplicates,return=minimal",
        body: { game_id: gameId, copies: present + storage, storage_copies: storage },
      });
    },
    history: (gameId, limit = 10) =>
      request(`/rest/v1/loans?game_id=eq.${encodeURIComponent(gameId)}&order=loaned_at.desc&limit=${limit}&select=${LOAN_FIELDS}`),
    async lend(gameId, borrower, dueDate, quantity = 1) {
      const rows = await request("/rest/v1/loans", {
        method: "POST",
        admin: true,
        prefer: "return=representation",
        body: { game_id: gameId, borrower, due_date: dueDate || null, quantity },
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
