// Site configuration.
// Phase 1 (GitHub Pages): apiBase is null, so games are read from data/games.json.
// Phase 2 (Lightsail server): set apiBase to your API URL, e.g. "https://api.happyvillage.example/api",
// and the site will load games (and later events) from the server instead.
// Site name and other interface text live in js/i18n.js.
window.HV_CONFIG = {
  // The site's version, shown at the bottom of every page. Raised one step with every change by
  // `node scripts/bump-version.mjs` (1.1.0 → 1.1.1 … 1.1.9 → 1.2.0); see CLAUDE.md. Don't edit it by hand.
  version: "1.3.3",

  apiBase: null,

  // The live site's address: what the 分享 button shares and copies, and what the QR code in images/share-qr.png opens
  // (the image was made outside the repo; make a new one if this address ever changes).
  siteUrl: "https://jianjunruan.github.io/HappyVillageBoardGame/",

  // Board game loans (Supabase). Copy both values from Supabase → Project Settings → API Keys / Data API.
  // supabaseAnonKey: the "publishable" key (sb_publishable_…) or the legacy "anon public" key. Never the secret/service_role key.
  // The anon key is meant to be public: the database rules in supabase/schema.sql decide who can change loans.
  // Leave them empty to hide the loan feature. Setup steps: docs/SUPABASE.md
  supabaseUrl: "https://arsqwtojjoeoriinbmiq.supabase.co",
  supabaseAnonKey: "sb_publishable_M-oaWVq6dgi8UbHreUJd2A_glWug8LE",
};

// Shows "欢乐小镇 v1.1.0" at the bottom of every page: inside the page's footer when it has one, otherwise in a small
// footer of its own at the end of the page. Follows the language switch.
document.addEventListener("DOMContentLoaded", () => {
  const v = window.HV_CONFIG && HV_CONFIG.version;
  if (!v || document.querySelector(".site-version")) return;
  const tag = document.createElement("p");
  tag.className = "site-version";
  const paint = () => {
    const en = window.HVI18n && HVI18n.lang === "en";
    tag.textContent = `${en ? "Happy Village" : "欢乐小镇"} v${v}`;
  };
  paint();
  if (window.HVI18n && HVI18n.onChange) HVI18n.onChange(paint);
  const footer = document.querySelector(".site-footer");
  if (footer) footer.append(tag);
  else {
    const f = document.createElement("footer");
    f.className = "site-version-bar";
    f.append(tag);
    document.body.append(f);
  }
});
