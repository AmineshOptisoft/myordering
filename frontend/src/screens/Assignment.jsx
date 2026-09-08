import React, { useState } from "react";
import ProductGrid from "../components/ProductGrid";
import CartPanel from "../components/CartPanel";
import CouponField from "../components/CouponField";
import OrderSummary from "../components/OrderSummary";
import { useCart, selectCount } from "../store/cart";
import { usePlaceOrder } from "../hooks/usePlaceOrder";

/**
 * The ordering screen. This composes the pieces; the interesting wiring is
 * yours:
 *
 *  - turn the cart lines into the POST /orders payload
 *  - run usePlaceOrder(); on success show <OrderSummary/> and clear the cart
 *  - feed the coupon code in, and route the INVALID_COUPON error back to
 *    <CouponField/> as a rejection reason
 *  - disable "Place order" when the cart is empty or a request is in flight
 *  - surface INSUFFICIENT_STOCK / NETWORK errors somewhere visible
 *
 * Layout: menu on the left, order on the right; single column on narrow
 * screens. Styling hooks are in styles/assignment.css (asg- prefix).
 */
export default function Assignment() {
  const count = useCart(selectCount);
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);

  const [coupon, setCoupon] = useState("");
  const placeOrder = usePlaceOrder();

  // TODO: build payload from `lines` (+ coupon) and call placeOrder.mutate(...)
  const onPlaceOrder = () => {
    // eslint-disable-next-line no-alert
    alert("Place order not wired up yet — see src/screens/Assignment.jsx");
  };

  return (
    <div className="asg-root">
      <header className="asg-header">
        <h1>myordering</h1>
        <span className="asg-cart-count">{count} in cart</span>
      </header>

      <main className="asg-layout">
        <section className="asg-col asg-col--menu">
          <h2 className="asg-panel__title">Menu</h2>
          <ProductGrid />
        </section>

        <aside className="asg-col asg-col--order">
          <CartPanel />
          <CouponField value={coupon} onChange={setCoupon} status="idle" />
          <button
            className="asg-btn asg-btn--primary"
            disabled={lines.length === 0}
            onClick={onPlaceOrder}
          >
            Place order
          </button>

          {/* TODO: error area for INSUFFICIENT_STOCK / NETWORK / etc. */}
          {/* TODO: <OrderSummary order={...} onDone={clear} /> after success */}
        </aside>
      </main>
    </div>
  );
}
