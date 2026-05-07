# Lumière — Jewellery Shop & Rentals (Monorepo)

Two Next.js storefronts sharing one database, one Stripe account, and one admin login:

- **`apps/shop`** — buy jewellery (port 3000). Includes the admin panel for **both** apps.
- **`apps/rent`** — rent jewellery for events (port 3001).
- **`packages/db`** — Prisma schema, generated client, settings/Stripe helpers (`@lumiere/db`).

## Stack
- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS (each app has its own brand palette)
- Prisma ORM + SQLite (`packages/db/prisma/dev.db`)
- Stripe Checkout (hosted) + signed webhook
- TOTP-based 2FA for admin

## Setup

```bash
npm install
cp .env.example .env   # edit secrets
npm run db:push        # create the SQLite schema
npm run db:seed        # seed categories + products (incl. 2 rent-only)

npm run dev:shop       # http://localhost:3000
npm run dev:rent       # http://localhost:3001
```

Build: `npm run build` (both apps).

## VPS deploy (Nginx + SSL)

Quickest path (guided):

```bash
chmod +x deploy/easy-deploy.sh deploy/vps-deploy.sh
bash deploy/easy-deploy.sh
```

The easy script asks only the essentials, auto-detects the project root, escalates to sudo, and runs the full deploy.

Advanced/non-interactive:

Use the included script to deploy on an Ubuntu/Debian VPS with systemd, Nginx reverse proxy, and Let's Encrypt:

```bash
chmod +x deploy/vps-deploy.sh
sudo \
  SHOP_DOMAIN=shop.example.com \
  RENT_DOMAIN=rent.example.com \
  LETSENCRYPT_EMAIL=ops@example.com \
  APP_DIR=/var/www/lumiere \
  APP_USER=deploy \
  bash deploy/vps-deploy.sh
```

If the project exists in another local VPS path, copy it during deploy:

```bash
sudo \
  SHOP_DOMAIN=shop.example.com \
  LETSENCRYPT_EMAIL=ops@example.com \
  APP_DIR=/var/www/lumiere \
  SOURCE_DIR=/home/ubuntu/JewlleryEshop \
  APP_USER=deploy \
  bash deploy/vps-deploy.sh
```

What it does:
- installs `nginx`, `certbot`, Node.js 20, and build dependencies
- uses the local project folder (or copies from `SOURCE_DIR`)
- runs `npm ci`, `npm run db:push`, `npm run build`
- creates `lumiere-shop` and `lumiere-rent` systemd services
- writes Nginx config and enables HTTPS certificates via certbot

If you only deploy shop, omit `RENT_DOMAIN`.

### Sync updates to VPS

The sync script only **copies your working tree** with `rsync` (run `git commit` / `git push` yourself first if you use git). It does **not** run git.

**Local destination** (no SSH) — e.g. VPS disk mounted on your machine:

```bash
SYNC_TARGET=/path/to/mounted/lumiere bash deploy/sync-site.sh
```

**Remote destination** (`user@host:path`) — uses `rsync` over SSH:

```bash
SYNC_TARGET=deploy@203.0.113.10:/var/www/lumiere \
bash deploy/sync-site.sh
```

You can also set `VPS_HOST`, or a single line in `deploy/.sync-host`, or `SYNC_TARGET` / `VPS_HOST` in root `.env`. See comments in `deploy/sync-site.sh`.

After a **remote** sync, the default post-step is `npm ci`, `npm run build`, and `systemctl restart lumiere-shop`. Override with `REMOTE_POST_SYNC`, or set `REMOTE_POST_SYNC=` to copy only. For **local** targets, post-sync is skipped (run build/restart on the server yourself if needed).

## Env (single root `.env`)

| Variable                | Purpose                                            |
| ----------------------- | -------------------------------------------------- |
| `DATABASE_URL`          | `file:./dev.db` (resolved relative to schema file) |
| `STRIPE_SECRET_KEY`     | Stripe secret key — DB value overrides             |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret — DB value overrides       |
| `NEXT_PUBLIC_BASE_URL`  | Shop base URL (used in shop checkout redirect)    |
| `RENT_BASE_URL`         | Rent base URL (used in rent checkout redirect)    |
| `ADMIN_USER`            | Admin sign-in username                             |
| `ADMIN_PASS`            | Admin sign-in password                             |
| `SESSION_SECRET`        | ≥ 32 random chars; signs the admin session cookie  |

## Apps

### Shop (`/`, port 3000)
Categories, product detail with variants, localStorage cart, Stripe Checkout.

### Rent (`/`, port 3001)
Browse rentable items → date-range picker (with fully-booked dates greyed out) → choose ship/pickup → optional damage waiver → Stripe Checkout. Booking is created `pending` and promoted to `confirmed` by the webhook.

**Pricing models** per product (chosen by admin):
- **Daily** — `days × dailyPrice`
- **Fixed** — single price for a fixed window (e.g. $499 for 4 days)
- **Tiered** — packages like Weekend / Week / Two weeks; smallest tier ≥ requested days wins

**Availability** — count of overlapping bookings (`pending` / `confirmed` / `active`) must stay below `rentCopiesCount`.

### Admin (in shop, `/admin/login`)
- **Products** — toggle buyable/rentable per item, set rental pricing, copies count, optional damage waiver fee
- **Categories**, **Orders**, **Bookings** (filter by status, change status), **Settings**

## Stripe webhook

Both apps share one webhook endpoint at the **shop** app: `POST /api/stripe/webhook`. It distinguishes order vs rental events by `session.metadata.kind`.

Local testing:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Two-factor auth

`/admin/settings` has a *Two-factor authentication* section. Click **Set up 2FA**, scan the QR with any TOTP app, enter a code to confirm. After that, login requires the 6-digit code.

## Out of scope (v1)

- Real-time shipping rates (flat-fee or free)
- Refund automation, late-return penalties, damage photo logging
- Per-physical-copy rental tracking (we track aggregate copies count + booking overlaps)
- Customer accounts (guest checkout only)

See [docs/superpowers/specs/](docs/superpowers/specs/) for the design specs.
