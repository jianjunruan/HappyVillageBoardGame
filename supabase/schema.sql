-- Happy Village board game loans: run this in Supabase → SQL Editor.
-- Safe to run again: re-running it upgrades an older setup (e.g. adds sets owned and loan quantities).
-- Everyone can see what is on loan; only users listed in public.admins can lend, return or change set counts.

-- Who is allowed to manage loans. Add rows here after creating the user in Authentication → Users.
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  note text
);
alter table public.admins enable row level security;  -- no policies: not readable or writable from the website

-- True when the signed-in user is an admin. "security definer" lets the check read public.admins
-- even though website visitors can't.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- Per-game settings: how many sets the club has, where they are (venue / storage / owner's place), and the owner.
-- Games without a row count as 1 set, present at the venue.
create table if not exists public.game_copies (
  game_id text primary key,                               -- the game's "id" in data/games.json
  copies integer not null default 1
);
-- 0 sets is allowed: the game was given away, lost or sold, but stays in the catalogue.
alter table public.game_copies drop constraint if exists game_copies_copies_check;   -- old rule: at least 1
alter table public.game_copies drop constraint if exists game_copies_copies_range;
alter table public.game_copies add constraint game_copies_copies_range check (copies between 0 and 99);
-- How many of the sets are in storage (仓库); the rest are present at the venue (在场).
alter table public.game_copies add column if not exists storage_copies integer not null default 0;
-- Upgrade from the one-location-per-game version: a game marked 'storage' had all its sets in storage.
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'game_copies' and column_name = 'location') then
    update public.game_copies set storage_copies = copies where location = 'storage';
    alter table public.game_copies drop column location;
  end if;
end;
$$;
-- Who owns the game (free text, e.g. a member who lends it to the club); blank = the club.
alter table public.game_copies add column if not exists owner text;
-- How many of the sets are kept at the owner's place (only possible when an owner is filled in).
alter table public.game_copies add column if not exists owner_copies integer not null default 0;
alter table public.game_copies drop constraint if exists game_copies_owner_length;
alter table public.game_copies add constraint game_copies_owner_length check (owner is null or char_length(owner) <= 60);
-- Present (在场) = copies - storage_copies - owner_copies, so the two can't add up to more than copies.
alter table public.game_copies drop constraint if exists game_copies_storage_range;
alter table public.game_copies add constraint game_copies_storage_range
  check (storage_copies >= 0 and owner_copies >= 0 and storage_copies + owner_copies <= copies);
-- Shares another game's Happy Village rulebook (e.g. an expansion uses its base game's).
-- null = use "rulebookFrom" in games.json; '' = shares with none; '<game id>' = uses that game's rulebook.
alter table public.game_copies add column if not exists rulebook_from text;
alter table public.game_copies drop constraint if exists game_copies_rulebook_from;
alter table public.game_copies add constraint game_copies_rulebook_from
  check (rulebook_from is null or (char_length(rulebook_from) <= 100 and rulebook_from <> game_id));
alter table public.game_copies drop constraint if exists game_copies_owner_sets;
alter table public.game_copies add constraint game_copies_owner_sets
  check (owner_copies = 0 or coalesce(trim(owner), '') <> '');

create table if not exists public.loans (
  id bigint generated always as identity primary key,
  game_id text not null,                                  -- the game's "id" in data/games.json
  borrower text not null check (char_length(trim(borrower)) between 1 and 60),
  loaned_at timestamptz not null default now(),
  due_date date,
  returned_at timestamptz,                                -- null = still on loan
  loaned_by uuid default auth.uid()
);
-- How many sets this loan covers (added in the "sets owned" upgrade).
alter table public.loans add column if not exists quantity integer not null default 1 check (quantity between 1 and 99);

-- Several people can borrow the same game now, as long as enough sets are left (checked below).
drop index if exists public.loans_one_open_per_game;
create index if not exists loans_game_history on public.loans (game_id, loaned_at desc);
create index if not exists loans_open on public.loans (game_id) where returned_at is null;

-- Sets of a game currently on loan.
create or replace function public.sets_on_loan(p_game_id text)
returns integer
language sql
stable
set search_path = ''
as $$
  select coalesce(sum(quantity), 0)::integer from public.loans where game_id = p_game_id and returned_at is null;
$$;

-- A new loan can't take more sets than are left. The lock stops two admins lending the last set at the same moment.
create or replace function public.check_sets_available()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  owned integer;
  out_now integer;
begin
  perform pg_advisory_xact_lock(hashtext('hv-game:' || new.game_id));
  -- Loans can be backdated (recorded late), but not dated in the future.
  if new.loaned_at > now() + interval '1 day' then
    raise exception 'The loan date can''t be in the future' using errcode = 'HVC03';
  end if;
  if new.due_date is not null and new.due_date < new.loaned_at::date - 1 then
    raise exception 'The due date is before the loan date' using errcode = 'HVC04';
  end if;
  owned := coalesce((select copies from public.game_copies where game_id = new.game_id), 1);
  out_now := public.sets_on_loan(new.game_id);
  if out_now + new.quantity > owned then
    raise exception 'Only % of % sets are available', greatest(owned - out_now, 0), owned
      using errcode = 'HVC01';
  end if;
  return new;
end;
$$;
drop trigger if exists loans_check_sets on public.loans;
create trigger loans_check_sets before insert on public.loans
  for each row execute function public.check_sets_available();

-- The number of sets owned can't drop below the number currently on loan.
create or replace function public.check_copies_cover_loans()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  out_now integer;
begin
  perform pg_advisory_xact_lock(hashtext('hv-game:' || new.game_id));
  out_now := public.sets_on_loan(new.game_id);
  if new.copies < out_now then
    raise exception '% sets are on loan, so the club must own at least that many', out_now
      using errcode = 'HVC02';
  end if;
  return new;
end;
$$;
drop trigger if exists game_copies_check on public.game_copies;
create trigger game_copies_check before insert or update on public.game_copies
  for each row execute function public.check_copies_cover_loans();

-- Access rules.
alter table public.loans enable row level security;
alter table public.game_copies enable row level security;

drop policy if exists "Anyone can view loans" on public.loans;
create policy "Anyone can view loans" on public.loans
  for select using (true);

drop policy if exists "Admins can lend" on public.loans;
create policy "Admins can lend" on public.loans
  for insert to authenticated with check (public.is_admin());

drop policy if exists "Admins can return" on public.loans;
create policy "Admins can return" on public.loans
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Anyone can view sets owned" on public.game_copies;
create policy "Anyone can view sets owned" on public.game_copies
  for select using (true);

drop policy if exists "Admins can add sets owned" on public.game_copies;
create policy "Admins can add sets owned" on public.game_copies
  for insert to authenticated with check (public.is_admin());

drop policy if exists "Admins can change sets owned" on public.game_copies;
create policy "Admins can change sets owned" on public.game_copies
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- No delete policies: loan history can't be deleted from the website (you can still clean up in the Table Editor).

-- Rulebooks: a public Storage bucket with one PDF per game (<game id>.pdf), max 50 MB (the free plan's limit).
-- Anyone can open and list them; only admins can upload, replace or delete.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('rulebooks', 'rulebooks', true, 52428800, array['application/pdf'])
on conflict (id) do update
  set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can list rulebooks" on storage.objects;
create policy "Anyone can list rulebooks" on storage.objects
  for select using (bucket_id = 'rulebooks');

drop policy if exists "Admins can upload rulebooks" on storage.objects;
create policy "Admins can upload rulebooks" on storage.objects
  for insert to authenticated with check (bucket_id = 'rulebooks' and public.is_admin());

drop policy if exists "Admins can replace rulebooks" on storage.objects;
create policy "Admins can replace rulebooks" on storage.objects
  for update to authenticated using (bucket_id = 'rulebooks' and public.is_admin())
  with check (bucket_id = 'rulebooks' and public.is_admin());

drop policy if exists "Admins can delete rulebooks" on storage.objects;
create policy "Admins can delete rulebooks" on storage.objects
  for delete to authenticated using (bucket_id = 'rulebooks' and public.is_admin());

-- Game score records (the Flip 7 scorer and score.html). Anyone can save a finished game and everyone can see them;
-- only admins can change or delete a record afterwards (e.g. fix a name, or remove a test or a duplicate).
create table if not exists public.game_scores (
  id bigint generated always as identity primary key,
  game_id text not null check (char_length(game_id) between 1 and 100),  -- the game's "id" in data/games.json
  played_at timestamptz not null default now(),
  target integer check (target between 1 and 100000),                      -- points needed to win (Flip 7: 200)
  -- [{ "name": "小明", "total": 213 }, ...] in seating order
  -- (Age of Innovation also has optional "faction" and "terrain" keys, e.g. "monks" and "lake"; games played in sides
  -- have "team", e.g. "wolves")
  -- How the game was won is in details.mode (see js/scoreboard.js): none = highest score; "low" = lowest score;
  -- "win" / "teams" / "coop" = no scores, total is 1 (won) or 0. top_score is always the winning value.
  players jsonb not null,
  -- one array per round, one cell per player (same order): { "s": score, "b": true if bust, "f": true if Flip 7 }
  rounds jsonb not null default '[]',
  winner text not null check (char_length(winner) between 1 and 400),    -- names joined with "、" on a tie
  top_score integer not null,
  round_count integer not null check (round_count between 0 and 500)
);
-- The day the game was played (picked by the player, today by default). Older Flip 7 records leave it empty.
alter table public.game_scores add column if not exists played_on date;
-- Choices about the whole game, e.g. SETI's alien species: { "aliens": ["mascamites", "anomalies"] }.
alter table public.game_scores add column if not exists details jsonb not null default '{}';
create index if not exists game_scores_by_game on public.game_scores (game_id, played_at desc);

-- Checks the shape of a record (new or changed), and slows down floods: at most 30 new records a minute across the site.
create or replace function public.check_game_score()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  p jsonb;
begin
  if tg_op = 'INSERT' then
    new.played_at := now();  -- always the time it was first saved
  else
    new.played_at := old.played_at;
    new.game_id := old.game_id;  -- a record stays with its game
  end if;
  if jsonb_typeof(new.players) <> 'array' or jsonb_array_length(new.players) not between 1 and 30 then
    raise exception 'players must list 1 to 30 players' using errcode = 'HVS01';
  end if;
  for p in select * from jsonb_array_elements(new.players) loop
    if jsonb_typeof(p -> 'name') <> 'string' or char_length(trim(p ->> 'name')) not between 1 and 30
       or jsonb_typeof(p -> 'total') <> 'number' then
      raise exception 'each player needs a name (1-30 characters) and a total' using errcode = 'HVS01';
    end if;
    if char_length(coalesce(p ->> 'faction', '')) > 40 or char_length(coalesce(p ->> 'terrain', '')) > 40
       or char_length(coalesce(p ->> 'team', '')) > 40 then
      raise exception 'faction, terrain and team must be 40 characters or fewer' using errcode = 'HVS01';
    end if;
  end loop;
  if jsonb_typeof(new.rounds) <> 'array' or jsonb_array_length(new.rounds) > 500 or pg_column_size(new.rounds) > 100000 then
    raise exception 'too many rounds' using errcode = 'HVS01';
  end if;
  if jsonb_typeof(new.details) <> 'object' or pg_column_size(new.details) > 4000 then
    raise exception 'details must be a small object' using errcode = 'HVS01';
  end if;
  if new.played_on is not null and (new.played_on < date '2000-01-01' or new.played_on > current_date + 1) then
    raise exception 'the game date can not be in the future' using errcode = 'HVS01';
  end if;
  if tg_op = 'INSERT' then
    perform pg_advisory_xact_lock(hashtext('hv-scores'));
    if (select count(*) from public.game_scores where played_at > now() - interval '1 minute') >= 30 then
      raise exception 'Too many records saved just now, try again in a minute' using errcode = 'HVS02';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists game_scores_check on public.game_scores;
create trigger game_scores_check before insert or update on public.game_scores
  for each row execute function public.check_game_score();

alter table public.game_scores enable row level security;
drop policy if exists "Anyone can view scores" on public.game_scores;
create policy "Anyone can view scores" on public.game_scores
  for select using (true);
drop policy if exists "Anyone can save scores" on public.game_scores;
create policy "Anyone can save scores" on public.game_scores
  for insert to anon, authenticated with check (true);
drop policy if exists "Admins can change scores" on public.game_scores;
create policy "Admins can change scores" on public.game_scores
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins can delete scores" on public.game_scores;
create policy "Admins can delete scores" on public.game_scores
  for delete to authenticated using (public.is_admin());

-- Open the tables to the website. Needed when "Automatically expose new tables" is off
-- (recommended); harmless if it is on. The policies above still decide which rows each user can see or change.
-- public.admins gets no grants, so the website can never read or change the admin list.
grant usage on schema public to anon, authenticated;
grant select on public.loans, public.game_copies to anon, authenticated;
grant insert (game_id, borrower, due_date, quantity, loaned_at) on public.loans to authenticated;  -- loaned_at: for backdating
grant update (returned_at) on public.loans to authenticated;
grant insert (game_id, copies, storage_copies, owner, owner_copies, rulebook_from) on public.game_copies to authenticated;
grant update (game_id, copies, storage_copies, owner, owner_copies, rulebook_from) on public.game_copies to authenticated;  -- "insert or update" (upsert) needs every column
grant select on public.game_scores to anon, authenticated;
grant insert (game_id, played_on, details, target, players, rounds, winner, top_score, round_count) on public.game_scores to anon, authenticated;
grant update (played_on, details, target, players, rounds, winner, top_score, round_count) on public.game_scores to authenticated;  -- admins only (policy above)
grant delete on public.game_scores to authenticated;  -- the policy above limits it to admins
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------------------------------------------
-- Events and sign-ups (events.html). Admins publish events; at an event anyone can open a table for a game
-- (from the catalogue or typed in) or join one. Visitors have no accounts: each browser makes a random secret
-- ("token") and sends it when joining, and only that secret can take the person off the table again.
create table if not exists public.events (
  id bigint generated always as identity primary key,
  title text not null check (char_length(trim(title)) between 1 and 80),
  event_date date not null,
  start_time time,                                         -- optional
  description text not null default '' check (char_length(description) <= 2000),
  created_at timestamptz not null default now()
);
create index if not exists events_by_date on public.events (event_date);
-- When the event ends (optional; earlier than the start means it runs past midnight), where it is, and an optional
-- map link (e.g. a Google Maps share link). Without a link the website searches Google Maps for the location.
-- The description can be formatted (font, size, colour…), stored as cleaned HTML, so it may be longer than the
-- text alone: up to 20000 characters (the first version allowed 2000).
alter table public.events drop constraint if exists events_description_check;
alter table public.events drop constraint if exists events_description_length;
alter table public.events add constraint events_description_length check (char_length(description) <= 20000);
alter table public.events add column if not exists end_time time;
alter table public.events add column if not exists location text not null default '' check (char_length(location) <= 200);
alter table public.events add column if not exists map_url text not null default ''
  check (map_url = '' or (char_length(map_url) <= 500 and map_url ~* '^https://'));
-- People coming without signing up (e.g. friends someone brings along). Admins set it; it is added to the headcount.
alter table public.events add column if not exists extra_people integer not null default 0 check (extra_people between 0 and 200);

create table if not exists public.event_tables (
  id bigint generated always as identity primary key,
  event_id bigint not null references public.events (id) on delete cascade,
  game_id text check (game_id is null or char_length(game_id) <= 100),  -- the game's "id" in data/games.json; null = typed in
  game_name text not null check (char_length(trim(game_name)) between 1 and 80),
  on_site boolean not null default true,                   -- the game is at the venue (false: someone has to bring it)
  max_players integer check (max_players is null or max_players between 1 and 30),  -- null = no limit
  note text not null default '' check (char_length(note) <= 200),
  created_at timestamptz not null default now()
);
create index if not exists event_tables_by_event on public.event_tables (event_id);
-- When the game starts (几点开), optional.
alter table public.event_tables add column if not exists start_time time;
-- Who opened the table: their browser's secret (never readable from the website) and their sign-up. Only that browser
-- or an admin can delete the table. Tables opened before this was added have no host_token: only admins can delete them.
alter table public.event_tables add column if not exists host_token text;
alter table public.event_tables add column if not exists host_player bigint;

create table if not exists public.event_players (
  id bigint generated always as identity primary key,
  table_id bigint not null references public.event_tables (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 30),
  joined_at timestamptz not null default now(),
  token text not null check (char_length(token) between 16 and 100)  -- the browser's secret; never readable from the website
);
create index if not exists event_players_by_table on public.event_players (table_id);
create unique index if not exists event_players_one_name on public.event_players (table_id, lower(trim(name)));

-- The player account that signed up (when signed in). Lets them leave, or act as host, from any device.
-- Never readable from the website.
alter table public.event_players add column if not exists user_id uuid references auth.users (id) on delete set null;
-- Signed up without a name (匿名): the website gives them a name like 匿名1, numbered per event.
alter table public.event_players add column if not exists anonymous boolean not null default false;
create index if not exists event_players_by_user on public.event_players (user_id) where user_id is not null;

-- Tables opened before the host was recorded: the first person who joined is the host.
update public.event_tables t
set host_player = p.id, host_token = p.token
from (select distinct on (table_id) id, table_id, token from public.event_players order by table_id, joined_at, id) p
where p.table_id = t.id and t.host_player is null;

-- When the host leaves (or an admin removes them), the next person by joining order becomes the host, and so on.
create or replace function public.pass_event_table_host()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  nxt record;
begin
  if exists (select 1 from public.event_tables where id = old.table_id and host_player = old.id) then
    select id, token into nxt from public.event_players where table_id = old.table_id order by joined_at, id limit 1;
    update public.event_tables set host_player = nxt.id, host_token = nxt.token where id = old.table_id;  -- null when empty
  end if;
  return old;
end;
$$;
drop trigger if exists event_players_pass_host on public.event_players;
create trigger event_players_pass_host after delete on public.event_players
  for each row execute function public.pass_event_table_host();

-- Checks shared by the sign-up functions: the event exists and is not over (one day of slack for time zones),
-- and at most 60 sign-ups a minute across the site.
create or replace function public.event_signup_guard(p_event bigint)
returns void
language plpgsql
set search_path = ''
as $$
declare
  d date;
begin
  select event_date into d from public.events where id = p_event;
  if d is null then
    raise exception 'event not found' using errcode = 'HVE01';
  end if;
  if d < current_date - 1 then
    raise exception 'this event is over' using errcode = 'HVE01';
  end if;
  perform pg_advisory_xact_lock(hashtext('hv-event-signups'));
  if (select count(*) from public.event_players where joined_at > now() - interval '1 minute') >= 60 then
    raise exception 'Too many sign-ups just now, try again in a minute' using errcode = 'HVE04';
  end if;
end;
$$;

-- The name a sign-up is saved under. Empty (or "匿名", "匿名3"…) means anonymous: the same browser keeps one
-- anonymous name per event (so joining two tables is still one person), and a new browser gets the next number
-- (匿名1, 匿名2, …). Any other name is kept as typed.
create or replace function public.event_signup_name(p_event bigint, p_name text, p_token text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  n text := trim(coalesce(p_name, ''));
  r text;
begin
  if n <> '' and n !~ '^匿名[0-9]*$' then
    return n;
  end if;
  select p.name into r from public.event_players p join public.event_tables t on t.id = p.table_id
  where t.event_id = p_event and p.anonymous and p.token = p_token
  order by p.id limit 1;
  if r is not null then
    return r;
  end if;
  select '匿名' || (coalesce(max(substring(p.name from '^匿名([0-9]+)$')::int), 0) + 1) into r
  from public.event_players p join public.event_tables t on t.id = p.table_id
  where t.event_id = p_event and p.name ~ '^匿名[0-9]+$';
  return r;
end;
$$;
revoke execute on function public.event_signup_name(bigint, text, text) from public, anon, authenticated;

-- Opens a table and seats the person who opened it. Returns { "table_id": …, "player_id": … }.
-- (The older version without a start time is removed so the website can't call it.)
-- p_user: admins only, the player account the sign-up is for (see event_signup_user).
drop function if exists public.open_event_table(bigint, text, text, boolean, integer, text, text, text);
drop function if exists public.open_event_table(bigint, text, text, boolean, integer, text, text, text, time);
create or replace function public.open_event_table(p_event bigint, p_game_id text, p_game_name text, p_on_site boolean,
  p_max_players integer, p_note text, p_name text, p_token text, p_start_time time default null, p_user uuid default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  t bigint;
  p bigint;
  nm text;
begin
  perform public.event_signup_guard(p_event);
  perform public.event_name_guard(p_name);
  nm := public.event_signup_name(p_event, p_name, p_token);
  if (select count(*) from public.event_tables where event_id = p_event) >= 100 then
    raise exception 'too many tables at this event' using errcode = 'HVE05';
  end if;
  if p_token is null or char_length(p_token) not between 16 and 100 then
    raise exception 'missing browser secret' using errcode = 'HVE05';
  end if;
  insert into public.event_tables (event_id, game_id, game_name, on_site, max_players, note, start_time, host_token)
  values (p_event, nullif(trim(p_game_id), ''), trim(p_game_name), coalesce(p_on_site, false), p_max_players,
          coalesce(trim(p_note), ''), p_start_time, p_token)
  returning id into t;
  insert into public.event_players (table_id, name, token, user_id, anonymous)
  values (t, nm, p_token, public.event_signup_user(nm, p_user), nm is distinct from trim(coalesce(p_name, '')) or nm ~ '^匿名[0-9]+$')
  returning id into p;
  update public.event_tables set host_player = p where id = t;
  return jsonb_build_object('table_id', t, 'player_id', p);
end;
$$;

-- Joins a table. Returns the new player id. p_user: admins only, the player account the sign-up is for.
drop function if exists public.join_event_table(bigint, text, text);
create or replace function public.join_event_table(p_table bigint, p_name text, p_token text, p_user uuid default null)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  ev bigint;
  cap integer;
  p bigint;
  u uuid;
  nm text;
begin
  select event_id, max_players into ev, cap from public.event_tables where id = p_table for update;
  if ev is null then
    raise exception 'table not found' using errcode = 'HVE01';
  end if;
  perform public.event_signup_guard(ev);
  perform public.event_name_guard(p_name);
  nm := public.event_signup_name(ev, p_name, p_token);
  if cap is not null and (select count(*) from public.event_players where table_id = p_table) >= cap then
    raise exception 'this table is full' using errcode = 'HVE02';
  end if;
  if exists (select 1 from public.event_players where table_id = p_table and lower(trim(name)) = lower(nm)) then
    raise exception 'someone with this name already joined' using errcode = 'HVE03';
  end if;
  u := public.event_signup_user(nm, p_user);
  if u is not null and exists (select 1 from public.event_players where table_id = p_table and user_id = u) then
    raise exception 'this account already joined this table' using errcode = 'HVE07';
  end if;
  insert into public.event_players (table_id, name, token, user_id, anonymous)
  values (p_table, nm, p_token, u, nm is distinct from trim(coalesce(p_name, '')) or nm ~ '^匿名[0-9]+$') returning id into p;
  return p;
end;
$$;

-- Leaves a table (only with the secret used to join). Returns true if it worked. A host who leaves can hand the table
-- to another player there (p_next); otherwise the next person by joining order becomes the host (trigger above), so
-- the last one to leave is always the host, and then the table is removed.
drop function if exists public.leave_event_table(bigint, text);
create or replace function public.leave_event_table(p_player bigint, p_token text, p_next bigint default null)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  t bigint;
  nxt record;
begin
  -- The browser's secret, or the signed-in account that signed up.
  select table_id into t from public.event_players
  where id = p_player and (token = p_token or (user_id is not null and user_id = auth.uid()))
  for update;
  if t is null then
    return false;
  end if;
  -- The host chose who takes over: hand it over first, so the trigger leaves it alone.
  if p_next is not null and p_next <> p_player
     and exists (select 1 from public.event_tables where id = t and host_player = p_player) then
    select id, token into nxt from public.event_players where id = p_next and table_id = t;
    if nxt.id is not null then
      update public.event_tables set host_player = nxt.id, host_token = nxt.token where id = t;
    end if;
  end if;
  delete from public.event_players where id = p_player;
  delete from public.event_tables where id = t and not exists (select 1 from public.event_players where table_id = t);
  return true;
end;
$$;

-- True when the caller is a table's current host: by the host's browser secret, or by the account they signed up with.
create or replace function public.is_event_table_host(p_table bigint, p_host_token text, p_host_player bigint, p_token text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (p_token is not null and char_length(p_token) >= 16 and p_host_token = p_token)
      or (auth.uid() is not null and exists (
            select 1 from public.event_players where id = p_host_player and table_id = p_table and user_id = auth.uid()));
$$;

-- Changes a table's start time (null clears it); only the current host's browser (admins change tables directly).
-- Returns true if it worked, false if this browser isn't the host.
create or replace function public.set_event_table_time(p_table bigint, p_token text, p_start_time time)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  t bigint;
begin
  update public.event_tables set start_time = p_start_time
  where id = p_table and public.is_event_table_host(id, host_token, host_player, p_token)
  returning id into t;
  return t is not null;
end;
$$;

-- Deletes a table; only its current host (admins delete tables directly), and only while nobody else has joined it
-- (with other players there, the host can leave instead and hand the table over).
-- Returns true if it worked, false if the caller isn't the host; raises HVE08 if other players are still there.
create or replace function public.delete_event_table(p_table bigint, p_token text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  tb record;
begin
  select id, host_token, host_player into tb from public.event_tables where id = p_table for update;
  if tb.id is null or not public.is_event_table_host(tb.id, tb.host_token, tb.host_player, p_token) then
    return false;
  end if;
  if exists (select 1 from public.event_players where table_id = tb.id and id <> tb.host_player) then
    raise exception 'other players are still at this table' using errcode = 'HVE08';
  end if;
  delete from public.event_tables where id = tb.id;
  return true;
end;
$$;

-- Admins make another player at a table its host (开桌人). Returns true if it worked, false if that player isn't
-- at the table. The host's browser secret moves with it, so the new host can manage the table from their device.
create or replace function public.set_event_table_host(p_table bigint, p_player bigint)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  t bigint;
begin
  if not public.is_admin() then
    raise exception 'admins only' using errcode = '42501';
  end if;
  update public.event_tables et set host_player = p.id, host_token = p.token
  from public.event_players p
  where et.id = p_table and p.id = p_player and p.table_id = p_table
  returning et.id into t;
  return t is not null;
end;
$$;

alter table public.events enable row level security;
alter table public.event_tables enable row level security;
alter table public.event_players enable row level security;
drop policy if exists "Anyone can view events" on public.events;
create policy "Anyone can view events" on public.events for select using (true);
drop policy if exists "Admins can add events" on public.events;
create policy "Admins can add events" on public.events for insert to authenticated with check (public.is_admin());
drop policy if exists "Admins can change events" on public.events;
create policy "Admins can change events" on public.events
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins can delete events" on public.events;
create policy "Admins can delete events" on public.events for delete to authenticated using (public.is_admin());
drop policy if exists "Anyone can view event tables" on public.event_tables;
create policy "Anyone can view event tables" on public.event_tables for select using (true);
drop policy if exists "Admins can change event tables" on public.event_tables;
create policy "Admins can change event tables" on public.event_tables
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins can delete event tables" on public.event_tables;
create policy "Admins can delete event tables" on public.event_tables for delete to authenticated using (public.is_admin());
drop policy if exists "Anyone can view event players" on public.event_players;
create policy "Anyone can view event players" on public.event_players for select using (true);
drop policy if exists "Admins can remove event players" on public.event_players;
create policy "Admins can remove event players" on public.event_players for delete to authenticated using (public.is_admin());

-- Visitors open and join tables only through the functions above (no direct inserts).
grant select on public.events to anon, authenticated;
-- Every column except host_token (an older version of this file granted the whole table, so take that back first).
revoke select on public.event_tables from anon, authenticated;
grant select (id, event_id, game_id, game_name, on_site, max_players, note, created_at, start_time, host_player)
  on public.event_tables to anon, authenticated;
grant select (id, table_id, name, joined_at) on public.event_players to anon, authenticated;  -- not the token
grant insert (title, event_date, start_time, end_time, location, map_url, description, extra_people) on public.events to authenticated;
grant update (title, event_date, start_time, end_time, location, map_url, description, extra_people) on public.events to authenticated;
grant delete on public.events to authenticated;
grant update (game_name, on_site, max_players, note, start_time) on public.event_tables to authenticated;  -- admins only (policy)
grant delete on public.event_tables, public.event_players to authenticated;
revoke execute on function public.event_signup_guard(bigint) from public, anon, authenticated;
revoke execute on function public.open_event_table(bigint, text, text, boolean, integer, text, text, text, time, uuid) from public;
revoke execute on function public.join_event_table(bigint, text, text, uuid) from public;
revoke execute on function public.leave_event_table(bigint, text, bigint) from public;
revoke execute on function public.delete_event_table(bigint, text) from public;
revoke execute on function public.set_event_table_time(bigint, text, time) from public;
grant execute on function public.set_event_table_time(bigint, text, time) to anon, authenticated;
revoke execute on function public.is_event_table_host(bigint, text, bigint, text) from public, anon, authenticated;
grant execute on function public.open_event_table(bigint, text, text, boolean, integer, text, text, text, time, uuid) to anon, authenticated;
grant execute on function public.join_event_table(bigint, text, text, uuid) to anon, authenticated;
grant execute on function public.leave_event_table(bigint, text, bigint) to anon, authenticated;
grant execute on function public.delete_event_table(bigint, text) to anon, authenticated;
revoke execute on function public.set_event_table_host(bigint, bigint) from public, anon;
grant execute on function public.set_event_table_host(bigint, bigint) to authenticated;  -- checks is_admin() itself

-- ---------------------------------------------------------------------------------------------------------------
-- Games played at an event table (对局). On the day of the event the table's host (开桌人) or an admin starts a game:
-- it is saved straight away as a game record (game_scores) with the players they picked from the table (everyone by
-- default) and no scores yet ("pending"). Then the host, an admin, or any player in that game who has an account (signed
-- up with it, or the name is one of their profile names) fills in the scores, and can correct them for 7 days after the
-- event. The host can start more games at the same table, with other players, and can add people who didn't sign up
-- (if there are seats left). Only games from the catalogue can be recorded (a record belongs to a game in data/games.json).
alter table public.game_scores add column if not exists pending boolean not null default false;  -- started, no scores yet
grant update (pending) on public.game_scores to authenticated;  -- admins only (policy): fixing a record clears it

create table if not exists public.event_games (
  id bigint generated always as identity primary key,
  table_id bigint not null references public.event_tables (id) on delete cascade,
  score_id bigint not null unique references public.game_scores (id) on delete cascade,  -- the record stays if the table goes
  started_at timestamptz not null default now()
);
create index if not exists event_games_by_table on public.event_games (table_id);
alter table public.event_games enable row level security;
drop policy if exists "Anyone can view event games" on public.event_games;
create policy "Anyone can view event games" on public.event_games for select using (true);
grant select (id, table_id, score_id, started_at) on public.event_games to anon, authenticated;

-- True when the caller may fill in a game's scores: an admin, the table's host, or a signed-in player in that game
-- (p_players: the record's players), matched by the account they signed up at the table with, or their profile names.
create or replace function public.can_score_event_game(p_table bigint, p_host_token text, p_host_player bigint, p_token text, p_players jsonb)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_admin()
      or public.is_event_table_host(p_table, p_host_token, p_host_player, p_token)
      or (auth.uid() is not null and exists (
            select 1 from jsonb_array_elements(p_players) pl
            where lower(trim(pl ->> 'name')) in (
              select lower(trim(p.name)) from public.event_players p where p.table_id = p_table and p.user_id = auth.uid()
              union all
              select lower(trim(n)) from public.profiles pr, unnest(array_append(pr.aliases, pr.name)) n where pr.user_id = auth.uid())));
$$;

-- Starts a game at a table: the host or an admin, on the day of the event (one day of slack for time zones).
-- p_players: the sign-ups who play (null = everyone at the table). p_record_game: the game the record is saved under,
-- when it isn't the table's own (an expansion or another edition is recorded under its base game). Returns the
-- new record's id.
drop function if exists public.start_event_game(bigint, text, bigint[]);
create or replace function public.start_event_game(p_table bigint, p_token text, p_players bigint[] default null,
  p_record_game text default null)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  tb record;
  names jsonb;
  n integer;
  s bigint;
begin
  select t.id, t.game_id, t.host_token, t.host_player, e.event_date into tb
  from public.event_tables t join public.events e on e.id = t.event_id
  where t.id = p_table for update of t;
  if tb.id is null then
    raise exception 'table not found' using errcode = 'HVE01';
  end if;
  if not (public.is_admin() or public.is_event_table_host(tb.id, tb.host_token, tb.host_player, p_token)) then
    raise exception 'only the host can start a game' using errcode = 'HVG01';
  end if;
  if tb.event_date not between current_date - 1 and current_date + 1 then
    raise exception 'games are started on the day of the event' using errcode = 'HVG02';
  end if;
  if tb.game_id is null then
    raise exception 'only games from the catalogue can be recorded' using errcode = 'HVG03';
  end if;
  if (select count(*) from public.event_games where table_id = tb.id) >= 30 then
    raise exception 'too many games at this table' using errcode = 'HVG04';
  end if;
  select jsonb_agg(jsonb_build_object('name', p.name, 'total', 0) order by p.joined_at, p.id), count(*) into names, n
  from public.event_players p
  where p.table_id = tb.id and (p_players is null or p.id = any (p_players));
  if coalesce(n, 0) = 0 then
    raise exception 'pick at least one player' using errcode = 'HVG05';
  end if;
  insert into public.game_scores (game_id, played_on, players, rounds, winner, top_score, round_count, pending)
  values (case when p_record_game ~ '^[a-z0-9-]{1,100}$' then p_record_game else tb.game_id end,
          tb.event_date, names, '[]', '—', 0, 0, true)
  returning id into s;
  insert into public.event_games (table_id, score_id) values (tb.id, s);
  return s;
end;
$$;

-- Fills in (or corrects) a game's result: p_totals is one whole number per player, in the record's order: their score,
-- or 1 (won) / 0 for games without scores. p_details says how the game is won: { "mode": "low" | "win" | "teams" |
-- "coop", "winTeam": side, "won": true/false, "score": team score } (null or no mode = highest score wins);
-- p_teams: each player's side (mode "teams"). Works out the winner. Returns false if the caller may not
-- (see can_score_event_game).
drop function if exists public.set_event_game_scores(bigint, text, jsonb);
create or replace function public.set_event_game_scores(p_score bigint, p_token text, p_totals jsonb,
  p_teams jsonb default null, p_details jsonb default null)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  g record;
  outp jsonb := '[]';
  v jsonb;
  pl jsonb;
  tm text;
  top integer;
  win text;
  mode text := coalesce(p_details ->> 'mode', 'high');
  det jsonb := '{}';
begin
  if p_details is not null and (jsonb_typeof(p_details) <> 'object' or pg_column_size(p_details) > 2000) then
    raise exception 'details must be a small object' using errcode = 'HVG07';
  end if;
  if mode not in ('high', 'low', 'win', 'teams', 'coop') then
    raise exception 'unknown scoring method' using errcode = 'HVG07';
  end if;
  if mode = 'teams' and (jsonb_typeof(p_teams) is distinct from 'array' or jsonb_typeof(p_details -> 'winTeam') is distinct from 'string'
                         or char_length(p_details ->> 'winTeam') not between 1 and 40) then
    raise exception 'pick each side and the winning side' using errcode = 'HVG07';
  end if;
  if mode = 'coop' and (jsonb_typeof(p_details -> 'won') is distinct from 'boolean'
       or (p_details ? 'score' and (jsonb_typeof(p_details -> 'score') <> 'number'
           or (p_details ->> 'score')::numeric not between -9999 and 9999))) then
    raise exception 'pick the result' using errcode = 'HVG07';
  end if;
  select s.id, s.players, t.id as table_id, t.host_token, t.host_player, e.event_date into g
  from public.event_games eg
  join public.game_scores s on s.id = eg.score_id
  join public.event_tables t on t.id = eg.table_id
  join public.events e on e.id = t.event_id
  where eg.score_id = p_score
  for update of s;
  if g.id is null or not public.can_score_event_game(g.table_id, g.host_token, g.host_player, p_token, g.players) then
    return false;
  end if;
  if not public.is_admin() and g.event_date < current_date - 7 then
    raise exception 'scores can be changed for 7 days after the event' using errcode = 'HVG06';
  end if;
  if jsonb_typeof(p_totals) is distinct from 'array' or jsonb_array_length(p_totals) <> jsonb_array_length(g.players) then
    raise exception 'one score per player' using errcode = 'HVG07';
  end if;
  for i in 0 .. jsonb_array_length(g.players) - 1 loop
    v := p_totals -> i;
    if jsonb_typeof(v) <> 'number' or (v #>> '{}')::numeric <> trunc((v #>> '{}')::numeric)
       or (v #>> '{}')::numeric not between -9999 and 9999
       or (mode in ('win', 'teams', 'coop') and (v #>> '{}')::numeric not in (0, 1)) then
      raise exception 'scores are whole numbers from -9999 to 9999 (1 or 0 without scores)' using errcode = 'HVG07';
    end if;
    pl := jsonb_set(g.players -> i, '{total}', to_jsonb((v #>> '{}')::integer)) - 'team';
    if mode = 'teams' then
      tm := p_teams ->> i;
      if tm is null or char_length(tm) not between 1 and 40 then
        raise exception 'pick a side for every player' using errcode = 'HVG07';
      end if;
      pl := pl || jsonb_build_object('team', tm);
    end if;
    outp := outp || jsonb_build_array(pl);
  end loop;
  if mode = 'coop' and (select count(distinct x ->> 'total') from jsonb_array_elements(outp) x) > 1 then
    raise exception 'a co-op game is won or lost by everyone' using errcode = 'HVG07';
  end if;
  select case mode when 'low' then min((x ->> 'total')::integer) when 'high' then max((x ->> 'total')::integer) else 1 end
  into top from jsonb_array_elements(outp) x;
  select string_agg(x ->> 'name', '、' order by o) into win
  from jsonb_array_elements(outp) with ordinality a (x, o) where (x ->> 'total')::integer = top;
  if mode <> 'high' then
    det := jsonb_strip_nulls(jsonb_build_object('mode', mode,
      'winTeam', case when mode = 'teams' then p_details -> 'winTeam' end,
      'won', case when mode = 'coop' then p_details -> 'won' end,
      'score', case when mode = 'coop' then p_details -> 'score' end));
  end if;
  update public.game_scores
  set players = outp, top_score = top, winner = left(coalesce(win, '—'), 400), details = det, pending = false
  where id = g.id;
  return true;
end;
$$;

-- Cancels a game started by mistake: the host or an admin, only while no scores are in. Deletes its record.
-- Returns false if it isn't possible (not the host, scores already in, or already gone).
create or replace function public.cancel_event_game(p_score bigint, p_token text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  s bigint;
begin
  delete from public.game_scores gs
  using public.event_games eg, public.event_tables t
  where gs.id = p_score and gs.pending and eg.score_id = gs.id and t.id = eg.table_id
    and (public.is_admin() or public.is_event_table_host(t.id, t.host_token, t.host_player, p_token))
  returning gs.id into s;
  return s is not null;
end;
$$;

-- The host or an admin adds someone who didn't sign up (by name) to the table, if there's a seat left. With p_score,
-- they also join that game, if its scores aren't in yet. Returns the new player id. The added person has no browser
-- secret of their own: the host or an admin takes them off again.
create or replace function public.add_event_table_player(p_table bigint, p_token text, p_name text, p_score bigint default null)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  tb record;
  p bigint;
begin
  select id, event_id, max_players, host_token, host_player into tb from public.event_tables where id = p_table for update;
  if tb.id is null then
    raise exception 'table not found' using errcode = 'HVE01';
  end if;
  if not (public.is_admin() or public.is_event_table_host(tb.id, tb.host_token, tb.host_player, p_token)) then
    raise exception 'only the host can add players' using errcode = 'HVG01';
  end if;
  perform public.event_signup_guard(tb.event_id);
  if tb.max_players is not null and (select count(*) from public.event_players where table_id = tb.id) >= tb.max_players then
    raise exception 'this table is full' using errcode = 'HVE02';
  end if;
  if exists (select 1 from public.event_players where table_id = tb.id and lower(trim(name)) = lower(trim(p_name))) then
    raise exception 'someone with this name already joined' using errcode = 'HVE03';
  end if;
  -- A name that belongs to exactly one player account is linked to it (see player_account_names).
  insert into public.event_players (table_id, name, token, user_id)
  values (tb.id, trim(p_name), replace(gen_random_uuid()::text, '-', ''),
          (select n.user_id from public.player_account_names() n where n.k = lower(trim(p_name))))
  returning id into p;
  if p_score is not null then
    update public.game_scores gs
    set players = gs.players || jsonb_build_array(jsonb_build_object('name', trim(p_name), 'total', 0))
    from public.event_games eg
    where gs.id = p_score and gs.pending and eg.score_id = gs.id and eg.table_id = tb.id
      and jsonb_array_length(gs.players) < 30
      and not exists (select 1 from jsonb_array_elements(gs.players) x where lower(trim(x ->> 'name')) = lower(trim(p_name)));
  end if;
  return p;
end;
$$;

revoke execute on function public.can_score_event_game(bigint, text, bigint, text, jsonb) from public, anon, authenticated;
revoke execute on function public.start_event_game(bigint, text, bigint[], text) from public;
revoke execute on function public.set_event_game_scores(bigint, text, jsonb, jsonb, jsonb) from public;
revoke execute on function public.cancel_event_game(bigint, text) from public;
revoke execute on function public.add_event_table_player(bigint, text, text, bigint) from public;
grant execute on function public.start_event_game(bigint, text, bigint[], text) to anon, authenticated;
grant execute on function public.set_event_game_scores(bigint, text, jsonb, jsonb, jsonb) to anon, authenticated;
grant execute on function public.cancel_event_game(bigint, text) to anon, authenticated;
grant execute on function public.add_event_table_player(bigint, text, text, bigint) to anon, authenticated;

-- ---------------------------------------------------------------------------------------------------------------
-- Event wishes (期望活动): anyone can suggest an event they'd like (their name, the event's name, a short description).
-- Everyone can see them. The person who suggested one can change or delete it (from the same browser, or signed in
-- with the same account); admins adopt (已采纳) or decline (未采纳) it, or delete it. Suggesting doesn't mean it will
-- be held. Anyone can add a "我也想参加 +1" vote, once per browser / account.
create table if not exists public.event_wishes (
  id bigint generated always as identity primary key,
  name text not null check (char_length(trim(name)) between 1 and 30),
  title text not null check (char_length(trim(title)) between 1 and 80),
  description text not null default '' check (char_length(description) <= 1000),
  status text not null default 'open',
  created_at timestamptz not null default now(),
  user_id uuid references auth.users (id) on delete set null  -- the account that suggested it; never readable
);
-- 'open' (待定), 'adopted' (已采纳) or 'rejected' (未采纳). (The first version had no 'rejected'.)
alter table public.event_wishes drop constraint if exists event_wishes_status_check;
alter table public.event_wishes add constraint event_wishes_status_check check (status in ('open', 'adopted', 'rejected'));
-- The suggesting browser's secret (like event sign-ups); never readable. Lets them change or delete it.
alter table public.event_wishes add column if not exists token text;
-- How many "+1" votes it has (kept up to date by toggle_event_wish_vote).
alter table public.event_wishes add column if not exists votes integer not null default 0;
create index if not exists event_wishes_by_date on public.event_wishes (created_at desc);

-- One "+1" per browser secret, and one per signed-in account. Never readable from the website.
create table if not exists public.event_wish_votes (
  id bigint generated always as identity primary key,
  wish_id bigint not null references public.event_wishes (id) on delete cascade,
  token text not null check (char_length(token) between 16 and 100),
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create unique index if not exists event_wish_votes_one_per_browser on public.event_wish_votes (wish_id, token);
create unique index if not exists event_wish_votes_one_per_account on public.event_wish_votes (wish_id, user_id) where user_id is not null;
alter table public.event_wish_votes enable row level security;  -- no policies, no grants: only the functions below use it
revoke all on public.event_wish_votes from anon, authenticated;

-- Adds a wish (plain text). At most 20 a minute across the site. Returns the new id.
-- (The first version had no browser secret; it is removed so the website can't call it.)
drop function if exists public.add_event_wish(text, text, text);
create or replace function public.add_event_wish(p_name text, p_title text, p_description text, p_token text)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  w bigint;
begin
  if p_token is null or char_length(p_token) not between 16 and 100 then
    raise exception 'missing browser secret' using errcode = 'HVW03';
  end if;
  perform pg_advisory_xact_lock(hashtext('hv-event-wishes'));
  if (select count(*) from public.event_wishes where created_at > now() - interval '1 minute') >= 20 then
    raise exception 'Too many suggestions just now, try again in a minute' using errcode = 'HVW01';
  end if;
  insert into public.event_wishes (name, title, description, token, user_id)
  values (trim(p_name), trim(p_title), trim(coalesce(p_description, '')), p_token, auth.uid())
  returning id into w;
  return w;
end;
$$;

-- True when the caller suggested this wish: same browser secret, or the same signed-in account.
create or replace function public.is_event_wish_owner(p_token_saved text, p_user_saved uuid, p_token text)
returns boolean
language sql
stable
set search_path = ''
as $$
  select (p_token is not null and char_length(p_token) >= 16 and p_token_saved = p_token)
      or (auth.uid() is not null and p_user_saved = auth.uid());
$$;

-- The person who suggested a wish changes it. Returns true if it worked, false if the caller didn't suggest it.
create or replace function public.update_event_wish(p_wish bigint, p_token text, p_name text, p_title text, p_description text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  w bigint;
begin
  update public.event_wishes
  set name = trim(p_name), title = trim(p_title), description = trim(coalesce(p_description, ''))
  where id = p_wish and public.is_event_wish_owner(token, user_id, p_token)
  returning id into w;
  return w is not null;
end;
$$;

-- The person who suggested a wish deletes it (admins delete directly). Returns true if it worked.
create or replace function public.delete_event_wish(p_wish bigint, p_token text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  w bigint;
begin
  delete from public.event_wishes
  where id = p_wish and public.is_event_wish_owner(token, user_id, p_token)
  returning id into w;
  return w is not null;
end;
$$;

-- Adds this browser's / account's "+1" to a wish, or takes it back if it's already there.
-- Returns { "voted": true/false, "votes": <new count> }. Declined wishes can't get new votes (HVW02).
-- At most 120 new votes a minute across the site.
create or replace function public.toggle_event_wish_vote(p_wish bigint, p_token text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  st text;
  v bigint;
  n integer;
begin
  if p_token is null or char_length(p_token) not between 16 and 100 then
    raise exception 'missing browser secret' using errcode = 'HVW03';
  end if;
  select status into st from public.event_wishes where id = p_wish for update;
  if st is null then
    raise exception 'wish not found' using errcode = 'HVW04';
  end if;
  select id into v from public.event_wish_votes
  where wish_id = p_wish and (token = p_token or (auth.uid() is not null and user_id = auth.uid()))
  limit 1;
  if v is not null then
    delete from public.event_wish_votes
    where wish_id = p_wish and (token = p_token or (auth.uid() is not null and user_id = auth.uid()));
  else
    if st = 'rejected' then
      raise exception 'this wish was declined' using errcode = 'HVW02';
    end if;
    perform pg_advisory_xact_lock(hashtext('hv-event-wish-votes'));
    if (select count(*) from public.event_wish_votes where created_at > now() - interval '1 minute') >= 120 then
      raise exception 'Too many votes just now, try again in a minute' using errcode = 'HVW01';
    end if;
    insert into public.event_wish_votes (wish_id, token, user_id) values (p_wish, p_token, auth.uid());
  end if;
  select count(*) into n from public.event_wish_votes where wish_id = p_wish;
  update public.event_wishes set votes = n where id = p_wish;
  return jsonb_build_object('voted', v is null, 'votes', n);
end;
$$;

-- Which wishes this browser / account suggested and voted for: { "mine": [ids], "voted": [ids] }.
create or replace function public.my_event_wish_state(p_token text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'mine', coalesce((select jsonb_agg(id) from public.event_wishes w
                      where public.is_event_wish_owner(w.token, w.user_id, p_token)), '[]'::jsonb),
    'voted', coalesce((select jsonb_agg(distinct wish_id) from public.event_wish_votes x
                       where (p_token is not null and char_length(p_token) >= 16 and x.token = p_token)
                          or (auth.uid() is not null and x.user_id = auth.uid())), '[]'::jsonb));
$$;

alter table public.event_wishes enable row level security;
drop policy if exists "Anyone can view event wishes" on public.event_wishes;
create policy "Anyone can view event wishes" on public.event_wishes for select using (true);
drop policy if exists "Admins can change event wishes" on public.event_wishes;
create policy "Admins can change event wishes" on public.event_wishes
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins can delete event wishes" on public.event_wishes;
create policy "Admins can delete event wishes" on public.event_wishes for delete to authenticated using (public.is_admin());
revoke all on public.event_wishes from anon, authenticated;
grant select (id, name, title, description, status, votes, created_at) on public.event_wishes to anon, authenticated;  -- not user_id or token
grant update (status) on public.event_wishes to authenticated;  -- admins only (policy)
grant delete on public.event_wishes to authenticated;           -- admins only (policy)
revoke execute on function public.add_event_wish(text, text, text, text) from public;
revoke execute on function public.is_event_wish_owner(text, uuid, text) from public, anon, authenticated;
revoke execute on function public.update_event_wish(bigint, text, text, text, text) from public;
revoke execute on function public.delete_event_wish(bigint, text) from public;
revoke execute on function public.toggle_event_wish_vote(bigint, text) from public;
revoke execute on function public.my_event_wish_state(text) from public;
grant execute on function public.add_event_wish(text, text, text, text) to anon, authenticated;
grant execute on function public.update_event_wish(bigint, text, text, text, text) to anon, authenticated;
grant execute on function public.delete_event_wish(bigint, text) to anon, authenticated;
grant execute on function public.toggle_event_wish_vote(bigint, text) to anon, authenticated;
grant execute on function public.my_event_wish_state(text) to anon, authenticated;

-- ---------------------------------------------------------------------------------------------------------------
-- Event organizers (负责人). Only admins can see the list and manage it. Each event has one main organizer and any
-- number of deputies. Visitors see an organizer's contact details only while they are assigned to an event that is
-- coming up (or was yesterday or today), so the details don't stay public after the event.
create table if not exists public.staff (
  id bigint generated always as identity primary key,
  name text not null check (char_length(trim(name)) between 1 and 30),
  phone text not null default '' check (char_length(phone) <= 30),
  wechat text not null default '' check (char_length(wechat) <= 60),
  xhs text not null default '' check (char_length(xhs) <= 60),           -- 小红书号
  wechat_qr text check (wechat_qr is null or char_length(wechat_qr) <= 200),  -- path in the "staff-qr" bucket
  xhs_qr text check (xhs_qr is null or char_length(xhs_qr) <= 200),
  created_at timestamptz not null default now()
);

create table if not exists public.event_staff (
  event_id bigint not null references public.events (id) on delete cascade,
  staff_id bigint not null references public.staff (id) on delete cascade,
  is_lead boolean not null default false,                -- the main organizer (主负责人)
  sort integer not null default 0,
  primary key (event_id, staff_id)
);
create unique index if not exists event_staff_one_lead on public.event_staff (event_id) where is_lead;
create index if not exists event_staff_by_staff on public.event_staff (staff_id);

alter table public.staff enable row level security;
alter table public.event_staff enable row level security;
drop policy if exists "Admins and current event visitors can view staff" on public.staff;
create policy "Admins and current event visitors can view staff" on public.staff for select using (
  public.is_admin() or exists (
    select 1 from public.event_staff es join public.events e on e.id = es.event_id
    where es.staff_id = staff.id and e.event_date >= current_date - 1));
drop policy if exists "Admins can add staff" on public.staff;
create policy "Admins can add staff" on public.staff for insert to authenticated with check (public.is_admin());
drop policy if exists "Admins can change staff" on public.staff;
create policy "Admins can change staff" on public.staff
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins can delete staff" on public.staff;
create policy "Admins can delete staff" on public.staff for delete to authenticated using (public.is_admin());
drop policy if exists "Anyone can view event staff" on public.event_staff;
create policy "Anyone can view event staff" on public.event_staff for select using (true);

-- Sets an event's organizers in one go (admins only): one main organizer and the deputies, in order.
create or replace function public.set_event_staff(p_event bigint, p_lead bigint, p_deputies bigint[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'admins only' using errcode = '42501';
  end if;
  if p_lead is null then
    raise exception 'an event needs a main organizer' using errcode = 'HVE06';
  end if;
  delete from public.event_staff where event_id = p_event;
  insert into public.event_staff (event_id, staff_id, is_lead, sort) values (p_event, p_lead, true, 0);
  insert into public.event_staff (event_id, staff_id, is_lead, sort)
  select p_event, d, false, o::integer
  from unnest(coalesce(p_deputies, '{}')) with ordinality as x(d, o)
  where d is not null and d <> p_lead
  on conflict do nothing;
end;
$$;

grant select on public.staff, public.event_staff to anon, authenticated;
grant insert (name, phone, wechat, xhs, wechat_qr, xhs_qr) on public.staff to authenticated;
grant update (name, phone, wechat, xhs, wechat_qr, xhs_qr) on public.staff to authenticated;
grant delete on public.staff to authenticated;
revoke execute on function public.set_event_staff(bigint, bigint, bigint[]) from public, anon;
grant execute on function public.set_event_staff(bigint, bigint, bigint[]) to authenticated;

-- QR codes (微信 / 小红书): a public bucket so event pages can show them. Files get random names and the bucket
-- can't be listed by visitors; only admins can upload, replace or delete.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('staff-qr', 'staff-qr', true, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update
  set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists "Admins can list staff QR codes" on storage.objects;
create policy "Admins can list staff QR codes" on storage.objects
  for select to authenticated using (bucket_id = 'staff-qr' and public.is_admin());
drop policy if exists "Admins can upload staff QR codes" on storage.objects;
create policy "Admins can upload staff QR codes" on storage.objects
  for insert to authenticated with check (bucket_id = 'staff-qr' and public.is_admin());
drop policy if exists "Admins can replace staff QR codes" on storage.objects;
create policy "Admins can replace staff QR codes" on storage.objects
  for update to authenticated using (bucket_id = 'staff-qr' and public.is_admin())
  with check (bucket_id = 'staff-qr' and public.is_admin());
drop policy if exists "Admins can delete staff QR codes" on storage.objects;
create policy "Admins can delete staff QR codes" on storage.objects
  for delete to authenticated using (bucket_id = 'staff-qr' and public.is_admin());

-- ---------------------------------------------------------------------------------------------------------------
-- Event templates: a saved event name, description, start and end time, place and map link, to fill in the event
-- form quickly. Admins only.
-- One template per name (not case-sensitive); saving under an existing name replaces it.
create table if not exists public.event_templates (
  id bigint generated always as identity primary key,
  title text not null check (char_length(trim(title)) between 1 and 80),
  description text not null default '' check (char_length(description) <= 2000),
  updated_at timestamptz not null default now()
);
alter table public.event_templates add column if not exists location text not null default '' check (char_length(location) <= 200);
alter table public.event_templates add column if not exists map_url text not null default ''
  check (map_url = '' or (char_length(map_url) <= 500 and map_url ~* '^https://'));
alter table public.event_templates drop constraint if exists event_templates_description_check;
alter table public.event_templates drop constraint if exists event_templates_description_length;
alter table public.event_templates add constraint event_templates_description_length check (char_length(description) <= 20000);
alter table public.event_templates add column if not exists start_time time;
alter table public.event_templates add column if not exists end_time time;
create unique index if not exists event_templates_one_name on public.event_templates (lower(trim(title)));
alter table public.event_templates enable row level security;
drop policy if exists "Admins can view event templates" on public.event_templates;
create policy "Admins can view event templates" on public.event_templates
  for select to authenticated using (public.is_admin());
drop policy if exists "Admins can add event templates" on public.event_templates;
create policy "Admins can add event templates" on public.event_templates
  for insert to authenticated with check (public.is_admin());
drop policy if exists "Admins can change event templates" on public.event_templates;
create policy "Admins can change event templates" on public.event_templates
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins can delete event templates" on public.event_templates;
create policy "Admins can delete event templates" on public.event_templates
  for delete to authenticated using (public.is_admin());
grant select, delete on public.event_templates to authenticated;
grant insert (title, description, start_time, end_time, location, map_url) on public.event_templates to authenticated;
grant update (title, description, start_time, end_time, location, map_url, updated_at) on public.event_templates to authenticated;

-- ---------------------------------------------------------------------------------------------------------------
-- Player accounts (account.html, profile.html). Anyone can sign up with an email and password (Supabase Auth).
-- A profile has a nickname, up to 5 other names used on scoreboards, and a short bio. Profiles are public (never the
-- email); only the owner (or an admin) can change one. Game records are matched to a player by these names, so each
-- name can belong to only one account.
create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 30),
  aliases text[] not null default '{}',
  bio text not null default '' check (char_length(bio) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.check_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  mine text[];
begin
  if tg_op = 'UPDATE' then
    new.user_id := old.user_id;
    new.created_at := old.created_at;
  end if;
  new.name := trim(new.name);
  -- Other names: trimmed, no blanks, no repeats, not the nickname itself.
  new.aliases := coalesce((
    select array_agg(a order by a) from (
      select distinct trim(x) as a from unnest(coalesce(new.aliases, '{}')) x
      where trim(x) <> '' and lower(trim(x)) <> lower(new.name)) s), '{}');
  if cardinality(new.aliases) > 5 or exists (select 1 from unnest(new.aliases) a where char_length(a) > 30) then
    raise exception 'up to 5 other names, 30 characters each' using errcode = 'HVP01';
  end if;
  new.updated_at := now();
  perform pg_advisory_xact_lock(hashtext('hv-profile-names'));
  mine := array_append(new.aliases, new.name);
  if exists (
    select 1 from public.profiles p, unnest(array_append(p.aliases, p.name)) taken
    where p.user_id <> new.user_id and lower(taken) in (select lower(m) from unnest(mine) m)) then
    raise exception 'this name belongs to another account' using errcode = 'HVP02';
  end if;
  return new;
end;
$$;
drop trigger if exists profiles_check on public.profiles;
create trigger profiles_check before insert or update on public.profiles
  for each row execute function public.check_profile();

alter table public.profiles enable row level security;
drop policy if exists "Anyone can view profiles" on public.profiles;
create policy "Anyone can view profiles" on public.profiles for select using (true);
drop policy if exists "Players can create their profile" on public.profiles;
create policy "Players can create their profile" on public.profiles
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "Players can change their profile" on public.profiles;
create policy "Players can change their profile" on public.profiles
  for update to authenticated using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());
drop policy if exists "Players can delete their profile" on public.profiles;
create policy "Players can delete their profile" on public.profiles
  for delete to authenticated using (user_id = auth.uid() or public.is_admin());
grant select (user_id, name, aliases, bio, created_at, updated_at) on public.profiles to anon, authenticated;
grant insert (user_id, name, aliases, bio) on public.profiles to authenticated;
grant update (name, aliases, bio) on public.profiles to authenticated;
grant delete on public.profiles to authenticated;

-- Every saved game in which one of these names played (not case-sensitive), newest first. For profile pages.
create or replace function public.player_scores(p_names text[])
returns setof public.game_scores
language sql
stable
set search_path = ''
as $$
  select s.* from public.game_scores s
  where exists (
    select 1 from jsonb_array_elements(s.players) pl
    where lower(trim(pl ->> 'name')) in (select lower(trim(n)) from unnest(p_names) n where trim(n) <> ''))
    and not s.pending  -- games started at an event whose scores aren't in yet
  order by coalesce(s.played_on, s.played_at::date) desc, s.played_at desc
  limit 2000;
$$;
grant execute on function public.player_scores(text[]) to anon, authenticated;

-- The signed-in player's event sign-ups (for their own profile page).
create or replace function public.my_event_signups()
returns table (event_id bigint, title text, event_date date, event_time time, table_id bigint, game_id text,
               game_name text, table_time time, is_host boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select e.id, e.title, e.event_date, e.start_time, t.id, t.game_id, t.game_name, t.start_time, t.host_player = p.id
  from public.event_players p
  join public.event_tables t on t.id = p.table_id
  join public.events e on e.id = t.event_id
  where auth.uid() is not null and p.user_id = auth.uid()
  order by e.event_date desc, t.start_time nulls last
  limit 500;
$$;
-- One page of the signed-in player's sign-ups: current ones (the event is today or later, by the player's own date,
-- p_today) soonest first, or past ones (p_past) most recent first. Returns { "total": n, "rows": [...] }.
create or replace function public.my_event_signups_page(p_today date, p_past boolean, p_offset integer, p_limit integer)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with mine as (
    select e.id as event_id, e.title, e.event_date, e.start_time as event_time, t.id as table_id, t.game_id, t.game_name,
           t.start_time as table_time, t.host_player = p.id as is_host
    from public.event_players p
    join public.event_tables t on t.id = p.table_id
    join public.events e on e.id = t.event_id
    where auth.uid() is not null and p.user_id = auth.uid()
      and (case when p_past then e.event_date < p_today else e.event_date >= p_today end)
  )
  select jsonb_build_object(
    'total', (select count(*) from mine),
    'rows', coalesce((
      select jsonb_agg(to_jsonb(x) order by n) from (
        select m.*, row_number() over (order by
                 case when p_past then null else m.event_date end asc,
                 case when p_past then m.event_date end desc,
                 m.table_time nulls last, m.table_id) as n
        from mine m
        order by n
        offset greatest(coalesce(p_offset, 0), 0)
        limit least(greatest(coalesce(p_limit, 10), 1), 50)) x), '[]'::jsonb));
$$;
revoke execute on function public.my_event_signups_page(date, boolean, integer, integer) from public, anon;
grant execute on function public.my_event_signups_page(date, boolean, integer, integer) to authenticated;
-- The signed-in player's sign-ups at one event (so the page knows which are theirs on any device).
create or replace function public.my_event_player_ids(p_event bigint)
returns setof bigint
language sql
stable
security definer
set search_path = ''
as $$
  select p.id from public.event_players p join public.event_tables t on t.id = p.table_id
  where auth.uid() is not null and p.user_id = auth.uid() and t.event_id = p_event;
$$;
revoke execute on function public.my_event_signups() from public, anon;
revoke execute on function public.my_event_player_ids(bigint) from public, anon;
grant execute on function public.my_event_signups() to authenticated;
grant execute on function public.my_event_player_ids(bigint) to authenticated;

-- Which player account a name belongs to, for sign-ups made without signing in: a name (ignoring case and spaces)
-- that is exactly one account's nickname, one of its aliases, or a name it used when signing up while signed in.
-- A name shared by two accounts belongs to neither. Only used inside the admin functions below.
create or replace function public.player_account_names()
returns table (k text, user_id uuid)
language sql
stable
security definer
set search_path = ''
as $$
  with keys as (
    select lower(trim(p.name)) as k, p.user_id from public.event_players p where p.user_id is not null and not p.anonymous
    union
    select lower(trim(n)), pr.user_id from public.profiles pr, unnest(array_append(pr.aliases, pr.name)) n
  )
  select keys.k, (array_agg(keys.user_id))[1]
  from keys
  where keys.k <> ''
  group by keys.k
  having count(distinct keys.user_id) = 1;
$$;
revoke execute on function public.player_account_names() from public, anon, authenticated;

-- Signing up (opening or joining a table) under a name that belongs to a player account — its nickname, an alias,
-- or a name it used when signed in — needs that account to be signed in (error HVE09), so a player's sign-ups stay
-- theirs. Admins may use any name. (Adding someone at the table, by the host or an admin, isn't checked.)
create or replace function public.event_name_guard(p_name text)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  k text := lower(trim(coalesce(p_name, '')));
begin
  if k = '' or public.is_admin() then
    return;
  end if;
  if exists (
    select 1 from (
      select p.user_id from public.event_players p where p.user_id is not null and not p.anonymous and lower(trim(p.name)) = k
      union
      select pr.user_id from public.profiles pr, unnest(array_append(pr.aliases, pr.name)) n where lower(trim(n)) = k
    ) owners
    where owners.user_id is distinct from auth.uid()
  ) and not exists (
    select 1 from public.profiles pr, unnest(array_append(pr.aliases, pr.name)) n
    where pr.user_id = auth.uid() and lower(trim(n)) = k
  ) and not exists (
    select 1 from public.event_players p where p.user_id = auth.uid() and lower(trim(p.name)) = k
  ) then
    raise exception 'this name belongs to a player account; sign in to use it' using errcode = 'HVE09';
  end if;
end;
$$;
revoke execute on function public.event_name_guard(text) from public, anon, authenticated;

-- Whose sign-up this is. A player signs up for themselves (their account when signed in, else nobody's).
-- Admins don't sign up themselves: they sign up other players. With p_user it's that player account (error HVE10
-- if there's no such account); otherwise a name that belongs to exactly one account is linked to it, and any other
-- name to no account.
create or replace function public.event_signup_user(p_name text, p_user uuid)
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    return auth.uid();
  end if;
  if p_user is not null then
    if not exists (select 1 from public.profiles where user_id = p_user) then
      raise exception 'player account not found' using errcode = 'HVE10';
    end if;
    return p_user;
  end if;
  return (select n.user_id from public.player_account_names() n where n.k = lower(trim(coalesce(p_name, ''))));
end;
$$;
revoke execute on function public.event_signup_user(text, uuid) from public, anon, authenticated;

-- Admins only: which of an event's sign-ups belong to a player account, with that account's nickname.
-- (Visitors can't read event_players.user_id; this is how the admin's "来玩的人" list marks 已注册 / 未注册.)
-- by_name: made without signing in, matched to the account by name (see player_account_names).
drop function if exists public.event_player_accounts(bigint);
create or replace function public.event_player_accounts(p_event bigint)
returns table (player_id bigint, user_id uuid, profile_name text, by_name boolean)
language sql
stable
security definer
set search_path = ''
as $$
  with m as (
    select p.id, coalesce(p.user_id, n.user_id) as uid, p.user_id is null as by_name
    from public.event_players p
    join public.event_tables t on t.id = p.table_id
    left join public.player_account_names() n on p.user_id is null and n.k = lower(trim(p.name))
    where public.is_admin() and t.event_id = p_event
  )
  select m.id, m.uid, pr.name, m.by_name
  from m left join public.profiles pr on pr.user_id = m.uid
  where m.uid is not null;
$$;
revoke execute on function public.event_player_accounts(bigint) from public, anon;
grant execute on function public.event_player_accounts(bigint) to authenticated;

-- Admins only: everyone who ever signed up for an event, across all events (events.html?players).
-- Sign-ups belong to a player account (registered) when made while signed in, or when made without signing in
-- under a name that belongs to exactly one account (see player_account_names). The rest are grouped by name
-- (ignoring case and spaces). Anonymous sign-ups (匿名) without an account are left out: they can't be told apart.
-- Player accounts that never signed up are listed too, with 0 events.
-- name: the name they used most recently; events: how many different events; signups: how many tables joined;
-- guest_signups: how many of those were made without signing in.
drop function if exists public.admin_player_roster();
create or replace function public.admin_player_roster()
returns table (user_id uuid, profile_name text, name text, events bigint, signups bigint, guest_signups bigint, first_date date, last_date date)
language sql
stable
security definer
set search_path = ''
as $$
  with s as (
    select coalesce(p.user_id, n.user_id) as uid, p.user_id is null as guest, p.anonymous as anon, lower(trim(p.name)) as k, trim(p.name) as name,
           e.id as eid, e.event_date, p.joined_at
    from public.event_players p
    join public.event_tables t on t.id = p.table_id
    join public.events e on e.id = t.event_id
    left join public.player_account_names() n on p.user_id is null and n.k = lower(trim(p.name))
    where public.is_admin() and not (p.anonymous and p.user_id is null)
  ), g as (
    select (array_agg(s.uid))[1] as uid,
           (array_agg(s.name order by s.anon, s.event_date desc, s.joined_at desc))[1] as name,
           count(distinct s.eid) as events, count(*) as signups, count(*) filter (where s.guest) as guest_signups,
           min(s.event_date) as first_date, max(s.event_date) as last_date
    from s
    group by coalesce(s.uid::text, 'n:' || s.k)
  )
  select g.uid, pr.name, g.name, g.events, g.signups, g.guest_signups, g.first_date, g.last_date
  from g left join public.profiles pr on pr.user_id = g.uid
  union all
  select pr.user_id, pr.name, pr.name, 0, 0, 0, null, null
  from public.profiles pr
  where public.is_admin() and not exists (select 1 from g where g.uid = pr.user_id);
$$;
revoke execute on function public.admin_player_roster() from public, anon;
grant execute on function public.admin_player_roster() to authenticated;
