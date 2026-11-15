# HappyVillageBoardGame — notes for Claude

## Version number: raise it with every change (required)

The site version lives in `js/config.js` (`version: "X.Y.Z"`) and shows at the bottom of every page as
"欢乐小镇 vX.Y.Z". The owner wants it raised by one step **for every change**, without being asked:

- 1.1.0 → 1.1.1 → … → 1.1.9 → **1.2.0** → 1.2.1 … → 1.9.9 → **2.0.0** (each digit after the first runs 0–9 and
  rolls over into the one before it).
- One change = one step: bump once per pull request / change request, not once per commit. If more commits are
  added to a PR that is still open, don't bump again.
- How: run `node scripts/bump-version.mjs` before committing (`--check` only prints current → next). It updates
  `js/config.js` and sets `?v=X.Y.Z` on every local `.js` / `.css` link in `*.html` and `admin/*.html`, so phones
  load the new files instead of cached ones. Don't hand-edit `?v=` values.
- Say the new version in the PR description and in the reply to the owner (e.g. "版本 1.1.3 → 1.1.4").

## Other things to know

- Static site (GitHub Pages) + Supabase. Database changes go in `supabase/schema.sql`, which the owner re-runs
  in the Supabase SQL Editor; it must stay safe to re-run on the existing database. Tell the owner when a change
  needs it.
- The owner writes in Chinese and checks on a phone: keep UI text bilingual (zh first) and test at phone width.
