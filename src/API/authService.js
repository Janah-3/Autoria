import { BASE_URL } from "./allApi";

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    "Authorization": token ? `Bearer ${token}` : ""
  };
};

export const signup = async (userData) => {
  try {
    const res = await fetch(`${BASE_URL}/api/Auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        FullName: userData.name,          
        Email: userData.email,
        Password: userData.password,
        ConfirmPassword: userData.confirmPassword,
        PhoneNumber: userData.phone,
      })
    });

    let data;
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      throw new Error(text || "Server returned an error");
    }

    if (!res.ok || data.success === false) {
      throw new Error(data.message || "Registration failed");
    }
    return data;
  } catch (error) {
    console.error("Signup error:", error);
    if (error.message === "Failed to fetch") {
      throw new Error("Unable to connect to the server. Please ensure the backend is running at " + BASE_URL);
    }
    throw error;
  }
};

export const login = async (userData) => {
  try {
    const res = await fetch(`${BASE_URL}/api/Auth/login`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        Email: userData.email,
        Password: userData.password
      }),
    });

    let data;
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      throw new Error(text || "Server returned an error");
    }

    if (!res.ok || data.success === false) {
      throw new Error(data.message || "Login failed");
    }

    // Save token and basic user info
    if (typeof window !== 'undefined' && data.data) {
      localStorage.setItem("token", data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken);
      localStorage.setItem("userRole", data.data.role);
    }

    return data;
  } catch (error) {
    console.error("Login error:", error);
    if (error.message === "Failed to fetch") {
      throw new Error("Unable to connect to the server. Please ensure the backend is running at " + BASE_URL);
    }
    throw error;
  }
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

export const logout = async () => {
  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem("refreshToken") : null;

  const res = await fetch(`${BASE_URL}/logout`, {
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
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  return data;
};