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

## Database (Supabase) setup

The app talks to the central Supabase project with its publishable key. **The database schema must match the app** (text ids like `usr_xxx`/`acc_xxx`, no `auth.users` foreign keys, permissive RLS for the publishable key):

- **Existing project (created with the old v1 schema):** run [`supabase/migrate_text_ids.sql`](./supabase/migrate_text_ids.sql) once in the Supabase SQL Editor. Without it, every write fails silently-rejects with `invalid input syntax for type uuid`.
- **Fresh project:** run [`supabase/schema.sql`](./supabase/schema.sql) (v2, matches the app out of the box).

Once the schema matches, the app **auto-syncs**: every add/edit/delete (accounts, transactions, budgets, …) is pushed to Supabase a couple of seconds after the change, with deletes mirrored too. Settings → *Sync* still offers a manual push/pull, and now reports real errors instead of fake success.

> ⚠️ Security note: the publishable key is part of the frontend bundle by design (local-first personal app with a central personal database), so the permissive policies make the data writable by anyone who knows the project URL. For anything beyond personal use, adopt Supabase Auth and scope the policies to `auth.uid() = user_id`.

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
