# Phase C Report — Upload System (Local Storage)

## Status

**Complete.**

## Implemented

### Storage abstraction

- `StorageProvider` interface + `STORAGE_PROVIDER` token
- `LocalStorageProvider` — saves under `uploads/{category}/[{ownerId}/]{uuid}.ext`
- Swappable later for Cloudflare R2 without changing controllers

### Upload service

- MIME type validation (jpeg, png, webp)
- Extension validation
- Max file size from `MAX_FILE_SIZE` env
- Path traversal protection on delete
- Memory storage via Multer (no temp disk writes before validation)

### Endpoints

| Route | Role | Purpose |
|-------|------|---------|
| `POST /api/admin/upload/product-image` | ADMIN | Product images |
| `POST /api/admin/upload/payment-qr` | ADMIN | Payment QR image |
| `POST /api/upload/payment-proof` | CUSTOMER | Payment proof (scoped by user id) |

### Static serving

- `main.ts` serves `/uploads/*` from local `uploads/` directory

## Verification

```
npm test   ✅ 56 passed (7 suites)
```

## Next phase

**Phase D** — Customer backend features (favorites, reviews, announcements, support).
