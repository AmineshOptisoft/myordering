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
  const subtotalCents = useCart(selectSubtotalCents);
  const setQuantity = useCart((s) => s.setQuantity);
  const removeLine = useCart((s) => s.removeLine);
  console.log("lines", lines)
  return (
    <div className="asg-panel" style={styles.card}>
      <div style={styles.header}>
        <h2 className="asg-panel__title" style={styles.headerTitle}>
          Your order
        </h2>
        <div style={styles.headerSubtitle}>
          {lines.reduce((sum, l) => sum + l.quantity, 0)} items
        </div>
      </div>

      <div style={styles.itemsWrap}>
        {lines.length === 0 ? (
          <p className="asg-muted" style={styles.emptyState}>
            Your cart is empty.
          </p>
        ) : (
          lines.map((line, idx) => (
            <div
              key={line.productId}
              style={{
                ...styles.itemRow,
                borderBottom: idx !== lines.length - 1 ? "1px solid #f1f1f2" : "none",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={styles.itemName}>{line.name}</div>
                {line.detail && <div style={styles.itemDetail}>{line.detail}</div>}

                <div style={styles.controlsRow}>
                  <div style={styles.stepper}>
                    <button
                      onClick={() => setQuantity(line.productId, Math.max(0, line.quantity - 1))}
                      style={styles.stepperBtn}
                      aria-label={`Decrease ${line.name} quantity`}
                    >
                      −
                    </button>
                    <span style={styles.stepperQty}>{line.quantity}</span>
                    <button
                      onClick={() => setQuantity(line.productId, line.quantity + 1)}
                      style={styles.stepperBtn}
                      aria-label={`Increase ${line.name} quantity`}
                    >
                      +
                    </button>
                  </div>
                  <button onClick={() => removeLine(line.productId)} style={styles.removeBtn}>
                    Remove
                  </button>
                </div>
              </div>

              <div style={styles.itemPrice}>
                {formatCents(line.priceCents * line.quantity)}
              </div>
            </div>
          ))
        )}
      </div>

      {lines.length > 0 && (
        <>
          <div style={styles.divider} />
          <div style={styles.totalsWrap}>
            <div style={styles.grandTotalRow}>
              <span style={styles.grandTotalLabel}>Subtotal</span>
              <span style={styles.grandTotalValue}>{formatCents(subtotalCents)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


const styles = {
  card: {
    width: 340,
    background: "#ffffff",
    border: "1px solid #e4e4e7",
    borderRadius: 10,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    overflow: "hidden",
    fontFamily:
      "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif",
  },
  header: {
    padding: "16px 18px 12px 18px",
    borderBottom: "1px solid #f1f1f2",
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "#18181b",
    margin: 0,
  },
  headerSubtitle: {
    fontSize: 12.5,
    color: "#a1a1aa",
    marginTop: 2,
  },
  itemsWrap: {
    padding: "4px 18px",
  },
  emptyState: {
    padding: "24px 0",
    textAlign: "center",
    fontSize: 13,
    color: "#a1a1aa",
    margin: 0,
  },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
    padding: "12px 0",
  },
  itemName: {
    fontSize: 13.5,
    fontWeight: 500,
    color: "#18181b",
    marginBottom: 2,
  },
  itemDetail: {
    fontSize: 12,
    color: "#a1a1aa",
    marginBottom: 8,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  controlsRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  stepper: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #e4e4e7",
    borderRadius: 7,
    overflow: "hidden",
  },
  stepperBtn: {
    width: 24,
    height: 24,
    border: "none",
    background: "#fafafa",
    color: "#52525b",
    fontSize: 14,
    cursor: "pointer",
    lineHeight: 1,
  },
  stepperQty: {
    width: 24,
    textAlign: "center",
    fontSize: 12.5,
    fontWeight: 500,
    color: "#18181b",
  },
  removeBtn: {
    border: "none",
    background: "none",
    color: "#a1a1aa",
    fontSize: 12,
    cursor: "pointer",
    padding: 0,
    textDecoration: "underline",
    textUnderlineOffset: "2px",
  },
  itemPrice: {
    fontSize: 13.5,
    fontWeight: 600,
    color: "#18181b",
    whiteSpace: "nowrap",
    paddingTop: 1,
  },
  divider: {
    height: 1,
    background: "#f1f1f2",
    margin: "4px 18px",
  },
  totalsWrap: {
    padding: "12px 18px 16px 18px",
  },
  grandTotalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: "#18181b",
  },
  grandTotalValue: {
    fontSize: 16,
    fontWeight: 700,
    color: "#18181b",
  },
};
