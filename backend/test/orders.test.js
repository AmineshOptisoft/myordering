"use strict";

/**
 * These fail against the skeleton — POST /orders is a stub. Make them pass, and
 * add your own cases (rounding, coupon length boundaries, repeated productId,
 * concurrent last-unit stock, ...).
 *
 * The coupon *engine* is faked here so these tests stay fast and focused on the
 * order logic. `fakeValidator([...])` treats exactly the listed codes as valid.
 */

const request = require("supertest");
const { createApp } = require("../src/app");
const { createStore } = require("../src/store");

function fakeValidator(validCodes = []) {
  const set = new Set(validCodes);
  return { init: async () => {}, isValid: async (code) => set.has(code) };
}

function makeApp({ valid = [] } = {}) {
  const store = createStore();
  const app = createApp({ store, couponValidator: fakeValidator(valid) });
  return { app, store };
}

describe("POST /api/orders — success", () => {
  it("creates an order and returns the spec shape (no coupon)", async () => {
    const { app } = makeApp();
    const res = await request(app)
      .post("/api/orders")
      .send({ items: [{ productId: "prod_margherita", quantity: 2 }] });

    expect(res.status).toBe(201);
    expect(res.body.code).toBe("SUCCESS");
    const o = res.body.data;
    expect(typeof o.id).toBe("string");
    expect(o.subtotalCents).toBe(2598);
    expect(o.discountCents).toBe(0);
    expect(o.totalCents).toBe(2598);
    expect(o.couponApplied).toBe(false);
    expect(o.couponCode).toBeNull();
    expect(o.items[0]).toMatchObject({
      productId: "prod_margherita",
      name: "Margherita",
      priceCents: 1299,
      quantity: 2,
      lineTotalCents: 2598,
    });
  });

  it("applies 10% off, rounded half-up, for a valid coupon", async () => {
    const { app } = makeApp({ valid: ["HAPPYHRS"] });
    const res = await request(app)
      .post("/api/orders")
      .send({
        items: [{ productId: "prod_margherita", quantity: 1 }], // 1299
        couponCode: "HAPPYHRS",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.subtotalCents).toBe(1299);
    expect(res.body.data.discountCents).toBe(130); // 129.9 -> 130
    expect(res.body.data.totalCents).toBe(1169);
    expect(res.body.data.couponApplied).toBe(true);
    expect(res.body.data.couponCode).toBe("HAPPYHRS");
  });

  it("decrements stock by the ordered quantity", async () => {
    const { app, store } = makeApp();
    await request(app)
      .post("/api/orders")
      .send({ items: [{ productId: "prod_wings", quantity: 2 }] });
    expect(store.getProduct("prod_wings").stock).toBe(0);
  });
});

describe("POST /api/orders — validation (first failure wins, in order)", () => {
  it("422 INVALID_ORDER when items is empty", async () => {
    const { app } = makeApp();
    const res = await request(app).post("/api/orders").send({ items: [] });
    expect(res.status).toBe(422);
    expect(res.body.code).toBe("INVALID_ORDER");
  });

  it("422 INVALID_ORDER when quantity is not a positive integer", async () => {
    const { app } = makeApp();
    for (const quantity of [0, -1, 1.5, "2", null]) {
      const res = await request(app)
        .post("/api/orders")
        .send({ items: [{ productId: "prod_cola", quantity }] });
      expect(res.status).toBe(422);
      expect(res.body.code).toBe("INVALID_ORDER");
    }
  });

  it("422 PRODUCT_NOT_FOUND for an unknown productId", async () => {
    const { app } = makeApp();
    const res = await request(app)
      .post("/api/orders")
      .send({ items: [{ productId: "prod_ghost", quantity: 1 }] });
    expect(res.status).toBe(422);
    expect(res.body.code).toBe("PRODUCT_NOT_FOUND");
    expect(res.body.details.productId).toBe("prod_ghost");
  });

  it("422 INSUFFICIENT_STOCK when quantity exceeds stock, and no stock is changed", async () => {
    const { app, store } = makeApp();
    const res = await request(app)
      .post("/api/orders")
      .send({ items: [{ productId: "prod_veggie", quantity: 99 }] });
    expect(res.status).toBe(422);
    expect(res.body.code).toBe("INSUFFICIENT_STOCK");
    expect(res.body.details).toMatchObject({ productId: "prod_veggie", available: 3 });
    expect(store.getProduct("prod_veggie").stock).toBe(3);
  });

  it("422 INVALID_COUPON when a supplied code is not valid, and no order is created", async () => {
    const { app, store } = makeApp({ valid: ["HAPPYHRS"] });
    const res = await request(app)
      .post("/api/orders")
      .send({
        items: [{ productId: "prod_cola", quantity: 1 }],
        couponCode: "NOPENOPE",
      });
    expect(res.status).toBe(422);
    expect(res.body.code).toBe("INVALID_COUPON");
    expect(store.getProduct("prod_cola").stock).toBe(40);
  });

  it("product-not-found is reported before insufficient-stock", async () => {
    const { app } = makeApp();
    const res = await request(app)
      .post("/api/orders")
      .send({
        items: [
          { productId: "prod_veggie", quantity: 99 }, // would be INSUFFICIENT_STOCK
          { productId: "prod_ghost", quantity: 1 }, // but this is PRODUCT_NOT_FOUND
        ],
      });
    expect(res.body.code).toBe("PRODUCT_NOT_FOUND");
  });
});
