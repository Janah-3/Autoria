import { apiAuthFetch } from "./api/client";

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
    const params = new URLSearchParams({ page, pageSize });
    if (isRead !== undefined && isRead !== null) {
      params.append("isRead", isRead);
    }

    const response = await apiAuthFetch(`/notifications?${params.toString()}`);
    return response?.data;
  },

  /**
   * Mark a single notification as read.
   * @param {string} id - The notification GUID
   */
  async markAsRead(id) {
    return apiAuthFetch(`/notifications/${id}/read`, {
      method: "PATCH",
    });
  },

  async markAllAsRead() {
    return apiAuthFetch(`/notifications/read-all`, {
      method: "PATCH",
    });
  },
};

export default notificationService;
