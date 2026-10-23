// Site configuration.
// Phase 1 (GitHub Pages): apiBase is null, so games are read from data/games.json.
// Phase 2 (Lightsail server): set apiBase to your API URL, e.g. "https://api.happyvillage.example/api",
// and the site will load games (and later events) from the server instead.
window.HV_CONFIG = {
  siteName: "Happy Village Board Games",
  apiBase: null,
};
