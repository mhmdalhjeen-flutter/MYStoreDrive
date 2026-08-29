# Phase 3A — Cloud Readiness Report

Scope: make the existing foundation technically deployable to managed cloud
infrastructure. No database was created or connected, no migrations were
generated, nothing was deployed, and no feature module (Orders, Upload,
Support, Announcements, Analytics) was implemented.

---

## 1. Blockers found and verified

Every blocker listed in `PRE_CLOUD_CORRECTION_REPORT.md` was re-checked against
the current code before being touched.

| # | Blocker | Verified present | Why it matters in the cloud | Action |
|---|---------|------------------|------------------------------|--------|
| 1 | `app.listen(port)` without host | yes (`backend/src/main.ts`) | Binding to the default interface can leave the container unreachable by the platform's health prober | Fixed |
| 2 | Port read only from `BACKEND_PORT` | yes | Render/Railway/Fly inject `PORT`; the service would listen on the wrong port and be killed | Fixed |
| 3 | CORS hardcoded to two fixed values | yes | Only two origins, localhost defaults, no way to add a preview/staging origin | Fixed |
| 4 | Winston writes `logs/*.log` | yes | Ephemeral container filesystems: the logs disappear and disk fills; platform log drains read stdout | Fixed |
| 5 | Exception filter returns raw `Error.message` | yes (`common/filters/http-exception.filter.ts`) | Unexpected non-HTTP errors (including Prisma errors) leak internals to clients | Fixed |
| 6 | Backend lint fails: no ESLint config | yes | Blocks any future CI gate | Fixed |
| 7 | Store/Admin have no ESLint config | yes (`next lint` would prompt interactively) | Same; also breaks non-interactive builds that run lint | Fixed |
| 8 | Root `npm test` fails | yes (store/admin have no `test` script) | Any pipeline calling the documented root command fails | Fixed |
| 9 | No Prisma migration history | yes | Cannot create the cloud schema without a real database | Deferred — requires `DATABASE_URL` |
| 10 | No managed PostgreSQL | yes | — | Requires your account creation |
| 11 | Object storage provider undecided | yes | Upload module does not exist yet | Deferred (decision needed) |
| 12 | No CI / Dockerfile / provider config | yes | Not required: Render/Railway/Vercel build Node projects natively | Not added (no concrete requirement) |

### Additional blockers discovered during this phase

| # | Issue | Impact | Action |
|---|-------|--------|--------|
| 13 | `npm run start:prod` was broken | `nest build` compiled to `dist/src/main.js` (because `prisma/seed.ts` widened the TS root), while `start:prod` runs `node dist/main` — the production start command would have crashed on first deploy | Fixed via `backend/tsconfig.build.json` |
| 14 | `prisma generate` not part of the backend build | Cloud builders install with a cached/pruned `node_modules`; without generation the build fails or ships a stale client | Fixed (`build` = `prisma generate && nest build`) |
| 15 | Seed hardcoded the admin password `admin123456` | A publicly known admin credential would be created in staging/production | Fixed — seed now requires `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` and refuses to run without them |
| 16 | OTP generated with `Math.random()` | Predictable OTP values; not a CSPRNG | Fixed (`crypto.randomInt`) |
| 17 | `POST /auth/admin/login` and `/auth/refresh` had no per-route throttle | Password/token brute force limited only by the global 100 req/min | Fixed (5/min, 20/min; verify-otp 10/min) |
| 18 | Swagger served unconditionally | Publishes the full API surface publicly in production | Fixed — disabled in production unless `SWAGGER_ENABLED=true` |
| 19 | Prisma `query` logging in all environments | Query logs can contain customer data | Fixed — `warn`/`error` only in production |
| 20 | No `trust proxy` | Behind a cloud load balancer every request appears to come from the proxy IP, so rate limiting applies globally instead of per client | Fixed |

---

## 2. Backend cloud startup

`backend/src/main.ts`:

- listens on `process.env.PORT ?? BACKEND_PORT ?? 3001` and binds `0.0.0.0`
- `app.enableShutdownHooks()` so Prisma disconnects on SIGTERM (rolling deploys)
- `app.set('trust proxy', 1)` for correct client IPs behind the platform proxy
- production logging is a single JSON stdout transport; file transports remain in
  development only
- `bootstrap()` failures are logged and exit with code 1 instead of an unhandled
  rejection, so the platform marks the deploy as failed
- health endpoints are excluded from the global API prefix, so probes can use
  `GET /health` and `GET /health/db` (all other routes keep `/<API_PREFIX>/...`)

Fail-fast configuration validation (`backend/src/config/env.validation.ts`, wired
into `ConfigModule.forRoot({ validate })`):

- always required: `DATABASE_URL`, `JWT_SECRET`
- additionally required in production: `JWT_REFRESH_SECRET`, at least one CORS origin
- in production, both JWT secrets must be ≥32 characters and must differ

Verified behaviour (production mode, no config):

```
Invalid environment configuration:
  - DATABASE_URL is required
  - JWT_SECRET is required
  - JWT_REFRESH_SECRET is required
  - CORS_ORIGINS (or STORE_FRONTEND_URL and ADMIN_FRONTEND_URL) is required
```

Local development is unchanged: with a `.env` present, defaults and localhost
CORS still apply.

---

## 3. CORS

`CORS_ORIGINS` is a comma-separated allowlist, merged with `STORE_FRONTEND_URL`
and `ADMIN_FRONTEND_URL` (trailing slashes stripped, de-duplicated).
`credentials: true` is preserved and `*` is never used. With nothing configured,
development falls back to `http://localhost:3000` and `http://localhost:3002`;
production refuses to start.

---

## 4. Database readiness

- `prisma validate` passes; Prisma Client generates.
- `DATABASE_URL` remains the single source of connection configuration and is
  backend-only.
- `PrismaService` now logs a connection failure **without** the error message,
  because Prisma embeds the connection string (credentials) in it, and rethrows a
  generic error so the deploy fails loudly instead of serving a broken app.
- `prisma:deploy` (`prisma migrate deploy`) and `prisma:validate` scripts added;
  `prisma migrate dev` stays development-only. **No migration was generated.**

---

## 5. Deployment configuration (scripts only)

| File | Change |
|------|--------|
| `backend/package.json` | `build` runs `prisma generate`; `lint` no longer auto-fixes (added `lint:fix`); added `prisma:deploy`, `prisma:validate`, and a `prisma.seed` entry |
| `backend/tsconfig.build.json` | new — excludes `prisma/`, tests and specs so output is `dist/main.js` |
| `store/package.json`, `admin/package.json` | `start` is now plain `next start` (honours the platform-injected `PORT`); `start:local` keeps the fixed 3000/3002 ports |
| root `package.json` | `test` runs the backend suite only (store/admin have no tests); added `typecheck`, `typecheck:store`, `typecheck:admin`, `db:deploy` |

No Dockerfile and no provider config files were added: Render/Railway build a
Node service from these scripts, and Vercel builds the two Next.js apps directly.

---

## 6. Linting

A minimal configuration was added rather than documented as a gap:

- `backend/.eslintrc.js` — `@typescript-eslint/recommended` + prettier, using the
  already-installed dependencies (nothing new installed)
- `store/.eslintrc.json`, `admin/.eslintrc.json` — `next/core-web-vitals`

Seven pre-existing errors were all unused imports/variables; they were removed.
No logic was rewritten to satisfy lint.

---

## 7. Security review

Reviewed: authentication, JWT/refresh tokens, OTP, role authorization,
validation, rate limiting, CORS, error handling, environment variables, secret
exposure. Authentication architecture was **not** redesigned.

Fixed: items 15–20 above, plus the exception filter no longer returning raw
error messages in production.

Confirmed already sound:

- OTP codes are bcrypt-hashed at rest, single-use, expiring, attempt-capped, and
  rate-limited to one per minute per phone number
- passwords are bcrypt-hashed; admin login returns a generic `Invalid credentials`
  for both unknown user and bad password
- global `JwtAuthGuard` + `RolesGuard`; `@Public()` is opt-in and all admin
  controllers are `@Roles(ADMIN)`; role checks are server-side
- `ValidationPipe` with `whitelist` + `forbidNonWhitelisted`
- no secrets in the repository; only `.env.example` files are tracked

Not fixed (require your decision — see §10): refresh-token rotation/revocation,
`helmet` security headers (new dependency), and file-upload validation (no upload
code exists yet).

---

## 8. Files changed

Created:

- `backend/src/config/env.validation.ts`
- `backend/src/config/env.validation.spec.ts`
- `backend/tsconfig.build.json`
- `backend/.eslintrc.js`
- `store/.eslintrc.json`
- `admin/.eslintrc.json`
- `CLOUD_READINESS_REPORT.md`

Modified:

- `backend/src/main.ts`
- `backend/src/app.module.ts`
- `backend/src/modules/prisma/prisma.service.ts`
- `backend/src/modules/auth/auth.service.ts`
- `backend/src/modules/auth/auth.controller.ts`
- `backend/src/common/filters/http-exception.filter.ts`
- `backend/prisma/seed.ts`
- `backend/.env.example`
- `backend/package.json`, `store/package.json`, `admin/package.json`, root `package.json`
- `backend/src/modules/users/users.controller.ts`, `backend/src/modules/cart/cart.service.spec.ts`,
  `backend/src/modules/categories/categories.service.spec.ts` (unused imports only)

---

## 9. Environment requirements

Backend (all private; set in the platform's secret manager, never in Git):

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | yes | managed PostgreSQL, usually `?sslmode=require` |
| `JWT_SECRET` | yes | ≥32 chars in production |
| `JWT_REFRESH_SECRET` | yes in production | must differ from `JWT_SECRET` |
| `CORS_ORIGINS` | yes in production | or `STORE_FRONTEND_URL` + `ADMIN_FRONTEND_URL` |
| `NODE_ENV` | yes | `production` in the cloud |
| `PORT` | injected | by the platform |
| `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`, `OTP_EXPIRES_IN`, `OTP_MAX_ATTEMPTS`, `BCRYPT_ROUNDS`, `RATE_LIMIT_TTL`, `RATE_LIMIT_MAX`, `API_PREFIX`, `SWAGGER_ENABLED` | optional | defaults documented in `backend/.env.example` |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_ADMIN_PHONE` | only when seeding | not needed at runtime |

Store and Admin (public, embedded in the browser bundle at build time):
`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_IMAGE_BASE_URL`.

---

## 10. Verification results

| Check | Result |
|-------|--------|
| `prisma validate` | pass (placeholder `DATABASE_URL`, no connection attempted) |
| `prisma generate` | pass (v5.22.0) |
| Backend build | pass — emits `dist/main.js` |
| Backend tests | pass — 49 tests, 7 suites (was 40/6; 9 new config tests) |
| Backend lint | pass (0 errors) |
| Store build | pass |
| Store lint | pass (1 pre-existing font warning) |
| Admin build | pass |
| Admin lint | pass (1 pre-existing font warning) |
| Store + Admin typecheck | pass |
| Startup with missing config | fails fast with the message above, exit 1 |
| Startup with unreachable DB | logs `Database connection failed. Check DATABASE_URL configuration.` — no connection string in the log — and exits 1 |
| `/health`, `/health/db` route mapping | confirmed at bootstrap |

Not verifiable without a real database: a live `GET /health/db` 200 response and
any query path.

---

## 11. Remaining blockers before deployment

1. No managed PostgreSQL instance and no `DATABASE_URL` (you must create these).
2. No Prisma migration history — the initial migration must be generated against
   the real, empty database.
3. Object storage provider not chosen; the upload module does not exist.
4. No SMS/OTP provider: OTPs are generated but never delivered, so customer login
   cannot work in a cloud environment unless a provider is configured.
5. Frontend deployment URLs are unknown until the platforms are created, so
   `CORS_ORIGINS` and `NEXT_PUBLIC_API_URL` cannot be filled in yet.

---

## 12. Decisions requiring your approval

1. **Providers** — the earlier recommendation stands: Neon (PostgreSQL), Render or
   Railway (backend), Vercel ×2 (store, admin), Cloudflare R2 (files, later). All
   have free tiers; all require **you** to create the accounts.
2. **`helmet`** — one new dependency for standard security headers (HSTS,
   `X-Content-Type-Options`, etc.). Not installed, since you asked for no
   unnecessary dependencies. Recommended before public exposure.
3. **Refresh-token rotation/revocation** — currently refresh tokens are stateless
   and valid for 30 days with no server-side revocation. Changing this touches the
   authentication architecture, so it needs explicit approval.
4. **SMS/OTP provider** — a business/cost decision, and a prerequisite for real
   customer login.
5. **Seeding staging** — whether to seed the cloud database at all, and with which
   admin email/password (supplied as secrets, never committed).

---

## 13. Next phase (not started)

Once you approve: create the managed PostgreSQL instance, provide `DATABASE_URL`,
generate and apply the initial migration with `prisma migrate deploy`, verify
tables/indexes/relations, then deploy backend → store → admin and wire the real
origins into `CORS_ORIGINS` / `NEXT_PUBLIC_API_URL`.
