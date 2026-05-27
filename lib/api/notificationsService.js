import { apiAuthFetch } from "./client";

/**
 * Notifications service.
 * Currently, the backend does not expose a notifications endpoint.
 * These functions are stubs that will work once the endpoint is available.
 */
export const notificationsService = {
  getAll: () =>
    apiAuthFetch("/Notifications").catch(() => ({ data: [] })),

  getNotificationById: (id) =>
    apiAuthFetch(`/Notifications/${id}`).catch(() => null),

  markAsRead: (id) =>
    apiAuthFetch(`/Notifications/${id}/read`, { method: "PUT" }).catch(() => null),
};
