import { API_BASE_URL } from "./apiConfig";

/**
 * Spare Parts Service
 * Handles all API calls related to spare parts
 */

export const sparePartsService = {
  /**
   * Fetch all spare parts with optional filtering
   * @param {Object} params - Filter parameters (q, category, brand, model, etc.)
   */
  async getSpareParts(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`${API_BASE_URL}/SpareParts?${queryParams.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch spare parts");
      return await response.json();
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
      const response = await fetch(`${API_BASE_URL}/SpareParts/${id}`);
      if (!response.ok) throw new Error("Failed to fetch spare part details");
      return await response.json();
    } catch (error) {
      console.error("Error in getSparePartById:", error);
      throw error;
    }
  },


  async getCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/SpareParts/categories`);
      if (!response.ok) {
        // Fallback to mock categories if endpoint doesn't exist yet
        return ["Engine", "Brakes", "Suspension", "Electrical", "Body", "Interior", "Lights", "Filters"];
      }
      return await response.json();
    } catch (error) {
      console.warn("Categories endpoint failed, using fallback");
      return ["Engine", "Brakes", "Suspension", "Electrical", "Body", "Interior", "Lights", "Filters"];
    }
  }
};

export default sparePartsService;
