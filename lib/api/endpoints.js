
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
  base: "/Bookings",
  blockSlot: "/Bookings/slots/block",
  serviceCenter: "/Bookings/service-center",
  byUser: (userId) => `/Bookings/user/${userId}`,
  status: (id) => `/Bookings/${id}/status`,
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
export const MECHANICS_ENDPOINTS = {
  base: "/Mechanics",
  pending: "/Mechanics/pending",
  myProfile: "/Mechanics/my/profile",
  myEarnings: "/Mechanics/my/earnings",
  byId: (id) => `/Mechanics/${id}`,
  approve: (id) => `/Mechanics/${id}/approve`,
  reject: (id) => `/Mechanics/${id}/reject`,
};

export const JOB_REQUESTS_ENDPOINTS = {
  base: "/job-requests",
  my: "/job-requests/my",
  myJobs: "/job-requests/my-jobs",
  byId: (id) => `/job-requests/${id}`,
  accept: (id) => `/job-requests/${id}/accept`,
  reject: (id) => `/job-requests/${id}/reject`,
  complete: (id) => `/job-requests/${id}/complete`,
  cancel: (id) => `/job-requests/${id}/cancel`,
  create: (mechanicId) => `/Mechanics/${mechanicId}/job-requests`,
};

export const REVIEWS_ENDPOINTS = {
  base: "/Reviews",
};

export const AUTH_ENDPOINTS_V2 = {
  registerCarOwner: "/Auth/register/car-owner",
  registerMechanic: "/Auth/register/mechanic",
};