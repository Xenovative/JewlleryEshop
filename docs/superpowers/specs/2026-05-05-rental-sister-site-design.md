# Lumière Rentals — Sister Site Design

## Goal
Add a jewellery rental storefront alongside the existing e-shop. Customers pick a date range, optionally add a damage waiver, choose ship-or-pickup, and pay via Stripe Checkout. Bookings live in the same DB; admin manages both.

## Repo layout (npm workspaces)
```
apps/shop/                existing storefront + shared admin
apps/rent/                new rental storefront
packages/db/              Prisma schema, client, seed
packages/core/            session, totp, settings, stripe, format, Tailwind preset
```
Single SQLite file in `packages/db/dev.db`. One Stripe account. One admin login.

## Prisma additions
- `Product`: `buyable Boolean`, `rentable Boolean`, `rentPricingType ("daily"|"tiered"|"fixed")`, `rentDailyCents Int?`, `rentFixedCents Int?`, `rentFixedDurationDays Int?`, `rentCopiesCount Int`, `waiverFeeCents Int?`.
- `RentalTier(id, productId, label, days, priceCents)`.
- `Booking(id, productId, startDate, endDate, status, fulfillment, email, customerName, shippingAddressJson?, pickupSlot?, waiverIncluded, waiverFeeCents, rentalCents, totalCents, currency, stripeSessionId?, createdAt)`.

## Customer flow (rent app)
1. Listing of rentable products with "from $X/day".
2. Detail page: image, description, calendar of unavailable dates, date-range picker, fulfillment radio, waiver checkbox, "Book now".
3. `POST /api/book` validates availability, creates `pending` booking + Stripe Checkout Session.
4. Webhook promotes booking → `confirmed` and writes `stripeSessionId`.
5. Success page confirms dates and instructions.

## Availability rule
For requested `[start, end]`, count bookings with overlapping range and `status ∈ {pending, confirmed, active}`; reject if count ≥ `Product.rentCopiesCount`.

## Pricing
- **daily**: `days × rentDailyCents`
- **fixed**: `rentFixedCents`, end date = start + `rentFixedDurationDays - 1`
- **tiered**: smallest `RentalTier` with `days ≥ requestedDays` (else largest).

## Admin
Stays in `apps/shop` admin:
- Products → add rental fields + tier editor + copies count.
- New "Bookings" page → list, filter, mark active/returned/canceled.

## Auth & secrets
Same admin login (cookie + 2FA). Same Stripe keys via shared Settings. `apps/rent` has no admin UI of its own.

## Out of scope (v1)
- Real-time shipping calculation — fixed flat fee, configurable in settings.
- Late-return penalties, refund automation, per-copy tracking, damage photos.
