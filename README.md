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
| `playtime` | no | Minutes only, e.g. `"60–90"`. The site adds "分钟" or "min". |
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
css/style.css       Styles (light and dark mode)
js/config.js        Site settings. Set apiBase here when the Phase 2 server exists
js/i18n.js          Chinese / English interface text and language switching
js/data.js          Data loading (JSON file now, server API later)
js/media.js         YouTube / Google Drive link → embed conversion
js/app.js           Page logic
data/games.json     ← the game list you edit
images/             Game pictures
admin/editor.html   Form that generates a games.json entry
docs/ROADMAP.md     Phase 2 plan: events, accounts, guest registration, admin
```
