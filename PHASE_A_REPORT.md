# Phase A Report — Backend Orders & Checkout Foundation

## Status

**Complete.** Orders module implemented with checkout, snapshots, stock validation, and atomic stock deduction.

## Implemented

### Module: `backend/src/modules/orders/`

| File | Purpose |
|------|---------|
| `orders.service.ts` | Checkout, stock deduction, order queries, admin status updates |
| `orders.controller.ts` | Customer: `POST/GET /api/orders`, `GET /api/orders/:id` |
| `admin-orders.controller.ts` | Admin: `GET /api/admin/orders`, `GET /api/admin/orders/:id`, `PATCH /api/admin/orders/:id/status` |
| `dtos/create-order.dto.ts` | `deliveryAreaId`, `deliveryAddress`, optional `notes` |
| `dtos/update-order-status.dto.ts` | Admin order status updates |
| `orders.service.spec.ts` | 9 focused tests |

### Checkout behavior

1. Rejects checkout when store is closed (`StoreClosedException` with Arabic default message).
2. Validates active delivery area and non-empty cart.
3. Re-validates each cart line (active, available, not `UNAVAILABLE`, variant rules).
4. Atomically deducts stock inside a Prisma transaction using conditional `updateMany` (`stock >= quantity`).
5. Server-calculates subtotal, delivery fee, total, and `cartScore` (never trusts client).
6. Creates `Order` + `OrderItem` snapshots (name, price, `freeDeliveryValue`, `variantInfo` JSON).
7. Clears customer cart on success.
8. Initial statuses: `OrderStatus.PENDING`, `PaymentStatus.PENDING`.

### Concurrency

Two simultaneous checkouts for the last unit: only one `updateMany` succeeds; the other gets `InsufficientStockException` and the transaction rolls back (no partial order).

### Store closed rule

Checkout is blocked when `Settings.isStoreOpen === false`. Display of closed state to customers is a frontend concern (Phase F).

## Verification

```
npx prisma validate   ✅
npm test              ✅ 46 passed (6 suites)
npm run build         ✅
```

## Database note

PostgreSQL is **not installed** on this machine (no `psql`, no Docker). Initial migration and live DB integration tests are blocked until local PostgreSQL is available. Unit tests use mocked Prisma.

## Next phase

**Phase B** — Manual payment workflow (submit payment, admin verify/reject, order confirmation).
