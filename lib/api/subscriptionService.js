import { SUBSCRIPTION_ENDPOINTS } from "./endpoints";
import { apiAuthFetch } from "./client";

export const subscriptionService = {
  /** GET /plans — list available subscription plans */
  async getPlans() {
    return apiAuthFetch(SUBSCRIPTION_ENDPOINTS.plans);
  },
  async getStatus(serviceCenterId) {
  return apiAuthFetch(
    SUBSCRIPTION_ENDPOINTS.status(serviceCenterId)
  );
},

  /** GET /{serviceCenterId}/status — current subscription status */
  async subscribe(serviceCenterId, monthsDuration) {
  return apiAuthFetch(
    SUBSCRIPTION_ENDPOINTS.subscribe(serviceCenterId),
    {
      method: "POST",
      body: JSON.stringify({
        monthsDuration,
      }),
    }
  );
},

  /** POST /{serviceCenterId}/subscribe — subscribe to a plan */
  async subscribe(serviceCenterId, payload) {
    return apiAuthFetch(SUBSCRIPTION_ENDPOINTS.subscribe(serviceCenterId), {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /** PATCH /{serviceCenterId}/cancel — cancel active subscription */
  async cancelSubscription(serviceCenterId, payload) {
    return apiAuthFetch(SUBSCRIPTION_ENDPOINTS.cancel(serviceCenterId), {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
async pay(serviceCenterId, subscriptionId, method, cardToken) {
  return apiAuthFetch(
    SUBSCRIPTION_ENDPOINTS.pay(serviceCenterId),
    {
      method: "POST",
      body: JSON.stringify({
        subscriptionId,
        method,
        cardToken,
      }),
    }
  );
}
};

export default subscriptionService;
