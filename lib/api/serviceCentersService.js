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

  /** Returns null if not logged in or user has no service center yet. */
  async getMyIfExists() {
    try {
      return await this.getMy();
    } catch (err) {
      if (err.status === 401 || err.status === 403 || err.status === 404) return null;
      throw err;
    }
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

  buildDocumentsFormData(files) {
    const fd = new FormData();
    if (files.commercialReg) fd.append("CommercialRegFile", files.commercialReg);
    if (files.taxCard) fd.append("TaxCardFile", files.taxCard);
    if (files.nationalId) fd.append("OwnerNationalIdFile", files.nationalId);
    return fd;
  },

  async uploadDocuments(filesOrFormData) {
    const formData =
      filesOrFormData instanceof FormData
        ? filesOrFormData
        : this.buildDocumentsFormData(filesOrFormData);

    const res = await fetch(`${API_BASE_URL}${SERVICE_CENTER_ENDPOINTS.myDocuments}`, {
      method: "POST",
      headers: getAuthHeaders(true, false),
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const details = Array.isArray(data?.errors) ? data.errors.filter(Boolean).join(" • ") : "";
      let message = details || data.message || "Failed to upload documents";
      if (res.status === 403) {
        message =
          details ||
          data.message ||
          "Cannot upload documents. Your application may already be submitted, or this account is not allowed to modify this service center.";
      }
      const error = new Error(message);
      error.errors = data?.errors;
      error.status = res.status;
      throw error;
    }
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
    const formatted = operatingHours.map((h) => ({
      day: h.day,
      openTime: h.openTime ?? h.start ?? "09:00",
      closeTime: h.closeTime ?? h.end ?? "18:00",
      isClosed: h.isClosed ?? h.isOpen === false,
    }));
    return apiAuthFetch(SERVICE_CENTER_ENDPOINTS.myOperatingHours, {
      method: "PUT",
      body: JSON.stringify({ operatingHours: formatted }),
    });
  },

  buildPhotosFormData(files) {
    const fd = new FormData();
    files.forEach((file) => fd.append("Photos", file));
    return fd;
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

  async getServiceTypes() {
    return apiAuthFetch(`${SERVICE_CENTER_ENDPOINTS.base}/service-types`);
  },

  async getCarBrands() {
    return apiAuthFetch(`${SERVICE_CENTER_ENDPOINTS.base}/car-brands`);
  },
};

export default serviceCentersService;
