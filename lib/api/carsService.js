import { CARS_ENDPOINTS } from "./endpoints";
import { apiAuthFetch, buildQuery } from "./client";

export const carsService = {
  async getAll(params = {}) {
    return apiAuthFetch(`${CARS_ENDPOINTS.base}${buildQuery(params)}`);
  },

  async getById(id) {
    return apiAuthFetch(CARS_ENDPOINTS.byId(id));
  },

  async getByUser(userId) {
    return apiAuthFetch(CARS_ENDPOINTS.byUser(userId));
  },

  async add(carData) {
    return apiAuthFetch(CARS_ENDPOINTS.base, {
      method: "POST",
      body: JSON.stringify(carData),
    });
  },

  async update(id, carData) {
    return apiAuthFetch(CARS_ENDPOINTS.byId(id), {
      method: "PUT",
      body: JSON.stringify(carData),
    });
  },

  async delete(id) {
    return apiAuthFetch(CARS_ENDPOINTS.byId(id), { method: "DELETE" });
  },
};

/** Normalize nested paginated response from Cars API */
export function getCarItems(response) {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (data?.data?.items) return data.data.items;
  if (data?.items) return data.items;
  return [];
}

export const getAllCars = (params) => carsService.getAll(params);
export const getCarById = (id) => carsService.getById(id);
export const addCar = (data) => carsService.add(data);
export const updateCar = (id, data) => carsService.update(id, data);
export const deleteCar = (id) => carsService.delete(id);
export const getCars = getAllCars;

export default carsService;
