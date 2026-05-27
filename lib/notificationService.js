import { API_BASE_URL } from "./apiConfig";


const getAuthHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};


export const NOTIFICATION_TYPE_META = {
  0: { label: "booking", icon: "fa-solid fa-circle-check", color: "#f0fdf4", iconColor: "#15803d" }, // BookingConfirmed
  1: { label: "booking", icon: "fa-solid fa-circle-xmark",  color: "#fff5f5", iconColor: "#E8272A" }, // BookingCancelled
  2: { label: "booking", icon: "fa-solid fa-flag-checkered",color: "#f0fdf4", iconColor: "#15803d" }, // BookingCompleted
  3: { label: "booking", icon: "fa-solid fa-rotate",        color: "#eff6ff", iconColor: "#1d4ed8" }, // BookingRescheduled
  4: { label: "booking", icon: "fa-solid fa-clock",         color: "#fefce8", iconColor: "#a16207" }, // BookingPending
};

export const notificationService = {
  /**
   * Fetch the current user's notifications.
   * @param {{ isRead?: boolean, page?: number, pageSize?: number }} options
   * @returns {Promise<{ items: NotificationDto[], totalCount: number, page: number, pageSize: number, totalPages: number }>}
   */
  async getNotifications({ isRead, page = 1, pageSize = 20 } = {}) {
    try {
      const params = new URLSearchParams({ page, pageSize });
      if (isRead !== undefined && isRead !== null) {
        params.append("isRead", isRead);
      }

      const response = await fetch(
        `${API_BASE_URL}/notifications?${params.toString()}`,
        { headers: getAuthHeaders() }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `${response.status}: ${errorData.message || errorData.title || "Failed to fetch notifications"}`
        );
      }

      const json = await response.json();
      
      return json.data;
    } catch (error) {
      console.error("Error in getNotifications:", error);
      throw error;
    }
  },

  /**
   * Mark a single notification as read.
   * @param {string} id - The notification GUID
   */
  async markAsRead(id) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/${id}/read`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Failed to mark notification as read"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error in markAsRead:", error);
      throw error;
    }
  },


  async markAllAsRead() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/read-all`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Failed to mark all notifications as read"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error in markAllAsRead:", error);
      throw error;
    }
  },
};

export default notificationService;
