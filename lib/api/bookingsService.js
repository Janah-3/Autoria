import { BOOKINGS_ENDPOINTS } from "./endpoints";
import { apiAuthFetch, buildQuery } from "./client";

export const bookingsService = {
  // 1. Get all bookings (with statusFilter)
  async getAll(statusFilter) {
    const res = await apiAuthFetch(
      `${BOOKINGS_ENDPOINTS.base}${buildQuery({ statusFilter })}`
    );
    const items = res.data?.items ?? (Array.isArray(res.data) ? res.data : []);
    return { ...res, data: items };
  },

  // 2. Create a new booking
  async create(bookingData) {
    return apiAuthFetch(BOOKINGS_ENDPOINTS.base, {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
  },

  // 3. Get bookings for user (uses token-based GET /Bookings)
  async getByUser(userId) {
    const res = await apiAuthFetch(BOOKINGS_ENDPOINTS.base);
    return res.data?.items ?? (Array.isArray(res.data) ? res.data : []);
  },

  // 4. Get bookings for service center (uses token-based GET /Bookings)
  async getServiceCenterBookings() {
    const res = await apiAuthFetch(BOOKINGS_ENDPOINTS.base);
    return res.data?.items ?? (Array.isArray(res.data) ? res.data : []);
  },

  // 5. Update booking status (dynamically maps to confirm/complete/cancel endpoints)
  async updateStatus(id, status, totalPrice = 0, cancellationReason = "Service is no longer needed") {
    if (status === "Confirmed" || status === "Confirm") {
      return apiAuthFetch(BOOKINGS_ENDPOINTS.confirm(id), { method: "PATCH" });
    }
    if (status === "Completed" || status === "Complete") {
      return apiAuthFetch(BOOKINGS_ENDPOINTS.complete(id), {
        method: "PATCH",
        body: JSON.stringify({ totalPrice }),
      });
    }
    if (status === "Cancelled" || status === "Cancel") {
      return apiAuthFetch(BOOKINGS_ENDPOINTS.cancel(id), {
        method: "PATCH",
        body: JSON.stringify({ cancellationReason }),
      });
    }
    return apiAuthFetch(BOOKINGS_ENDPOINTS.byId(id));
  },

  // 6. Get booking details
  async getById(id) {
    return apiAuthFetch(BOOKINGS_ENDPOINTS.byId(id));
  },

  // 7. Reschedule a booking
  async reschedule(id, newTimeSlotId) {
    return apiAuthFetch(BOOKINGS_ENDPOINTS.reschedule(id), {
      method: "PATCH",
      body: JSON.stringify({ newTimeSlotId }),
    });
  },

  // 8. Get available time slots for a center on a date
  async getAvailableSlots(ServiceCenterId, Date) {
    return apiAuthFetch(
      `${BOOKINGS_ENDPOINTS.slots}${buildQuery({ ServiceCenterId, Date })}`
    );
  },

  // 9. Add an available time slot
  async addAvailableSlot(payload) {
    return apiAuthFetch(BOOKINGS_ENDPOINTS.slots, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // 10. Delete/unblock time slot
  async deleteSlot(id) {
    return apiAuthFetch(BOOKINGS_ENDPOINTS.deleteSlot(id), {
      method: "DELETE",
    });
  },

  // 11. Block a specific time slot ID
  async blockSlot(id) {
    return apiAuthFetch(BOOKINGS_ENDPOINTS.blockSlot(id), {
      method: "PATCH",
    });
  },

  // 12. Get admin booking statistics
  async getAdminStats(dateFrom, dateTo) {
    return apiAuthFetch(
      `${BOOKINGS_ENDPOINTS.adminStats}${buildQuery({ dateFrom, dateTo })}`
    );
  },

  // 13. List bookings for admin with filters
  async adminList(params) {
    return apiAuthFetch(
      `${BOOKINGS_ENDPOINTS.admin}${buildQuery(params)}`
    );
  },

  // 14. View booking details by admin
  async adminGetById(id) {
    return apiAuthFetch(BOOKINGS_ENDPOINTS.adminById(id));
  },

  // 15. Cancel booking by admin
  async adminCancel(id, cancellationReason) {
    return apiAuthFetch(BOOKINGS_ENDPOINTS.adminCancel(id), {
      method: "PATCH",
      body: JSON.stringify({ cancellationReason }),
    });
  },
};

export const getAllBookings = (statusFilter) => bookingsService.getAll(statusFilter);
export const bookingService = {
  createBooking: (data) => bookingsService.create(data),
  getUserBookings: (userId) => bookingsService.getByUser(userId),
  getServiceCenterBookings: () => bookingsService.getServiceCenterBookings(),
  updateBookingStatus: (id, status, totalPrice, reason) => 
    bookingsService.updateStatus(id, status, totalPrice, reason),
};

export const getBookingById = async (id) => {
  return bookingsService.getById(id);
};

export const cancelBooking = async (id, reason) => {
  return bookingsService.updateStatus(id, "Cancelled", 0, reason);
};

export default bookingsService;
