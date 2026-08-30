# Database & Local Development Setup

This guide describes how to run the project locally once PostgreSQL is available.

## Prerequisites

- Node.js >= 18
- npm >= 9
- PostgreSQL 14+ (local install, Docker, or managed cloud instance)

## 1. Install dependencies

From the repository root:

```bash
npm install
```

## 2. Configure environment

```bash
cp backend/.env.example backend/.env
cp store/.env.example store/.env.local
cp admin/.env.example admin/.env.local
```

Edit `backend/.env`:

- Set `DATABASE_URL` to your PostgreSQL connection string
- Set strong `JWT_SECRET` (minimum 32 characters for production)
- Set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` for the initial admin account

**Production / cloud PostgreSQL example (format only):**

```
postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public&sslmode=require
```

Never commit real credentials to Git.

### Neon PostgreSQL (project `yagota`)

Use two connection strings from the Neon Console → **Connect**:

| Variable | Neon type | Usage |
|----------|-----------|--------|
| `DATABASE_URL` | **Pooled** (`-pooler` hostname) | NestJS runtime / Prisma Client queries |
| `DATABASE_URL_UNPOOLED` | **Direct** (no `-pooler`) | `prisma migrate deploy` only |

Both must include `sslmode=require`. Do **not** use Neon CLI if you prefer not to grant org/project management permissions — copy strings manually from the dashboard.

Apply migrations (non-destructive):

```bash
cd backend
npx prisma migrate deploy
npx prisma migrate status
```

Seed (requires `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` in `backend/.env`):

> **Important:** Seed credentials must be present in the gitignored file `backend/.env`. Cursor secure secrets are not read automatically unless they are written to this file.

```bash
npm run db:seed
```

Verify connection:

```bash
node backend/scripts/verify-db.cjs
curl http://localhost:3001/health/db
```


```bash
npm run db:generate
```

## 4. Apply database migrations

### First-time setup (development)

```bash
npm run db:migrate
```

This runs `prisma migrate dev` in the backend workspace.

An initial migration (`20250830100000_init`) is included in the repository. When a database is available, Prisma will apply it and record migration history.

### Production / CI deploy

```bash
npm run db:migrate:deploy
```

This runs `prisma migrate deploy` — safe for production, does not reset data.

## 5. Seed the database

Ensure `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` are set in `backend/.env`, then:

```bash
npm run db:seed
```

The seed creates:

- One admin user (credentials from environment variables only)
- Default store settings
- Sample delivery areas and categories

It does **not** create fake orders, customers, or payment records.

## 6. Start services

### All services (root)

```bash
npm run dev
```

### Individual services

```bash
npm run dev:backend   # http://localhost:3001
npm run dev:store     # http://localhost:3000
npm run dev:admin     # http://localhost:3002
```

## 7. Verify

### Static checks (no database required)

From the repository root:

```bash
npm run validate        # prisma generate + prisma validate
npm run typecheck       # TypeScript across backend, store, admin
npm run lint            # ESLint across all workspaces
npm run test:backend    # Jest unit tests (mocked, no PostgreSQL)
npm run build           # Production builds for all three apps
```

Or run the full static pipeline:

```bash
npm run verify:static
```

### Runtime checks (requires PostgreSQL + migrations)

| Check | URL |
|-------|-----|
| API health | `GET http://localhost:3001/health` |
| Database health | `GET http://localhost:3001/health/db` |
| API (authenticated routes) | `http://localhost:3001/api/...` |
| Swagger (development only) | `http://localhost:3001/api/docs` |

**Local OTP login (development only):** After `POST /auth/send-otp`, the 6-digit code is printed in the backend console as `[DEV OTP]`. It is never logged in production.

## Migration status terminology

| Status | Meaning |
|--------|---------|
| **Schema validated** | `npx prisma validate` passes — schema syntax is correct |
| **Migration prepared** | SQL migration files exist in `backend/prisma/migrations/` |
| **Migration applied** | `prisma migrate deploy` or `migrate dev` succeeded against a live database |

If PostgreSQL is not available, the project remains at **Schema validated** + **Migration prepared**. Migration application is blocked until a real database connection exists.

## Storage (development)

Uploads use the local filesystem provider (`UPLOAD_DIR=uploads`). Files are served at `/uploads/...`.

For production cloud deployment, replace the storage provider with object storage (e.g. Cloudflare R2) using the existing `StorageProvider` abstraction — no business logic changes required.

## Troubleshooting

- **Connection refused:** PostgreSQL is not running or `DATABASE_URL` is incorrect
- **SSL errors:** Add `?sslmode=require` for managed cloud databases
- **Seed fails:** Ensure `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` (min 12 chars) are set
- **JWT errors in production:** `JWT_SECRET` must be at least 32 characters
