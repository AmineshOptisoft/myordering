import React from "react";
import { useCart, selectSubtotalCents } from "../store/cart";
import { formatCents } from "../lib/money";

/**
 * ============================================================================
 *  YOUR JOB. Render the cart.
 * ============================================================================
 *
 *  - one row per line: name, unit price, a quantity control (+ / −, or an
 *    input), line total, a remove button
 *  - subtotal at the bottom (use the `selectSubtotalCents` selector once you
 *    have implemented it)
 *  - empty state when there are no lines
 *  - quantity changes go through `setQuantity` on the store
 *
 * Keep it a controlled, predictable component — no local copy of the cart.
 */
export default function CartPanel() {
  const lines = useCart((s) => s.lines);
  // const subtotalCents = useCart(selectSubtotalCents);
  // const setQuantity = useCart((s) => s.setQuantity);
  // const removeLine = useCart((s) => s.removeLine);

  return (
    <div className="asg-panel">
      <h2 className="asg-panel__title">Your order</h2>
      {/* TODO: empty state + line rows + subtotal */}
      <p className="asg-muted">CartPanel not implemented ({lines.length} lines).</p>
    </div>
  );
}
