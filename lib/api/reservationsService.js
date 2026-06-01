import { RESERVATIONS_ENDPOINTS } from "./endpoints";
import { apiAuthFetch } from "./client";

export const reservationsService = {
  /**
   * Reserve a spare part
   * @param {Object} data - { serviceCenterId, sparePartId, quantity, bookingId }
   */
  async reservePart(data) {
    try {
      console.log("🚀 Sending reservation payload:", JSON.stringify(data, null, 2));
      const res = await apiAuthFetch(RESERVATIONS_ENDPOINTS.reserve, {
        method: "POST",
        body: JSON.stringify(data),
      });
      return res;
    } catch (err) {
      console.error("❌ Failed to reserve part:", err);
      throw err;
    }
  },

  /**
   * Cancel a reservation
   * @param {string} id - Reservation ID
   * @param {string|null} reason - Cancellation reason
   */
  async cancelReservation(id, reason) {
    try {
      console.log(`🚀 Cancelling reservation ${id} with reason:`, reason);
      const res = await apiAuthFetch(RESERVATIONS_ENDPOINTS.cancel(id), {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      return res;
    } catch (err) {
      console.error(`❌ Failed to cancel reservation ${id}:`, err);
      throw err;
    }
  },

  /**
   * Mark a reservation as picked up
   * @param {string} id - Reservation ID
   */
  async pickupReservation(id) {
    try {
      console.log(`🚀 Marking reservation ${id} as picked up`);
      const res = await apiAuthFetch(RESERVATIONS_ENDPOINTS.pickup(id), {
        method: "PATCH",
        body: JSON.stringify({}),
      });
      return res;
    } catch (err) {
      console.error(`❌ Failed to mark reservation ${id} as picked up:`, err);
      throw err;
    }
  },

  /**
   * Fetch logged-in user's reservations
   */
  async getMyReservations() {
    try {
      const res = await apiAuthFetch(RESERVATIONS_ENDPOINTS.my);
      return res;
    } catch (err) {
      console.error("❌ Failed to fetch my reservations:", err);
      throw err;
    }
  },

  /**
   * Fetch reservations for the logged-in service center
   */
  async getServiceCenterReservations() {
    try {
      const res = await apiAuthFetch(RESERVATIONS_ENDPOINTS.serviceCenter);
      return res;
    } catch (err) {
      console.error("❌ Failed to fetch service center reservations:", err);
      throw err;
    }
  },
};

export default reservationsService;
