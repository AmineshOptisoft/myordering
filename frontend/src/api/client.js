/**
 * Thin fetch wrapper for the challenge API.
 *
 * Success bodies are  { data, code: "SUCCESS" }  -> this returns `data`.
 * Error bodies are     { code, message, details? } with a 4xx/5xx status
 *   -> this throws an ApiError carrying { status, code, message, details }
 *      so callers (react-query, the coupon field) can branch on `err.code`.
 */

export class ApiError extends Error {
  constructor({ status, code, message, details }) {
    super(message || code || `HTTP ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request(path, { method = "GET", body } = {}) {
  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new ApiError({ status: 0, code: "NETWORK", message: "Network error" });
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    /* empty / non-JSON body */
  }

  if (!res.ok) {
    throw new ApiError({
      status: res.status,
      code: (json && json.code) || "UNKNOWN",
      message: (json && json.message) || res.statusText,
      details: json && json.details,
    });
  }

  return json ? json.data : null;
}

export const api = {
  listProducts: () => request("/products"),
  getProduct: (id) => request(`/products/${encodeURIComponent(id)}`),
  placeOrder: (payload) => request("/orders", { method: "POST", body: payload }),
};
