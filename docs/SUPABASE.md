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
[`score.html?game=<id>`](../score.html) is one scoreboard page for every game. It uses the same **game_scores** table, with `game_id` set to the game's id. Open it from a game's popup → **🧮 计分板 & 战绩记录**. Every game has the button except those marked `"scoring": { "mode": "none" }` (剧本杀) and storage boxes (tag Accessory). A game with `"scorer"` opens that page instead: Flip 7 has its own, and expansions and other editions open their base game's scoreboard, so they share its records and leaderboard (e.g. 重塑火星：殖民地 → `score.html?game=terraforming-mars`). The old `aoi.html` link still works and opens the 大创造时代 scoreboard.
- **How a game is won** comes from `"scoring"` in `data/games.json`. Without it, the highest score wins.
  - **高分胜** (default): each player's score; the highest wins.
  - **低分胜** (`"low"`, e.g. 牛头王, 垃圾山): each player's score; the lowest wins. The leaderboard shows 最低分 and has no total-points table.
  - **只记胜负** (`"win"`, e.g. 政变疑云, 情书, 骷髅牌, 图灵机): no scores. Tap **🏆 赢了** for each winner (one or more). The leaderboard shows wins, games and win rate.
  - **阵营对抗** (`"teams"`, e.g. 狼人, 阿瓦隆, 行动代号, 风声, 暗夜杀机, 山中小屋): pick each player's side (阵营), then **哪一方获胜？**. The sides and their colours are listed in `"teams"`. The leaderboard adds **各阵营胜率**, which is the games a side won divided by the games someone played on that side.
  - **合作** (`"coop"`, e.g. 诡镇奇谈卡牌版, 花火, 炸弹克星, 纸牌帮): everyone wins or loses together: **✅ 合作成功 / ❌ 合作失败**, plus an optional team score when `"score"` is set (花火: 烟花分数 0–25). The leaderboard shows the team's record (games, wins, win rate, best and average score) and each player's games and wins.
  - The method is saved with each record in `details.mode` (not for 高分胜). Without scores, each player's `total` is 1 (won) or 0, and `top_score` is always the winning value, so a player won when their total equals it. Sides are saved as `team` on each player, the winning side as `details.winTeam`, and a co-op result as `details.won` and `details.score`. Profiles count wins for every game, but best and average scores only for games with scores. Only records saved the way the game is scored now count on its leaderboard.
  - There's room for as many players as the catalogue says (e.g. 狼人 up to 13; 6 when it doesn't say).
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
[`events.html`](../events.html) (the **📅 活动报名** button on the home page) lists the events, soonest first; an event counts as current until the end of its day. Past events are folded under **往期活动**: only their number is loaded with the page, and they load 10 at a time from the database when the section is opened or a page is turned (pages already seen are kept). Re-run `supabase/schema.sql` once before using it: it adds the tables **events**, **event_tables** (the tables opened at an event) and **event_players** (who joined each table), and the functions visitors use to sign up.
- **Admins** (signed in on the home page, or on `events.html?admin=1`) see **＋ 发布活动**: an event has a **活动名称**, a **日期** picked from the calendar, an optional **开始时间** and an optional **简介说明**. On an event's page, admins can **编辑活动** and **删除活动** (this also deletes its tables and sign-ups). On each table they can mark the game **在现场 / 不在现场**, **删除这桌**, and remove a player with the ✕ on their name.
- **Visitors** don't sign in. On an event's page, **加入** joins an open table, and **🎲 开新桌** opens a new one. They pick a game from the catalogue (searchable, with how many sets are at the venue now) or type one in under **库里没有？手动填写**. A typed name that matches a catalogue game counts as that game. Then they choose **📍 在现场** or **🚚 不在现场（有人带来）**. This is pre-set from the inventory, and the visitor can change it if someone is bringing their own copy. They can also set **人数上限** (filled in from the game's player count; empty means no limit), add a **备注**, and enter **你的名字**. The person who opens a table joins it automatically and is shown as **开桌**.
- A table can't take more people than its 人数上限, and two people at one table can't use the same name. Sign-ups close once the event date has passed. The database accepts at most 60 sign-ups a minute across the site.
- **Formatted description:** the event description has a toolbar for font (黑体, 宋体, 楷体, 圆体, 等宽; fonts the device has), size, bold, italic, underline, strikethrough, colour, alignment and lists. It is stored as HTML, cleaned on save and again on every page view so only those styles are kept (no scripts, pictures or links). Older plain-text descriptions show as before. Up to 20000 characters including the formatting.
- **Event time and place:** an event can have a start and end time (shown as **14:00–18:30**; an end earlier than the start means it runs past midnight) and a place. The place opens Google Maps: the event's map link if the admin pasted one (it must start with `https://`; links typed without it get it added), otherwise a Google Maps search for the place. Templates save the start and end time, place and map link too.
- **Start time (几点开):** when opening a table, the host can pick a start time. It starts as the event's own start time and can be changed or cleared. Tables show **🕒 15:30 开** and are listed by start time; tables without one come last. Later, the table's current host and admins can change it with **修改时间**.
- **Host (开桌人):** the person who opens a table is its host, marked **· 开桌**. When the host leaves a table that still has other players, they can pick who takes over; if they don't pick anyone, or an admin removes them, the next person by joining order becomes the host, and so on. When the last person leaves, the table is removed. Admins can also make any other player at a table its host with **更换开桌人** (the admin row under the table).
- **Leaving a table:** each browser keeps a random secret with its sign-ups, so only the same browser can **退出**. Someone who signed up on another phone, or cleared their browser, has to ask an admin to remove them.
- **Deleting a table:** only the current host (from the browser they joined with) or an admin can. The host sees **修改时间** and **删除这桌** on their table, and loses both once they leave. The host can delete the table only while nobody else is at it; with other players there, the button is replaced by a note and the database refuses too (error HVE08), so the host should **退出** and hand the table over instead. Admins can still delete any table. The database checks the host's browser secret, so nobody else can delete the table or change its time. Re-running `supabase/schema.sql` makes the first person who joined the host of every table opened before this change.
- **Names at events are public**, like borrower names.
- **Games at a table (🎮 对局记录):** on the day of the event, the table's host (or an admin) sees **▶ 开始对局**. It opens a list of everyone at the table, all ticked; the host can untick people, or type in someone who didn't sign up (**＋ 加入**, while there are seats). **▶ 开始** saves a game record straight away (table `game_scores`, marked `pending`) with those players and the event date, so nobody has to type names. Later games at the same table use **▶ 开始新的一局**, with any players from the table.
  - **Games without scores** use the game's method here too: **✏️ 填写结果** asks for the winners, each player's side and the winning side, or the co-op result (see Scoreboards above). An expansion or another edition is recorded under its base game. Games that aren't scored (剧本杀, storage boxes) can't be started.
  - **Scores:** **✏️ 填写分数** opens one box per player (whole numbers from -9999 to 9999, negatives allowed). The highest score wins, and a tie is a shared win. The host, admins, and any signed-in player in that game can enter or change the scores. A player counts as in the game if they signed up at the table with their account, or if one of their profile names is in the game. Players can change scores for 7 days after the event; admins can change them at any time, here or on the records page. Once saved, the game shows the winner and scores, plus a **查看战绩 ↗** link to that game's records page.
  - **While scores are missing**, the game shows **⏳ 等待填写分数**. On score.html and flip7.html it is listed with a note but left out of the leaderboards, and profiles leave it out until the scores are in. The host or an admin can **取消这局** while scores are missing; that deletes the record.
  - **＋ 添加玩家** (host or admin, while there are seats) adds someone by name who didn't sign up online, optionally also into the game that is still waiting for scores. They have no browser secret of their own, so an admin removes them if needed.
  - Only games from the catalogue can be recorded, because a record belongs to a game in `data/games.json`. For a typed-in game the host sees a note instead of the button.
  - Everything goes through database functions (`start_event_game`, `set_event_game_scores`, `cancel_event_game`, `add_event_table_player`). They check the host's browser secret or account, the admin list and the event date (errors HVG01–HVG07). The table **event_games** links each game to its table; if the table is deleted, the record stays.
- **Event wishes (期望活动):** on the events page, **＋ 提议活动** lets anyone suggest an event: their name, the event name and an optional description (plain text, up to 1000 characters). The form and the list show the note 「我们会根据情况决定是否采纳举办，提交期望活动不代表一定会举办。」
  - **我也想参加 +1:** anyone can vote once per browser (and once per signed-in account); clicking again takes the vote back. Suggestions are listed by votes, then newest. The home page shows the top 4 (declined ones left out) under the events banner, with the same +1 button.
  - **The person who suggested it** sees **我提议的** with **修改** and **删除**, from the same browser or signed in with the same account on any device. Like event sign-ups, this uses the browser secret (`hv-event-token`), which the website can never read back from the database.
  - **Admins** see **✓ 采纳**, **✕ 不采纳**, **改回待定** and **删除**. A declined suggestion shows **未采纳**, is greyed out, moves to the end, takes no new votes and is left off the home page.
  - Everything goes through database functions (`add_event_wish`, `update_event_wish`, `delete_event_wish`, `toggle_event_wish_vote`, `my_event_wish_state`), with at most 20 suggestions and 120 votes a minute across the site. Who suggested or voted for what is never readable from the website.
- **Home page:** the top of [index.html](../index.html) shows a **📅 近期活动** banner with the next 1–2 events (date, how many tables and people, 负责人1, **去报名 →**). With no upcoming event it shrinks to one line linking to the events page.

### Event templates (模板)
Re-running `supabase/schema.sql` also adds the **event_templates** table. A template is a saved event name and description, so a regular event (e.g. 周六桌游夜) doesn't need retyping. Admins only; visitors can't read them.
- **Using a template:** in the 发布活动 / 编辑活动 form, choose one under **📋 从模板导入**. It fills in the name and description, asking first if something different is already typed. The date, time and organizers are still chosen each time.
- **Saving a template:** fill in the name and description, then click **💾 把名称和简介存为模板**. The event name is the template's name. Saving under a name that already exists (not case-sensitive) asks before replacing that template's description.
- **Deleting a template:** choose it in the list, then click **删除这个模板**. Events already published from it don't change.

### Organizers (负责人)
Re-run `supabase/schema.sql` once more for this. It adds the **staff** and **event_staff** tables, the `set_event_staff` function and a public Storage bucket **staff-qr** for QR code pictures.
- **The list is for admins only.** Admins open it with the **👥 负责人** button on the events page (`events.html?staff`). Each organizer has a **名字**, **电话** and **微信号** (all required), plus an optional **小红书号**. They can also have a **微信二维码** and a **小红书二维码**: pick a picture, such as a phone screenshot of the QR code. It is shrunk to at most 900 px before uploading. Replacing or removing a picture deletes the old file.
- **Every event needs at least one organizer.** When publishing or editing an event, choose **负责人1** (required); a dropdown for **负责人2** then appears, and so on, as many as you like. They are shown in that order. (In the database 负责人1 is stored as the main organizer, `is_lead`, and the rest keep their order in `sort`.)
- **On the event page**, visitors see a **当日负责人** section: 负责人1, 负责人2, … in order. Each card shows the phone number (tap to call), WeChat ID and Xiaohongshu ID with a **复制** button, and the QR codes. Tap a QR code to enlarge it; on a phone, press and hold the picture to scan it.
- **Privacy:** visitors can only read an organizer's details while that person is assigned to an event dated yesterday or later. After the event, the details disappear from the page; admins still see them. QR pictures have random file names and the bucket can't be listed, but anyone who has a picture's link can open it.
- Deleting an organizer also takes them off their events. If they were an event's 负责人1, the next one moves up on the page; edit the event to set the order again.

### Headcount (参加人数)
**Re-run `supabase/schema.sql` before deploying this.** It adds the `extra_people` column to **events**. Until then the events pages can't load, because they ask for that column.
- **The number** on the event cards, the event page and the home page counts people, not seats: someone at two tables counts once (same name, ignoring case and spaces). The organizers count too, once each, even if they also joined a table.
- **Friends who didn't sign up:** on the event page, admins click **👥 共 N 人参加** and enter how many came without signing up (0–200). That number is added to the total.
- **The list:** anyone can click the number to see everyone coming: the organizers first, then each player with the tables they joined, then how many friends were added. On past events visitors see organizers as "名字不公开", because their names are hidden after the event.
- **Registered or not (admins):** in that list admins also see **全部 / 已注册 / 未注册** filters and a tag on each player. 已注册 means they signed up while signed in to a player account; the line under them links to that account's profile. Organizers who didn't join a table have no tag. Re-run `supabase/schema.sql` once for this: it adds the admin-only `event_player_accounts` function. Until then the list shows "没能查到注册情况" for admins, and everything else works as before.

### All players (玩家总名单)
Admins open it with the **📋 玩家名单** button on the events page (`events.html?players`). It lists everyone who ever signed up for any event, one line each, with how many events they came to, how many tables they joined and their most recent event. Most recent first.
- **全部 / 已注册 / 未注册** filters and a name search (it also finds account nicknames).
- **已注册:** the sign-ups were made while signed in to a player account. Each account is one line; the name shown is the one they used most recently, with the account nickname in brackets if it's different. Tap the name to open their profile. Accounts that never signed up are listed too ("还没报过名").
- **未注册:** sign-ups without an account, grouped by name (ignoring case and spaces). Someone who sometimes signs up while signed in and sometimes not shows up twice, once in each group.
- Re-run `supabase/schema.sql` once for this: it adds the admin-only `admin_player_roster` function. Visitors and players can't call it.

## Player accounts and profiles (注册 / 玩家主页)
Players can create their own accounts. Re-run `supabase/schema.sql` once: it adds the **profiles** table, links event sign-ups to accounts, and adds the functions behind the profile page. Player accounts use the same Supabase Auth as admins. Only accounts listed in `public.admins` get admin tools; a player who signs in sees none.

**Set up in the Supabase dashboard (Authentication):**
1. **Sign In / Providers → Email:** keep **Enable email provider** and **Allow new users to sign up** on.
2. **Confirm email:** choose one of these.
   - **On** (the default): new players get a confirmation email and can sign in only after clicking its link.
   - **Off:** new players are signed in immediately after signing up.

   Supabase's built-in email service only sends a few emails an hour, which is fine for testing but not for a busy sign-up day. With it on, set up your own SMTP under **Emails → SMTP Settings**, or turn confirmation off. Password reset emails go through the same service.
3. **URL Configuration:** set **Site URL** to the site's address (e.g. `https://<user>.github.io/<repo>/`), and add `https://<user>.github.io/<repo>/account.html` under **Redirect URLs**. Links in confirmation and password reset emails open `account.html`, which signs the player in. For local testing, add `http://localhost:…/account.html` too.

**How it works:**
- **📝 Sign up / sign in:** [account.html](../account.html), opened from the **👤 登录 / 注册** button on the home and events pages.
  - Signing up asks for a **昵称** (nickname), an email and a password (at least 6 characters, entered twice). **忘记密码？** sends a reset email.
  - Once signed in, the same page has **修改密码** and **退出登录**.
- **👤 Profile:** [profile.html](../profile.html) is your own profile (the **👤 我的主页** button); `profile.html?u=<id>` shows anyone's.
  - **Public:** the nickname, other names, bio, join date and game summary. The email is never shown.
  - **Only the owner can edit it (✏️ 编辑资料).** Fields: **昵称**, **我在计分板上用过的其他名字** (up to 5) and **个人简介** (up to 1000 characters).
- **Games summary:** built from the scoreboards (game_scores). Every saved game where a player's name is the nickname or one of the other names counts, ignoring upper/lower case. The summary shows:
  - totals: games, wins, and how many different games. Tap **玩过的桌游** for a full-screen 3D space of the covers of every game played (CSS 3D, no library), in four layouts: **球体** (spread over a sphere), **螺旋** (a rising spiral), **环形** (stacked rings) and **平面** (a flat wall); the last layout used is remembered. Drag or swipe to spin it in any direction, zoom with the mouse wheel, two fingers or ＋ －, arrow keys spin it too; it turns slowly on its own while left alone (not with the device's reduce-motion setting). Tap a cover for that game's own summary: plays, wins, best, average, first and last played, every game of it with score and place, and links to its scoreboard and catalogue page;
  - **🎲 桌游总结:** one row per game, with plays, wins, best, average and last played; the most recently played first, 10 games a page;
  - **📜 最近对局:** the last 10 games, with score, place and 🏆.

  A win means having the top score in that game, and a shared top score counts as a win for each player. Each name can belong to only one account, so nobody can claim someone else's games; if a name is taken, the profile page says so. An admin can fix a wrongly claimed name in **Table Editor → profiles**.
- **📅 我的活动报名 (only on your own profile):** event tables joined or opened while signed in. **即将参加** shows events from today on (today's stay until the day is over), soonest first; **🕘 历史活动** shows earlier ones, most recent first. Both load 10 at a time from the database (function `my_event_signups_page`), one page when it is shown; pages already seen are kept, so going back is instant.
- **Long lists elsewhere:** the scoreboard and Flip 7 record lists show 10 records a page (the records stay loaded in full, because the leaderboards are worked out from all of them).
- **Events with an account:** the nickname fills in the name when joining or opening a table. Sign-ups are linked to the account, so a player who signed in can leave a table, or act as its host (修改时间 / 删除这桌), from any device. A signed-in player can join each table once.
- **Deleting an account** isn't on the website. Delete the user under **Authentication → Users**: their profile is deleted with it, and their event sign-ups stay without the link.

## Things to know
- **Borrower names are public.** Anyone visiting the site can see who has a game. Use first names or nicknames if that's a concern.
- **Free plan pause:** Supabase pauses free projects after about a week with no activity. Loans and rulebooks then fail to load (the site shows "借用状态暂时无法加载" and everything else still works). The GitHub Actions job [`.github/workflows/keep-supabase-awake.yml`](../.github/workflows/keep-supabase-awake.yml) prevents this by reading one row every 3 days. Check it under the repo's **Actions** tab (you can also click **Run workflow** to test it). GitHub turns off scheduled jobs in a repo with no commits for 60 days; if that happens, click **Enable workflow** on the Actions tab. If the project does get paused, open the Supabase dashboard and click **Restore project**.
- **Admin sign-in is remembered** on that browser until **退出 Sign out** is clicked, so sign out on shared computers.
