# API spec

Base URL: `http://localhost:4000/api`

This is the contract. Implement it exactly — the automated checks and the review
both compare against what is written here. Where something is unspecified, make a
reasonable decision and record it in `DECISIONS.md`.

## Conventions

- All request and response bodies are JSON. Send `Content-Type: application/json`.
- **Money is always integer cents.** `priceCents: 1299` means \$12.99. Never send
  or store floating-point currency.
- **Success envelope** — every 2xx response body is:
  ```json
  { "data": <payload>, "code": "SUCCESS" }
  ```
- **Error envelope** — every 4xx / 5xx response body is:
  ```json
  { "code": "<ERROR_CODE>", "message": "<human readable>", "details": <optional> }
  ```
  `code` is a stable `SCREAMING_SNAKE_CASE` string the client can branch on.
  `message` is for humans and may change. `details` is optional and free-form.
- Unknown route → `404` with `code: "NOT_FOUND"`.
- Malformed JSON body → `400` with `code: "BAD_REQUEST"`.

---

## `GET /products`

List all products. Already implemented in the skeleton — treat it as the
reference for the quality bar.

**200**
```json
{
  "data": [
    {
      "id": "prod_margherita",
      "name": "Margherita",
      "description": "Tomato, mozzarella, basil",
      "priceCents": 1299,
      "category": "pizza",
      "imageUrl": "https://picsum.photos/seed/margherita/400/300",
      "stock": 12
    }
  ],
  "code": "SUCCESS"
}
```

Order: as returned by the store (insertion order of the seed). No pagination.

---

## `GET /products/:id`

Single product. Already implemented.

- **200** — `{ "data": <product>, "code": "SUCCESS" }`
- **404** — `{ "code": "PRODUCT_NOT_FOUND", "message": "...", "details": { "id": "<id>" } }`

---

## `POST /orders`

Create an order. **You implement this.**

### Request body

```json
{
  "items": [
    { "productId": "prod_margherita", "quantity": 2 },
    { "productId": "prod_cola", "quantity": 1 }
  ],
  "couponCode": "HAPPYHRS"
}
```

- `items` — required, non-empty array.
  - `productId` — required string.
  - `quantity` — required integer `>= 1`. Non-integer or `< 1` is invalid.
  - The same `productId` may appear more than once; treat repeats as additive
    (total quantity is the sum). How you represent that in the response is your
    call — document it.
- `couponCode` — optional string. If the key is present it must be a non-empty
  string; `null` is treated as absent.

### Validation order and errors

Check in this order and return the **first** failure:

| Condition | Status | `code` |
| --- | --- | --- |
| Body is not an object / `items` missing or empty / an item is missing fields / `quantity` not a positive integer | `422` | `INVALID_ORDER` |
| A `productId` does not exist | `422` | `PRODUCT_NOT_FOUND` (`details.productId`) |
| Requested quantity for a product exceeds its current `stock` | `422` | `INSUFFICIENT_STOCK` (`details.productId`, `details.available`) |
| `couponCode` is present but not valid (see rule below) | `422` | `INVALID_COUPON` (`details.couponCode`) |

On any failure **no order is created and no stock is changed.**

### Success

On success:

1. Decrement each product's `stock` by the ordered quantity.
2. Build the order:
   - `subtotalCents` = Σ (product `priceCents` × quantity).
   - If a valid coupon was supplied: `discountCents` = 10% of `subtotalCents`,
     **rounded half-up to the nearest cent** (e.g. subtotal `1299` → `130`).
     Otherwise `discountCents` = `0`.
   - `totalCents` = `subtotalCents − discountCents`.
3. Respond **201**:

```json
{
  "data": {
    "id": "order_a1b2c3",
    "createdAt": "2026-01-01T12:00:00.000Z",
    "items": [
      { "productId": "prod_margherita", "name": "Margherita", "priceCents": 1299, "quantity": 2, "lineTotalCents": 2598 }
    ],
    "couponCode": "HAPPYHRS",
    "couponApplied": true,
    "subtotalCents": 2598,
    "discountCents": 260,
    "totalCents": 2338
  },
  "code": "SUCCESS"
}
```

`couponCode` is `null` and `couponApplied` is `false` when none was supplied.
Order `id` format is up to you as long as it is unique and URL-safe.

Orders do not need to survive a server restart (in-memory is fine), but a
`GET /orders/:id` that returns a created order is a welcome extra if you have
time — not required, and not in scope for scoring if it is missing.

---

## Promo-code rule (the hard part)

A code is **valid** iff **both**:

1. `8 <= code.length <= 10`.
2. The code appears in **at least two of the three** files
   `couponbase1.gz`, `couponbase2.gz`, `couponbase3.gz` (see
   `scripts/generate-coupons.js`). Matching is exact and case-sensitive; each
   file is newline-separated codes, gzip-compressed.

Operating constraints (memory ceiling, latency target, no external services,
warm-up window) are in the [README](./README.md#constraints-on-the-promo-code-engine).
They are part of the challenge, not a footnote.

### Codes you can rely on while developing

Valid: `HAPPYHRS`, `FIFTYOFF`. Invalid: `LONELY01` (one file only),
`GHOSTCODE` (no file), `SHORT7` (length), `WAYTOOLONG11` (length).
`scripts/generate-coupons.js --show-planted` prints the full planted set it
guarantees; additional evaluation codes are held back.
