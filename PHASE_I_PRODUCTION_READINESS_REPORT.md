# Phase I — Production Readiness Report

## Completed

Phase I prepared the project for cloud deployment with **Cloudflare Pages** (Store + Admin) and a **cloud-hosted NestJS backend** with **managed PostgreSQL**.

### Cloudflare Pages (Store & Admin)

- Added `@cloudflare/next-on-pages` + pinned `vercel@44.7.3` build toolchain
- Added `pages:build` and `pages:preview` scripts to store and admin
- Added `wrangler.toml` with `nodejs_compat` compatibility flag
- Updated `next.config.js` — production API URL validation, dynamic image remote patterns from env
- Removed hardcoded localhost from production image config
- Root scripts: `build:store:cloudflare`, `build:admin:cloudflare`
- Full deployment guide: `docs/CLOUDFLARE_DEPLOYMENT.md`

### Backend cloud readiness

- `CORS_ORIGINS` — comma-separated production origins (no wildcard)
- Legacy `STORE_FRONTEND_URL` + `ADMIN_FRONTEND_URL` still supported
- Production CORS validation at startup
- Separate `JWT_REFRESH_SECRET` for refresh token sign/verify
- `STORAGE_PROVIDER` factory — local default, R2 reserved for future
- `start:prod:migrate` — migrate + start for production hosts
- OTP values no longer logged in production (from Phase H, verified)

### Environment documentation

- Updated `backend/.env.example` with CORS, R2 placeholders, production URLs
- Updated `store/.env.example` and `admin/.env.example` for Cloudflare builds
- Updated root `.env.example`

### Database

- Initial migration `20250830100000_init` verified present and ready
- **Migration NOT applied** — no cloud `DATABASE_URL` provided
- Seed requires `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (not executed)

### Business rules verified (unchanged)

| Rule | Status |
|------|--------|
| Product availability: LIMITED / UNLIMITED / UNAVAILABLE | ✅ Schema + service |
| No stock reservation — atomic deduction at checkout | ✅ `orders.service.ts` |
| Free delivery calculated server-side; display capped | ✅ `FreeDeliveryProgress` uses `displayedScore` |
| Delivery fee from backend area, not client DTO | ✅ `CreateOrderDto` has no fee field |
| Phone 059 green / 056 red visual only | ✅ `PhoneInput.tsx` |
| Order item historical snapshots | ✅ `OrderItem` model + `buildOrderItemSnapshot` |
| Store open/closed admin-controlled | ✅ Settings model |
| Manual payment workflow PENDING→SUBMITTED→VERIFIED/REJECTED | ✅ Unchanged |

---

## Files Created

| File | Purpose |
|------|---------|
| `docs/CLOUDFLARE_DEPLOYMENT.md` | Full deployment guide |
| `store/next.config.helpers.js` | Production build helpers |
| `admin/next.config.helpers.js` | Production build helpers |
| `store/wrangler.toml` | Cloudflare Pages config |
| `admin/wrangler.toml` | Cloudflare Pages config |
| `backend/src/config/cors.config.ts` | CORS origin resolution |

---

## Files Modified

| File | Change |
|------|--------|
| `store/package.json` | Cloudflare deps + `pages:build` script |
| `admin/package.json` | Cloudflare deps + `pages:build` script |
| `store/next.config.js` | Env-based images, Cloudflare dev platform |
| `admin/next.config.js` | Env-based images, Cloudflare dev platform |
| `store/.env.example` | Production API URL documentation |
| `admin/.env.example` | Production API URL documentation |
| `backend/.env.example` | CORS_ORIGINS, R2 placeholders, JWT refresh |
| `backend/package.json` | `start:prod:migrate` |
| `backend/src/main.ts` | CORS_ORIGINS support |
| `backend/src/config/env.validation.ts` | Production CORS validation |
| `backend/src/modules/auth/auth.service.ts` | JWT_REFRESH_SECRET for refresh tokens |
| `backend/src/modules/upload/upload.module.ts` | STORAGE_PROVIDER factory |
| `package.json` | Cloudflare build scripts |
| `.gitignore` | `.vercel/` build output |
| `package-lock.json` | Dependency lock update |

---

## Verification

### Backend

| Check | Result |
|-------|--------|
| `npm run build` | ✅ Passed |
| `npm test` | ✅ 56 passed |
| `npm run lint` | ✅ Passed (5 pre-existing warnings) |
| `npm run typecheck` | ✅ Passed |
| `npx prisma validate` | ✅ Passed |
| `npx prisma generate` | ✅ Passed |

### Store

| Check | Result |
|-------|--------|
| `npm run typecheck` | ✅ Passed |
| `npm run lint` | ✅ Passed (1 font warning) |
| `npm run build` | ✅ Passed (15 routes) |
| `npm run pages:build` | ⚠️ Next.js build ✅; `@cloudflare/next-on-pages` step requires Linux (Cloudflare CI) |

### Admin

| Check | Result |
|-------|--------|
| `npm run typecheck` | ✅ Passed |
| `npm run lint` | ✅ Passed (1 font warning) |
| `npm run build` | ✅ Passed (17 routes) |
| `npm run pages:build` | ⚠️ Same Linux requirement as Store |

### Prisma

| Check | Result |
|-------|--------|
| Schema validated | ✅ |
| Migration prepared | ✅ `20250830100000_init` |
| Migration applied | ❌ Blocked — no cloud DATABASE_URL |

---

## Security

| Check | Result |
|-------|--------|
| No hardcoded credentials in source | ✅ |
| Seed uses env vars only | ✅ |
| JWT refresh uses separate secret when configured | ✅ Fixed |
| CORS explicit origins in production | ✅ Fixed |
| No `Access-Control-Allow-Origin: *` | ✅ |
| OTP not logged in production | ✅ |
| 500 errors masked in production | ✅ |
| Helmet enabled | ✅ |
| Rate limiting (Throttler) | ✅ |
| Admin routes protected by JWT + roles | ✅ |
| Upload module decoupled from local disk | ✅ Factory pattern |
| Secrets not in Store/Admin env examples | ✅ |

---

## Cloudflare Pages Readiness

| Item | Status |
|------|--------|
| Store Next.js production build | ✅ Ready |
| Admin Next.js production build | ✅ Ready |
| Cloudflare adapter configured | ✅ `@cloudflare/next-on-pages` |
| Build command documented | ✅ |
| Output directory documented | ✅ `.vercel/output/static` |
| `nodejs_compat` flag documented | ✅ |
| `NEXT_PUBLIC_API_URL` required for CF builds | ✅ |
| Full adapter build on Windows | ⚠️ Requires Linux (Cloudflare CI handles this) |

**Conclusion:** Store and Admin are **ready for Cloudflare Pages deployment**. The final `@cloudflare/next-on-pages` step runs on Cloudflare's Linux build environment.

---

## Database

| Item | Status |
|------|--------|
| Migration SQL ready | ✅ |
| `prisma migrate deploy` documented | ✅ |
| Seed documented | ✅ |
| Applied to cloud DB | ❌ **NOT applied** — awaiting real `DATABASE_URL` |

---

## Remaining Cloud Requirements

You will need to provide:

1. **Managed PostgreSQL** — Neon, Supabase, Railway Postgres, etc.
2. **`DATABASE_URL`** — connection string with SSL if required
3. **Backend hosting** — any Node.js platform (Railway, Render, Fly.io, VPS)
4. **`JWT_SECRET`** — min 32 characters
5. **`JWT_REFRESH_SECRET`** — separate strong secret (recommended)
6. **`CORS_ORIGINS`** — Store + Admin Cloudflare Pages URLs (or custom domains)
7. **`BACKEND_URL`** — public API URL for upload links
8. **Cloudflare Pages — Store project** — connect repo, set build config
9. **Cloudflare Pages — Admin project** — separate project
10. **`NEXT_PUBLIC_API_URL`** — on both Pages projects pointing to backend
11. **Seed credentials** — `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` (one-time seed)
12. **(Optional) Cloudflare R2** — for production file uploads
13. **(Optional) Custom domain** — connect later; update CORS after

---

## Exact Next Step

1. Create managed PostgreSQL and copy `DATABASE_URL`
2. Deploy backend with production env vars
3. Run `npx prisma migrate deploy` and seed
4. Create two Cloudflare Pages projects (Store + Admin)
5. Set `NEXT_PUBLIC_API_URL` on both
6. Set `CORS_ORIGINS` on backend with Pages URLs
7. Test live system
8. Connect custom domain when ready

---

**Phase I complete. No deployment performed. Waiting for your instruction.**
