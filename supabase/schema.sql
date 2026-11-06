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

-- Per-game settings: how many sets the club owns, and how many of them are in storage.
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
alter table public.game_copies drop constraint if exists game_copies_storage_range;
alter table public.game_copies add constraint game_copies_storage_range check (storage_copies between 0 and copies);

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

-- Open the tables to the website. Needed when "Automatically expose new tables" is off
-- (recommended); harmless if it is on. The policies above still decide which rows each user can see or change.
-- public.admins gets no grants, so the website can never read or change the admin list.
grant usage on schema public to anon, authenticated;
grant select on public.loans, public.game_copies to anon, authenticated;
grant insert (game_id, borrower, due_date, quantity) on public.loans to authenticated;
grant update (returned_at) on public.loans to authenticated;
grant insert (game_id, copies, storage_copies) on public.game_copies to authenticated;
grant update (game_id, copies, storage_copies) on public.game_copies to authenticated;  -- "insert or update" (upsert) needs every column
grant execute on function public.is_admin() to anon, authenticated;
