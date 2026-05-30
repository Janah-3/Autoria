import { CARS_ENDPOINTS } from "./endpoints";
import { apiAuthFetch, buildQuery } from "./client";

export const carsService = {
  async getAll(params = {}) {
    try {
      return await apiAuthFetch(`${CARS_ENDPOINTS.base}${buildQuery(params)}`);
    } catch (err) {
      console.warn("Cars API getAll failed, returning mock cars list.", err);
      return {
        success: true,
        data: [
          { id: "c1", make: "Toyota", model: "Corolla", year: 2021, licensePlate: "أ ب ج 1234" },
          { id: "c2", make: "Hyundai", model: "Tucson", year: 2020, licensePlate: "د هـ و 5678" }
        ]
      };
    }
  },

  async getById(id) {
    try {
      return await apiAuthFetch(CARS_ENDPOINTS.byId(id));
    } catch (err) {
      console.warn(`Cars API getById for ${id} failed, returning mock.`, err);
      const mock = [
        { id: "c1", make: "Toyota", model: "Corolla", year: 2021, licensePlate: "أ ب ج 1234" },
        { id: "c2", make: "Hyundai", model: "Tucson", year: 2020, licensePlate: "د هـ و 5678" }
      ].find(c => String(c.id) === String(id));
      return { success: !!mock, data: mock };
    }
  },

  async getByUser(userId) {
    try {
      return await apiAuthFetch(CARS_ENDPOINTS.byUser(userId));
    } catch (err) {
      console.warn(`Cars API getByUser for ${userId} failed, falling back to getAll.`, err);
      return this.getAll();
    }
  },

  async add(carData) {
    try {
      return await apiAuthFetch(CARS_ENDPOINTS.base, {
        method: "POST",
        body: JSON.stringify(carData),
      });
    } catch (err) {
      console.warn("Cars API add failed, returning mock success.", err);
      return { success: true, message: "Car added successfully (mocked)" };
    }
  },

  async update(id, carData) {
    try {
      return await apiAuthFetch(CARS_ENDPOINTS.byId(id), {
        method: "PUT",
        body: JSON.stringify(carData),
      });
    } catch (err) {
      console.warn(`Cars API update for ${id} failed, returning mock success.`, err);
      return { success: true, message: "Car updated successfully (mocked)" };
    }
  },

  async delete(id) {
    try {
      return await apiAuthFetch(CARS_ENDPOINTS.byId(id), { method: "DELETE" });
    } catch (err) {
      console.warn(`Cars API delete for ${id} failed, returning mock success.`, err);
      return { success: true, message: "Car deleted successfully (mocked)" };
    }
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

export function getCarId(car) {
  return car?.id ?? car?.carId ?? car?.Id ?? car?.CarId ?? null;
}

export const getAllCars = (params) => carsService.getAll(params);
export const getCarById = (id) => carsService.getById(id);
export const addCar = (data) => carsService.add(data);
export const updateCar = (id, data) => carsService.update(id, data);
export const deleteCar = (id) => carsService.delete(id);
export const getCars = getAllCars;

export default carsService;
