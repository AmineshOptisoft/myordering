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
      const { body } = req;
      //console.log("BODY", body);
      const { items, couponCode } = body;
      let couponApplied = false;
      let refinedProductArray = [];

      // 1. Validate the body. First failure wins, in this order:
      // - not an object / items missing or empty / item missing fields /
      //   quantity not a positive integer      -> 422 INVALID_ORDER
      // - a productId does not exist            -> 422 PRODUCT_NOT_FOUND
      // - quantity > current stock              -> 422 INSUFFICIENT_STOCK
      // - couponCode present but not valid      -> 422 INVALID_COUPON
      // On any failure: no order created, no stock changed.

      if (typeof body !== "object" || body === null) {
        throw new ApiError(422, "INVALID_ORDER", "Body must be an object");
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new ApiError(422, "INVALID_ORDER", "Items must be a non-empty array");
      }

      if (items.some(item => typeof item !== "object" || item === null)) {
        throw new ApiError(422, "INVALID_ORDER", "Items must be an array of objects");
      }

      if (items.some((item) =>
        !item.productId ||
        item.quantity == null
      )
      ) {
        throw new ApiError(422, "INVALID_ORDER", "Item fields are missing");
      }

      if (items.some(item => !item.quantity || typeof item.quantity !== "number" || !Number.isInteger(item.quantity) || item.quantity <= 0)) {
        throw new ApiError(422, "INVALID_ORDER", "Items must have a positive integer quantity");
      }




      // check duplicate productId in items and combine them get priceCents and set it from store.getProduct


      for (const item of items) {
        const product = await store.getProduct(item.productId);

        if (!product) {
          throw new ApiError(
            422,
            "PRODUCT_NOT_FOUND",
            "Product not found",
            { productId: item.productId }
          );
        }

        const existing = refinedProductArray.find(
          (data) => data.productId === item.productId
        );

        if (existing) {
          existing.quantity += item.quantity;
          existing.lineTotalCents = existing.priceCents * existing.quantity;
        } else {
          refinedProductArray.push({
            productId: item.productId,
            quantity: item.quantity,
            priceCents: product.priceCents,
            name: product.name,
            lineTotalCents: product.priceCents * item.quantity,
          });
        }
      }

      // check for INSUFFICIENT_STOCK
      for (const item of refinedProductArray) {
        const product = await store.getProduct(item.productId);
        if (item.quantity > product.stock) {
          throw new ApiError(
            422,
            "INSUFFICIENT_STOCK",
            "Insufficient stock",
            { productId: item.productId, available: product.stock }
          );
        }
      }

      const lines = refinedProductArray;


      console.log("lines lineslines lineslines lines", lines);

      // if coupon code is present and valid
      if (couponCode) {
        const isValidCoupon = await couponValidator.isValid(couponCode.trim().toUpperCase());
        if (!isValidCoupon) {
          throw new ApiError(422, "INVALID_COUPON", "Invalid coupon");
        } else {
          couponApplied = true;
        }
      }

      // 2. On success:
      //       - decrement stock (store.commitStock)
      //       - subtotalCents = sum(priceCents * quantity)
      //       - discountCents = valid coupon ? round-half-up(10% of subtotal) : 0
      //       - totalCents    = subtotalCents - discountCents
      //       - persist via store.saveOrder, respond 201 with the spec shape

      await store.commitStock(lines);

      const subtotalCents = lines.reduce((sum, item) => sum + (item.priceCents * item.quantity), 0);

      const discountCents = couponCode ? Math.round((subtotalCents) / 10) : 0;

      const totalCents = subtotalCents - discountCents;

      const order = await store.saveOrder({

        createdAt: new Date().toISOString(),
        items: lines,
        couponCode: couponCode || null,
        subtotalCents,
        discountCents,
        totalCents,
        couponApplied
      });



      res.status(201).json({ data: order, code: "SUCCESS", });

    })
  );

  return router;
};
