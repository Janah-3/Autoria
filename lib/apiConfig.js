/** Backend root (no trailing slash). Auth routes like /logout live here. */
export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5236";

/** Routes under the Auth controller: /api/Auth/login, /api/Auth/register */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || `${BASE_URL}/api`;

export default API_BASE_URL;
