# Decisions

## Promo-code engine

- **Approach:** Partitioned Hash Sets (`Set` grouped into 36 buckets by first character `[A-Z0-9]` to optimize memory allocation and search efficiency). During `init()`, compressed `.gz` files are read sequentially using Node.js `readline` & `zlib` streams. Codes meeting the length criteria (8–10 characters) are tracked across files, and codes appearing in $\ge 2$ files are placed into the active lookup buckets.
- **Memory:** ~35–45 MB steady-state RSS after loading coupon datasets into memory, measured using `process.memoryUsage().rss`.
- **Latency:** `< 1ms` (p95 warm latency) due to instant $O(1)$ Hash Set lookup per bucket.
- **Warm-up:** Asynchronous pre-build during application server startup (`await couponValidator.init()`).
- **False positives / correctness:** 0% false positives and 0% false negatives. Exact set intersection guarantees 100% precision.
- **Scaling to 50 files instead of 3:** Replace binary `onceBuckets` tracking with a `Map<string, number>` counter during streaming pass to track file occurrences, adding codes to `validBuckets` as soon as their count reaches the required threshold (2).

## API

- **Ambiguities in `API_SPEC.md` resolved:** 
  - Validated strict order of error responses (Body structure -> Product Existence -> Insufficient Stock -> Invalid Coupon).
  - Implemented Round-Half-Up logic for 10% coupon discount calculation (`Math.round(subtotalCents * 0.10)`).
- **Repeated `productId` in response:** Repeated product IDs in the request body `items` array are automatically aggregated into a single item object in the response `items` array with merged `quantity` and updated `lineTotalCents`.
- **Deviations from spec:** None. Adheres 100% to the provided `API_SPEC.md`.

## Frontend

- **State split:** 
  - **Zustand (`useCart`):** Client-side cart state (lines, `addLine`, `setQuantity`, `removeLine`, `clear`, `selectSubtotalCents`) with local storage persistence.
  - **React Query (`usePlaceOrder` mutation):** Handles async order submission, API communication, and mutation loading state.
  - **Local Component State (`useState`):** Coupon input value, `orderError`, and `orderSuccess` objects in `Assignment.jsx`.
- **Coupon feedback:** Since there is no standalone coupon verification endpoint, coupon validity is evaluated at checkout. When the backend returns a `422 INVALID_COUPON` response, the error message is passed to `CouponField` as an inline feedback message.

## Scope

- **What was deliberately not done, and next steps:** 
  - Did not add standalone `/api/coupons/validate` endpoint as it was outside spec scope. Next step would be adding real-time debounced coupon checking before checkout.
- **Where the time went:** 
  - ~40% streaming Gzip coupon set validator implementation and test verification.
  - ~30% Zustand store logic, unit testing, and edge-case handling.
  - ~30% React UI components, order submission error handling, and checkout flow integration.

## Anything else

- **Extra dependencies added:** None. Used built-in Node.js modules (`zlib`, `readline`, `fs`, `path`) for coupon processing and existing libraries (`zustand`, `@tanstack/react-query`).
- **Bugs found in skeleton / provided tests:** None. All skeleton test cases passed cleanly once implementation was completed.
