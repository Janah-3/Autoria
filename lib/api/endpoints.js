
export const AUTH_ENDPOINTS = {
  login: "/Auth/login",
  register: "/Auth/register",
  forgetPass: "/forgetPass",
  resetPass: "/ResetPass",
  logout: "/logout",
  verifyEmail: "/api/auth/verify-email",
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
  // Booking operations
  base: "/Bookings",
  byId: (id) => `/Bookings/${id}`,
  confirm: (id) => `/Bookings/${id}/confirm`,
  complete: (id) => `/Bookings/${id}/complete`,
  cancel: (id) => `/Bookings/${id}/cancel`,
  reschedule: (id) => `/Bookings/${id}/reschedule`,

  // Time slot operations
  slots: "/Bookings/slots",
  deleteSlot: (id) => `/Bookings/slots/${id}`,
  blockSlot: (id) => `/Bookings/slots/${id}/block`,

  // Admin operations
  admin: "/Bookings/admin",
  adminStats: "/Bookings/admin/stats",
  adminById: (id) => `/Bookings/admin/${id}`,
  adminCancel: (id) => `/Bookings/admin/${id}/cancel`,
};

export const SERVICE_CENTER_ENDPOINTS = {
  base: "/ServiceCenters",
  my: "/ServiceCenters/my",
  myDocuments: "/ServiceCenters/my/documents",
  myServiceTypes: "/ServiceCenters/my/service-types",
  myCarBrands: "/ServiceCenters/my/car-brands",
  myOperatingHours: "/ServiceCenters/my/operating-hours",
  myPhotos: "/ServiceCenters/my/photos",
  mySubmit: "/ServiceCenters/my/submit",
  myLocation: "/ServiceCenters/my/location",
  pending: "/ServiceCenters/pending",
  match: "/ServiceCenters/match",
  byId: (id) => `/ServiceCenters/${id}`,
  approve: (id) => `/ServiceCenters/${id}/approve`,
  reject: (id) => `/ServiceCenters/${id}/reject`,
};

export const ADMIN_ENDPOINTS = {
  dashboard: "/admin/dashboard",
};

export const SPARE_PARTS_ENDPOINTS = {
  base: "/SpareParts",
  byId: (id) => `/SpareParts/${id}`,
  categories: "/SpareParts/categories",
};
