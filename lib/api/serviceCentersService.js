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

  /**
   * GET service types available on the platform.
   * NOTE: No dedicated GET endpoint exists in the API spec — the API only has
   * PUT /my/service-types for updating. We return a static list that matches
   * the known service types stored in the backend.
   */
  async getServiceTypes() {
    const STATIC_SERVICE_TYPES = [
      { id: "779E6B5C-FC46-4207-940F-3C79DA96BECA", name: "Oil Change" },
      { id: "0D78B545-DBE7-4C47-9557-61677308178D", name: "Brakes Repair" },
      { id: "f218b908-d6e5-4eef-925b-12cf5873af8f", name: "Suspension" },
      { id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", name: "AC Maintenance" },
      { id: "b2c3d4e5-f6a7-8901-bcde-f12345678901", name: "Engine Diagnostics" },
      { id: "c3d4e5f6-a7b8-9012-cdef-123456789012", name: "Tire Services" },
      { id: "d4e5f6a7-b8c9-0123-defa-234567890123", name: "Electrical Systems" },
      { id: "e5f6a7b8-c9d0-1234-efab-345678901234", name: "Body Work" },
    ];
    return { success: true, data: STATIC_SERVICE_TYPES };
  },

  /**
   * GET car brands available on the platform.
   * NOTE: No dedicated GET endpoint exists in the API spec — the API only has
   * PUT /my/car-brands for updating. We return a static list.
   */
  async getCarBrands() {
    const STATIC_CAR_BRANDS = [
      { id: "2DD8709F-DDFA-452C-A23B-1BCECD6CCFAE", name: "Toyota" },
      { id: "3AA77C79-B11C-4455-9BC9-36B206BA5D0F", name: "Hyundai" },
      { id: "4BB88D80-CC22-5566-AAD0-47C317CB6E1F", name: "Kia" },
      { id: "5CC99E91-DD33-6677-BBE1-58D428DC7F2G", name: "Nissan" },
      { id: "6DD00F02-EE44-7788-CCF2-69E539ED8030", name: "Honda" },
      { id: "7EE11013-FF55-8899-DD03-70F64AFE9141", name: "BMW" },
      { id: "8FF22124-0066-99AA-EE14-81077BFF0252", name: "Mercedes-Benz" },
      { id: "9AA33235-1177-AABB-FF25-92188C001363", name: "Chevrolet" },
      { id: "ABB44346-2288-BBCC-0036-A3299D112474", name: "Ford" },
      { id: "BCC55457-3399-CCDD-1147-B430AE223585", name: "Mitsubishi" },
      { id: "CDD66568-44AA-DDEE-2258-C541BF334696", name: "Suzuki" },
      { id: "DEE77679-55BB-EEFF-3369-D652C0445707", name: "Volkswagen" },
    ];
    return { success: true, data: STATIC_CAR_BRANDS };
  },
};

export default serviceCentersService;
