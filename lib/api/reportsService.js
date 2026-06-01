import { REPORTS_ENDPOINTS } from "./endpoints";
import { apiAuthFetch, buildQuery } from "./client";

export const reportsService = {
  /* ================= CREATE REPORT ================= */
  async create(payload) {
    // payload: { targetType, targetId, reason, details }
    return apiAuthFetch(REPORTS_ENDPOINTS.base, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /* ================= GET ALL (WITH FILTERS) ================= */
  async getAll(params = {}) {
    const query = buildQuery(params);
    return apiAuthFetch(`${REPORTS_ENDPOINTS.base}${query}`);
  },

  /* ================= GET BY ID ================= */
  async getById(id) {
    return apiAuthFetch(REPORTS_ENDPOINTS.byId(id));
  },

  /* ================= COMPATIBILITY (OLD NAME) ================= */
  // عشان ما تكسرش أي كود قديم عندك
  async getAllReports() {
    return this.getAll();
  },

  async getReportDetails(id) {
    return this.getById(id);
  },

  /* ================= RESOLVE ================= */
  async resolve(id, resolutionNote) {
    return apiAuthFetch(REPORTS_ENDPOINTS.resolve(id), {
      method: "PATCH",
      body: JSON.stringify({
        ResolutionNote: resolutionNote
      }),
    });
  },

  /* ================= DISMISS ================= */
  async dismiss(id, resolutionNote) {
    return apiAuthFetch(REPORTS_ENDPOINTS.dismiss(id), {
      method: "PATCH",
      body: JSON.stringify({
        ResolutionNote: resolutionNote
      }),
    });
  },
};

export default reportsService;