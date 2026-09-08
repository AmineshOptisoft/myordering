"use strict";

const path = require("path");
const { createApp } = require("./app");
const { createStore } = require("./store");
const { CouponValidator } = require("./coupons/validator");

const PORT = Number(process.env.PORT || 4000);
const COUPONS_DIR =
  process.env.COUPONS_DIR || path.resolve(__dirname, "../../coupons");

const store = createStore();
const couponValidator = new CouponValidator({ dir: COUPONS_DIR });

const app = createApp({ store, couponValidator });

// Start serving immediately; warm the coupon subsystem in the background.
const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`Coupon files: ${COUPONS_DIR}`);

  const started = Date.now();
  Promise.resolve(couponValidator.init())
    .then(() => {
      // eslint-disable-next-line no-console
      console.log(
        `Coupon validator ready in ${((Date.now() - started) / 1000).toFixed(1)}s`
      );
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.warn(
        `Coupon validator not ready: ${err.message}\n` +
          `  -> implement backend/src/coupons/validator.js, and run\n` +
          `     node scripts/generate-coupons.js  to create the files.`
      );
    });
});

process.on("SIGINT", () => server.close(() => process.exit(0)));
process.on("SIGTERM", () => server.close(() => process.exit(0)));
