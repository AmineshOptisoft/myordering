import create from "zustand";
import { persist } from "zustand/middleware";

/**
 * Client-side cart. Mirrors how the real app does it: zustand + persist to
 * localStorage, keyed so a reload keeps the cart.
 *
 * A cart line is: { productId, name, priceCents, quantity }
 *
 * ============================================================================
 *  PARTIALLY DONE. `addLine`, `removeLine` and `clear` work. You implement:
 *   - `setQuantity(productId, quantity)`  (remove the line when quantity <= 0)
 *   - `addLine` must MERGE when the product is already in the cart
 *     (sum the quantities) rather than pushing a duplicate line
 *   - the `selectSubtotalCents` selector at the bottom
 *  See frontend/test/cart.test.js.
 * ============================================================================
 */

export const useCart = create(
  persist(
    (set, get) => ({
      lines: [],
      addLine: (product, quantity = 1) => {
        // TODO: if a line for product.id already exists, increase its quantity
        //       instead of adding a second line.
        // set((state) => ({
        //   lines: [
        //     ...state.lines,
        //     {
        //       productId: product.id,
        //       name: product.name,
        //       priceCents: product.priceCents,
        //       quantity,
        //     },
        //   ],
        // }));
        set((state) => {
          const existingLine = state.lines.find(
            (line) => line.productId === product.id
          );

          // If product already exists, increase its quantity
          if (existingLine) {
            return {
              lines: state.lines.map((line) =>
                line.productId === product.id
                  ? {
                    ...line,
                    quantity: line.quantity + quantity,
                  }
                  : line
              ),
            };
          }

          // If product doesn't exist, add a new line
          return {
            lines: [
              ...state.lines,
              {
                productId: product.id,
                name: product.name,
                priceCents: product.priceCents,
                quantity,
              },
            ],
          };
        });
      },

      setQuantity: (productId, quantity) => {
        // TODO: set the line's quantity; if quantity <= 0 remove the line.
        if (quantity <= 0) {
          get().removeLine(productId);
        } else {
          set((state) => ({
            lines: state.lines.map((line) =>
              line.productId === productId
                ? {
                  ...line,
                  quantity,
                }
                : line
            ),
          }));
        }

        // throw new Error("setQuantity not implemented");
      },

      removeLine: (productId) =>
        set((state) => ({
          lines: state.lines.filter((l) => l.productId !== productId),
        })),

      clear: () => set({ lines: [] }),
    }),
    { name: "challenge:cart" }
  )
);

/** Total item count. */
export const selectCount = (state) =>
  state.lines.reduce((n, l) => n + l.quantity, 0);

/**
 * Subtotal in integer cents.
 * TODO: implement. Must stay integer — no floating point.
 */
export const selectSubtotalCents = (state) => {
  let total = state.lines.reduce(
    (total, line) => total + line.priceCents * line.quantity,
    0
  );

  return parseInt(total)
  // throw new Error("selectSubtotalCents not implemented");
};
