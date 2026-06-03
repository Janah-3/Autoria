import { apiAuthFetch } from "./client";
import { REVIEWS_ENDPOINTS } from "./endpoints";

export const reviewsService = {
  /**
   * POST /Reviews — submit a new review (multipart/form-data per API spec)
   */
  async submitReview(payload) {
    const formData = new FormData();
    formData.append("ServiceCenterId", payload.serviceCenterId);
    if (payload.bookingId) formData.append("BookingId", payload.bookingId);
    formData.append("Rating", String(payload.rating));
    formData.append("Comment", payload.comment);
    if (payload.photos && payload.photos.length > 0) {
      payload.photos.forEach((photo) => formData.append("Photos", photo));
    }

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5236/api"}${REVIEWS_ENDPOINTS.submit}`,
      { method: "POST", headers, body: formData }
    );

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        data?.message || data?.title || `Failed to submit review (${res.status})`
      );
    }
    return data;
  },

  /**
   * GET /Reviews/my — get all reviews by the current user
   */
  async getMyReviews() {
    return apiAuthFetch(REVIEWS_ENDPOINTS.my);
  },

  /**
   * GET /Reviews/service-center/{id} — reviews for a specific service center
   */
  async getServiceCenterReviews(serviceCenterId) {
    return apiAuthFetch(REVIEWS_ENDPOINTS.forServiceCenter(serviceCenterId));
  },

};

export default reviewsService;
