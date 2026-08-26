# Deploying FINORA OS to Vercel

This repository is connected to the **[finora](https://vercel.com/razalpa64-7359s-projects/finora)** project on Vercel via the Vercel GitHub integration. Every push deploys automatically — no manual steps required.

## How deployments trigger

| Event | Deployment type | URL |
| :---- | :-------------- | :-- |
| Pull request opened/updated (any branch) | **Preview** deployment | Posted by the `vercel` bot as a comment on the PR |
| Push/merge to `arena/01a03f43-finora` (default branch) | **Production** deployment | Project's production domain on Vercel |

## Deploy the latest changes (standard flow)

1. Push your branch to GitHub.
2. Open a PR against the default branch (`arena/01a03f43-finora`).
   - Vercel builds the PR and posts a **preview URL** as a comment.
3. Merge the PR.
   - Vercel immediately builds and deploys to **production**.

## Build configuration

Defined in [`vercel.json`](./vercel.json):

- **Framework:** Vite (`npm run build` → `dist/`)
- **SPA fallback:** all unknown routes rewrite to `/index.html` (client-side routing works on refresh)
- **API routes:** `/api/*` is excluded from the SPA fallback and served by serverless functions in [`api/`](./api/) — e.g. [`GET /api/health`](./api/health.js)
- **Caching:** hashed assets under `/assets/*` are cached immutably (1 year); API responses are never cached

## Environment variables

**None required.** The Supabase connection settings are centralized in [`src/services/storage.ts`](./src/services/storage.ts) (`CENTRAL_SUPABASE_URL` / `CENTRAL_SUPABASE_KEY`), so the production build works out of the box. The `.env` file is only a local-development convenience.

If environment-specific Supabase credentials are ever introduced, add them in **Vercel → Project → Settings → Environment Variables** (they must be prefixed `VITE_` to be visible to the Vite build).

## Verifying a deployment

- `GET /api/health` on the deployment URL should return:

  ```json
  {
    "status": "healthy",
    "os": "FINORA OS 2.0 Web",
    ...
  }
  ```

- Check build logs and deployment history at [vercel.com/razalpa64-7359s-projects/finora](https://vercel.com/razalpa64-7359s-projects/finora)
- Rollbacks: Vercel dashboard → Deployments → **Instant Rollback** to any previous deployment

## Local development vs. Vercel

| | Local | Vercel |
| :-- | :---- | :----- |
| Frontend | `npm run dev` (Vite dev server) | Static files from `dist/` |
| Health check | `server.js` → `/api/health` | Serverless function `api/health.js` |
| SPA fallback | `server.js` SPA fallback | `vercel.json` rewrite to `/index.html` |

> **Note:** The Java backend (`pom.xml`) and `server.js` are for local/standalone use; Vercel serves the web app plus lightweight serverless functions.
