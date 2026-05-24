import { BOOKINGS_ENDPOINTS } from "./endpoints";
import { apiAuthFetch, buildQuery } from "./client";

export const bookingsService = {
  async getAll(statusFilter) {
    const res = await apiAuthFetch(
      `${BOOKINGS_ENDPOINTS.base}${buildQuery({ statusFilter })}`
    );
    const items = res.data?.items ?? (Array.isArray(res.data) ? res.data : []);
    return { ...res, data: items };
  },

  async blockSlot(payload) {
    return apiAuthFetch(BOOKINGS_ENDPOINTS.blockSlot, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async create(bookingData) {
    return apiAuthFetch(BOOKINGS_ENDPOINTS.base, {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
  },

  async getByUser(userId) {
    return apiAuthFetch(BOOKINGS_ENDPOINTS.byUser(userId));
  },

  async getServiceCenterBookings() {
    return apiAuthFetch(BOOKINGS_ENDPOINTS.serviceCenter);
  },

  async updateStatus(id, status) {
    return apiAuthFetch(BOOKINGS_ENDPOINTS.status(id), {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
};

export const getAllBookings = (statusFilter) => bookingsService.getAll(statusFilter);
export const bookingService = {
  createBooking: (data) => bookingsService.create(data),
  getUserBookings: (userId) => bookingsService.getByUser(userId),
  getServiceCenterBookings: () => bookingsService.getServiceCenterBookings(),
  updateBookingStatus: (id, status) => bookingsService.updateStatus(id, status),
};

export default bookingsService;
