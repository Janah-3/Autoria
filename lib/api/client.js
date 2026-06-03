import { API_BASE_URL, BASE_URL } from "../apiConfig";
import { AUTH_ENDPOINTS } from "./endpoints";

export const getAuthHeaders = (withAuth = true, json = true) => {
  const headers = {};
  if (json) headers["Content-Type"] = "application/json";
  if (withAuth && typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

export function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, String(value));
    }
  });
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

/** Authenticated request under /api (e.g. /Users/me) */
export async function apiAuthFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  return apiFetch(url, { auth: true, ...options });
}

export async function parseResponse(res) {
  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return res.json();
  }
  const text = await res.text();
  return text;
}

export async function apiFetch(path, options = {}) {
  const { base = BASE_URL, auth = false, _retried = false, ...init } = options;
  const url = path.startsWith("http") ? path : `${base}${path}`;

  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        ...getAuthHeaders(auth),
        ...init.headers,
      },
    });

    const data = await parseResponse(res);

    if (!res.ok) {
      if (res.status === 401 && auth && !_retried && typeof window !== "undefined") {
        const refreshed = await tryRefreshToken();
        if (refreshed) {
          return apiFetch(url, { base, auth, _retried: true, ...init });
        }
        clearAuthTokens();
      }

      const details = Array.isArray(data?.errors)
        ? data.errors.filter(Boolean).join(" • ")
        : "";
      const message =
        details ||
        (typeof data === "string"
          ? data
          : data?.message || data?.title || `Request failed (${res.status})`);
      // Use warn for 4xx (expected business rule failures), error for unexpected failures
      if (res.status >= 500) {
        console.error(`[API Error] Request to "${path}" failed with status ${res.status}. Message: "${message}"`);
      } else {
        console.warn(`[API Warn] Request to "${path}" rejected (${res.status}): ${message}`);
      }
      const error = new Error(message);
      error.status = res.status;
      error.errors = data?.errors;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.message === "Failed to fetch") {
      throw new Error(
        `Unable to connect to the server. Please ensure the backend is running at ${base}`
      );
    }
    throw error;
  }
}

async function tryRefreshToken() {
  if (typeof window === "undefined") return false;
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.refreshToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return false;
    saveAuthTokens(data);
    return true;
  } catch {
    return false;
  }
}

/** Decode JWT payload to read role (client-side routing only). */
export function parseJwt(token) {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getRoleFromToken(accessToken) {
  const claims = parseJwt(accessToken);
  if (!claims) return null;
  const raw =
    claims["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
    claims.role ||
    claims.Role;
  if (Array.isArray(raw)) return raw[0] || null;
  return raw || null;
}

export function saveAuthTokens(data) {
  if (typeof window === "undefined" || !data) return;

  const accessToken = data.accessToken ?? data.data?.accessToken;
  const refreshRaw = data.refreshToken ?? data.data?.refreshToken;
  const refreshToken =
    typeof refreshRaw === "string" ? refreshRaw : refreshRaw?.token;

  if (accessToken) localStorage.setItem("token", accessToken);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

  const role = getRoleFromToken(accessToken);
  if (role) localStorage.setItem("userRole", role);
}

export function clearAuthTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userRole");
  localStorage.removeItem("email");
}
