# Happy Village Board Games 🎲

A board game catalogue for the Happy Village club. Every game has a name, picture, description and links. YouTube and Google Drive videos play right on the page.

The site is bilingual. It opens in **Chinese (Simplified)** by default, and visitors switch with the **EN / 中文** button. Each browser remembers the choice. To share a link in a specific language, add `?lang=en` or `?lang=zh` to the URL.

**Phase 1 (now):** a static site hosted free on **GitHub Pages**. There's no server and no database.
**Phase 2 (later):** events and registration on a server (AWS Lightsail or similar). See [docs/ROADMAP.md](docs/ROADMAP.md).

---

## Publish on GitHub Pages

1. Create an empty repository on GitHub named **HappyVillageBoardGame**. Make it **Public**, because free GitHub Pages needs a public repo. Don't add a README.
2. Push this folder:
   ```bash
   git remote add origin https://github.com/<your-username>/HappyVillageBoardGame.git
   git push -u origin main
   ```
3. On GitHub, open **Settings → Pages**. Under *Build and deployment*, choose **Deploy from a branch**, then **main** and **/ (root)**, and click **Save**.
4. After a minute or two the site is live at
   `https://<your-username>.github.io/HappyVillageBoardGame/`

Each push to `main` updates the site within a minute or two.

## Add or edit a game

All games live in **`data/games.json`**.

1. Open `https://<your-username>.github.io/HappyVillageBoardGame/admin/editor.html`. You can also open `admin/editor.html` on your computer.
2. Fill in the form, then click **Copy**.
3. On GitHub, open `data/games.json`, click the ✏️ pencil, and paste the entry into the `"games"` list. Separate entries with a comma.
4. Click **Commit changes**. The site updates in about a minute.

### Fields

| Field | Required | Notes |
|---|---|---|
| `id` | yes | Unique, lowercase, dashes only (`ticket-to-ride`). Used in the share link `#/game/ticket-to-ride`. |
| `name` | yes | `{ "zh": "卡坦岛", "en": "Catan" }` |
| `image` | no | A repo path (`images/catan.jpg`) or a Google Drive / web image URL. |
| `description` | no | `{ "zh": "…", "en": "…" }`. Line breaks (`\n`) are kept. |
| `players` | no | Just the number, e.g. `"3–4"`. The site adds "人" or "players". |
| `playtime` | no | Minutes **per player**, numbers only, e.g. `"20"` or `"15–20"`. The site adds "分钟/人" or "min/player". |
| `category` | yes | `"euro"` (德式), `"american"` (美式), `"party"` (聚会), `"card"` (卡牌), `"abstract"` (抽象), `"family"` (亲子), `"puzzle"` (解谜), `"war"` (战棋) or `"roleplay"` (扮演). Decides which section the game appears in. Games without one show under "其他 / Other". |
| `weight` | yes | Difficulty on BGG's 1–5 scale (the "Weight" on the game's BoardGameGeek page), e.g. `2.9`. Groups the game into 入门 Light (under 2), 轻中度 Medium-light (2–2.75), 中重度 Medium-heavy (2.75–3.5) or 重度 Heavy (3.5+). |
| `series` | no | Keeps related games next to each other within a difficulty band: give the base game, its expansions and other editions the same value, normally the base game's `id` (e.g. `"terraforming-mars"`). The base game is shown first, then the rest by difficulty. |
| `scorer` | no | A scorer page for this game, shown as a **🧮 计分板 & 战绩记录** button in its popup, e.g. `"score.html?game=seti"` (shared scoreboard) or `"flip7.html"`. |
| `rulebookFrom` | no | Default rulebook sharing: the `id` of the game whose Happy Village rulebook this one also shows (e.g. an expansion → `"terraforming-mars"`). Admins can change it on the site (game popup → 🔗, or 库存管理), which overrides this value. |
| `age` | no | Minimum age only, e.g. `"10"`. The site adds "岁以上" or "Ages 10+". |
| `tags` | no | Tag keys, e.g. `["Strategy", "Family"]`. Translations live in the `"tags"` section at the top of the file. |
| `links` | no | A list of `{ "label": { "zh": "教学视频", "en": "How to play" }, "url": "..." }`. |

**Translations.** Any text field can be a plain string (`"name": "UNO"`) when it's the same in both languages, or a `{ "zh": …, "en": … }` pair. If a translation is missing, the site falls back to the other language.

**New tags.** Add each new tag once to the `"tags"` section at the top of `games.json`, for example `"Dice": { "zh": "骰子", "en": "Dice" }`. The entry helper generates this line for you.

**Interface text** (buttons, headings, messages) is in [js/i18n.js](js/i18n.js). To change the default language, edit `DEFAULT` there.

### Images
- **Best option:** upload the picture to the `images/` folder (on GitHub: *Add file → Upload files*). Then set `"image": "images/yourfile.jpg"`. A 4:3 ratio around 800×600 looks best.
- **Google Drive:** share the image as *Anyone with the link → Viewer* and paste the share link. The site converts it automatically.

### Videos and links
| Link you paste | What happens |
|---|---|
| `https://www.youtube.com/watch?v=…`, `https://youtu.be/…`, `/shorts/…` | Plays inside the page |
| `https://drive.google.com/file/d/…/view` | Plays inside the page (Google Drive preview player) |
| Anything else (PDF rules, BoardGameGeek page, etc.) | Shown as a link that opens in a new tab |

> **Google Drive videos must be shared as "Anyone with the link".** Otherwise visitors see a "request access" screen. Drive can take a while to process large videos before they play.

## Board game loans

The site can show which games are lent out and to whom, and admins can lend and return games from each game's popup. Admins sign in from the top-right button, which only appears when the address ends in `?admin=1`. Loans are stored in a free Supabase database. The feature stays hidden until `supabaseUrl` and `supabaseAnonKey` are set in `js/config.js`. Setup steps: [docs/SUPABASE.md](docs/SUPABASE.md).

Flip 7 has a round-by-round scorer ([flip7.html](flip7.html)). Other games use one shared scoreboard page, [score.html?game=<id>](score.html): each player's final score plus the game's own choices (e.g. 大创造时代's faction and terrain, SETI's organization, colour and alien species), with records, an overall leaderboard and a wins leaderboard. All are stored in the same Supabase project and linked from the game's popup through the `"scorer"` field. A game's choices are set in `js/scoreboards/<id>.js`.

Events ([events.html](events.html), the **📅 活动报名** button): admins publish events with a name, date, start and end time, place and description. The description can be formatted (font, size, bold, italic, underline, colour, alignment, lists; js/richtext.js). The place links to Google Maps: either a map link the admin pastes (e.g. a Google Maps share link) or, without one, a Google Maps search for the place. The name, description, times, place and map link can be saved as a template and filled in from one later. At an event, anyone can join a table or open a new one for a game from the catalogue, or type a game in. Each table shows whether the game is at the venue. On the day, the table host (or an admin) taps **▶ 开始对局**: the players at the table are saved as a game record at once (the host can untick people or add walk-ins). The host, admins and signed-in players in the game then fill in the scores, and the host can start further games at the table with different players. Each event has organizers in order (负责人1 required, then 负责人2, 负责人3 …), chosen from an organizer list that only admins can see; their phone, WeChat, Xiaohongshu and QR codes show on the event page. The home page shows the next 1–2 events at the top. Anyone can also suggest an event they would like (**💡 期望活动**: their name, the event name and a description); suggestions are listed on the events page and under the events on the home page, with a note that suggesting one does not mean it will be held. Anyone can add a **我也想参加 +1** vote (once per browser or account; the most-wanted are listed first). The person who suggested one can edit or delete it; admins can adopt (已采纳) or decline (未采纳) it, or delete it. Setup and details: [docs/SUPABASE.md](docs/SUPABASE.md#events-and-sign-ups-活动报名).

Player accounts ([account.html](account.html), the **👤 登录 / 注册** button): players sign up with an email and password and get a public profile ([profile.html](profile.html)) with a nickname and bio. The profile summarises their games from the scoreboards (matched by nickname and other names they've used): games played, wins, and per-game best and average scores, plus their event sign-ups. Setup: [docs/SUPABASE.md](docs/SUPABASE.md#player-accounts-and-profiles-注册--玩家主页).

## Run locally

The site loads `data/games.json` with `fetch`, so it won't work if you double-click `index.html`. Run a tiny web server instead:

```bash
# Option A: Node.js
npx serve .
# then open the address it prints (usually http://localhost:3000)

# Option B: VS Code "Live Server" extension → right-click index.html → Open with Live Server
```

You can also put the folder in `C:\xampp\htdocs\` and open `http://localhost/HappyVillageBoardGame/`.

## Project structure

```
index.html          Game catalogue (search, tag filter, detail popup)
flip7.html          Flip 7 scorer, game records and leaderboard (js/flip7.js, css/flip7.css)
events.html         Events and sign-ups: events.html, events.html?id=<id>, organizers: events.html?staff (js/events.js, css/events.css)
account.html        Player sign-in, sign-up, password reset (js/account.js, css/account.css)
profile.html        Player profile with bio and games summary: profile.html, profile.html?u=<id> (js/profile.js)
js/account-link.js  The 👤 登录 / 我的主页 button in page headers
js/home-events.js   The upcoming-events banner at the top of the home page
js/richtext.js      The formatted-description editor for events, and the cleaner that keeps only safe formatting
score.html          Scoreboard for any game: score.html?game=<id> (js/scoreboard.js, css/scoreboard.css)
js/scoreboards/     Each game's scoreboard choices (age-of-innovation.js, seti.js, ark-nova.js)
aoi.html            Old link; redirects to the 大创造时代 scoreboard
css/style.css       Styles (light and dark mode)
js/config.js        Site settings: Supabase connection for loans; apiBase for a future server
js/i18n.js          Chinese / English interface text and language switching
js/data.js          Data loading (JSON file now, server API later)
js/loans.js         Board game loans: reads/writes Supabase, admin sign-in
js/media.js         YouTube / Google Drive link → embed conversion
js/datepicker.js    Calendar date picker for every date field (css/datepicker.css)
js/app.js           Page logic
data/games.json     ← the game list you edit
images/             Game pictures
admin/inventory.html Admin list of all games: bulk-edit sets owned and location (Supabase)
admin/editor.html   Form that generates a games.json entry (admin sign-in required once Supabase is set up)
docs/ROADMAP.md     Phase 2 plan: events, accounts, guest registration, admin
docs/SUPABASE.md    How to set up the loans database
supabase/schema.sql Loan, inventory and score tables plus access rules (run in Supabase; safe to re-run)
```
