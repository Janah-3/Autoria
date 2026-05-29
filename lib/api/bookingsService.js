import { BOOKINGS_ENDPOINTS } from "./endpoints";
import { apiAuthFetch, buildQuery } from "./client";

export const bookingsService = {
  // ── Bookings ─────────────────────────────────────────────────────────────

  async getAll(statusFilter, page = 1, pageSize = 10) {
    const res = await apiAuthFetch(
      `${BOOKINGS_ENDPOINTS.base}${buildQuery({ statusFilter, page, pageSize })}`
    );
    // Unify items structure
    const items = res.data?.items ?? (Array.isArray(res.data) ? res.data : []);
    return { ...res, data: items };
  },

  async getById(id) {
    return apiAuthFetch(BOOKINGS_ENDPOINTS.byId(id));
  },

  async create(bookingData) {
    try {
      // إذا كان bookingData جاي مغلف بـ { request: {...} }
      // هنستخرج البيانات الأساسية فقط قبل الإرسال
      const payload = bookingData.request ? bookingData.request : bookingData;

      console.log("🚀 Sending Clean Payload:", JSON.stringify(payload, null, 2));

      const response = await apiAuthFetch(BOOKINGS_ENDPOINTS.base, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload), // بنبعت الـ Payload نظيف مباشرة
      });
      return response;
    } catch (error) {
      console.error("❌ Backend Rejected Booking Because:", error);
      throw error;
    }
  },
  async getByUser(userId) {
    // In C# GetUserBookings resolves user from token, base endpoint is used.
    // If frontend still passes userId, we fallback to old byUser or use base.
    try {
      return await apiAuthFetch(BOOKINGS_ENDPOINTS.byUser(userId));
    } catch {
      return this.getAll();
    }
  },

  async getServiceCenterBookings() {
    // Falls back to admin listing filtered by service center if custom endpoint doesn't exist
    try {
      return await apiAuthFetch(BOOKINGS_ENDPOINTS.serviceCenter);
    } catch {
      return this.getAll();
    }
  },

  async updateStatus(id, status, payload = {}) {
    const statusNormalized = status?.toLowerCase();
    if (statusNormalized === "confirmed" || statusNormalized === "confirm") {
      return this.confirmBooking(id);
    } else if (
      statusNormalized === "cancelled" ||
      statusNormalized === "declined" ||
      statusNormalized === "cancel" ||
      statusNormalized === "decline"
    ) {
      return this.cancelBooking(id, payload.cancellationReason || "Updated to " + status);
    } else if (statusNormalized === "completed" || statusNormalized === "complete") {
      return this.completeBooking(id, payload.totalPrice);
    } else {
      // Legacy status fallback
      return apiAuthFetch(BOOKINGS_ENDPOINTS.status(id), {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    }
  },

  async cancelBooking(id, cancellationReason) {
    return apiAuthFetch(BOOKINGS_ENDPOINTS.cancel(id), {
      method: "PATCH",
      body: JSON.stringify({ cancellationReason }),
    });
  },

  async rescheduleBooking(id, newTimeSlotId) {
    return apiAuthFetch(BOOKINGS_ENDPOINTS.reschedule(id), {
      method: "PATCH",
      body: JSON.stringify({ newTimeSlotId }),
    });
  },

  async confirmBooking(id) {
    return apiAuthFetch(BOOKINGS_ENDPOINTS.confirm(id), {
      method: "PATCH",
    });
  },

  async completeBooking(id, totalPrice) {
    return apiAuthFetch(BOOKINGS_ENDPOINTS.complete(id), {
      method: "PATCH",
      body: JSON.stringify({ totalPrice: totalPrice ? Number(totalPrice) : null }),
    });
  },

  // ── Time Slots ────────────────────────────────────────────────────────────

  async getAvailableSlots(serviceCenterId, date) {
    return apiAuthFetch(
      `${BOOKINGS_ENDPOINTS.slots}${buildQuery({ ServiceCenterId: serviceCenterId, Date: date })}`
    );
  },

  async addTimeSlot(payload) {
    // payload: { serviceCenterId, date, startTime, endTime }
    return apiAuthFetch(BOOKINGS_ENDPOINTS.slots, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async blockTimeSlot(slotId) {
    return apiAuthFetch(BOOKINGS_ENDPOINTS.blockSlot(slotId), {
      method: "PATCH",
    });
  },

  async deleteTimeSlot(slotId) {
    return apiAuthFetch(BOOKINGS_ENDPOINTS.deleteSlot(slotId), {
      method: "DELETE",
    });
  },

  // ── Admin Bookings ────────────────────────────────────────────────────────

  async adminGetAll(filters = {}) {
    // filters: { Status, ServiceCenterId, DateFrom, DateTo, Page, PageSize }
    return apiAuthFetch(
      `${BOOKINGS_ENDPOINTS.adminBase}${buildQuery(filters)}`
    );
  },

  async adminGetById(id) {
    return apiAuthFetch(BOOKINGS_ENDPOINTS.adminById(id));
  },

  async adminCancel(id, cancellationReason) {
    return apiAuthFetch(BOOKINGS_ENDPOINTS.adminCancel(id), {
      method: "PATCH",
      body: JSON.stringify({ cancellationReason }),
    });
  },

  async adminGetStats(dateFrom, dateTo) {
    return apiAuthFetch(
      `${BOOKINGS_ENDPOINTS.adminStats}${buildQuery({ dateFrom, dateTo })}`
    );
  },
};

// ── Export Named Wrappers ───────────────────────────────────────────────────

export const getAllBookings = (statusFilter) => bookingsService.getAll(statusFilter);

export const bookingService = {
  createBooking: (data) => bookingsService.create(data),
  getUserBookings: (userId) => bookingsService.getByUser(userId),
  getServiceCenterBookings: () => bookingsService.getServiceCenterBookings(),
  updateBookingStatus: (id, status, payload) => bookingsService.updateStatus(id, status, payload),
  cancelBooking: (id, reason) => bookingsService.cancelBooking(id, reason),
  rescheduleBooking: (id, newSlotId) => bookingsService.rescheduleBooking(id, newSlotId),
  confirmBooking: (id) => bookingsService.confirmBooking(id),
  completeBooking: (id, totalPrice) => bookingsService.completeBooking(id, totalPrice),

  // Slots
  getAvailableSlots: (centerId, date) => bookingsService.getAvailableSlots(centerId, date),
  addTimeSlot: (payload) => bookingsService.addTimeSlot(payload),
  blockTimeSlot: (slotId) => bookingsService.blockTimeSlot(slotId),
  deleteTimeSlot: (slotId) => bookingsService.deleteTimeSlot(slotId),

  // Admin
  adminGetAllBookings: (filters) => bookingsService.adminGetAll(filters),
  adminGetBookingById: (id) => bookingsService.adminGetById(id),
  adminCancelBooking: (id, reason) => bookingsService.adminCancel(id, reason),
  adminGetBookingStats: (dateFrom, dateTo) => bookingsService.adminGetStats(dateFrom, dateTo),
};

export const getBookingById = async (id) => {
  try {
    return await bookingsService.getById(id);
  } catch (error) {
    // Safe fallback to local find in case of custom schema usage
    const res = await bookingsService.getAll();
    const items = res.data ?? [];
    const item = items.find((b) => String(b.id) === String(id));
    return { success: !!item, data: item };
  }
};

export const cancelBooking = async (id, reason) => {
  return bookingsService.cancelBooking(id, reason);
};

export default bookingsService;