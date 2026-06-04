import { apiAuthFetch } from "./client";
import { REVIEWS_ENDPOINTS } from "./endpoints";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5236/api";

/** Build auth headers for multipart requests (no Content-Type — browser sets boundary) */
function getAuthHeader() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const reviewsService = {
  /**
   * POST /Reviews — submit a new review
   * Body: multipart/form-data { ServiceCenterId, BookingId?, Rating, Comment, Photos[]? }
   */
  async submitReview(payload) {
    const formData = new FormData();
    formData.append("ServiceCenterId", payload.serviceCenterId);
    if (payload.bookingId) formData.append("BookingId", payload.bookingId);
    formData.append("Rating", String(payload.rating));
    formData.append("Comment", payload.comment);
    if (payload.photos?.length > 0) {
      payload.photos.forEach((photo) => formData.append("Photos", photo));
    }

    const res = await fetch(`${BASE_URL}${REVIEWS_ENDPOINTS.submit}`, {
      method: "POST",
      headers: getAuthHeader(),
      body: formData,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        data?.message || data?.title || `Failed to submit review (${res.status})`
      );
    }
    return data;
  },

  /**
   * GET /Reviews/mine — get all reviews written by the current user
   */
  async getMyReviews() {
    return apiAuthFetch(REVIEWS_ENDPOINTS.mine);
  },

  /**
   * DELETE /Reviews/{id} — delete a review by ID
   */
  async deleteReview(reviewId) {
    return apiAuthFetch(REVIEWS_ENDPOINTS.byId(reviewId), {
      method: "DELETE",
    });
  },

  /**
   * PUT /Reviews/{id} — edit an existing review
   * Body: multipart/form-data { Rating?, Comment?, NewPhotos? }
   */
  async editReview(reviewId, payload) {
    const formData = new FormData();
    if (payload.rating !== undefined)
      formData.append("Rating", String(payload.rating));
    if (payload.comment !== undefined)
      formData.append("Comment", payload.comment);
    if (payload.newPhotos)
      formData.append("NewPhotos", payload.newPhotos);

    const res = await fetch(`${BASE_URL}${REVIEWS_ENDPOINTS.byId(reviewId)}`, {
      method: "PUT",
      headers: getAuthHeader(),
      body: formData,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        data?.message || data?.title || `Failed to edit review (${res.status})`
      );
    }
    return data;
  },

  /**
   * GET /Reviews/service-centers/{id} — get all reviews for a service center
   */
  async getServiceCenterReviews(serviceCenterId) {
    return apiAuthFetch(REVIEWS_ENDPOINTS.forServiceCenter(serviceCenterId));
  },
};

export default reviewsService;
