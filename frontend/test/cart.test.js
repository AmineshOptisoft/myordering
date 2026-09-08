import { describe, it, expect, beforeEach } from "vitest";
import { useCart, selectSubtotalCents, selectCount } from "../src/store/cart";

const P = (over = {}) => ({
  id: "prod_x",
  name: "Thing",
  priceCents: 500,
  stock: 10,
  ...over,
});

beforeEach(() => {
  useCart.getState().clear();
});

describe("cart store", () => {
  it("adds a line (works in skeleton)", () => {
    useCart.getState().addLine(P(), 2);
    const { lines } = useCart.getState();
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({ productId: "prod_x", quantity: 2 });
  });

  it("removes a line (works in skeleton)", () => {
    useCart.getState().addLine(P(), 1);
    useCart.getState().removeLine("prod_x");
    expect(useCart.getState().lines).toHaveLength(0);
  });

  it("MERGES when the same product is added twice (implement)", () => {
    useCart.getState().addLine(P({ id: "prod_a" }), 1);
    useCart.getState().addLine(P({ id: "prod_a" }), 2);
    const { lines } = useCart.getState();
    expect(lines).toHaveLength(1);
    expect(lines[0].quantity).toBe(3);
  });

  it("setQuantity updates a line (implement)", () => {
    useCart.getState().addLine(P({ id: "prod_a" }), 1);
    useCart.getState().setQuantity("prod_a", 4);
    expect(useCart.getState().lines[0].quantity).toBe(4);
  });

  it("setQuantity to 0 removes the line (implement)", () => {
    useCart.getState().addLine(P({ id: "prod_a" }), 1);
    useCart.getState().setQuantity("prod_a", 0);
    expect(useCart.getState().lines).toHaveLength(0);
  });

  it("selectSubtotalCents sums priceCents * quantity as an integer (implement)", () => {
    useCart.getState().addLine(P({ id: "a", priceCents: 1299 }), 2); // 2598
    useCart.getState().addLine(P({ id: "b", priceCents: 249 }), 3); // 747
    const subtotal = selectSubtotalCents(useCart.getState());
    expect(subtotal).toBe(3345);
    expect(Number.isInteger(subtotal)).toBe(true);
  });

  it("selectCount counts items (works in skeleton)", () => {
    useCart.getState().addLine(P({ id: "a" }), 2);
    useCart.getState().addLine(P({ id: "b" }), 1);
    expect(selectCount(useCart.getState())).toBe(3);
  });
});
