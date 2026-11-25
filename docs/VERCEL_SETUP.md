# Connect RoomCraft to Vercel (client demo)

## Important: use **Cursor (Origin)**, not an empty GitHub repo

The GitHub repository `ahsunirfan-cpu/ai-furniture-ecommerce` was created **without any code**, so Vercel shows:

> *The provided GitHub repository does not contain the requested branch or commit reference.*

**All source code lives in Cursor Origin** (already pushed). On [vercel.com/new](https://vercel.com/new), choose **Cursor** or **Origin**, not GitHub, and import **`ahsan-irfan/ai-furniture-ecommerce`** (or the matching Origin repo name shown in your account). Only use GitHub after you have pushed `main` (see [Sync to GitHub](#sync-to-github-optional) below).

## 1. Link Cursor Origin to Vercel

1. Open [Vercel Dashboard](https://vercel.com/dashboard) → team **Ahsan's projects**.
2. Go to **Settings** → **Git** (or **Integrations** / **Cursor** if offered).
3. Connect **Cursor Origin** / your Cursor account and authorize access to `ahsan-irfan/ai-furniture-ecommerce`.
4. Confirm `originConnections` is no longer empty (or import the repo in **Add New Project**).

If Origin is not listed, connect it under **Integrations** first. Do not import the empty GitHub repo until you have synced code (below).

## Sync to GitHub (optional)

If you must deploy from GitHub, push once from a machine that has Origin access:

```bash
origin auth login
origin repo clone ahsan-irfan/ai-furniture-ecommerce
cd ai-furniture-ecommerce
git remote add github https://github.com/ahsunirfan-cpu/ai-furniture-ecommerce.git
git push -u github main
```

Or, from the clone, with a GitHub fine-grained token (`contents: read and write`):

```bash
export GH_TOKEN=ghp_your_token_here
npm run push:github
```

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