#!/usr/bin/env node
// Raises the site version by one step and refreshes every page's cache-busting links.
//
//   node scripts/bump-version.mjs          1.1.0 → 1.1.1 … 1.1.9 → 1.2.0 … 1.9.9 → 2.0.0
//   node scripts/bump-version.mjs --check  only prints the current and next version
//
// What it changes:
//   - js/config.js: version: "X.Y.Z" (shown at the bottom of every page as "欢乐小镇 vX.Y.Z")
//   - every *.html (and admin/*.html): each local .js / .css link gets ?v=X.Y.Z, so phones load the new files
//     instead of old cached ones.
// Run it once per change (one pull request = one step), before committing.
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const configPath = join(root, "js/config.js");
const config = readFileSync(configPath, "utf8");
const m = config.match(/version:\s*"(\d+)\.(\d+)\.(\d+)"/);
if (!m) {
  console.error("No version: \"X.Y.Z\" found in js/config.js");
  process.exit(1);
}
let [major, minor, patch] = m.slice(1).map(Number);
const current = `${major}.${minor}.${patch}`;
// Each digit after the first counts 0–9; 9 rolls over into the digit before it.
patch++;
if (patch > 9) {
  patch = 0;
  minor++;
  if (minor > 9) {
    minor = 0;
    major++;
  }
}
const next = `${major}.${minor}.${patch}`;

if (process.argv.includes("--check")) {
  console.log(`current ${current} → next ${next}`);
  process.exit(0);
}

writeFileSync(configPath, config.replace(m[0], `version: "${next}"`));

// Local scripts and stylesheets (not http(s):// or //cdn links), with or without an old ?v=…
const LINK = /((?:src|href)=")((?!https?:|\/\/)[^"?#]+\.(?:js|css))(?:\?[^"#]*)?(")/g;
const pages = [
  ...readdirSync(root).filter((f) => f.endsWith(".html")).map((f) => join(root, f)),
  ...(existsSync(join(root, "admin")) ? readdirSync(join(root, "admin")).filter((f) => f.endsWith(".html")).map((f) => join(root, "admin", f)) : []),
];
let links = 0;
for (const page of pages) {
  const html = readFileSync(page, "utf8");
  const out = html.replace(LINK, (_, a, path, z) => {
    links++;
    return `${a}${path}?v=${next}${z}`;
  });
  if (out !== html) writeFileSync(page, out);
}
console.log(`version ${current} → ${next} (${links} links in ${pages.length} pages)`);
