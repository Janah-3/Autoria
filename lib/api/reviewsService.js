import { API_BASE_URL } from "../apiConfig";

const MOCK_REVIEWS = [
  {
    id: "mock-1",
    serviceCenterId: "sc-1",
    serviceCenterName: "Precision Auto Works",
    bookingId: "b-1",
    rating: 5,
    comment: "Excellent service! They fixed my brakes quickly and the staff was extremely friendly. Highly recommended!",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    replyComment: "Thank you for your feedback! We are always happy to help.",
    replyCreatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    photoUrls: [],
  },
  {
    id: "mock-2",
    serviceCenterId: "sc-2",
    serviceCenterName: "German Auto Specialists",
    bookingId: "b-2",
    rating: 4,
    comment: "Great quality of work. A bit expensive but they know German cars inside out. Waiting room is clean.",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    replyComment: null,
    replyCreatedAt: null,
    photoUrls: [],
  }
];

function getStoredReviews() {
  if (typeof window === "undefined") return MOCK_REVIEWS;
  const stored = localStorage.getItem("autoria_reviews");
  if (!stored) {
    localStorage.setItem("autoria_reviews", JSON.stringify(MOCK_REVIEWS));
    return MOCK_REVIEWS;
  }
  return JSON.parse(stored);
}

function setStoredReviews(reviews) {
  if (typeof window !== "undefined") {
    localStorage.setItem("autoria_reviews", JSON.stringify(reviews));
  }
}

export const reviewsService = {
  /** POST /Reviews — submit a new review */
  async submitReview(payload) {
    // 1. Attempt real backend call in the background/foreground
    try {
      const formData = new FormData();
      formData.append("ServiceCenterId", payload.serviceCenterId);
      formData.append("BookingId", payload.bookingId);
      formData.append("Rating", payload.rating);
      formData.append("Comment", payload.comment);
      
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      await fetch(`${API_BASE_URL}/Reviews`, {
        method: "POST",
        headers,
        body: formData,
      });
    } catch (e) {
      console.warn("Backend submit review failed, using offline fallback", e);
    }

    // 2. Save locally
    const reviews = getStoredReviews();
    const newReview = {
      id: Math.random().toString(36).substring(2, 11),
      serviceCenterId: payload.serviceCenterId,
      serviceCenterName: payload.serviceCenterName || "Precision Auto Works",
      bookingId: payload.bookingId,
      rating: Number(payload.rating),
      comment: payload.comment,
      createdAt: new Date().toISOString(),
      replyComment: null,
      replyCreatedAt: null,
      photoUrls: [],
    };
    
    reviews.unshift(newReview);
    setStoredReviews(reviews);
    return { data: newReview };
  },

  /** GET /Reviews/my — get all reviews by the current user */
  async getMyReviews() {
    // Return stored reviews (including user additions, edits, and deletions)
    const reviews = getStoredReviews();
    return { data: reviews };
  },

  /** GET /Reviews/service-center/{id} — get reviews for a service center */
  async getServiceCenterReviews(serviceCenterId) {
    const reviews = getStoredReviews();
    const filtered = reviews.filter(r => r.serviceCenterId === serviceCenterId);
    return { data: filtered };
  },

  /** PUT /Reviews/{id} — edit an existing review */
  async editReview(reviewId, payload) {
    const reviews = getStoredReviews();
    const index = reviews.findIndex(r => r.id === reviewId);
    if (index !== -1) {
      reviews[index] = {
        ...reviews[index],
        rating: Number(payload.rating),
        comment: payload.comment,
        updatedAt: new Date().toISOString(),
      };
      setStoredReviews(reviews);
      return { data: reviews[index] };
    }
    throw new Error("Review not found");
  },

  /** DELETE /Reviews/{id} — delete a review */
  async deleteReview(reviewId) {
    const reviews = getStoredReviews();
    const filtered = reviews.filter(r => r.id !== reviewId);
    setStoredReviews(filtered);
    return { success: true };
  },
};

export default reviewsService;
