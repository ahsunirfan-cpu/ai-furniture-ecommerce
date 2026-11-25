# Connect RoomCraft to Vercel (client demo)

Your Vercel team **Ahsan's projects** (`ahsan-s-projects255`) currently has **no Cursor Origin workspace linked**, so automated project creation returns **403**. Complete the steps below once, then every push can auto-deploy.

## 1. Link Cursor Origin to Vercel

1. Open [Vercel Dashboard](https://vercel.com/dashboard) → team **Ahsan's projects**.
2. Go to **Settings** → **Git** (or **Integrations** / **Cursor** if offered).
3. Connect **Cursor Origin** / your Cursor account and authorize access to `ahsan-irfan/ai-furniture-ecommerce`.
4. Confirm `originConnections` is no longer empty (or import the repo in **Add New Project**).

If Origin is not listed, mirror the repo to GitHub and import from GitHub instead (same env vars below).

## 2. Import the project

**Dashboard:** [New Project](https://vercel.com/new) → select **ai-furniture-ecommerce** → **Import**.

Suggested settings:

| Setting | Value |
|---------|--------|
| Framework | Next.js (auto) |
| Root directory | `.` |
| Build command | `npm run build` |

## 3. Environment variables

Add these for **Production** and **Preview**:

| Name | Value |
|------|--------|
| `CLIENT_DEMO` | `true` |
| `AI_MOCK` | `true` |
| `AUTH_SECRET` | Run locally: `openssl rand -base64 32` (paste once; do not commit) |

Do **not** set `DATABASE_URL` for the lightweight demo.

## 4. Deploy

Click **Deploy**. When the build finishes, open the deployment URL (e.g. `https://roomcraft-furniture.vercel.app`).

## 5. CLI alternative (after Origin is linked)

From a local clone:

```bash
npm i -g vercel
vercel login
vercel link --scope ahsan-s-projects255
vercel git connect https://origin.cursor.com/ahsan-irfan/ai-furniture-ecommerce
vercel env add CLIENT_DEMO
vercel env add AI_MOCK
vercel env add AUTH_SECRET
vercel --prod
```

## Demo logins

- `client@demo.com` / `demo123`
- `admin@roomcraft.local` / `admin123`

See also [CLIENT_DEMO_AND_COSTS.md](./CLIENT_DEMO_AND_COSTS.md).