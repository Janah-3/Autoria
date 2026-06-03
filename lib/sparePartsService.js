import { API_BASE_URL } from "./apiConfig";

const getAuthHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const sparePartsService = {
  /**
   * Fetch all spare parts with optional filtering
   * @param {Object} params - Filter parameters
   */
  async getSpareParts(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (params.q) queryParams.append("Search", params.q);
      if (params.brand) queryParams.append("Brand", params.brand);
      if (params.model) queryParams.append("Model", params.model);
      if (params.category) queryParams.append("Category", params.category);
      if (params.partNumber) queryParams.append("PartNumber", params.partNumber);
      if (params.isAvailable) queryParams.append("IsAvailable", params.isAvailable);
      if (params.pageSize) queryParams.append("PageSize", params.pageSize);

      const response = await fetch(`${API_BASE_URL}/spare-parts?${queryParams.toString()}`, {
        headers: getAuthHeaders()
      });
      console.log("STATUS:", response.status);
      console.log("STATUS TEXT:", response.statusText);
      console.log("URL:", response.url);

      if (!response.ok) {
        const errorText = await response.text();
        console.log("BACKEND ERROR:", errorText);
        throw new Error(`Failed: ${response.status}`);
      }
      const resData = await response.json();

      if (resData?.data?.items) {
        return resData.data.items.map(item => ({
          ...item,
          car: `${item.brand} ${item.model}`,
          price: item.lowestPrice !== null && item.lowestPrice !== undefined ? item.lowestPrice : "Contact for Price",
          availability: item.totalAvailableCenters > 0
            ? `Available at ${item.totalAvailableCenters} centers`
            : "Available on order",
          type: (item.category === "Engine" || item.category === "Engine Parts") ? "Used" : "New"
        }));
      }

      return [];
    } catch (error) {
      console.error("Error in getSpareParts:", error);
      throw error;
    }
  },

  /**
   * Fetch a single spare part by ID
   * @param {string|number} id - The spare part ID
   */
  async getSparePartById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/Spare-Parts/${id}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error("Failed to fetch spare part details");
      const resData = await response.json();
      return resData.data;
    } catch (error) {
      console.error("Error in getSparePartById:", error);
      throw error;
    }
  },

  /**
   * Fetch categories from backend
   */
  async getCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/spare-parts/categories`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        return ["Brake Pads", "Engine Parts", "Filters", "Electrical", "Suspension", "Exhaust"];
      }
      const resData = await response.json();
      return resData.data || ["Brake Pads", "Engine Parts", "Filters", "Electrical", "Suspension", "Exhaust"];
    } catch (error) {
      console.warn("Categories endpoint failed, using fallback");
      return ["Brake Pads", "Engine Parts", "Filters", "Electrical", "Suspension", "Exhaust"];
    }
  },

  /**
   * Add a new spare part (Admin)
   * @param {Object} partData - Spare part data
   */
  async addSparePart(partData) {
    try {
      const response = await fetch(`${API_BASE_URL}/spare-parts`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(partData)
      });
      if (!response.ok) throw new Error("Failed to add spare part");
      return await response.json();
    } catch (error) {
      console.error("Error in addSparePart:", error);
      throw error;
    }
  },

  /**
   * Delete a spare part by ID (Admin)
   * @param {string|number} id - The spare part ID
   */
  async deleteSparePart(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/Spare-Parts/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error("Failed to delete spare part");
      return await response.json();
    } catch (error) {
      console.error("Error in deleteSparePart:", error);
      throw error;
    }
  },

  /**
   * Fetch all spare parts including inactive ones (Admin)
   * @param {Object} params - Filter parameters
   */
  async getAdminSpareParts(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.q) queryParams.append("Search", params.q);
      if (params.brand) queryParams.append("Brand", params.brand);
      if (params.model) queryParams.append("Model", params.model);
      if (params.category) queryParams.append("Category", params.category);
      if (params.partNumber) queryParams.append("PartNumber", params.partNumber);
      if (params.isAvailable) queryParams.append("IsAvailable", params.isAvailable);
      if (params.pageSize) queryParams.append("PageSize", params.pageSize);

      if (params.includeInactive !== undefined) {
        queryParams.append("includeInactive", String(params.includeInactive));
      }
      const response = await fetch(`${API_BASE_URL}/spare-parts/admin?${queryParams.toString()}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error("Failed to fetch admin spare parts");
      const resData = await response.json();

      if (resData?.data?.items) {
        resData.data.items = resData.data.items.map(item => ({
          ...item,
          car: `${item.brand} ${item.model}`,
          price: item.lowestPrice !== null && item.lowestPrice !== undefined ? item.lowestPrice : "Contact for Price",
          availability: item.totalAvailableCenters > 0
            ? `Available at ${item.totalAvailableCenters} centers`
            : "Available on order",
          type: (item.category === "Engine" || item.category === "Engine Parts") ? "Used" : "New"
        }));
      }
      return resData.data;
    } catch (error) {
      console.error("Error in getAdminSpareParts:", error);
      throw error;
    }
  }
};

export default sparePartsService;
