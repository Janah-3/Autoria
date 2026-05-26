export const BASE_URL =
 process.env.NEXT_PUBLIC_API_URL || "http://localhost:5236";
export const API_BASE_URL =
 process.env.NEXT_PUBLIC_API_BASE_URL || `${BASE_URL}/api`;

export default API_BASE_URL;