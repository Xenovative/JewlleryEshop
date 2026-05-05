# Jewellery E-Shop — Design

## Goal
A small Next.js e-shop for a jewellery store with product listing, client-side cart, Stripe Checkout payments, and a basic admin UI for managing products/categories/orders.

## Stack
- Next.js 15 (App Router), TypeScript, React 19
- Tailwind CSS
- Prisma ORM + SQLite (`prisma/dev.db`)
- Stripe (Checkout hosted page + webhook)
- HTTP Basic auth (Next.js middleware) for admin

## Data Model
- `Category(id, slug, name)`
- `Product(id, slug, name, description, priceCents, currency, imageUrl, stock, material?, gemstone?, weightGrams?, categoryId, createdAt)`
- `Variant(id, productId, label, stock)` — e.g., ring sizes
- `Order(id, stripeSessionId, status, amountTotalCents, currency, email?, itemsJson, createdAt)`

Money stored as integer cents.

## Routes
**Public**: `/`, `/category/[slug]`, `/product/[slug]`, `/cart`, `/checkout/success`, `/checkout/cancel`
**Admin** (basic-auth): `/admin`, `/admin/products`, `/admin/categories`, `/admin/orders`
**API**: `POST /api/checkout`, `POST /api/stripe/webhook`, `GET/POST/PUT/DELETE /api/admin/products|categories`

## Cart
- localStorage key `cart_v1`, stores `{productId, variantId?, qty}[]`.
- No prices/names persisted client-side; resolved server-side at checkout.

## Checkout flow
1. Client POSTs cart to `/api/checkout`.
2. Server resolves items from DB (authoritative prices), creates Stripe Checkout Session, returns URL.
3. Stripe redirects to `/checkout/success` (cart cleared) or `/checkout/cancel`.
4. `/api/stripe/webhook` (signature-verified) handles `checkout.session.completed`: writes `Order`, decrements stock in a transaction.

## Admin auth
HTTP Basic via middleware on `/admin/*` and `/api/admin/*`. Credentials from `ADMIN_USER`, `ADMIN_PASS` env vars.

## Env vars
`DATABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_BASE_URL`, `ADMIN_USER`, `ADMIN_PASS`.

## Out of scope (v1)
- User accounts, login, order history per user
- Shipping calculation, tax beyond Stripe's automatic tax
- Reviews, wishlist, search
- Image uploads (admin pastes a URL)
- Refund automation

## Seed
`prisma/seed.ts` inserts categories (rings, necklaces, earrings, bracelets) and a few sample products.
