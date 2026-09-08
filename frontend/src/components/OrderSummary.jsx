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
      <pre className="asg-muted" style={{ whiteSpace: "pre-wrap" }}>
        {JSON.stringify(order, null, 2)}
      </pre>
      <button className="asg-btn" onClick={onDone}>
        New order
      </button>
    </div>
  );
}
