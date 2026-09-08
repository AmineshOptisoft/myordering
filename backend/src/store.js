"use strict";

const crypto = require("crypto");
const seedProducts = require("./seed/products");

/**
 * In-memory data layer.
 *
 * Production uses MongoDB + Mongoose; this is a thin stand-in so the challenge
 * needs no database. Keep your route code talking to *this interface* rather
 * than reaching into the Maps directly — swapping the implementation for a real
 * collection should not touch the routes.
 *
 * `createStore()` returns a fresh, isolated store — the tests create one per
 * suite so they do not share mutable state.
 */

function createStore() {
  const products = new Map();
  for (const p of seedProducts) {
    products.set(p.id, { ...p });
  }

  const orders = new Map();

  return {
    // ---- products ----
    listProducts() {
      return [...products.values()].map((p) => ({ ...p }));
    },

    getProduct(id) {
      const p = products.get(id);
      return p ? { ...p } : null;
    },

    /**
     * Atomically decrement stock for several products. `lines` is
     * [{ productId, quantity }]. Throws if any line is unknown or would take
     * stock negative — and makes no change in that case.
     */
    commitStock(lines) {
      for (const { productId, quantity } of lines) {
        const p = products.get(productId);
        if (!p) throw new Error(`unknown product ${productId}`);
        if (p.stock < quantity) {
          throw new Error(`insufficient stock for ${productId}`);
        }
      }
      for (const { productId, quantity } of lines) {
        products.get(productId).stock -= quantity;
      }
    },

    // ---- orders ----
    saveOrder(order) {
      const id = order.id || `order_${crypto.randomBytes(5).toString("hex")}`;
      const stored = { ...order, id };
      orders.set(id, stored);
      return { ...stored };
    },

    getOrder(id) {
      const o = orders.get(id);
      return o ? { ...o } : null;
    },
  };
}

module.exports = { createStore };
