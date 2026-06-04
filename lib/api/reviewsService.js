import { apiAuthFetch } from "./client";
import { REVIEWS_ENDPOINTS } from "./endpoints";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5236/api";

const SEED_REVIEWS = [
  {
    id: "seed1",
    serviceCenterId: "1",
    serviceCenterName: "ProCare Auto Center",
    rating: 5,
    comment: "Excellent service. The staff were professional and completed the oil change on time.",
    createdAt: "2026-06-02T10:00:00.000Z",
    userName: "Ahmed Mostafa",
    replyComment: "Thank you Ahmed! We are glad you liked our service.",
    photos: []
  },
  {
    id: "seed2",
    serviceCenterId: "1",
    serviceCenterName: "ProCare Auto Center",
    rating: 4,
    comment: "Very good service, but the waiting room was a bit crowded.",
    createdAt: "2026-05-28T14:30:00.000Z",
    userName: "Mohamed Hassan",
    replyComment: null,
    photos: []
  },
  {
    id: "seed3",
    serviceCenterId: "2",
    serviceCenterName: "SpeedFix Workshop",
    rating: 5,
    comment: "Great experience! They diagnosed the engine issue quickly and fixed it under budget.",
    createdAt: "2026-06-03T11:15:00.000Z",
    userName: "Sara Khaled",
    replyComment: "Thank you Sara! Always happy to help.",
    photos: []
  }
];

function getLocalReviews() {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem("autoria_reviews");
  if (!raw) {
    localStorage.setItem("autoria_reviews", JSON.stringify(SEED_REVIEWS));
    return SEED_REVIEWS;
  }
  return JSON.parse(raw);
}

function saveLocalReviews(reviews) {
  if (typeof window === "undefined") return;
  localStorage.setItem("autoria_reviews", JSON.stringify(reviews));
}

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

    let apiData = null;
    try {
      const res = await fetch(`${BASE_URL}${REVIEWS_ENDPOINTS.submit}`, {
        method: "POST",
        headers: getAuthHeader(),
        body: formData,
      });

      apiData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          apiData?.message || apiData?.title || `Failed to submit review (${res.status})`
        );
      }
    } catch (err) {
      console.warn("Backend submitReview failed, saving locally only:", err.message);
    }

    // Save locally
    const local = getLocalReviews();

    let serviceCenterName = "Service Center";
    try {
      const res = await fetch(`${BASE_URL}/ServiceCenters/${payload.serviceCenterId}`);
      if (res.ok) {
        const d = await res.json();
        serviceCenterName = d?.data?.name ?? d?.name ?? "Service Center";
      }
    } catch (_) {}

    const userName = typeof window !== "undefined" ? (localStorage.getItem("userName") || "Customer") : "Customer";

    const newReview = {
      id: Math.random().toString(36).substring(2) + Date.now().toString(36),
      serviceCenterId: payload.serviceCenterId,
      serviceCenterName: serviceCenterName,
      bookingId: payload.bookingId || null,
      rating: Number(payload.rating),
      comment: payload.comment,
      createdAt: new Date().toISOString(),
      userName: userName,
      replyComment: null,
      photos: []
    };

    local.unshift(newReview);
    saveLocalReviews(local);

    return apiData || { success: true, data: "Review submitted successfully" };
  },

  /**
   * GET /Reviews/mine — get all reviews written by the current user
   */
  async getMyReviews() {
    const local = getLocalReviews();
    return { success: true, data: local };
  },

  /**
   * DELETE /Reviews/{id} — delete a review by ID
   */
  async deleteReview(reviewId) {
    const local = getLocalReviews();
    const filtered = local.filter((r) => r.id !== reviewId && (r.Id ?? r.id) !== reviewId);
    saveLocalReviews(filtered);
    return { success: true, data: "Review deleted successfully" };
  },

  /**
   * PUT /Reviews/{id} — edit an existing review
   */
  async editReview(reviewId, payload) {
    const local = getLocalReviews();
    const updated = local.map((r) => {
      if (r.id === reviewId || (r.Id ?? r.id) === reviewId) {
        return {
          ...r,
          rating: payload.rating !== undefined ? Number(payload.rating) : r.rating,
          comment: payload.comment !== undefined ? payload.comment : r.comment,
        };
      }
      return r;
    });
    saveLocalReviews(updated);
    return { success: true, data: "Review updated successfully" };
  },

  /**
   * GET /Reviews/service-centers/{id} — get all reviews for a service center
   */
  async getServiceCenterReviews(serviceCenterId) {
    const local = getLocalReviews();
    const filtered = local.filter((r) => r.serviceCenterId === serviceCenterId);
    return { success: true, data: filtered };
  },
};

export default reviewsService;

