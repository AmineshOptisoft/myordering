"use strict";

const express = require("express");
const { fail, ApiError } = require("./lib/apiResponse");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");

/**
 * Build the Express app. Dependencies are injected so tests can pass a fresh
 * store and a fake coupon validator.
 *
 * @param {{ store: object, couponValidator: { isValid(code: string): Promise<boolean> } }} deps
 */
function createApp({ store, couponValidator }) {
  const app = express();

  app.use(
    express.json({
      // Surface malformed JSON as a spec-shaped 400 rather than Express's HTML.
      verify: () => {},
    })
  );

  app.get("/api/health", (req, res) => res.json({ data: { ok: true }, code: "SUCCESS" }));

  app.use("/api/products", productRoutes({ store }));
  app.use("/api/orders", orderRoutes({ store, couponValidator }));

  // unknown route
  app.use((req, res) => {
    fail(res, 404, "NOT_FOUND", `Cannot ${req.method} ${req.path}`);
  });

  // error handler — understands ApiError; also catches the body-parser error
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err && err.type === "entity.parse.failed") {
      return fail(res, 400, "BAD_REQUEST", "Request body is not valid JSON");
    }
    if (err instanceof ApiError) {
      return fail(res, err.status, err.code, err.message, err.details);
    }
    // eslint-disable-next-line no-console
    console.error(err);
    return fail(res, 500, "INTERNAL", "Something went wrong");
  });

  return app;
}

module.exports = { createApp };
