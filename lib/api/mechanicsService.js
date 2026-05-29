import { MECHANICS_ENDPOINTS } from "./endpoints";
import { apiAuthFetch, buildQuery } from "./client";

const mechanicsService = {
  async browse(params = {}) {
    return apiAuthFetch(
      `${MECHANICS_ENDPOINTS.base}${buildQuery(params)}`
    );
  },

  async getById(id) {
    return apiAuthFetch(MECHANICS_ENDPOINTS.byId(id));
  },

  async getMyProfile() {
    return apiAuthFetch(MECHANICS_ENDPOINTS.myProfile, {
      method: "GET",
    });
  },

  async updateMyProfile(formData) {
    return apiAuthFetch(MECHANICS_ENDPOINTS.myProfile, {
      method: "PUT",
      body: formData,
      headers: {},
    });
  },

  async getMyEarnings(params = {}) {
    return apiAuthFetch(
      `${MECHANICS_ENDPOINTS.myEarnings}${buildQuery(params)}`
    );
  },

  async getPending(params = {}) {
    return apiAuthFetch(
      `${MECHANICS_ENDPOINTS.pending}${buildQuery(params)}`
    );
  },

  async approve(id) {
    return apiAuthFetch(MECHANICS_ENDPOINTS.approve(id), {
      method: "POST",
      body: JSON.stringify({}),
    });
  },

  async reject(id, reason) {
    return apiAuthFetch(MECHANICS_ENDPOINTS.reject(id), {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },
};

export default mechanicsService;