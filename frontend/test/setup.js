import "@testing-library/jest-dom";

// jsdom has no localStorage in some versions of the setup — make sure the
// zustand persist middleware has something to write to.
if (typeof localStorage === "undefined") {
  const store = new Map();
  global.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  };
}

beforeEach(() => {
  try {
    localStorage.clear();
  } catch {
    /* ignore */
  }
});
