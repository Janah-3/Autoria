import { MILEAGE_ENDPOINTS } from "./endpoints";
import { apiAuthFetch, buildQuery } from "./client";

export const mileageService = {
  /** POST /MileageTracking — log a mileage entry */
  async addMileage(payload) {
    return apiAuthFetch(MILEAGE_ENDPOINTS.base, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /** GET /MileageTracking/{carId}/history — get mileage history */
  async getMileageHistory(carId) {
    return apiAuthFetch(MILEAGE_ENDPOINTS.history(carId));
  },

  /** POST /MileageTracking/reminders — create a reminder */
  async createReminder(payload) {
    return apiAuthFetch(MILEAGE_ENDPOINTS.reminders, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /** GET /MileageTracking/reminders?CarId={carId} — get reminders */
  async getReminders(carId, isTriggered) {
    return apiAuthFetch(
      `${MILEAGE_ENDPOINTS.reminders}${buildQuery({ CarId: carId, isTriggered })}`
    );
  },

  /** DELETE /MileageTracking/reminders/{id} — delete a reminder */
  async deleteReminder(id) {
    return apiAuthFetch(MILEAGE_ENDPOINTS.reminderById(id), {
      method: "DELETE",
    });
  },
};

export default mileageService;
