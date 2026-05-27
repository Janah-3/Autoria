import { API_BASE_URL, BASE_URL } from "../apiConfig";
import { AUTH_ENDPOINTS } from "./endpoints";
import {
  apiFetch,
  saveAuthTokens,
  clearAuthTokens,
  getRoleFromToken,
} from "./client";

export const login = async (userData) => {
  const data = await apiFetch(`${API_BASE_URL}${AUTH_ENDPOINTS.login}`, {
    method: "POST",
    body: JSON.stringify({
      email: userData.email,
      password: userData.password,
    }),
  });

  saveAuthTokens(data);

  const accessToken = data.accessToken ?? data.data?.accessToken;
  const role = getRoleFromToken(accessToken) ?? data.data?.role ?? data.role;

  return { ...data, data: { ...data.data, accessToken, role } };
};

export const signup = async (userData) => {
  const data = await apiFetch(`${API_BASE_URL}${AUTH_ENDPOINTS.register}`, {
    method: "POST",
    body: JSON.stringify({
      FullName: userData.name,
      Email: userData.email,
      Password: userData.password,
      ConfirmPassword: userData.confirmPassword,
      PhoneNumber: userData.phone,
    }),
  });

  saveAuthTokens(data);
  return data;
};

export const forgotPassword = async (email) => {
  return apiFetch(`${BASE_URL}${AUTH_ENDPOINTS.forgetPass}`, {
    method: "POST",
    body: JSON.stringify({ Email: email }),
  });
};

export const resetPassword = async ({ email, token, newPassword, confirmPassword }) => {
  return apiFetch(`${BASE_URL}${AUTH_ENDPOINTS.resetPass}`, {
    method: "POST",
    body: JSON.stringify({
      email,
      token,
      newPassword,
      confirmPassword,
    }),
  });
};

export const verifyEmail = async (token, email) => {
  return apiFetch(`${BASE_URL}${AUTH_ENDPOINTS.verifyEmail}`, {
    method: "POST",
    body: JSON.stringify({ token, email }),
  });
};

export const resendVerification = async (email) => {
  return apiFetch(`${BASE_URL}${AUTH_ENDPOINTS.resendVerification}`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};

export const changePassword = async (oldPassword, newPassword, confirmPassword) => {
  return apiFetch(`${BASE_URL}${AUTH_ENDPOINTS.changePassword}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
  });
};

export const refreshAuthToken = async () => {
  const refreshToken =
    typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;

  const data = await apiFetch(`${BASE_URL}${AUTH_ENDPOINTS.refreshToken}`, {
    method: "POST",
    body: JSON.stringify({ RefreshToken: refreshToken }),
  });

  const payload = data.data ?? data;
  saveAuthTokens(payload);
  return data;
};

export const logout = async () => {
  const refreshToken =
    typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;

  try {
    const data = await apiFetch(`${BASE_URL}${AUTH_ENDPOINTS.logout}`, {
      method: "POST",
      body: JSON.stringify({ RefreshToken: refreshToken }),
    });
    clearAuthTokens();
    return data;
  } catch (error) {
    clearAuthTokens();
    throw error;
  }
};

export const addAdmin = async (adminData) => {
  return apiFetch(`${BASE_URL}${AUTH_ENDPOINTS.addAdmin}`, {
    method: "POST",
    auth: true,
    body: JSON.stringify({
      fullName: adminData.fullName,
      email: adminData.email,
      password: adminData.password,
      phoneNumber: adminData.phoneNumber,
    }),
  });
};
