# Bunyadi Real Estate

A full-stack real estate website with a public listings site and a secured admin
dashboard for managing properties.

## Stack

- **Next.js 14** (App Router, TypeScript) — frontend + backend in one codebase
- **Prisma + PostgreSQL** — database, designed around [Neon](https://neon.tech)
- **next-intl** — routing/messages infrastructure (English only)
- **Tailwind CSS** — styling, with a brand palette derived from the logo
- **jose + bcryptjs** — JWT session auth for the admin dashboard

This app ships with **zero property listings**. The database starts empty —
add real listings through `/admin` after deploying. See
[Seeding (development only)](#seeding-development-only) if you want sample
data for local testing.

## Local setup

```bash
cp .env.example .env   # fill in the values — see "Environment variables" below
npm install
npm run dev            # applies migrations + creates the admin automatically
```

`npm run dev` and `npm start` both run `db:init` first, which applies any
pending Prisma migrations and creates/updates the admin account from your
`.env`. **You never need to run a migration command by hand** — a fresh clone
initialises its own schema on first run, both locally and on Render.

Open http://localhost:3000 — you'll be redirected to `/en`.

You need a Postgres database to run this locally. The easiest option is a free
[Neon](https://neon.tech) project (see below) — point your local `.env` at it
just like you would in production. A local Postgres install works too if you
prefer.

## Setting up the Neon database

1. Create a free account at [neon.tech](https://neon.tech) and create a new
   project (pick a region close to where you'll deploy — e.g. near your
   Render region).
2. On the project dashboard, open **Connection Details**. Neon gives you two
   connection strings:
   - **Pooled connection** — host contains `-pooler`. This is your
     `DATABASE_URL`. The running app uses it for every request.
   - **Direct connection** — no `-pooler`. This is your `DIRECT_URL`. Prisma
     uses it only to run migrations, which need a plain session connection
     that PgBouncer's transaction-mode pooling (used by the pooled string)
     can't provide.
3. Copy both into your `.env` (locally) and into your Render service's
   environment variables (production). Keep the `?sslmode=require` suffix
   Neon includes by default.
4. That's it — there's no separate "create the database" step. The schema is
   created automatically the first time the app runs `db:init` (see below).

You don't need shell/SSH access to Neon or Render to set anything up — running
`npm start` (or `npm run dev` locally) is enough to initialise the schema.

## Environment variables

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | Neon's **pooled** connection string (host has `-pooler`). Used by the app at runtime. |
| `DIRECT_URL` | yes | Neon's **direct** connection string (no `-pooler`). Used by Prisma only to run migrations. |
| `JWT_SECRET` | yes | Min 32 chars. Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. Rotating it signs everyone out. |
| `ADMIN_EMAIL` | yes | The single admin account. |
| `ADMIN_PASSWORD` | yes | Min 10 chars. Change it, then run `npm run db:bootstrap` to apply the new value. |
| `NEXT_PUBLIC_SITE_URL` | production | Absolute base URL (e.g. `https://your-domain.com`), used for canonical links, Open Graph images and the sitemap. |
| `UPLOADS_DIR` | no | Absolute path for admin-uploaded property images. Defaults to `storage/uploads` inside the project. On Render, point this at a mounted persistent Disk — see [Uploaded images on Render](#uploaded-images-on-render). |

The app validates `JWT_SECRET`, `DATABASE_URL` and `DIRECT_URL` at startup and
refuses to boot with a clear message if any are missing, rather than failing
later at login or during a migration.

## Running database migrations / schema setup

Nothing to do manually. `db:init` (run automatically by `predev`/`prestart`)
does two things, in order:

1. `prisma migrate deploy` — applies any migrations in `prisma/migrations/`
   that haven't run yet against `DIRECT_URL`. This is non-interactive and
   never resets data, unlike `prisma migrate dev`.
2. `tsx scripts/bootstrap-admin.ts` — upserts the admin account from
   `ADMIN_EMAIL`/`ADMIN_PASSWORD`. Safe to run repeatedly; it touches nothing
   else. This is also your **account-recovery path** — if the `Admin` row is
   ever lost, this recreates it without touching properties or enquiries:

   ```bash
   npm run db:bootstrap
   ```

If you change `prisma/schema.prisma` during development, run
`npm run db:migrate` (`prisma migrate dev`) locally to generate a new
migration file, commit it, and `db:deploy`/`db:init` will apply it everywhere
else automatically. Never run `prisma migrate dev` against a live database —
it can prompt interactively and offers to reset the database on drift.

## Seeding (development only)

```bash
npm run db:seed        # ~18 fictional sample listings; skipped if any properties already exist
```

This is a **development convenience only**, for exercising the UI locally. It
is never run automatically — `predev`/`prestart` only ever run `db:init`
(migrations + admin bootstrap), never the seed.

**Do not run this against your production database.** It exists purely to
give a local checkout some sample listings to click through. With `--force`
it **deletes every property, image and customer enquiry** before reinserting
the samples — never use it to change the admin password (use
`npm run db:bootstrap` instead).

## Deploying to Render

1. Push this project to a GitHub repository (see
   [Preparing the ZIP for GitHub](#preparing-the-zip-for-github) if you're
   starting from a downloaded copy).
2. In the Render dashboard: **New → Web Service**, connect the repository.
3. Configure the service:
   - **Environment**: Node
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`
4. Add the environment variables from the table above (`DATABASE_URL`,
   `DIRECT_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`,
   `NEXT_PUBLIC_SITE_URL` set to your Render/custom URL).
5. Deploy. On every deploy (and every restart), `npm start` runs `db:init`
   first — applying any new migrations and ensuring the admin account exists —
   *before* `next start` begins serving traffic. There's no separate release
   step to configure.
6. Once live, visit the site (it redirects to `/en`), then sign in at
   `/admin/login` with `ADMIN_EMAIL`/`ADMIN_PASSWORD` and add your first real
   listing.

Render automatically provides the `PORT` your service must listen on; `next
start` reads it without any extra configuration, and binds to `0.0.0.0` by
default, which Render requires.

### Uploaded images on Render

Render's default filesystem is **ephemeral** — anything written to disk at
runtime (including admin-uploaded property photos, which live outside
`public/` in `storage/uploads/`) is lost on the next deploy or restart unless
it's on a mounted **persistent Disk**. Three options, in order of effort:

1. **No disk (default).** Simplest, but uploaded photos disappear on the next
   deploy/restart. Only acceptable for early testing, not for a live site
   with real listings.
2. **Add a Render persistent Disk** (available on paid instance types).
   Mount it at, say, `/var/data/uploads`, then set `UPLOADS_DIR=/var/data/uploads`
   in the service's environment variables. Uploaded images now survive
   deploys and restarts. This app is single-instance by design (see
   [Security overview](#security-overview)), which matches how Render Disks
   work — one disk, attached to one instance.
3. **Object storage (S3, Cloudinary, R2, etc.)** — the durable, scalable
   option if you outgrow a single disk, but requires provider credentials and
   swapping out `lib/uploads.ts` and the upload/serving routes. Not included
   here since it needs your own account/credentials.

### Build/start commands reference

| Command | Where it runs | What it does |
|---|---|---|
| `npm ci && npm run build` | Render build step | Installs dependencies (`postinstall` runs `prisma generate`), then `next build`. |
| `npm start` | Render start command | Runs `db:init` (migrate + bootstrap admin), then `next start`. |
| `npm run dev` | Local development | Same `db:init` step, then `next dev`. |

## Environment variables and secrets

Set real values directly in the Render dashboard's Environment tab — never
commit a `.env` file with real credentials. `.env` is already gitignored.

## Admin dashboard

Visit `/admin`. From there you can:

- View stats (totals, published/draft, under offer/sold/let agreed, new enquiries)
- Create listings through a 4-step guided wizard (Basics → Details → Photos → Review)
- Edit / delete properties on a single page
- Upload, reorder, delete, and set a cover image for property photos (drag & drop)
- Publish / unpublish listings, and set availability
- Browse enquiries, mark them complete, or delete them

### Property status model

Three independent fields, because they answer different questions:

| Field | Values | Meaning |
|---|---|---|
| `status` | Draft, Published | Is it on the public site at all? |
| `availability` | Available, Under Offer, Sold, Let Agreed | Where is it in the sales/lettings cycle? |
| `tenure` | Freehold, Leasehold, Share of Freehold (optional) | Ownership type. |

**Sold and Let Agreed listings stay visible.** They keep working URLs, remain
in category grids (sorted after available stock, badged and dimmed), and swap
their enquiry form for a "register interest in similar" prompt. They are only
removed from the homepage's Featured section. A listing disappears from the
public site only when you unpublish or delete it.

## Project structure

- `app/[locale]/(site)/...` — public site (home, residential/commercial/business
  listings, property detail pages) wrapped in the shared `Navbar`/`Footer`
- `app/[locale]/admin/...` — admin login (no shell) and the dashboard route group
  `(dashboard)` (sidebar shell, auth-guarded)
- `app/api/...` — REST-ish route handlers for auth, property CRUD, image upload/
  management, and public inquiries
- `lib/` — Prisma client, auth/session helpers, env validation, zod
  validation, data-access functions (`lib/properties.ts`), formatting helpers
- `messages/en.json` — all UI copy
- `prisma/schema.prisma` — data model; `prisma/migrations/` — the committed
  migration history applied by `prisma migrate deploy`; `prisma/seed.ts` —
  optional demo content (dev only, see above)
- `scripts/bootstrap-admin.ts` — idempotent admin creation
- `storage/uploads/` — **admin-uploaded property images** (see the Render
  uploads section above)
- `public/uploads/seed/` — committed placeholder images used only by the
  optional seed script

## Notes

- Middleware (`middleware.ts`) handles routing and guards every `/admin`
  route except `/admin/login` by verifying the session cookie.
- The `[locale]` routing layer only ever resolves to `en` today; it's kept because
  next-intl still centralizes all UI copy in `messages/en.json`, but there's no
  language switcher and no second locale.
- **Uploads live in `storage/uploads/`, not `public/`**, and are served by
  `app/api/uploads/[...path]/route.ts`. This is deliberate: `next start`
  snapshots `public/` at boot, so a file written there at runtime 404s until
  the process restarts.
- `next build` downloads the Inter font from Google Fonts, so the build
  machine needs outbound internet access (Render's build environment has
  this by default).
- The app is single-node: the rate limiter (login attempts, public inquiry
  submissions) is in-process. Fine for the single Render instance this app is
  built for; swap for a shared store (e.g. Redis) if you ever scale to
  multiple instances behind a load balancer.

## Before you go live

- **Replace the footer contact details** in `messages/en.json` (`footer.address`,
  `footer.phone`, `footer.email`) — they currently hold placeholder text and
  must be your real business details before real visitors see them.
- **Change the admin password** if you used a placeholder value while testing,
  then run `npm run db:bootstrap` (or just redeploy with the new
  `ADMIN_PASSWORD` set — it runs automatically on boot).
- **Generate a fresh `JWT_SECRET`** for production — don't reuse a development
  value. Rotating it invalidates all existing sessions, which is fine.
- **Set `NEXT_PUBLIC_SITE_URL`** to your real production domain so canonical
  links, Open Graph previews and the sitemap are correct.
- **Decide on uploads storage** — see
  [Uploaded images on Render](#uploaded-images-on-render) above. Don't launch
  with real listings before this is settled, or photos will vanish on the
  next deploy.
- **Add your real listings** through `/admin` — the database ships empty on
  purpose.

## Security overview

What's already in place:

- **Auth**: bcrypt-hashed admin password, JWT session in an `httpOnly`,
  `SameSite=Lax` cookie that's `Secure` only when the request is actually HTTPS
  (checked per-request, not hardcoded to `NODE_ENV`) — Render terminates TLS in
  front of the app and forwards `X-Forwarded-Proto`, which this check reads.
- **Authorization**: every admin-mutating API route (`/api/admin/**`) independently
  verifies the session server-side via `requireAdmin()` — confirmed there are no
  gaps. Public routes (`/api/inquiries`, login) are intentionally open.
- **Rate limiting**: login (30 attempts/15 min) and the public inquiry form
  (5 submissions/10 min) are throttled per IP to blunt brute-forcing and spam.
- **Input validation**: every API route validates its body with `zod` before
  touching the database.
- **File uploads**: restricted to `image/jpeg|png|webp|gif`, capped at 8MB,
  written under a server-generated UUID filename (never the original filename)
  into a per-property directory that's only resolved after confirming the
  property exists in the database — so the upload path can't be steered by
  client input.
- **Security headers** (`next.config.mjs`): `X-Content-Type-Options: nosniff`
  (uploaded images can never be reinterpreted as HTML/JS by a browser),
  `X-Frame-Options: DENY` (the admin login/dashboard can't be framed for
  clickjacking), `Referrer-Policy`, a restrictive `Permissions-Policy`, and HSTS.
- **No secrets in the client bundle**: `JWT_SECRET`, the database URLs and the
  admin password hash never leave the server.
- **Generic error responses**: API routes never leak stack traces or internal
  error messages to the client.
- **Login timing safety**: an unknown email still runs a dummy bcrypt compare,
  so response time can't be used to enumerate valid admin emails.

What you still need to do — see [Before you go live](#before-you-go-live).
