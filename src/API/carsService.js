import { BASE_URL } from "./allApi";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": token ? `Bearer ${token}` : ""
  };
};

export const getAllCars = async () => {
  const res = await fetch(`${BASE_URL}/`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.message || "Failed to fetch cars");
  }
  return data;
};

export const getCarById = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.message || "Failed to fetch car");
  }
  return data;
};

export const addCar = async (carData) => {
  const res = await fetch(`${BASE_URL}/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(carData)
  });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.message || "Failed to add car");
  }
  return data;
};

export const updateCar = async (id, carData) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(carData)
  });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.message || "Failed to update car");
  }
  return data;
};

export const deleteCar = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.message || "Failed to delete car");
  }
  return data;
};
