"use strict";

/**
 * Response helpers — see API_SPEC.md "Conventions".
 * Success: { data, code: "SUCCESS" }
 * Error:   { code, message, details? }   with an HTTP 4xx/5xx status
 */

function ok(res, data, status = 200) {
  return res.status(status).json({ data, code: "SUCCESS" });
}

function fail(res, status, code, message, details) {
  const body = { code, message };
  if (details !== undefined) body.details = details;
  return res.status(status).json(body);
}

/** Throw this from anywhere in a route to produce a spec-shaped error. */
class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Wrap an async route handler so a rejected promise reaches the Express error
 * handler (Express 4 does not do this itself). Use it for any `async` handler:
 *   router.post("/", wrap(async (req, res) => { ... }));
 */
function wrap(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

module.exports = { ok, fail, ApiError, wrap };
