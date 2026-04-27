// Single source of truth for the backend API URL. Baked at build time via the
// NEXT_PUBLIC_API_URL env var (passed through GitHub Actions for production
// builds). When unset, callers should gracefully fall back to local mocks.

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

export const apiAvailable = (): boolean => API_URL.length > 0;
