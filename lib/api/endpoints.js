
export const AUTH_ENDPOINTS = {
  login: "/Auth/login",
  register: "/Auth/register",
  forgetPass: "/Auth/forgetPass",
  resetPass: "/Auth/resetPass",
  logout: "/Auth/logout",
  verifyEmail: "/Auth/verify-email",
  resendVerification: "/Auth/resend-verification",
  changePassword: "/Auth/changePassword",
  refreshToken: "/Auth/refresh-token",
  addAdmin: "/Auth/AddAdmin",
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
  slots: "/Bookings/slots",
  blockSlot: (slotId) => `/Bookings/slots/${slotId}/block`,
  deleteSlot: (slotId) => `/Bookings/slots/${slotId}`,
  
  byId: (id) => `/Bookings/${id}`,
  cancel: (id) => `/Bookings/${id}/cancel`,
  reschedule: (id) => `/Bookings/${id}/reschedule`,
  confirm: (id) => `/Bookings/${id}/confirm`,
  complete: (id) => `/Bookings/${id}/complete`,
  
  serviceCenter: "/Bookings/service-center",
  byUser: (userId) => `/Bookings/user/${userId}`,
  status: (id) => `/Bookings/${id}/status`,

  // Admin routes
  adminBase: "/Bookings/admin",
  adminById: (id) => `/Bookings/admin/${id}`,
  adminCancel: (id) => `/Bookings/admin/${id}/cancel`,
  adminStats: "/Bookings/admin/stats",
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
