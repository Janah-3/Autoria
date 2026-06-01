import { REPORTS_ENDPOINTS } from "./endpoints";
import { apiAuthFetch } from "./client";

export const reportsService = {
  async createReport(reportData) {
    // reportData: { targetType, targetId, reason, details }
    return apiAuthFetch(REPORTS_ENDPOINTS.base, {
      method: "POST",
      body: JSON.stringify(reportData),
    });
  },

  async getAllReports() {
    return apiAuthFetch(REPORTS_ENDPOINTS.base);
  },

  async getReportDetails(id) {
    return apiAuthFetch(REPORTS_ENDPOINTS.byId(id));
  },

  async resolveReport(id, resolutionNote) {
    return apiAuthFetch(REPORTS_ENDPOINTS.resolve(id), {
      method: "PATCH",
      body: JSON.stringify({ ResolutionNote: resolutionNote }),
    });
  },

  async dismissReport(id, resolutionNote) {
    return apiAuthFetch(REPORTS_ENDPOINTS.dismiss(id), {
      method: "PATCH",
      body: JSON.stringify({ ResolutionNote: resolutionNote }),
    });
  },
};

export default reportsService;
