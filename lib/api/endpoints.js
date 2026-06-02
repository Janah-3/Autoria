
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
  slots: "/bookings/slots",
  deleteSlot: (id) => `/bookings/slots/${id}`,
  blockSlot: (id) => `/bookings/slots/${id}/block`,
  
 serviceCenter: (id) => `/bookings/service-center/${id}/dashboard`,
  byUser: (userId) => `/bookings/user/${userId}`,
  status: (id) => `/bookings/${id}/status`,

  // Admin operations
  admin: "/bookings/admin",
  adminBase: "/bookings/admin",
  adminStats: "/bookings/admin/stats",
  adminById: (id) => `/bookings/admin/${id}`,
  adminCancel: (id) => `/bookings/admin/${id}/cancel`,
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
  dashboard: "/Admin/dashboard",
};

export const SPARE_PARTS_ENDPOINTS = {
  base: "/spare-parts",
  byId: (id) => `/spare-parts/${id}`,
  categories: "/spare-parts/categories",
};

export const RESERVATIONS_ENDPOINTS = {
  base: "/PartReservations",
  reserve: "/PartReservations/reserve",
  cancel: (id) => `/PartReservations/${id}/cancel`,
  pickup: (id) => `/PartReservations/${id}/pickup`,
  my: "/PartReservations/my",
  serviceCenter: "/PartReservations/service-center",
};

export const REPORTS_ENDPOINTS = {
  base: "/Reports",
  byId: (id) => `/Reports/${id}`,
  resolve: (id) => `/Reports/${id}/resolve`,
  dismiss: (id) => `/Reports/${id}/dismiss`,
};

export const CONTACT_US_ENDPOINTS = {
  base: "/contact",
  adminMessages: "/contact/admin",
  resolve: (id) => `/contact/admin/${id}/resolve`,
};

export const INVENTORY_ENDPOINTS = {
  base: "/Inventory",
  admin: "/Inventory/admin",
  adminById: (id) => `/Inventory/admin/${id}`,
  flagLowStock: (id) => `/Inventory/admin/${id}/flag-low-stock`,
  history: (id) => `/Inventory/admin/${id}/history`,
};

export const SUBSCRIPTION_ENDPOINTS = {
  plans: "/subscriptions/plans",
  status: (id) => `/subscriptions/${id}/status`,
  subscribe: (id) => `/subscriptions/${id}/subscribe`,
  cancel: (id) => `/subscriptions/${id}/cancel`,
  pay: (id) => `/subscriptions/${id}/pay`,
};

export const PREMIUM_ENDPOINTS = {
  analytics: (id) => `/service-centers/${id}/analytics`,
  promotions: (id) => `/service-centers/${id}/promotions`,
  view: (id) => `/service-centers/${id}/view`,
};

export const MILEAGE_ENDPOINTS = {
  base: "/MileageTracking",
  history: (carId) => `/MileageTracking/${carId}/history`,
  reminders: "/MileageTracking/reminders",
  reminderById: (id) => `/MileageTracking/reminders/${id}`,
};

export const PAYMENT_ENDPOINTS = {
  invoices: "/Payments/invoices",
  invoiceForBooking: (bookingId) => `/Payments/invoices/booking/${bookingId}`,
  pay: "/Payments/pay",
  confirmCash: (invoiceId) => `/Payments/${invoiceId}/confirm-cash`,
  myHistory: "/Payments/my-history",
  adminBase: "/Payments/admin",
  adminStats: "/Payments/admin/stats",
  adminRefund: (invoiceId) => `/Payments/admin/${invoiceId}/refund`,
};