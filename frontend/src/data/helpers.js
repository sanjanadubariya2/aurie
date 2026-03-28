export const LS = {
  get: (k, f) => {
    try { return JSON.parse(localStorage.getItem(k)) ?? f; }
    catch { return f; }
  },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v))
};

export const uid = (p = "") => p + Math.random().toString(36).slice(2, 9);

export const currency = n => `₹${Number(n).toFixed(0)}`;

export function isWinter() {
  const m = new Date().getMonth() + 1;
  return m === 11 || m === 12 || m <= 2;
}
