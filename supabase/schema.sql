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

-- Game score records (e.g. the Flip 7 scorer, flip7.html). Anyone can save a finished game and everyone can see them;
-- records can't be changed afterwards, and only admins can delete one (e.g. a test or a duplicate).
create table if not exists public.game_scores (
  id bigint generated always as identity primary key,
  game_id text not null check (char_length(game_id) between 1 and 100),  -- the game's "id" in data/games.json
  played_at timestamptz not null default now(),
  target integer check (target between 1 and 100000),                      -- points needed to win (Flip 7: 200)
  -- [{ "name": "小明", "total": 213 }, ...] in seating order
  players jsonb not null,
  -- one array per round, one cell per player (same order): { "s": score, "b": true if bust, "f": true if Flip 7 }
  rounds jsonb not null default '[]',
  winner text not null check (char_length(winner) between 1 and 400),    -- names joined with "、" on a tie
  top_score integer not null,
  round_count integer not null check (round_count between 0 and 500)
);
create index if not exists game_scores_by_game on public.game_scores (game_id, played_at desc);

-- Checks the shape of a record, and slows down floods: at most 30 records a minute across the whole site.
create or replace function public.check_game_score()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  p jsonb;
begin
  new.played_at := now();  -- always the time it was saved
  if jsonb_typeof(new.players) <> 'array' or jsonb_array_length(new.players) not between 1 and 30 then
    raise exception 'players must list 1 to 30 players' using errcode = 'HVS01';
  end if;
  for p in select * from jsonb_array_elements(new.players) loop
    if jsonb_typeof(p -> 'name') <> 'string' or char_length(trim(p ->> 'name')) not between 1 and 30
       or jsonb_typeof(p -> 'total') <> 'number' then
      raise exception 'each player needs a name (1-30 characters) and a total' using errcode = 'HVS01';
    end if;
  end loop;
  if jsonb_typeof(new.rounds) <> 'array' or jsonb_array_length(new.rounds) > 500 or pg_column_size(new.rounds) > 100000 then
    raise exception 'too many rounds' using errcode = 'HVS01';
  end if;
  perform pg_advisory_xact_lock(hashtext('hv-scores'));
  if (select count(*) from public.game_scores where played_at > now() - interval '1 minute') >= 30 then
    raise exception 'Too many records saved just now, try again in a minute' using errcode = 'HVS02';
  end if;
  return new;
end;
$$;
drop trigger if exists game_scores_check on public.game_scores;
create trigger game_scores_check before insert on public.game_scores
  for each row execute function public.check_game_score();

alter table public.game_scores enable row level security;
drop policy if exists "Anyone can view scores" on public.game_scores;
create policy "Anyone can view scores" on public.game_scores
  for select using (true);
drop policy if exists "Anyone can save scores" on public.game_scores;
create policy "Anyone can save scores" on public.game_scores
  for insert to anon, authenticated with check (true);
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
grant insert (game_id, target, players, rounds, winner, top_score, round_count) on public.game_scores to anon, authenticated;
grant delete on public.game_scores to authenticated;  -- the policy above limits it to admins
grant execute on function public.is_admin() to anon, authenticated;
