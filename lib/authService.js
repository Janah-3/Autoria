import { API_BASE_URL } from "./apiConfig";

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    "Authorization": token ? `Bearer ${token}` : ""
  };
};

export const signup = async (userData) => {
  const res = await fetch(`${API_BASE_URL}/Auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      FullName: userData.name,          
      Email: userData.email,
      Password: userData.password,
    })
  });

  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.message || "Registration failed");
  }
  return data;
};

export const login = async (userData) => {
  const res = await fetch(`${API_BASE_URL}/Auth/login`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json" 
    },
    body: JSON.stringify({
      email: userData.email,
      password: userData.password
    }),
  });

  const data = await res.json();

  if (!res.ok || data.success === false) {
    throw new Error(data.message || "Login failed");
  }
  return data; 
};

export const logout = async () => {
  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem("refreshToken") : null;

  const res = await fetch(`${API_BASE_URL}/Auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      RefreshToken: refreshToken
    }),
  });

  if (typeof window !== 'undefined') {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("email");
  }

  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = await res.text();
  }

  return data;
};
