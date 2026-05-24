import { API_BASE_URL } from "../apiConfig";
import { SPARE_PARTS_ENDPOINTS } from "./endpoints";
import { apiFetch, buildQuery } from "./client";
import { getSparePartItems } from "./mappers";

export const sparePartsService = {
  async getSpareParts(params = {}) {
    const res = await apiFetch(
      `${API_BASE_URL}${SPARE_PARTS_ENDPOINTS.base}${buildQuery(params)}`
    );
    return getSparePartItems(res);
  },

  async getSparePartById(id) {
    return apiFetch(`${API_BASE_URL}${SPARE_PARTS_ENDPOINTS.byId(id)}`);
  },

  async getCategories() {
    try {
      const res = await apiFetch(`${API_BASE_URL}${SPARE_PARTS_ENDPOINTS.categories}`);
      return res.data ?? res ?? [];
    } catch {
      return [];
    }
  },
};

export default sparePartsService;
