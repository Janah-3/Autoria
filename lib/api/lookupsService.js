import { apiAuthFetch } from "./client";

export const lookupsService = {
  getServiceTypes() {
    return apiAuthFetch("/lookups/service-types");
  },

  getCarBrands() {
    return apiAuthFetch("/lookups/car-brands");
  },
};

export default lookupsService;