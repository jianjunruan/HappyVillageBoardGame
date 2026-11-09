# Setting up board game loans (Supabase)

The site can show which games are on loan and who has them. Admins sign in on the site to lend games out and mark them returned. The loan records are stored in a free Supabase database; the rest of the site stays on GitHub Pages.

Until the two settings in step 4 are filled in, the loan feature is hidden and the site works exactly as before.

## 1. Create a Supabase project
1. Sign up at https://supabase.com (free plan).
2. Click **New project**. Choose a name (e.g. `happyvillage`) and set a database password (save it somewhere safe).
3. **Region:** click **Need a specific region?** and pick the one closest to your members (e.g. Southeast Asia / Singapore). It can't be changed later.
4. **Security:**
   - **Enable Data API:** on (the site needs it).
   - **Automatically expose new tables:** off (`schema.sql` opens only the loans table itself).
   - **Enable automatic RLS:** on (a safety net for any future tables).
5. Wait about a minute for the project to start.

## 2. Create the loans table
1. In the project, open **SQL Editor** → **New query**.
2. Paste the whole contents of [`supabase/schema.sql`](../supabase/schema.sql) and click **Run**. It should say "Success. No rows returned".

This creates:
- a `loans` table (one row per loan; `returned_at` is empty while the game is out),
- an `admins` list of who may lend and return games,
- rules so that **anyone can see loans** but **only admins can lend or return**. A game can't be lent out beyond the number of sets the club owns, and loan history can't be deleted from the website.

## 3. Create admin accounts
1. Go to **Authentication → Sign In / Providers** and turn **off** "Allow new users to sign up". Only accounts you create can sign in.
2. Go to **Authentication → Users → Add user → Create new user**. Enter the admin's email and a password, and tick **Auto Confirm User**.
3. Make that account an admin: in **SQL Editor**, run (with the real email):
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'admin@example.com';
   ```
Repeat steps 2–3 for each person who manages loans. To remove an admin: `delete from public.admins where user_id = (select id from auth.users where email = 'admin@example.com');`

## 4. Connect the website
1. Go to **Project Settings → API** (or **Data API**).
2. Copy the **Project URL** and the **anon public** key (not the `service_role` key, which must never be put on a website).
3. Paste them into [`js/config.js`](../js/config.js):
   ```js
   supabaseUrl: "https://abcdefghijklmnop.supabase.co",
   supabaseAnonKey: "eyJhbGciOi...",
   ```
4. Commit and push. The site now shows loan status.

The anon key is designed to be public. It only lets visitors do what the rules in `schema.sql` allow: read loans. Lending and returning still require an admin sign-in.

## Using it
- **Everyone** sees a red **已借出 · name** badge on games that are out, the status inside each game's popup, and a **可借 / 已借出** filter.
- **Admins** open the site with `?admin` added to the address, e.g. `https://<your-username>.github.io/HappyVillageBoardGame/?admin=1`, and click **管理员登录 / Admin sign in** at the top right, next to the language button. (Without `?admin` the button is hidden from visitors. Once signed in, it stays visible as **退出 / Sign out** on every visit until you sign out.) Then, in any game's popup:
  - **👤 拥有者 Owner** (optional free text, e.g. the member who lent the game to the club). Once an owner is filled in, a third place appears: **🏠 在拥有者处套数 Sets with owner**, for sets kept at the owner's. Clearing the owner moves those sets back to present.
  - **📍 在场套数 Sets present** and **📦 仓库套数 Sets in storage**: how many sets are at the venue and how many are in storage. Together they are the sets owned. Change them, then **保存 Save**. Games start at 1 set present. The total can't be lower than the number of sets currently on loan. Set both to **0** for a game the club no longer has (given away, lost or sold): it stays in the catalogue with a greyed-out picture, shows **⚪ 暂无（0 套）**, can't be lent, and appears under the **⚪ 暂无** filter.
  - **Lend:** enter the borrower's name, choose **借几套 Sets** (shown when more than one set is left) pick the **借出日期 Loan date** in the calendar (today by default; pick an earlier date to record a loan after the fact, future dates are greyed out) and optionally a due date (days before the loan date are greyed out; quick buttons for 一周后 / 两周后 / 一个月后, and **不设日期** clears it) → **借出 Lend out**. Each loan is its own record, so a game with several sets can be lent to several people at once. The form disappears when no sets are left.
  - **Return:** each open loan has its own **标记为已归还 Mark as returned** button.
  - **借用记录 Loan history** shows the last 10 loans for that game.
- Games with more than one set show **已借出 2/3 套 · names** on the card (orange while some sets are still left, red when all are out) and **共 3 套 · 可借 1 套** in the popup. The **可借** filter shows games with at least one set left.
- Every card shows where the sets are, e.g. **📍 在场** for a single set, or **📍 在场 1 套 📦 仓库 1 套** when the sets are split. So does the loan box in the popup. The **📍 在场 / 📦 仓库** filters list the games with at least one set in that place. (Location and loans are tracked separately: lending a set doesn't change the present/storage counts.)

> **Upgrading from an earlier version?** Run the whole of [`supabase/schema.sql`](../supabase/schema.sql) again in the SQL Editor. It's safe to re-run: it adds sets owned, sets in storage and loan quantities, converts the old one-location-per-game setting (a game marked 仓库 becomes all of its sets in storage), and keeps all existing loans.
- **库存管理 Inventory** (`admin/inventory.html`, linked next to **退出** once signed in) lists every game by name with its owner, sets present, in storage and with the owner, total and sets on loan. Search, filter by location and sort by Chinese or English name. Edit any rows, then click **保存全部 Save all**. **批量修改 Bulk edit**: **设置套数 Set sets** fills in a present and a storage count; **设置拥有者 Set owner** sets (or, left blank, clears) the owner; **全部套数移到 Move all sets to** moves each game's sets to 在场, 仓库 or 拥有者处 (games without an owner are skipped) and keeps its total. Each has **应用到选中 Apply to selected** (ticked games) and **应用到全部 Apply to all** (every game). Games with more sets on loan get extra present sets to cover them. Changed rows are highlighted; invalid rows are marked red and block saving. A save is all-or-nothing.
- Loans past their due date are marked **已逾期 Overdue**.
- The **game entry helper** (`admin/editor.html`) also requires an admin sign-in. Signing in on either page signs you in on both. Before Supabase is set up, the helper stays open with a warning, so you're never locked out.
- Accounts that can sign in but aren't in the admin list are turned away on both pages.
- You can also view, fix or export all loans in Supabase → **Table Editor → loans**.

## Rulebooks (PDF)
Uploaded rulebooks are the club's own copies, so the site always names them **欢乐小镇规则书 / Happy Village rulebook** (links, preview, buttons and the inventory page).

Running [`supabase/schema.sql`](../supabase/schema.sql) also creates a public Storage bucket called **rulebooks** (PDF only, max 50 MB per file) where anyone can read files and only admins can upload, replace or delete.
- **Upload:** signed in as admin, open a game's popup → **📖 欢乐小镇规则书 PDF** → choose the file → **上传欢乐小镇规则书**. Or use the **📖 欢乐小镇规则书** column on **库存管理 Inventory** (**⬆ 上传** / **替换**); uploads there happen right away.
- Each game has one rulebook, saved as `rulebooks/<game id>.pdf`. Uploading again replaces it; **删除欢乐小镇规则书** removes it.
- Everyone sees a **📖 欢乐小镇规则书（PDF）** link in the game's popup as soon as a file exists. No editing of `data/games.json` is needed.
- **Games can share a rulebook** (e.g. an expansion uses its base game's). A game that shares another's shows **📖 《…》欢乐小镇规则书（共用）**, so the shared rulebook only needs uploading once; if it also has its own, both links show.
  - **Set it per game:** in the game's popup, **🔗 与哪款游戏共用欢乐小镇规则书** → pick a game (same or similar names are listed first) → **保存**. Pick **不共用** to stop sharing.
  - **Set it in bulk:** on **库存管理**, the **🔗 共用规则书** column has a **修改** dropdown per game, and **按名称自动配对** fills in games whose name starts with another game's full name (e.g. 重塑火星：动荡 → 重塑火星). Auto-match also suggests spin-offs like 璀璨宝石：宝可梦, so check the highlighted rows, then **保存全部**.
  - The starting values come from `"rulebookFrom"` in `data/games.json` (all expansions and the two storage boxes); anything set on the site overrides them.
- The inventory page can filter **有欢乐小镇规则书 / 没有欢乐小镇规则书** to see which games still need one.
- Free plan: about 1 GB of files in total and about 5 GB of downloads a month. Compress large scanned PDFs first (e.g. ilovepdf.com → Compress).

## Score records (Flip 7)
Running [`supabase/schema.sql`](../supabase/schema.sql) also creates the **game_scores** table used by the Flip 7 scorer, [`flip7.html`](../flip7.html). Open it from the 7连翻 popup → **🧮 计分板 & 战绩记录**.
- **🧮 计分:** enter the players and target (200 by default). Each round, tap a player and pick the cards they kept: number cards, +2…+10, ×2, or 爆牌. Seven number cards add the +15 Flip 7 bonus automatically, and you can also type a score instead. When someone reaches the target, tap **💾 保存到战绩记录**; **提前结束这局** ends a game early. The game in progress is kept in that browser only, so a refresh doesn't lose it.
- **📜 战绩记录:** every saved game, newest first, with each round's scores. Anyone can see them and filter by player name.
- **🏆 排行榜:** wins, games, win rate, best and average score, Flip 7s and busts per player. Players are matched by name (capital letters don't matter), and the name boxes suggest names from past games, so use the same name each time.
- **No sign-in is needed to save,** so anyone can add a record. **Only admins can change or delete records.** A signed-in admin sees **编辑** and **删除** under each record. In Flip 7, **编辑** fixes the player names; the scores come from the rounds and can't be changed. Use **删除** for a test game or a duplicate. The database refuses changes from anyone else, and more than 30 new records a minute, to stop floods.

## Scoreboards (大创造时代, SETI and any other game)
[`score.html?game=<id>`](../score.html) is one scoreboard page for every game. It uses the same **game_scores** table, with `game_id` set to the game's id. Open it from a game's popup → **🧮 计分板 & 战绩记录** (shown when the game has `"scorer"` in `data/games.json`). The old `aoi.html` link still works and opens the 大创造时代 scoreboard.
- **📝 记录一局:** pick the **游戏日期** from the calendar. It is today by default and can be changed, but not to a future date. For each player, enter the **名字** and **得分**, plus the game's optional choices. **💾 保存这一局** saves the game and keeps the names filled in for the next one.
- **📜 战绩记录:** every game, newest game date first, showing each player's rank, choices and score. You can filter by player name.
- **🏆 排行榜:** first, **总榜 Overall** lists each player's total points across all saved games, with games, average and wins. Then **胜场排行** shows wins, games, win rate, and best and average score per player, plus a table for each choice (e.g. per faction). A shared first place counts as a win for each player.
- The same rules as Flip 7 apply: no sign-in is needed to save, only admins can change or delete records, and the database accepts at most 30 new records a minute. An admin's **编辑** opens the whole record (date, players, scores, choices) in the 记录一局 form with a **正在修改** banner. **💾 保存修改** updates that record instead of adding a new one, and **取消修改** brings back whatever was being filled in before.
- Re-run `supabase/schema.sql` once for admin editing to work (it adds the permission to change records).
- Re-run `supabase/schema.sql` once before using it. It adds the `played_on` (date) and `details` (choices about the whole game) columns.

**Each game's choices** live in `js/scoreboards/<id>.js` (the format is described at the top of `js/scoreboard.js`). A game without one gets the simple version: date, names and scores.
- **大创造时代** (`age-of-innovation.js`, 1–5 players): **角色**, one of the 12 base-game factions shown as cards with picture, setup bonus and ability; and **土地颜色**, one of the 7 round landscape tiles, with its setup bonus shown underneath. Pictures are in `images/aoi/`.
- **星空觅迹 SETI** (`seti.js`, 1–4 players; also linked from the Space Agencies expansion): **外星种族** for the whole game, up to 2 of the 8 species (5 base, 3 from Space Agencies); **机构**, one of the 12 organizations (the 11 Space Agencies ones plus 神舟二十一号 from the Simplified Chinese edition), shown as cards with their abilities; and **玩家颜色** (purple, white, orange, green). Names, ability text and pictures come from the club's Chinese copy; the pictures are in `images/seti/`.
- **方舟动物园 Ark Nova** (`ark-nova.js`, 1–4 players; also linked from Marine Worlds): **使用的扩展** for the whole game (海洋世界); and **动物园地图**, shown as cards in four groups: the base game (Map A, Map 0, maps 1–8), BGA's alternative maps 1a–8a (same abilities, different layouts), the official Zoo Map Packs 1 & 2 (maps 9–14, Tournament Map 1), the Bahamut forum fan maps (9A/10A/13A and DIY01–14, from the post 方舟動物自製粉絲地圖分享) and other fan-made maps (from BoardGameGeek, plus 153桌游吧's Map 153a 海洋公园 and 五星酒店). Chinese map names follow what Chinese BGA players use. A map that isn't listed can be typed in (**列表里没有？手动填写**); typing a listed map's name or number picks that map. Several players can use the same map. Ark Nova scores can be negative, so scores down to −999 are accepted.
- A faction, organization or colour another player has already taken is greyed out.

## Events and sign-ups (活动报名)
[`events.html`](../events.html) (the **📅 活动报名** button on the home page) lists the events, soonest first. Past events are folded under **往期活动**. Re-run `supabase/schema.sql` once before using it: it adds the tables **events**, **event_tables** (the tables opened at an event) and **event_players** (who joined each table), and the functions visitors use to sign up.
- **Admins** (signed in on the home page, or on `events.html?admin=1`) see **＋ 发布活动**: an event has a **活动名称**, a **日期** picked from the calendar, an optional **开始时间** and an optional **简介说明**. On an event's page, admins can **编辑活动** and **删除活动** (this also deletes its tables and sign-ups). On each table they can mark the game **在现场 / 不在现场**, **删除这桌**, and remove a player with the ✕ on their name.
- **Visitors** don't sign in. On an event's page, **加入** joins an open table, and **🎲 开新桌** opens a new one. They pick a game from the catalogue (searchable, with how many sets are at the venue now) or type one in under **库里没有？手动填写**. A typed name that matches a catalogue game counts as that game. Then they choose **📍 在现场** or **🚚 不在现场（有人带来）**. This is pre-set from the inventory, and the visitor can change it if someone is bringing their own copy. They can also set **人数上限** (filled in from the game's player count; empty means no limit), add a **备注**, and enter **你的名字**. The person who opens a table joins it automatically and is shown as **开桌**.
- A table can't take more people than its 人数上限, and two people at one table can't use the same name. Sign-ups close once the event date has passed. The database accepts at most 60 sign-ups a minute across the site.
- **Start time (几点开):** when opening a table, the host can pick a start time. It starts as the event's own start time and can be changed or cleared. Tables show **🕒 15:30 开** and are listed by start time; tables without one come last.
- **Leaving a table:** each browser keeps a random secret with its sign-ups, so only the same browser can **退出**. Someone who signed up on another phone, or cleared their browser, has to ask an admin to remove them.
- **Deleting a table:** only the person who opened it (from the same browser) or an admin can. The host sees **删除这桌** on their table, even after leaving it. Other people leaving never deletes the table; if everyone leaves, it stays empty until the host or an admin deletes it. The one exception: a host who leaves their own table when nobody else is at it removes it. Tables opened before this change have no recorded host, so only admins can delete them. Re-run `supabase/schema.sql` once for this and for start times.
- **Names at events are public**, like borrower names.
- **Home page:** the top of [index.html](../index.html) shows a **📅 近期活动** banner with the next 1–2 events (date, how many tables and people, the main organizer, **去报名 →**). With no upcoming event it shrinks to one line linking to the events page.

### Event templates (模板)
Re-running `supabase/schema.sql` also adds the **event_templates** table. A template is a saved event name and description, so a regular event (e.g. 周六桌游夜) doesn't need retyping. Admins only; visitors can't read them.
- **Using a template:** in the 发布活动 / 编辑活动 form, choose one under **📋 从模板导入**. It fills in the name and description, asking first if something different is already typed. The date, time and organizers are still chosen each time.
- **Saving a template:** fill in the name and description, then click **💾 把名称和简介存为模板**. The event name is the template's name. Saving under a name that already exists (not case-sensitive) asks before replacing that template's description.
- **Deleting a template:** choose it in the list, then click **删除这个模板**. Events already published from it don't change.

### Organizers (负责人)
Re-run `supabase/schema.sql` once more for this. It adds the **staff** and **event_staff** tables, the `set_event_staff` function and a public Storage bucket **staff-qr** for QR code pictures.
- **The list is for admins only.** Admins open it with the **👥 负责人** button on the events page (`events.html?staff`). Each organizer has a **名字**, **电话** and **微信号** (all required), plus an optional **小红书号**. They can also have a **微信二维码** and a **小红书二维码**: pick a picture, such as a phone screenshot of the QR code. It is shrunk to at most 900 px before uploading. Replacing or removing a picture deletes the old file.
- **Every event needs a main organizer.** When publishing or editing an event, choose **当日主负责人** (required) and any number of **副负责人** from the list.
- **On the event page**, visitors see a **当日负责人** section: the main organizer first, then the deputies. Each card shows the phone number (tap to call), WeChat ID and Xiaohongshu ID with a **复制** button, and the QR codes. Tap a QR code to enlarge it; on a phone, press and hold the picture to scan it.
- **Privacy:** visitors can only read an organizer's details while that person is assigned to an event dated yesterday or later. After the event, the details disappear from the page; admins still see them. QR pictures have random file names and the bucket can't be listed, but anyone who has a picture's link can open it.
- Deleting an organizer also takes them off their events. If they were an event's main organizer, edit that event and choose a new one.

## Things to know
- **Borrower names are public.** Anyone visiting the site can see who has a game. Use first names or nicknames if that's a concern.
- **Free plan pause:** Supabase pauses free projects after about a week with no activity. Loans and rulebooks then fail to load (the site shows "借用状态暂时无法加载" and everything else still works). The GitHub Actions job [`.github/workflows/keep-supabase-awake.yml`](../.github/workflows/keep-supabase-awake.yml) prevents this by reading one row every 3 days. Check it under the repo's **Actions** tab (you can also click **Run workflow** to test it). GitHub turns off scheduled jobs in a repo with no commits for 60 days; if that happens, click **Enable workflow** on the Actions tab. If the project does get paused, open the Supabase dashboard and click **Restore project**.
- **Admin sign-in is remembered** on that browser until **退出 Sign out** is clicked, so sign out on shared computers.
