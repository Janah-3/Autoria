import { REVIEWS_ENDPOINTS } from "./endpoints";
import { apiAuthFetch, buildQuery } from "./client";

const reviewsService = {
  async submit(formData) {
    return apiAuthFetch(REVIEWS_ENDPOINTS.base, {
      method: "POST",
      body: formData,
      headers: {},
    });
  },

  async getReviews(params = {}) {
    return apiAuthFetch(`${REVIEWS_ENDPOINTS.base}${buildQuery(params)}`);
  },
};

export default reviewsService;