# Cloudflare Pages Deployment Guide

This document describes how to deploy the **Store** and **Admin** frontends to **Cloudflare Pages**, and how to connect them to a cloud-hosted NestJS backend and managed PostgreSQL.

**Do not deploy until you have real production secrets and infrastructure.**

---

## Architecture Overview

```
Cloudflare Pages (Store)  ──►  Backend API (Node/NestJS)  ──►  Managed PostgreSQL
Cloudflare Pages (Admin)  ──►       ▲
                                    └── Object storage (optional R2, future)
```

- **Store** and **Admin** are separate Cloudflare Pages projects.
- **Backend** runs on any Node.js host (Railway, Render, Fly.io, VPS, etc.).
- **PostgreSQL** is a managed cloud database (Neon, Supabase, RDS, etc.).
- **CORS** on the backend allows only configured frontend origins (never `*`).

---

## Prerequisites

1. Git repository connected to Cloudflare
2. Cloud-hosted PostgreSQL with `DATABASE_URL`
3. Backend hosting platform
4. Production JWT secrets
5. Final or temporary Cloudflare Pages URLs for CORS

---

## Store — Cloudflare Pages

### Framework

- **Next.js 14.2** (App Router, client-side rendering)
- Adapter: `@cloudflare/next-on-pages` (pinned for Next.js 14 compatibility)

### Monorepo settings

| Setting | Value |
|---------|-------|
| **Root directory** | `store` |
| **Build command** | `npm install && npm run pages:build` |
| **Build output directory** | `.vercel/output/static` |
| **Node.js version** | `20` (set `NODE_VERSION=20` in environment) |

If Cloudflare builds from the repository root instead:

| Setting | Value |
|---------|-------|
| **Root directory** | `/` (repo root) |
| **Build command** | `npm install && npm run build:store:cloudflare` |
| **Build output directory** | `store/.vercel/output/static` |

### Required environment variables

| Variable | Example | Notes |
|----------|---------|-------|
| `NEXT_PUBLIC_API_URL` | `https://api.example.com/api` | Public backend API base URL |
| `NODE_VERSION` | `20` | Recommended Node version |

### Optional environment variables

| Variable | Example | Notes |
|----------|---------|-------|
| `NEXT_PUBLIC_IMAGES_HOST` | `cdn.example.com` | Public CDN hostname for images (future R2) |

### Compatibility flags

In Cloudflare Pages → Settings → Functions:

- Enable **`nodejs_compat`**

Or set in `store/wrangler.toml` (already included for local preview).

### Deployment verification

After deploy, verify:

1. Store loads at `https://<project>.pages.dev`
2. Arabic RTL layout renders correctly
3. API calls go to `NEXT_PUBLIC_API_URL` (check browser Network tab)
4. Login, products, and cart work against live backend

### Custom domain (later)

Cloudflare Pages → Custom domains → add your domain when ready.  
Update backend `CORS_ORIGINS` to include the custom domain URL.

---

## Admin — Cloudflare Pages

### Framework

Same as Store — Next.js 14.2 with `@cloudflare/next-on-pages`.

### Monorepo settings

| Setting | Value |
|---------|-------|
| **Root directory** | `admin` |
| **Build command** | `npm install && npm run pages:build` |
| **Build output directory** | `.vercel/output/static` |
| **Node.js version** | `20` |

From repo root:

```bash
npm run build:admin:cloudflare
# Output: admin/.vercel/output/static
```

### Required environment variables

| Variable | Example |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | `https://api.example.com/api` |
| `NODE_VERSION` | `20` |

### Deployment verification

1. Admin loads at `https://<project>.pages.dev`
2. Login page appears (Arabic RTL)
3. Admin login succeeds against live backend
4. Dashboard metrics load

---

## Backend — Cloud Node Hosting

### Build & start

```bash
cd backend
npm install
npm run build          # runs prisma generate + nest build
npm run start:prod:migrate   # prisma migrate deploy && node dist/main
```

Or run migration separately in CI before start:

```bash
npx prisma migrate deploy
node dist/main
```

### Required environment variables

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | Managed PostgreSQL with `?sslmode=require` if needed |
| `JWT_SECRET` | Yes | Min 32 characters |
| `JWT_REFRESH_SECRET` | Recommended | Separate secret for refresh tokens |
| `CORS_ORIGINS` | Yes | Comma-separated frontend URLs |
| `PORT` | Yes | Set by most cloud hosts automatically |
| `NODE_ENV` | Yes | `production` |
| `BACKEND_URL` | Yes | Public API URL (for upload file URLs) |
| `SEED_ADMIN_EMAIL` | Seed only | Not needed at runtime |
| `SEED_ADMIN_PASSWORD` | Seed only | Not needed at runtime |

### CORS example

After deploying Store and Admin to Cloudflare Pages:

```
CORS_ORIGINS=https://your-store.pages.dev,https://your-admin.pages.dev
```

When you add custom domains, update this list.

### Health checks

Configure your host to probe:

- `GET /health` — liveness
- `GET /health/db` — database connectivity

### Post-deploy seed (one time)

```bash
SEED_ADMIN_EMAIL=... SEED_ADMIN_PASSWORD=... npm run prisma:seed
```

Run once after first migration against the production database.

---

## Database — Managed PostgreSQL

### Migration (not yet applied without real DATABASE_URL)

Initial migration is prepared at:

```
backend/prisma/migrations/20250830100000_init/
```

When `DATABASE_URL` points to your cloud database:

```bash
cd backend
npx prisma migrate deploy
npm run prisma:seed
```

### Connection string format

```
postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public&sslmode=require
```

---

## Storage (Future — Cloudflare R2)

Current development uses local disk (`STORAGE_PROVIDER=local`).

For production with R2 (later phase):

| Variable | Purpose |
|----------|---------|
| `STORAGE_PROVIDER` | Set to `r2` |
| `R2_ACCOUNT_ID` | Cloudflare account |
| `R2_ACCESS_KEY_ID` | R2 API token |
| `R2_SECRET_ACCESS_KEY` | R2 secret |
| `R2_BUCKET_NAME` | Bucket name |
| `R2_PUBLIC_URL` | Public CDN URL for uploaded files |

Implement `R2StorageProvider` implementing the existing `StorageProvider` interface before enabling.

Update `NEXT_PUBLIC_IMAGES_HOST` on frontends if using a CDN domain.

---

## Build Notes

### Windows local development

`npm run pages:build` runs `@cloudflare/next-on-pages`, which requires **bash** (Linux/macOS/WSL).  
Cloudflare Pages CI runs on Linux — this is not a deployment blocker.

For local Windows development, use:

```bash
npm run build    # Standard Next.js build
npm run dev      # Local dev server
```

### Pinned dependencies

- `@cloudflare/next-on-pages@1.13.16`
- `vercel@44.7.3` (CLI used internally by next-on-pages)

### Future migration

Cloudflare recommends **OpenNext** or **vinext** for newer Next.js versions.  
When upgrading beyond Next.js 14, plan migration from `@cloudflare/next-on-pages`.

---

## Deployment Checklist

- [ ] Create managed PostgreSQL database
- [ ] Set `DATABASE_URL` on backend host
- [ ] Run `prisma migrate deploy`
- [ ] Run seed with `SEED_ADMIN_*` credentials
- [ ] Deploy backend with all production env vars
- [ ] Verify `/health` and `/health/db`
- [ ] Create Cloudflare Pages project for **Store**
- [ ] Create Cloudflare Pages project for **Admin**
- [ ] Set `NEXT_PUBLIC_API_URL` on both Pages projects
- [ ] Set `CORS_ORIGINS` on backend with Pages URLs
- [ ] Test Store: browse, cart, checkout, orders
- [ ] Test Admin: login, products, orders, payment verification
- [ ] Connect custom domains when ready
- [ ] Update CORS with custom domain URLs
- [ ] (Optional) Configure R2 for production uploads

---

## Domain Strategy

1. Deploy to default Cloudflare Pages URLs first (`*.pages.dev`)
2. Test full flow with those URLs in CORS
3. Add custom domains in Cloudflare Pages when ready
4. Update `CORS_ORIGINS` and redeploy/restart backend

No custom domain is required to complete initial deployment testing.
