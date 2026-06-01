import { PREMIUM_ENDPOINTS } from "./endpoints";
import { apiAuthFetch } from "./client";

export const premiumService = {
  /** GET /{serviceCenterId}/analytics — get analytics data */
  async getAnalytics(serviceCenterId) {
    return apiAuthFetch(PREMIUM_ENDPOINTS.analytics(serviceCenterId));
  },

  /** POST /{serviceCenterId}/promotions — send promotional email */
  async sendPromotion(serviceCenterId, payload) {
    return apiAuthFetch(PREMIUM_ENDPOINTS.promotions(serviceCenterId), {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /** POST /{serviceCenterId}/view — track a profile view */
  async trackView(serviceCenterId) {
    return apiAuthFetch(PREMIUM_ENDPOINTS.view(serviceCenterId), {
      method: "POST",
    });
  },
};

export default premiumService;
