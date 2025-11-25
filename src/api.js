// src/api.js
export async function api(path, options = {}) {
  // Make sure this env is set in frontend .env:
  // VITE_API_BASE=http://localhost:4000/api
  const base = import.meta.env.VITE_API_BASE;

  const res = await fetch(base + path, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      if (err && err.error) msg = err.error;
    } catch (_) {}
    throw new Error(msg);
  }

  return res.json();
}
