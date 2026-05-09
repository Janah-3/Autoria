import { BASE_URL } from "./allApi";

/**
 * Booking Service
 * Handles all API calls for service center bookings
 */

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    "Authorization": token ? `Bearer ${token}` : ""
  };
};

export const bookingService = {
  // Fetch all bookings for the logged-in service center
  async getServiceCenterBookings() {
    try {
      const response = await fetch(`${BASE_URL}/api/Bookings/service-center`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error("Failed to fetch bookings");
      return await response.json();
    } catch (error) {
      console.error("Error in getServiceCenterBookings:", error);
      throw error;
    }
  },

  // Update booking status (Confirm/Decline/Cancel)
  async updateBookingStatus(id, status) {
    try {
      const response = await fetch(`${BASE_URL}/api/Bookings/${id}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error(`Failed to ${status} booking`);
      return await response.json();
    } catch (error) {
      console.error(`Error in updateBookingStatus (${status}):`, error);
      throw error;
    }
  }
};

export default bookingService;
