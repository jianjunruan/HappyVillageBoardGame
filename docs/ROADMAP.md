# Roadmap: events and registration (Phase 2)

GitHub Pages only serves static files. It can't store registrations, log people in or hold private data. Phase 2 adds a small server with a database. Everything built in Phase 1 stays, and `games.json` becomes a database table.

## 1. What Phase 2 must do

**Visitors**
- Browse games, as in Phase 1.
- Browse upcoming events: title, date and time, location, featured games, seats left.
- Register for an event in one of two ways:
  - **With an account.** Sign up or log in with email and password. "My events" shows every upcoming and past registration, and the member can cancel a registration.
  - **As a guest.** Enter a display name and, optionally, a phone or email for contact. The guest gets a confirmation screen with a short code. **Guests can't see their past records.** Their registrations are stored and visible only to the web admin.

**Web admin**
- Create, edit and cancel events, with a capacity (and optional waitlist) and a registration deadline.
- Manage the game catalogue, including uploading images. This replaces editing `games.json` by hand.
- See all registrations for every event, members and guests, and export them to CSV.
- See a member's full history and look up guest registrations by name or code.
- Optionally, mark attendance after an event.

## 2. Recommended architecture

```
                    ┌──────────────────────────────────────────┐
  Browser  ───────► │  Lightsail instance (Ubuntu)             │
  (phone/PC)  HTTPS │   Nginx + Let's Encrypt SSL              │
                    │   ├─ Public site (games, events, signup) │
                    │   ├─ REST API  /api/...                  │
                    │   └─ Admin panel  /admin                 │
                    │   PHP 8 + Laravel                        │
                    │   MySQL (same box at first)              │
                    └──────────────────────────────────────────┘
                         │ nightly backup → Lightsail snapshot / S3
```

**Recommended stack: Laravel (PHP) + MySQL.** It fits your existing XAMPP/PHP setup, so you can build and test locally first. Laravel provides:
- **Laravel Breeze**: ready-made sign-up, login, password reset and email verification.
- **Filament**: an admin panel with tables, forms, filters and CSV export generated from your database models. This covers almost the whole web-admin requirement.
- **Eloquent and migrations**: database tables defined in code and versioned in this repo.

*Alternative:* Node.js (Express or NestJS) with PostgreSQL works just as well if you prefer JavaScript everywhere. The data model and API below stay the same.

**Hosting options**
| Option | Notes |
|---|---|
| **Lightsail instance**, LAMP or plain Ubuntu blueprint | Simplest. One server runs everything. Use 1–2 GB RAM. Turn on automatic snapshots. |
| Lightsail instance + Lightsail managed MySQL | Costs more, but adds managed backups and makes it easy to replace the server. Worth it once data matters. |
| Other VPS (DigitalOcean, Hetzner, school/community server) | Same setup and the same steps. |

Check current Lightsail pricing before choosing a plan. A small instance is usually enough for a club-sized site.

**What happens to the GitHub Pages site?** Choose one:
- **A (simplest):** the Laravel app serves the whole site, and GitHub Pages redirects to it or is retired. You get one login cookie and no CORS setup.
- **B:** keep the static front end on GitHub Pages and set `apiBase` in `js/config.js` to the server's API. This needs CORS and token auth (Laravel Sanctum). It's more work, and it only pays off if you want to keep free static hosting.

**Recommendation: A.** Move the existing HTML, CSS and JS into Laravel's `public/` folder or into Blade views.

## 3. Data model

```
users                     events                        registrations
─────────────────         ─────────────────────         ─────────────────────────────
id                        id                            id
name                      title                         event_id      → events.id
email (unique)            description                   user_id       → users.id   (NULL for guests)
password (hashed)         location                      guest_name    (NULL for members)
phone (optional)          starts_at                     guest_contact (optional phone/email)
role  ('member'|'admin')  ends_at                       confirmation_code (e.g. "HV-7K3Q")
created_at                capacity                      party_size    (default 1)
                          registration_closes_at        status ('confirmed'|'waitlist'|'cancelled')
games                     status ('draft'|'published'|  attended (bool, admin sets)
─────────────────                 'cancelled')          created_at, cancelled_at
id, slug                  created_by → users.id
name, image_path                                        Rules:
description               event_game (many-to-many)     • exactly one of user_id / guest_name is set
players, playtime, age    ─────────────────             • a member can't hold two active
tags (JSON)               event_id, game_id               registrations for the same event
links (JSON)                                            • confirmed seats ≤ capacity, rest → waitlist
```

**How guest privacy works:**
- A guest registration has `user_id = NULL`, so no login is linked to it and nobody can browse the guest's history.
- The `confirmation_code` is shown once after registering. It lets the guest (or the admin) find that single registration, for example to cancel it. It never reveals any other registration.
- Admins see every registration in the admin panel, guests included.
- Optional later feature: when a guest creates an account with the same email, the admin can merge their earlier guest registrations into it.

## 4. API sketch

| Method | Path | Who | Purpose |
|---|---|---|---|
| GET | `/api/games` | public | Game list (same shape as `games.json`) |
| GET | `/api/events?upcoming=1` | public | Event list with seats left |
| GET | `/api/events/{id}` | public | Event details and featured games |
| POST | `/api/events/{id}/register` | member | Register as the logged-in user |
| POST | `/api/events/{id}/register-guest` | public | Body `{ guest_name, guest_contact? }` → returns the confirmation code |
| DELETE | `/api/registrations/{id}` | member (own) | Cancel own registration |
| POST | `/api/registrations/cancel-by-code` | public | Guest cancels with name and code |
| GET | `/api/me/registrations` | member | "My events": upcoming and past |
| POST | `/register`, `/login`, `/logout`, `/forgot-password` | public | Provided by Laravel Breeze |
| * | `/admin/...` | admin | Filament panel: events, games, registrations, users, CSV export |

## 5. Security checklist
- HTTPS everywhere (free Let's Encrypt certificate through Certbot).
- Passwords hashed with bcrypt or argon2 (Laravel does this by default). Never store plain passwords.
- CSRF protection on forms (Laravel default).
- Rate limiting and a CAPTCHA (e.g. Cloudflare Turnstile) on the **guest** form and the login form, so bots can't fill events.
- The admin role is checked on the server for every admin route, not only hidden in the UI.
- Keep secrets in `.env` on the server and never commit them to GitHub.
- Back up the database daily, keep at least 7 days, and test a restore once.
- Collect as little personal data as possible: a name, plus optional contact details for guests. Add a short privacy note to the registration form.

## 6. Milestones

| # | Milestone | Result |
|---|---|---|
| 0 | ✅ **Phase 1**: static catalogue on GitHub Pages | Games, images, embedded videos |
| 1 | Local Laravel project in XAMPP. Migrations for `games`, `events`, `registrations`, `users`. Import `games.json` with a seeder | Same catalogue served from MySQL |
| 2 | Filament admin: CRUD for games and events, registration list, CSV export | Admin can run events |
| 3 | Public events page and **guest registration** with a confirmation code, capacity and waitlist | People can sign up without an account |
| 4 | Accounts with Breeze: sign-up, login, "My events" history, cancel | Members keep records |
| 5 | Deploy to Lightsail: static IP, domain DNS, Nginx, SSL, backups, `.env` | Live site |
| 6 | Nice-to-haves: email confirmations and reminders, calendar (.ics) download, attendance, merge guest into account | Polish |

## 7. Decisions to make before starting Phase 2
1. Domain name, e.g. `happyvillageboardgames.com`, so the site has a permanent address.
2. Option A (one server) or option B (keep GitHub Pages and add a separate API). A is recommended.
3. Do guests need to give a phone or email, or only a name? Contact details help with no-shows but add privacy duties.
4. Does a registration allow a party size of more than 1 ("me + 2 friends")?
5. Is a waitlist needed, or does registration simply close when the event is full?
