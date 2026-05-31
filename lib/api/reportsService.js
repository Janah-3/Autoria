import { REPORTS_ENDPOINTS } from "./endpoints";
import { apiAuthFetch, buildQuery } from "./client";

export const reportsService = {
  async getAll(params = {}) {
    // params can contain Page, PageSize, etc.
    const query = buildQuery(params);
    const res = await apiAuthFetch(`${REPORTS_ENDPOINTS.base}${query}`);
    return res;
  },

  async getById(id) {
    return apiAuthFetch(REPORTS_ENDPOINTS.byId(id));
  },

  async create(payload) {
    return apiAuthFetch(REPORTS_ENDPOINTS.base, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async resolve(id, resolutionNote) {
    return apiAuthFetch(REPORTS_ENDPOINTS.resolve(id), {
      method: "PATCH",
      body: JSON.stringify({ ResolutionNote: resolutionNote }),
    });
  },

  async dismiss(id, resolutionNote) {
    return apiAuthFetch(REPORTS_ENDPOINTS.dismiss(id), {
      method: "PATCH",
      body: JSON.stringify({ ResolutionNote: resolutionNote }),
    });
  },
};

export default reportsService;
