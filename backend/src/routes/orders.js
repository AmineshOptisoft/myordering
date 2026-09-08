"use strict";

/**
 * POST /api/orders  -> 201 with the created order
 *
 * ============================================================================
 *  YOUR JOB. This is a stub. Implement it against API_SPEC.md "POST /orders".
 * ============================================================================
 *
 * Summary of what it must do (the spec is authoritative):
 *
 *  1. Validate the body. First failure wins, in this order:
 *       - not an object / items missing or empty / item missing fields /
 *         quantity not a positive integer      -> 422 INVALID_ORDER
 *       - a productId does not exist            -> 422 PRODUCT_NOT_FOUND
 *       - quantity > current stock              -> 422 INSUFFICIENT_STOCK
 *       - couponCode present but not valid      -> 422 INVALID_COUPON
 *     On any failure: no order created, no stock changed.
 *
 *  2. On success:
 *       - decrement stock (store.commitStock)
 *       - subtotalCents = sum(priceCents * quantity)
 *       - discountCents = valid coupon ? round-half-up(10% of subtotal) : 0
 *       - totalCents    = subtotalCents - discountCents
 *       - persist via store.saveOrder, respond 201 with the spec shape
 *
 * `couponValidator.isValid(code)` returns a Promise<boolean> and already
 * enforces BOTH the length rule and the "2 of 3 files" rule.
 *
 * Repeated productId in items: treat as additive. Document how you represent it
 * in the response (DECISIONS.md).
 */

const express = require("express");
const { ApiError, wrap } = require("../lib/apiResponse");

module.exports = function orderRoutes({ store, couponValidator }) {
  const router = express.Router();

  // `wrap` forwards async errors to the Express error handler — keep it.
  router.post(
    "/",
    wrap(async (req, res) => {
      throw new ApiError(
        501,
        "NOT_IMPLEMENTED",
        "POST /orders is not implemented yet — see backend/src/routes/orders.js"
      );
    })
  );

  return router;
};
