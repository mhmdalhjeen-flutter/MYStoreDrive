# Phase D Report — Customer Backend Features

## Status

**Complete.**

## Implemented

### Favorites (`/api/favorites`)
- List, add, remove, status check
- Customer-only; validates product is active

### Reviews (`/api/reviews`)
- Public: list by product, rating summary
- Customer: create (one per product), delete own, list mine

### Announcements
- Public: `GET /api/announcements` (active, date-filtered)
- Admin CRUD: `/api/admin/announcements`

### Support messaging
- Customer: `GET/POST /api/support/messages`
- Admin: list messages, view thread, reply, mark read
- Optional `orderId` linkage validated against customer ownership

### Order history
- Already in Phase A: `GET /api/orders`, `GET /api/orders/:id`

## Next phase

**Phase E** — Admin backend (mostly covered; analytics added separately).
