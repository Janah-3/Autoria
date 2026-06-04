import { SUBSCRIPTION_ENDPOINTS } from "./endpoints";
import { apiAuthFetch } from "./client";

export const subscriptionService = {
  /** GET /plans — list available subscription plans */
  async getPlans() {
    return apiAuthFetch(SUBSCRIPTION_ENDPOINTS.plans);
  },

  /** GET /{serviceCenterId}/status — current subscription status */
  async getStatus(serviceCenterId) {
    return apiAuthFetch(SUBSCRIPTION_ENDPOINTS.status(serviceCenterId));
  },

  /** POST /{serviceCenterId}/subscribe — create a subscription (returns subscriptionId) */
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

  /** POST /{serviceCenterId}/pay — process payment: body = { request: { subscriptionId, CardToken } } */
async pay(serviceCenterId, subscriptionId, cardToken) {
  return apiAuthFetch(SUBSCRIPTION_ENDPOINTS.pay(serviceCenterId), {
    method: "POST",
    body: JSON.stringify({
      subscriptionId,     
      CardToken: cardToken, 
    }),
  });
},
};

export default subscriptionService;
