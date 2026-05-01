import { BASE_URL } from "./allApi";

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    "Authorization": token ? `Bearer ${token}` : ""
  };
};

export const signup = async (userData) => {
  const res = await fetch(`${BASE_URL}/api/Auth/register`, {
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
  const res = await fetch(`${BASE_URL}/api/Auth/login`, {
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

export const verifyEmail = async (token, email) => {
  const res = await fetch(`${BASE_URL}/verify-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ token, email }),
  });

  let data;
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    throw new Error(typeof data === 'string' ? data : (data.message || "Email verification failed"));
  }
  
  return data;
};

export const changePassword = async (oldPassword, newPassword, confirmPassword) => {
  const res = await fetch(`${BASE_URL}/changePassword`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      oldPassword,
      newPassword,
      confirmPassword
    }),
  });

  let data;
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    throw new Error(typeof data === 'string' ? data : (data.message || "Failed to change password"));
  }
  
  return data;
};