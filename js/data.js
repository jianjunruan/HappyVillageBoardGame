// Data access layer. Every page asks this module for data, so moving from a
// static JSON file to a real server later only means changing this file + config.js.
window.HVData = {
  async getGames() {
    const { apiBase } = window.HV_CONFIG;
    const url = apiBase ? `${apiBase}/games` : "data/games.json";
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error(`Could not load games (${res.status})`);
    const body = await res.json();
    return Array.isArray(body) ? body : body.games || [];
  },
};
