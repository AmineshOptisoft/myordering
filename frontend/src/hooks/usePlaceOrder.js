import { useMutation, useQueryClient } from "react-query";
import { api } from "../api/client";

/**
 * ============================================================================
 *  YOUR JOB. Wrap `api.placeOrder` in a react-query mutation.
 * ============================================================================
 *
 * Think about:
 *   - request shape: { items: [{ productId, quantity }], couponCode? }
 *     (omit couponCode entirely when there is none)
 *   - on success: invalidate "products" so stock on screen refreshes, and give
 *     the screen the created order to display
 *   - on error: the mutation's `error` is an ApiError with `.code`
 *     ("INVALID_COUPON", "INSUFFICIENT_STOCK", "NETWORK", ...). The screen
 *     needs enough to show a useful message.
 */
export function usePlaceOrder() {
  const queryClient = useQueryClient();

  return useMutation((payload) => api.placeOrder(payload), {
    // TODO
    onSuccess: () => {
      queryClient.invalidateQueries("products");
    },
  });
}
