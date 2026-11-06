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
  - **📍 在场套数 Sets present** and **📦 仓库套数 Sets in storage**: how many sets are at the venue and how many are in storage. Together they are the sets owned. Change them, then **保存 Save**. Games start at 1 set present. The total can't be lower than the number of sets currently on loan. Set both to **0** for a game the club no longer has (given away, lost or sold): it stays in the catalogue with a greyed-out picture, shows **⚪ 暂无（0 套）**, can't be lent, and appears under the **⚪ 暂无** filter.
  - **Lend:** enter the borrower's name, choose **借几套 Sets** (shown when more than one set is left) and optionally a due date → **借出 Lend out**. Each loan is its own record, so a game with several sets can be lent to several people at once. The form disappears when no sets are left.
  - **Return:** each open loan has its own **标记为已归还 Mark as returned** button.
  - **借用记录 Loan history** shows the last 10 loans for that game.
- Games with more than one set show **已借出 2/3 套 · names** on the card (orange while some sets are still left, red when all are out) and **共 3 套 · 可借 1 套** in the popup. The **可借** filter shows games with at least one set left.
- Every card shows where the sets are, e.g. **📍 在场** for a single set, or **📍 在场 1 套 📦 仓库 1 套** when the sets are split. So does the loan box in the popup. The **📍 在场 / 📦 仓库** filters list the games with at least one set in that place. (Location and loans are tracked separately: lending a set doesn't change the present/storage counts.)

> **Upgrading from an earlier version?** Run the whole of [`supabase/schema.sql`](../supabase/schema.sql) again in the SQL Editor. It's safe to re-run: it adds sets owned, sets in storage and loan quantities, converts the old one-location-per-game setting (a game marked 仓库 becomes all of its sets in storage), and keeps all existing loans.
- **库存管理 Inventory** (`admin/inventory.html`, linked next to **退出** once signed in) lists every game by name with its sets present, sets in storage, total and sets on loan. Search, filter by location and sort by Chinese or English name. Edit any rows, then click **保存全部 Save all**. **批量修改 Bulk edit**: **设置套数 Set sets** fills in a present and a storage count; **全部套数移到 Move all sets to** moves each game's sets to 在场 or 仓库 and keeps its total. Each has **应用到选中 Apply to selected** (ticked games) and **应用到全部 Apply to all** (every game). Games with more sets on loan get extra present sets to cover them. Changed rows are highlighted; invalid rows are marked red and block saving. A save is all-or-nothing.
- Loans past their due date are marked **已逾期 Overdue**.
- The **game entry helper** (`admin/editor.html`) also requires an admin sign-in. Signing in on either page signs you in on both. Before Supabase is set up, the helper stays open with a warning, so you're never locked out.
- Accounts that can sign in but aren't in the admin list are turned away on both pages.
- You can also view, fix or export all loans in Supabase → **Table Editor → loans**.

## Things to know
- **Borrower names are public.** Anyone visiting the site can see who has a game. Use first names or nicknames if that's a concern.
- **Free plan pause:** Supabase pauses free projects after about a week with no activity. Loans then fail to load (the site shows "借用状态暂时无法加载" and everything else still works). Open the Supabase dashboard and click **Restore project** to wake it up. Regular use keeps it awake.
- **Admin sign-in is remembered** on that browser until **退出 Sign out** is clicked, so sign out on shared computers.
