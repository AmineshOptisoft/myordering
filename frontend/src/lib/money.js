/** Format integer cents as a currency string. e.g. 1299 -> "$12.99" */
export function formatCents(cents) {
  const n = Number.isFinite(cents) ? cents : 0;
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  return `${sign}$${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, "0")}`;
}
