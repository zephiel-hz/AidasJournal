# Railway Deployment Guide

This repository uses a pnpm workspace with two main deployable packages:

- `@workspace/aida` — frontend app in `artifacts/aida`
- `@workspace/api-server` — backend API in `artifacts/api-server`

---

## Railway-ready configuration

### Frontend service

- Build command:
  ```bash
  corepack pnpm --filter @workspace/aida run build
  ```
- Start command:
  ```bash
  corepack pnpm --filter @workspace/aida run serve
  ```
- Environment variables:
  - `PORT=3000`
  - `BASE_PATH=/`
  - `NODE_ENV=production`

> `artifacts/aida/vite.config.ts` requires both `PORT` and `BASE_PATH`.

### API service

- Build command:
  ```bash
  corepack pnpm --filter @workspace/api-server run build
  ```
- Start command:
  ```bash
  corepack pnpm --filter @workspace/api-server run start
  ```
- Environment variables:
  - `PORT=8080`
  - `NODE_ENV=production`
  - `DATABASE_URL` (if your API needs Postgres)

> `artifacts/api-server/src/index.ts` requires `PORT` at runtime.

---

## Notes for Railway

- Use `corepack pnpm` in Railway build/start commands when pnpm is not installed globally.
- If you only want to deploy the frontend, use the frontend service only.
- If you deploy the full app, create two Railway services: one for frontend and one for backend.
- If Railway forces the repo root, use the supplied `railpack.json` at the repository root; it builds and starts the frontend from `artifacts/aida`.
- For local development, you can now run `pnpm run dev` from the repo root, and it will start both frontend and backend with the local `.env.local` files.

---

## Docker Deployment (recommended)

You can deploy each service on Railway using Docker images. This avoids workspace-specific package manager quirks.

Frontend (Docker):

Build locally (optional):
```bash
docker build -t aida-frontend:latest -f artifacts/aida/Dockerfile .
docker run -p 8080:80 aida-frontend:latest
```

API (Docker):

Build locally (optional):
```bash
docker build -t aida-api:latest -f artifacts/api-server/Dockerfile .
docker run -p 8080:8080 -e PORT=8080 aida-api:latest
```

Railway: choose "Deploy from Docker" or provide the Dockerfile path when creating a service.

---

## CI / Auto-deploy (GitHub Actions)

I can add a GitHub Actions workflow that deploys to Railway on push to `main`, but it requires a Railway API token (store as a repo secret `RAILWAY_API_TOKEN`). Tell me if you want this and I will scaffold the workflow.

---

## Local verification

The repository was verified locally:

- `npx pnpm --filter @workspace/api-server run build` ✅
- `PORT=3000 BASE_PATH=/ npx pnpm --filter @workspace/aida run build` ✅

---

## Repo fixes applied

- Updated the root `package.json` `preinstall` script to be cross-platform.
- Removed pnpm overrides that blocked Windows native packages for Rollup and Tailwind Oxide.
- This makes the workspace more compatible with local Windows and Linux/Railway environments.
