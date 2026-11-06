// Site configuration.
// Phase 1 (GitHub Pages): apiBase is null, so games are read from data/games.json.
// Phase 2 (Lightsail server): set apiBase to your API URL, e.g. "https://api.happyvillage.example/api",
// and the site will load games (and later events) from the server instead.
// Site name and other interface text live in js/i18n.js.
window.HV_CONFIG = {
  apiBase: null,

  // Board game loans (Supabase). Copy both values from Supabase → Project Settings → API Keys / Data API.
  // supabaseAnonKey: the "publishable" key (sb_publishable_…) or the legacy "anon public" key. Never the secret/service_role key.
  // The anon key is meant to be public: the database rules in supabase/schema.sql decide who can change loans.
  // Leave them empty to hide the loan feature. Setup steps: docs/SUPABASE.md
  supabaseUrl: "https://arsqwtojjoeoriinbmiq.supabase.co",
  supabaseAnonKey: "sb_publishable_M-oaWVq6dgi8UbHreUJd2A_glWug8LE",
};
