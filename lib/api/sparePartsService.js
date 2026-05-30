import { SPARE_PARTS_ENDPOINTS } from "./endpoints";
import { apiAuthFetch, buildQuery } from "./client";
import { getSparePartItems } from "./mappers";

export const sparePartsService = {
  async getSpareParts(params = {}) {
    const res = await apiAuthFetch(
      `${SPARE_PARTS_ENDPOINTS.base}${buildQuery(params)}`
    );
    return getSparePartItems(res);
  },

  async getSparePartById(id) {
    return apiAuthFetch(SPARE_PARTS_ENDPOINTS.byId(id));
  },

  async getCategories() {
    try {
      const res = await apiAuthFetch(SPARE_PARTS_ENDPOINTS.categories);
      return res.data ?? res ?? [];
    } catch {
      return [];
    }
  },
};

export default sparePartsService;
