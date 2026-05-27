import { ADMIN_ENDPOINTS } from "./endpoints";
import { apiAuthFetch } from "./client";

export const adminService = {
  async getDashboard() {
    return apiAuthFetch(ADMIN_ENDPOINTS.dashboard);
  },
};

export default adminService;
