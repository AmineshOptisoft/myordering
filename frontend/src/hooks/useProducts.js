import { useQuery } from "react-query";
import { api } from "../api/client";

/**
 * Server state for the catalogue. Reference for how server data should be
 * fetched in this app — react-query, not useEffect + useState.
 */
export function useProducts() {
  return useQuery("products", api.listProducts, {
    staleTime: 30_000,
  });
}
