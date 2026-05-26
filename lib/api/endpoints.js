
export const AUTH_ENDPOINTS = {
  login: "/Auth/login",
  register: "/Auth/register",
  forgetPass: "/forgetPass",
  resetPass: "/ResetPass",
  logout: "/logout",
  verifyEmail: "/verify-email",
  resendVerification: "/resend-verification",
  changePassword: "/changePassword",
  refreshToken: "/refresh-token",
  addAdmin: "/AddAdmin",
};

export const USERS_ENDPOINTS = {
  base: "/Users",
  me: "/Users/me",
  myLocation: "/Users/my/location",
  byId: (id) => `/Users/${id}`,
  ban: (id) => `/Users/${id}/Ban`,
  unban: (id) => `/Users/${id}/Unban`,
};

export const CARS_ENDPOINTS = {
  base: "/Cars",
  byId: (id) => `/Cars/${id}`,
  byUser: (userId) => `/Cars/user/${userId}`,
};

export const BOOKINGS_ENDPOINTS = {
  base: "/Bookings",
  blockSlot: "/Bookings/slots/block",
  serviceCenter: "/Bookings/service-center",
  byUser: (userId) => `/Bookings/user/${userId}`,
  status: (id) => `/Bookings/${id}/status`,
};

export const SERVICE_CENTER_ENDPOINTS = {
  base: "/service-centers",
  my: "/service-centers/my",
  myDocuments: "/service-centers/my/documents",
  myServiceTypes: "/service-centers/my/service-types",
  myCarBrands: "/service-centers/my/car-brands",
  myOperatingHours: "/service-centers/my/operating-hours",
  myPhotos: "/service-centers/my/photos",
  mySubmit: "/service-centers/my/submit",
  myLocation: "/service-centers/my/location",
  pending: "/service-centers/pending",
  match: "/service-centers/match",
  byId: (id) => `/service-centers/${id}`,
  approve: (id) => `/service-centers/${id}/approve`,
  reject: (id) => `/service-centers/${id}/reject`,
};

export const ADMIN_ENDPOINTS = {
  dashboard: "/admin/dashboard",
};

export const SPARE_PARTS_ENDPOINTS = {
  base: "/SpareParts",
  byId: (id) => `/SpareParts/${id}`,
  categories: "/SpareParts/categories",
};
