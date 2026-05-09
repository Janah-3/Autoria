import { API_BASE_URL } from "./apiConfig";

/**
 * Booking Service
 * Handles all API calls related to service bookings
 */

export const bookingService = {
  /**
   * Submit a new booking request
   * @param {Object} bookingData - The data from the booking form
   */
  async createBooking(bookingData) {
    try {
      const response = await fetch(`${API_BASE_URL}/Bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to submit booking");
      }

      return await response.json();
    } catch (error) {
      console.error("Error in createBooking:", error);
      throw error;
    }
  },

  /**
   * Fetch bookings for a specific user (optional)
   * @param {string} userId 
   */
  async getUserBookings(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/Bookings/user/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch user bookings");
      return await response.json();
    } catch (error) {
      console.error("Error in getUserBookings:", error);
      throw error;
    }
  }
};

export default bookingService;
