# RoomCraft — AI-powered furniture e-commerce (Phase 1)

Online furniture store where customers upload a room photo, receive **catalogue-linked** AI recommendations, and checkout with COD or Stripe.

## Features (Phase 1)

- Email/password registration, profile, addresses, password reset (demo token in UI)
- Product catalogue with search, filters, and sorting
- Room upload (JPG/PNG, 10MB) + AI analysis (`AI_MOCK=true` by default)
- Recommendations scored only from in-stock products + “why” explanations
- Wishlist, cart, checkout (COD + Stripe Checkout when configured)
- Orders history and confirmation
- Admin dashboard: products, stock, orders, customers, basic analytics
- Phase 2 stubs: `src/lib/ai/visualization.ts`, `src/lib/ai/design-assistant.ts`

## Client demo (Vercel)

Step-by-step: **[docs/VERCEL_SETUP.md](docs/VERCEL_SETUP.md)**. Set `CLIENT_DEMO=true`, `AI_MOCK=true`, and `AUTH_SECRET` (`openssl rand -base64 32`). Catalogue lives in [`data/products.json`](data/products.json); cart and orders stay in the session (no Postgres required).

Demo shoppers: `client@demo.com` / `demo123` · Admin: `admin@roomcraft.local` / `admin123`

## Local development (full stack)

```bash
npm install
env -u DATABASE_URL AI_MOCK=true npm run dev
```

## Local development (match Vercel demo)

```bash
npm install
CLIENT_DEMO=true AI_MOCK=true npm run dev
```

Without `DATABASE_URL`, the app uses in-memory **PGlite** and runs SQL from `migrations/`, then seeds sample products and an admin user:

| Email | Password | Role |
|-------|----------|------|
| `admin@roomcraft.local` | `admin123` | ADMIN |

Register additional customers from `/register`.

## Environment variables

| Variable | Purpose |
|----------|---------|
| `AUTH_SECRET` | Session encryption (32+ chars in production) |
| `AI_MOCK` | `true` skips OpenAI (default-friendly for dev) |
| `OPENAI_API_KEY` | Room vision analysis (`gpt-4o-mini`) |
| `STRIPE_SECRET_KEY` | Stripe Checkout |
| `STRIPE_WEBHOOK_SECRET` | Payment confirmation webhook |
| `DATABASE_URL` | Set automatically when published with a Postgres database |

Do not commit secrets. The platform injects `DATABASE_URL` on publish when `cursor-app.json` declares `"database": "postgres"`.

## AI cost note

- ~1 vision request per room upload (image tokens)
- Recommendation copy uses template reasons by default (no extra LLM per item)
- Set `AI_MOCK=false` and provide `OPENAI_API_KEY` for live analysis

## Database

- Schema: [`migrations/001_init.sql`](migrations/001_init.sql)
- Production migrations run via `scripts/migrate.mjs` after `next build`

## Publish (Cursor)

1. Commit and push
2. Bind secrets: `AUTH_SECRET`, optional `OPENAI_API_KEY`, `STRIPE_*`
3. `publish-app` with preview URL `http://127.0.0.1:3456`

## Phase 2 (out of scope)

- Furniture visualization in the uploaded room photo
- AI interior design chat assistant

See plan and stubs before estimating timeline and API costs for Phase 2.