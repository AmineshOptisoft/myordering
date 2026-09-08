"use strict";

const request = require("supertest");
const { createApp } = require("../src/app");
const { createStore } = require("../src/store");

// Coupon validator is not exercised by these tests.
const noopValidator = { isValid: async () => false, init: async () => {} };

function app() {
  return createApp({ store: createStore(), couponValidator: noopValidator });
}

describe("GET /api/products", () => {
  it("returns the catalogue in the success envelope", async () => {
    const res = await request(app()).get("/api/products");
    expect(res.status).toBe(200);
    expect(res.body.code).toBe("SUCCESS");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("each product has the documented fields with integer cents", async () => {
    const res = await request(app()).get("/api/products");
    for (const p of res.body.data) {
      expect(typeof p.id).toBe("string");
      expect(typeof p.name).toBe("string");
      expect(Number.isInteger(p.priceCents)).toBe(true);
      expect(Number.isInteger(p.stock)).toBe(true);
    }
  });
});

describe("GET /api/products/:id", () => {
  it("returns a single product", async () => {
    const res = await request(app()).get("/api/products/prod_margherita");
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe("prod_margherita");
    expect(res.body.data.priceCents).toBe(1299);
  });

  it("404s with PRODUCT_NOT_FOUND for an unknown id", async () => {
    const res = await request(app()).get("/api/products/prod_nope");
    expect(res.status).toBe(404);
    expect(res.body.code).toBe("PRODUCT_NOT_FOUND");
    expect(res.body.details).toEqual({ id: "prod_nope" });
  });
});

describe("unknown routes", () => {
  it("404 NOT_FOUND", async () => {
    const res = await request(app()).get("/api/nonsense");
    expect(res.status).toBe(404);
    expect(res.body.code).toBe("NOT_FOUND");
  });

  it("400 BAD_REQUEST on malformed JSON", async () => {
    const res = await request(app())
      .post("/api/orders")
      .set("Content-Type", "application/json")
      .send('{"items": [');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("BAD_REQUEST");
  });
});
