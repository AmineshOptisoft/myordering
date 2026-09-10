import React from "react";
import { formatCents } from "../lib/money";

/**
 * ============================================================================
 *  YOUR JOB. Shown after a successful POST /orders.
 * ============================================================================
 *
 * Render the created order: id, line items, subtotal, discount (if any),
 * total. Give the user a way to start again (which should clear the cart).
 */
export default function OrderSummary({ order, onDone }) {
  if (!order) return null;
  return (
    <div className="asg-panel asg-ok">
      <h2 className="asg-panel__title">Order placed</h2>
      {/* TODO: id, items, subtotal / discount / total, "new order" button */}

      {/*
      {
        "id": "order_1788992481066_utalo5",
      "createdAt": "2026-09-09T22:21:21.066Z",
      "items": [
      {
        "productId": "prod_veggie",
      "name": "Garden Veggie",
      "priceCents": 1399,
      "quantity": 1,
      "lineTotalCents": 1399
    }
      ],
      "couponCode": "",
      "couponApplied": false,
      "subtotalCents": 1399,
      "discountCents": 0,
      "totalCents": 1399
}
      */}
      {
        order.id && <p className="asg-muted" style={{ whiteSpace: "pre-wrap" }}>Order ID: {order.id}</p>
      }
      {
        order.items && (
          <p className="asg-muted" style={{ whiteSpace: "pre-wrap" }}>Items: {order.items.map(item => item.name).join(", ")}</p>
        )
      }
      {
        order.subtotalCents && (
          <p className="asg-muted" style={{ whiteSpace: "pre-wrap" }}>Subtotal: {formatCents(order.subtotalCents)}</p>
        )
      }

      <p className="asg-muted" style={{ whiteSpace: "pre-wrap" }}>Discount: {formatCents(order.discountCents)}</p>


      {
        order.totalCents && (
          <p className="asg-muted" style={{ whiteSpace: "pre-wrap" }}>Total: {formatCents(order.totalCents)}</p>
        )
      }
      <button className="asg-btn" onClick={onDone}>
        New order
      </button>
    </div>
  );
}
