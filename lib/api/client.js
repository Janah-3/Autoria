import { API_BASE_URL, BASE_URL } from "../apiConfig";

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
  const { base = BASE_URL, auth = false, ...init } = options;
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
      const message =
        typeof data === "string"
          ? data
          : data?.message || data?.title || `Request failed (${res.status})`;
      throw new Error(message);
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
  return (
    claims["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
    claims.role ||
    null
  );
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
