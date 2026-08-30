# Phase M — Local E2E Verification Report

**Project:** Yaqouta | ياقوتة  
**Date:** 2026-08-30  
**Database:** Neon PostgreSQL (`neondb`, project `yagota`) — **no reset, no destructive ops**  
**Deployment:** None (local verification only)

---

## Executive summary

Local end-to-end verification against the real Neon database is **complete**. All automated API checks pass (**53/53**). Static quality gates pass (validate, typecheck, lint, 56 unit tests, production builds). Three implementation bugs were found and fixed during this phase.

**Readiness:** ✅ Ready for your manual browser testing while keeping cloud deployment deferred.

---

## Services verified

| Service | URL | Status |
|---------|-----|--------|
| Backend API | http://localhost:3001 | ✅ Health + DB connected |
| Store | http://localhost:3000 | ✅ HTTP 200 |
| Admin | http://localhost:3002 | ✅ HTTP 200 |

Start locally: `npm run dev` from repo root (uses Neon via `backend/.env`).

---

## Infrastructure & database

| Check | Result |
|-------|--------|
| `GET /health` | ✅ `status: ok` |
| `GET /health/db` | ✅ `database: connected` |
| Prisma validate | ✅ |
| Prisma generate | ✅ |
| Migration status | ✅ 1 migration applied (`20250830100000_init`), schema up to date |
| `verify-db.cjs` | ✅ Connection OK, all expected tables present |
| `verify-seed-auth.cjs` | ✅ Seeded admin login, settings, analytics |
| Destructive DB ops | ✅ None performed |

**Seed snapshot:** 3 categories, 4 delivery areas, 1 settings row, admin user present.

---

## Authentication (automated)

### Customer (OTP)

| Step | Result |
|------|--------|
| Send OTP | ✅ |
| Dev OTP in non-production response | ✅ (`devOtp` field) |
| Verify OTP → access + refresh tokens | ✅ |
| Refresh token rotation | ✅ |
| Protected profile access | ✅ |
| Customer blocked from admin routes (403) | ✅ |

### Admin

| Step | Result |
|------|--------|
| Login with seeded credentials | ✅ |
| Access + refresh tokens | ✅ |
| Protected admin settings | ✅ |
| Analytics overview | ✅ |

---

## Store APIs (public & customer)

| Area | Result |
|------|--------|
| Store status / settings | ✅ |
| Categories | ✅ |
| Products, offers, recommended, search, detail | ✅ |
| Delivery areas | ✅ |
| Announcements | ✅ |
| Favorites (add + list) | ✅ |
| Cart (add, update qty, totals, over-stock rejected) | ✅ |
| Reviews (create + summary) | ✅ |
| Support messages | ✅ |
| Unauthenticated cart → 401 | ✅ |

---

## Customer purchase flow (automated)

| Step | Result |
|------|--------|
| Login (OTP) | ✅ |
| Browse catalog / product detail | ✅ |
| Add to cart (limited stock product) | ✅ |
| Server-side subtotal | ✅ |
| Over-stock add rejected (409) | ✅ |
| Checkout → order created | ✅ |
| Stock deducted (3 → 2) | ✅ |
| Submit manual payment info | ✅ |
| Admin views order | ✅ |
| Admin verifies payment | ✅ |
| Price change does **not** alter order snapshot | ✅ |
| Review after order | ✅ |

---

## Admin workflow (automated)

| Step | Result |
|------|--------|
| Login | ✅ |
| Create LIMITED / UNLIMITED / variant products | ✅ |
| New products visible in store catalog | ✅ |
| Analytics overview | ✅ |
| Store close → public status closed | ✅ |
| Checkout blocked when closed (503) | ✅ |
| Store reopen | ✅ |
| Invalid payload → 400 | ✅ |

---

## Consistency tests

| Test | Expected | Result |
|------|----------|--------|
| Over-stock cart add | Rejected, stock ≥ 0 | ✅ |
| Order price snapshot | Unchanged after admin price edit | ✅ |
| Store closed checkout | Blocked (503 Service Unavailable) | ✅ |
| Customer → admin API | 403 Forbidden | ✅ |
| Anonymous → protected API | 401 Unauthorized | ✅ |
| Invalid admin product payload | 400 Bad Request | ✅ |

---

## Bugs found & fixes

### 1. `NODE_ENV=production` in shell blocked dev OTP

**Symptom:** OTP send succeeded but `devOtp` missing; logs had no `[DEV OTP]`.  
**Cause:** Cursor/shell sets `NODE_ENV=production`, which overrides `.env` for Nest.  
**Fix:** `cross-env NODE_ENV=development` on backend dev scripts (`package.json`, `backend/package.json`).  
**Also:** `auth.controller.ts` returns `devOtp` in non-production responses.

### 2. Cart add crashed for products without variants (Prisma)

**Symptom:** `POST /api/cart/items` → 500, `Argument variantId must not be null` on composite unique lookup.  
**Cause:** `findUnique` with `userId_productId_variantId` cannot use `null` variantId.  
**Fix:** `cart.service.ts` uses `findFirst` with explicit `variantId: null` filter. Unit mock updated.

### 3. Swagger plugin crash on startup (Arabic workspace path)

**Symptom:** Backend failed to start after rebuild; module not found for `.ts` paths under Swagger introspection.  
**Fix:** Removed `@nestjs/swagger` CLI plugin from `nest-cli.json` (DTOs already have explicit decorators). Wrapped Swagger setup in try/catch in `main.ts`.

### 4. Store/Admin Tailwind 500 (from Phase L, confirmed)

**Fix retained:** `cross-env NODE_ENV=` for Next.js dev scripts so PostCSS/Tailwind works.

---

## Automated test command

```bash
# With dev stack running:
node backend/scripts/phase-m-e2e.cjs
```

**Latest run:** **53/53 passed**

---

## Final static verification

| Gate | Result |
|------|--------|
| `npm run validate` | ✅ |
| `npx prisma migrate status` | ✅ up to date |
| `npm run typecheck` | ✅ backend + store + admin |
| `npm run lint` | ✅ warnings only (pre-existing) |
| `npm run test:backend` | ✅ **56/56** |
| `npm run build` | ✅ backend + store + admin |

---

## Security & Git hygiene

| Check | Result |
|-------|--------|
| `.env` files gitignored | ✅ |
| No secrets in tracked files | ✅ |
| Localhost in production config | ✅ Only dev fallbacks / `.env.example` |
| Destructive DB commands | ✅ None |

---

## Manual browser checklist

Use while `npm run dev` is running. Report any row where **actual ≠ expected**.

### Store (http://localhost:3000)

| Test | Expected | If it fails, report |
|------|----------|---------------------|
| Home | Arabic RTL, categories/products load, store open banner if applicable | Blank page, LTR layout, or API errors in console |
| Categories | List opens; category page shows products | Empty list or 404 |
| Search | Query returns matching products (min 2 chars) | No results for known product name |
| Product details | Price, stock/availability, images, add-to-cart | Wrong price or cannot add |
| Variant product | Must pick variant before add | Adds without variant or error |
| Favorites | Heart toggles; favorites page lists item | Toggle does nothing |
| Cart | Items, qty change, subtotal updates | Wrong total or missing items |
| Checkout | Area + address required; order created | Blocked with open store + valid cart |
| Payment | Reference/notes submit; status updates | Submit fails or status stuck |
| Orders | Order list + detail match checkout | Missing order or wrong totals |
| Reviews | Can review purchased product | Submit fails after valid order |
| Support | Send message with subject + body | Validation error or no send |
| Profile | Phone shown after OTP login | Wrong user or logged out |
| Store closed | Admin closes store → closed message; checkout blocked | Can still checkout |

### Admin (http://localhost:3002)

| Test | Expected | If it fails, report |
|------|----------|---------------------|
| Login | Seeded admin email/password works | 401 or redirect loop |
| Dashboard | Stats/cards load | Empty or error toast |
| Products | List, create, edit, stock/availability | Save fails or store not updated |
| Categories | CRUD reflects on store | Store shows stale categories |
| Orders | List + detail; status/payment actions | Payment verify/reject broken |
| Delivery | Areas and fees editable | Checkout shows wrong fee |
| Settings | Store open/close, delivery thresholds | Store ignores setting |
| Payment | QR / payment settings visible | Missing config on store checkout |
| Announcements | Create shows on store | Not visible on store home |
| Support | Customer thread + reply | Messages missing |
| Reviews | Admin list loads | Empty when reviews exist |
| Analytics | Overview charts/numbers | Error or all zeros |

---

## Remaining issues / notes

1. **Manual UI testing** — Required; API pass does not replace browser UX (RTL, forms, uploads).
2. **Lint warnings** — Pre-existing unused imports / Next.js font warning; non-blocking.
3. **E2E creates test products** in Neon each run (tagged `phase-m`); safe to leave or clean later from Admin.
4. **Swagger docs** — May be disabled if plugin path issue recurs; API unaffected.
5. **Cloud deployment** — Intentionally not done in Phase M.

---

## Files changed in Phase M

- `package.json` — `cross-env` for backend/store/admin dev
- `backend/package.json` — `NODE_ENV=development` for watch mode
- `backend/src/modules/auth/auth.controller.ts` — dev OTP in response
- `backend/src/modules/auth/auth.service.ts` — DEV OTP logging
- `backend/src/modules/cart/cart.service.ts` — Prisma null variant fix
- `backend/src/modules/cart/cart.service.spec.ts`, `prisma.service.mock.ts`
- `backend/nest-cli.json`, `backend/src/main.ts` — Swagger stability
- `backend/scripts/phase-m-e2e.cjs` — Full local E2E script

---

## Final readiness status

| Area | Status |
|------|--------|
| Local stack vs Neon | ✅ Verified |
| Automated E2E | ✅ 53/53 |
| Unit tests | ✅ 56/56 |
| Production builds | ✅ |
| Manual browser QA | ⏳ **Your turn** (checklist above) |
| Cloud deploy | ⏸ Deferred |

**Phase M objective met:** Yaqouta is fully verified locally against the real Neon database; please complete manual browser testing using the checklist above.
