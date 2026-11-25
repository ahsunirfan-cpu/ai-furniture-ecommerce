# Client demo (Vercel) and production cost guide

Share this with stakeholders when moving from the **mock GitHub/Vercel demo** to a **production** RoomCraft deployment.

## Demo vs production

| Layer | Client demo (`CLIENT_DEMO=true`) | Production path |
|--------|----------------------------------|-----------------|
| Catalogue | [`data/products.json`](../data/products.json) in the repo | Postgres (Neon / Vercel Postgres / Cursor publish DB) + admin CRUD |
| Users & auth | [`data/demo-users.json`](../data/demo-users.json) + session-only sign-ups | Postgres + email provider for password reset |
| Cart / orders | Encrypted session cookie (per browser) | Postgres orders + inventory |
| Room photos | Ephemeral `/tmp` on serverless; not stored | S3 / Vercel Blob + retention policy |
| AI analysis | Mocked (`AI_MOCK` / no OpenAI key) | OpenAI GPT-4o mini (or Gemini Flash) vision |
| Payments | COD demo only; Stripe disabled | Stripe Checkout + webhooks (~2.9% + 20p UK) |

## Deploy the client demo on Vercel

1. Import this GitHub repository in Vercel.
2. **Environment variables** (Project → Settings → Environment Variables):

   | Variable | Value |
   |----------|--------|
   | `CLIENT_DEMO` | `true` |
   | `AI_MOCK` | `true` |
   | `AUTH_SECRET` | Generate: `openssl rand -base64 32` (required — no default in production) |

3. Do **not** set `DATABASE_URL` for the lightweight demo (session-backed cart).
4. Deploy. Share the preview URL with the client.

**Demo logins** (password `demo123` for client; `admin123` for admin):

- `client@demo.com` — shopper
- `admin@roomcraft.local` — admin dashboard (catalogue is read-only from JSON in demo)

## Estimated monthly costs (production, indicative)

Assumptions: moderate traffic (e.g. 500 room uploads/month, 200 paid orders/month, UK). Prices change — verify on vendor sites before contracting.

### Hosting & data

| Service | Typical use | Ballpark |
|---------|-------------|----------|
| **Vercel Pro** (team) | Next.js app, serverless | ~$20 / seat / month + usage |
| **Neon Postgres** (or Vercel Postgres) | Users, catalog, orders | Free tier → ~$19–69/mo as data grows |
| **Vercel Blob** or **S3** | Room + product images | ~$5–25/mo at low volume |

### AI (room analysis)

| Model | Per upload (estimate) | 500 uploads/mo |
|--------|----------------------|----------------|
| **GPT-4o mini** vision | ~$0.01–0.05 / image (size dependent) | ~$5–25 |
| **Gemini 2.0 Flash** | Often lower token cost | ~$3–15 |

Recommendation text in Phase 1 uses **template reasons** (no extra LLM per product). Optional batched “why” copy adds ~$0.002–0.01 per session.

**Phase 2 visualization** (inpainting / image edit APIs) is a separate line item — often **$0.05–0.30+ per preview** depending on provider; scope separately.

### Payments

| Item | Notes |
|------|--------|
| **Stripe** | ~2.9% + fixed fee per successful card payment (region-specific) |
| **COD** | No gateway fee; operational cost only |

### Email (password reset, order confirmation)

| Provider | Ballpark |
|----------|----------|
| Resend / SendGrid | Free tier → ~$15–20/mo at thousands of emails |

### Total rough bands

- **Pilot (low traffic, mock AI in staging):** ~$25–50/mo infrastructure only  
- **Phase 1 production (real AI, DB, Stripe, email):** ~$80–200/mo + payment % + AI usage  
- **Growth:** scale with uploads, storage, and DB size

## Efficient migration path

1. **Week 0 — Client demo (current):** Vercel + `CLIENT_DEMO=true`, JSON catalogue, mock AI.  
2. **Phase 1a — Persistent data:** Add `DATABASE_URL` (Neon), run migrations, turn off session store (`CLIENT_DEMO=false`), keep `AI_MOCK=true`.  
3. **Phase 1b — Live AI:** Set `OPENAI_API_KEY`, `AI_MOCK=false`, cap uploads per user/day.  
4. **Phase 1c — Payments:** Stripe keys + webhook URL; keep COD.  
5. **Phase 1d — Email:** Transactional email for reset + order confirmation; remove generic forgot-password stub.  
6. **Phase 2 — Visualization & assistant:** Separate estimate (image API + chat tokens).

## Security checklist before go-live

- Strong `AUTH_SECRET` (never ship a default secret).  
- No reset tokens in API responses.  
- Authenticated room analysis + rate limits.  
- Stripe webhook signature verification (already implemented).  
- Privacy policy for room photo retention and deletion.