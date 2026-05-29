import { API_BASE_URL } from "./apiConfig";

/**
 * User Service
 * Handles all API calls related to users
 *
 * Endpoints (base: /api/users):
 *   GET    /me              → Get current logged-in user
 *   PUT    /me              → Update current user { fullName, phoneNumber }
 *   PUT    /my/location     → Update user location { latitude, longitude }
 *
 *   — Admin only —
 *   GET    /                → Get all users (query: Search, Role, IsBanned, Page, PageSize)
 *   GET    /{id}            → Get user by id
 *   PUT    /{userId}        → Update user { fullName, phoneNumber, role }
 *   DELETE /{userId}        → Delete user
 *   PATCH  /{userId}/Ban    → Ban user     ⚠️ capital B
 *   PATCH  /{userId}/Unban  → Unban user   ⚠️ capital U
 *
 * Response shape: { success, message, data, errors }
 * User fields: { id, fullName, email, phoneNumber, role, is_Banned }
 *              ⚠️ is_Banned has underscore + capital B
 */

const getAuthHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const userService = {
  // ─── Current User ───────────────────────────────────────────

  /**
   * Get the currently logged-in user's profile.
   * @returns {Promise<{ id, fullName, email, phoneNumber, role }>}
   */
  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/Users/me`, {
      headers: getAuthHeaders(),
    });
    const json = await response.json();
    if (!response.ok || json.success === false) {
      throw new Error(json.message || "Failed to fetch user");
    }
    const user = json.data;
    if (!user) return null;
    return {
      id: user.id || user.Id,
      fullName: user.fullName || user.FullName,
      email: user.email || user.Email,
      phoneNumber: user.phoneNumber || user.PhoneNumber,
      role: user.role || user.Role,
      is_Banned: 
        user.is_Banned !== undefined ? user.is_Banned : (
        user.is_banned !== undefined ? user.is_banned : (
        user.isBanned !== undefined ? user.isBanned : (
        user.Is_Banned !== undefined ? user.Is_Banned : (
        user.IsBanned !== undefined ? user.IsBanned : (
        user.isbanned !== undefined ? user.isbanned : false
        )))))
    };
  },

  /**
   * Update the current user's profile.
   * @param {{ fullName: string, phoneNumber: string }} data
   */
  async updateCurrentUser(data) {
    const response = await fetch(`${API_BASE_URL}/Users/me`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await response.json();
    if (!response.ok || json.success === false) {
      throw new Error(json.message || "Failed to update user");
    }
    return json.data;
  },

  /**
   * Update the current user's location.
   * @param {{ latitude: number, longitude: number }} coords
   */
  async updateLocation(coords) {
    const response = await fetch(`${API_BASE_URL}/Users/my/location`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(coords),
    });
    const json = await response.json();
    if (!response.ok || json.success === false) {
      throw new Error(json.message || "Failed to update location");
    }
    return json.data;
  },

  // ─── Admin Only ──────────────────────────────────────────────

  /**
   * Get all users (Admin only).
   * @param {{ Search?: string, Role?: string, IsBanned?: boolean, Page?: number, PageSize?: number }} filters
   * @returns {Promise<Array<{ id, fullName, email, role, is_Banned }>>}
   */
  async getAllUsers({ Search, Role, IsBanned, Page = 1, PageSize = 20 } = {}) {
    const params = new URLSearchParams({ Page, PageSize });
    if (Search) params.append("Search", Search);
    if (Role) params.append("Role", Role);
    if (IsBanned !== undefined && IsBanned !== null)
      params.append("IsBanned", IsBanned);

    const response = await fetch(
      `${API_BASE_URL}/Users?${params.toString()}`,
      { headers: getAuthHeaders() }
    );
    const json = await response.json();
    if (!response.ok || json.success === false) {
      throw new Error(json.message || "Failed to fetch users");
    }
    
    const data = json.data;
    let items = [];
    if (data && Array.isArray(data)) {
      items = data;
    } else if (data && (data.items || data.Items)) {
      items = data.items || data.Items;
    }
    console.log("=== API Users Response ===", items);

    return items.map(user => ({
      id: user.id || user.Id,
      fullName: user.fullName || user.FullName,
      email: user.email || user.Email,
      phoneNumber: user.phoneNumber || user.PhoneNumber,
      role: user.role || user.Role,
      is_Banned: 
        user.is_Banned !== undefined ? user.is_Banned : (
        user.is_banned !== undefined ? user.is_banned : (
        user.isBanned !== undefined ? user.isBanned : (
        user.Is_Banned !== undefined ? user.Is_Banned : (
        user.IsBanned !== undefined ? user.IsBanned : (
        user.isbanned !== undefined ? user.isbanned : false
        )))))
    }));
  },

  /**
   * Get a user by ID (Admin only).
   * @param {string} id
   */
  async getUserById(id) {
    const response = await fetch(`${API_BASE_URL}/Users/${id}`, {
      headers: getAuthHeaders(),
    });
    const json = await response.json();
    if (!response.ok || json.success === false) {
      throw new Error(json.message || "User not found");
    }
    return json.data;
  },

  /**
   * Update a user by ID (Admin only).
   * @param {string} userId
   * @param {{ fullName: string, phoneNumber: string, role: string }} data
   */
  async updateUser(userId, data) {
    const response = await fetch(`${API_BASE_URL}/Users/${userId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await response.json();
    if (!response.ok || json.success === false) {
      throw new Error(json.message || "Failed to update user");
    }
    return json.data;
  },

  /**
   * Delete a user (Admin only).
   * @param {string} userId
   */
  async deleteUser(userId) {
    const response = await fetch(`${API_BASE_URL}/Users/${userId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    
    let json = {};
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      json = await response.json();
    } else {
      const text = await response.text();
      json = { success: response.ok, message: text || (response.ok ? "Success" : "Failed") };
    }

    if (!response.ok || json.success === false) {
      throw new Error(json.message || "Failed to delete user");
    }
    return json.data;
  },

  /**
   * Ban a user (Admin only).
   * ⚠️ Route: /{userId}/Ban — capital B, matches backend exactly
   * @param {string} userId
   */
  async banUser(userId) {
    const response = await fetch(`${API_BASE_URL}/Users/${userId}/Ban`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({}),
    });
    
    let json = {};
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      json = await response.json();
    } else {
      const text = await response.text();
      json = { success: response.ok, message: text || (response.ok ? "Success" : "Failed") };
    }

    if (!response.ok || json.success === false) {
      throw new Error(json.message || "Failed to ban user");
    }
    return json.data;
  },

  /**
   * Unban a user (Admin only).
   * ⚠️ Route: /{userId}/Unban — capital U, matches backend exactly
   * @param {string} userId
   */
  async unbanUser(userId) {
    const response = await fetch(`${API_BASE_URL}/Users/${userId}/Unban`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({}),
    });
    
    let json = {};
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      json = await response.json();
    } else {
      const text = await response.text();
      json = { success: response.ok, message: text || (response.ok ? "Success" : "Failed") };
    }

    if (!response.ok || json.success === false) {
      throw new Error(json.message || "Failed to unban user");
    }
    return json.data;
  },
};

export default userService;
