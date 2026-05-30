
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
  
  serviceCenter: "/Bookings/service-center",
  byUser: (userId) => `/Bookings/user/${userId}`,
  status: (id) => `/Bookings/${id}/status`,

  // Admin operations
  admin: "/Bookings/admin",
  adminBase: "/Bookings/admin",
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
  base: "/Spare-Parts",
  byId: (id) => `/Spare-Parts/${id}`,
  categories: "/Spare-Parts/categories",
};

export const INVENTORY_ENDPOINTS = {
  base: "/Inventory",
  admin: "/Inventory/admin",
  adminById: (id) => `/Inventory/admin/${id}`,
  flagLowStock: (id) => `/Inventory/admin/${id}/flag-low-stock`,
  history: (id) => `/Inventory/admin/${id}/history`,
};
