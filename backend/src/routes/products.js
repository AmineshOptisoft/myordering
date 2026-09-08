"use strict";

/**
 * GET /api/products      -> list
 * GET /api/products/:id  -> one, or 404 PRODUCT_NOT_FOUND
 *
 * Implemented — this is the reference for the response envelope, error shape
 * and general style. `POST /orders` should match this bar.
 */

const express = require("express");
const { ok, ApiError } = require("../lib/apiResponse");

module.exports = function productRoutes({ store }) {
  const router = express.Router();

  router.get("/", (req, res) => {
    ok(res, store.listProducts());
  });

  router.get("/:id", (req, res) => {
    const product = store.getProduct(req.params.id);
    if (!product) {
      throw new ApiError(
        404,
        "PRODUCT_NOT_FOUND",
        `No product with id "${req.params.id}"`,
        { id: req.params.id }
      );
    }
    ok(res, product);
  });

  return router;
};
