import { JOB_REQUESTS_ENDPOINTS } from "./endpoints";
import { apiAuthFetch, buildQuery } from "./client";

const jobRequestsService = {
  async create(mechanicId, payload) {
    return apiAuthFetch(JOB_REQUESTS_ENDPOINTS.create(mechanicId), {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getMy(params = {}) {
    return apiAuthFetch(`${JOB_REQUESTS_ENDPOINTS.my}${buildQuery(params)}`);
  },

  async getMyJobs(params = {}) {
    return apiAuthFetch(`${JOB_REQUESTS_ENDPOINTS.myJobs}${buildQuery(params)}`);
  },

  async getById(id) {
    return apiAuthFetch(JOB_REQUESTS_ENDPOINTS.byId(id));
  },

  async accept(id) {
    return apiAuthFetch(JOB_REQUESTS_ENDPOINTS.accept(id), {
      method: "POST",
      body: JSON.stringify({}),
    });
  },

  async reject(id, reason) {
    return apiAuthFetch(JOB_REQUESTS_ENDPOINTS.reject(id), {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },

  async complete(id, price) {
    return apiAuthFetch(JOB_REQUESTS_ENDPOINTS.complete(id), {
      method: "POST",
      body: JSON.stringify({ price }),
    });
  },

  async cancel(id, cancellationReason = "") {
    return apiAuthFetch(JOB_REQUESTS_ENDPOINTS.cancel(id), {
      method: "POST",
      body: JSON.stringify({ cancellationReason }),
    });
  },
};

export default jobRequestsService;