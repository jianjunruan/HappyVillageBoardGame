# Happy Village Board Games 🎲

A board game catalogue for the Happy Village club. Every game has a name, picture, description and links. YouTube and Google Drive videos play right on the page.

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
| `name` | yes | Shown on the card. |
| `image` | no | A repo path (`images/catan.jpg`) or a Google Drive / web image URL. |
| `description` | no | Line breaks (`\n`) are kept. |
| `players`, `playtime`, `age` | no | Free text, e.g. `3–4`, `60 min`, `10+`. |
| `tags` | no | Used by the filter buttons, e.g. `["Strategy", "Family"]`. |
| `links` | no | A list of `{ "label": "...", "url": "..." }`. |

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
# Option A: Python
python -m http.server 8000
# then open http://localhost:8000

# Option B: VS Code "Live Server" extension → right-click index.html → Open with Live Server
```

You can also put the folder in `C:\xampp\htdocs\` and open `http://localhost/HappyVillageBoardGame/`.

## Project structure

```
index.html          Game catalogue (search, tag filter, detail popup)
css/style.css       Styles (light and dark mode)
js/config.js        Site settings. Set apiBase here when the Phase 2 server exists
js/data.js          Data loading (JSON file now, server API later)
js/media.js         YouTube / Google Drive link → embed conversion
js/app.js           Page logic
data/games.json     ← the game list you edit
images/             Game pictures
admin/editor.html   Form that generates a games.json entry
docs/ROADMAP.md     Phase 2 plan: events, accounts, guest registration, admin
```
