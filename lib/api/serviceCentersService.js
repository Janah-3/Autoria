import { SERVICE_CENTER_ENDPOINTS } from "./endpoints";
import { apiAuthFetch, getAuthHeaders } from "./client";
import { API_BASE_URL } from "../apiConfig";

export { getServiceCenterItems, mapServiceCenterListItem } from "./mappers";

export const serviceCentersService = {
  async getAll() {
    return apiAuthFetch(SERVICE_CENTER_ENDPOINTS.base);
  },

  async getById(id) {
    return apiAuthFetch(SERVICE_CENTER_ENDPOINTS.byId(id));
  },

  async create(payload) {
    return apiAuthFetch(SERVICE_CENTER_ENDPOINTS.base, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getMy() {
    return apiAuthFetch(SERVICE_CENTER_ENDPOINTS.my);
  },

  async updateMy(payload) {
    return apiAuthFetch(SERVICE_CENTER_ENDPOINTS.my, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async delete(id) {
    return apiAuthFetch(SERVICE_CENTER_ENDPOINTS.byId(id), { method: "DELETE" });
  },

  async uploadDocuments(formData) {
    const res = await fetch(`${API_BASE_URL}${SERVICE_CENTER_ENDPOINTS.myDocuments}`, {
      method: "POST",
      headers: getAuthHeaders(true, false),
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Failed to upload documents");
    return data;
  },

  async updateServiceTypes(serviceTypeIds) {
    return apiAuthFetch(SERVICE_CENTER_ENDPOINTS.myServiceTypes, {
      method: "PUT",
      body: JSON.stringify({ serviceTypeIds }),
    });
  },

  async updateCarBrands(carBrandIds) {
    return apiAuthFetch(SERVICE_CENTER_ENDPOINTS.myCarBrands, {
      method: "PUT",
      body: JSON.stringify({ CarBrandIds: carBrandIds }),
    });
  },

  async updateOperatingHours(operatingHours) {
    const formatted = operatingHours.map(h => ({
      day: h.day,
      dayOfWeek: h.day,
      isOpen: h.isOpen,
      start: h.start,
      end: h.end,
      Day: h.day,
      IsOpen: h.isOpen,
      Start: h.start,
      End: h.end
    }));
    return apiAuthFetch(SERVICE_CENTER_ENDPOINTS.myOperatingHours, {
      method: "PUT",
      body: JSON.stringify({ 
        operatingHours: formatted,
        OperatingHours: formatted
      }),
    });
  },

  async uploadPhotos(formData) {
    const res = await fetch(`${API_BASE_URL}${SERVICE_CENTER_ENDPOINTS.myPhotos}`, {
      method: "POST",
      headers: getAuthHeaders(true, false),
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Failed to upload photos");
    return data;
  },

  async submitRegistration() {
    return apiAuthFetch(SERVICE_CENTER_ENDPOINTS.mySubmit, { method: "POST" });
  },

  async setMyLocation(payload) {
    return apiAuthFetch(SERVICE_CENTER_ENDPOINTS.myLocation, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async getPending() {
    return apiAuthFetch(SERVICE_CENTER_ENDPOINTS.pending);
  },

  async approve(id) {
    return apiAuthFetch(SERVICE_CENTER_ENDPOINTS.approve(id), { method: "PUT" });
  },

  async reject(id, rejectionReason) {
    return apiAuthFetch(SERVICE_CENTER_ENDPOINTS.reject(id), {
      method: "PUT",
      body: JSON.stringify({ RejectionReason: rejectionReason }),
    });
  },

  async match(payload) {
    return apiAuthFetch(SERVICE_CENTER_ENDPOINTS.match, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

export default serviceCentersService;
