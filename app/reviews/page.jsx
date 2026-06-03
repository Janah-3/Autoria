"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { reviewsService } from "@/lib/api/reviewsService";
import { getTokenRole } from "@/lib/utils/toast";

const StarRating = ({ rating }) => (
  <div style={{ display: "flex" }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <i
        key={i}
        className="fa-solid fa-star"
        style={{ color: i <= rating ? "#F59E0B" : "#E5E7EB", marginRight: "2px", fontSize: "14px" }}
      />
    ))}
  </div>
);

/** Inline toast that sits at top of page */
const Toast = ({ show, type, message }) => (
  <div style={{
    position: "fixed", top: "24px", right: "24px", zIndex: 9999,
    transform: show ? "translateY(0)" : "translateY(-80px)",
    opacity: show ? 1 : 0,
    transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
    background: type === "success" ? "#10B981" : type === "error" ? "#EF4444" : "#F59E0B",
    color: "#fff", borderRadius: "12px", padding: "14px 20px",
    fontSize: "14px", fontWeight: 700, boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
    display: "flex", alignItems: "center", gap: "10px", maxWidth: "340px",
  }}>
    <i className={`fa-solid ${type === "success" ? "fa-circle-check" : type === "error" ? "fa-circle-xmark" : "fa-circle-exclamation"}`} />
    {message}
  </div>
);

export default function MyReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Toast state
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });
  const triggerToast = (message, type = "success") => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 4000);
  };

  // Role detection — service centers and mechanics should have appropriate back nav
  const role = getTokenRole();
  const isServiceCenter = 
    role?.toLowerCase() === "servicecenter" || 
    role?.toLowerCase() === "servicecenterowner" || 
    role?.toLowerCase() === "mechanic";

  // Back destination based on role
  const backHref = isServiceCenter ? "/service-center" : "/user-dashboard";
  const backLabel = "Back to Dashboard";

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reviewsService.getMyReviews();
      setReviews(res?.data || []);
    } catch (err) {
      console.warn("Failed to load reviews:", err);
      setError("Failed to load your reviews. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  return (
    <div className="page-container">
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .page-container { min-height: 100vh; background: #F4F7F6; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; flex-direction: column; }
        .top-nav { background: #fff; border-bottom: 2px solid #E8192C; height: 70px; padding: 0 40px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 8px rgba(232, 25, 44, 0.07); position: sticky; top: 0; z-index: 10; }
        .logo { font-size: 24px; font-weight: 900; color: #E8192C; letter-spacing: -0.5px; text-decoration: none; }
        .nav-back { font-size: 14px; font-weight: 600; color: #6B7280; text-decoration: none; display: flex; align-items: center; gap: 8px; transition: color 0.2s; }
        .nav-back:hover { color: #E8192C; }
        .content { max-width: 900px; margin: 40px auto; width: 100%; padding: 0 24px; }
        .page-header { margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end; }
        .page-title { font-size: 28px; font-weight: 800; color: #111827; margin-bottom: 4px; }
        .page-subtitle { font-size: 15px; color: #6B7280; }
        .reviews-list { display: flex; flex-direction: column; gap: 24px; }
        .review-card { background: #fff; border-radius: 12px; border: 1px solid #E5E7EB; box-shadow: 0 2px 4px rgba(0,0,0,0.02); overflow: hidden; }
        .card-header { padding: 20px 24px; border-bottom: 1px solid #F3F4F6; display: flex; justify-content: space-between; align-items: center; background: #FAFAFA; }
        .center-info { display: flex; align-items: center; gap: 12px; }
        .center-icon { width: 40px; height: 40px; background: #FEE2E2; color: #E8192C; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
        .center-name { font-size: 16px; font-weight: 700; color: #111827; }
        .review-date { font-size: 13px; color: #6B7280; }
        .status-badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; background: #D1FAE5; color: #059669; }
        .card-body { padding: 24px; }
        .rating-row { margin-bottom: 16px; display: flex; align-items: center; gap: 12px; }
        .rating-text { font-size: 14px; font-weight: 700; color: #374151; }
        .review-text { font-size: 15px; color: #4B5563; line-height: 1.6; }
        .center-reply { background: #F9FAFB; border-left: 3px solid #10B981; padding: 16px; border-radius: 0 8px 8px 0; margin-top: 20px; }
        .reply-header { font-size: 13px; font-weight: 700; color: #111827; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }
        .reply-text { font-size: 14px; color: #4B5563; line-height: 1.5; }
        .empty-state { background: #fff; border-radius: 12px; border: 1px dashed #D1D5DB; padding: 60px 20px; text-align: center; }
        .empty-icon { font-size: 48px; color: #D1D5DB; margin-bottom: 16px; }
        .empty-title { font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 8px; }
        .empty-desc { font-size: 14px; color: #6B7280; }
        .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px 20px; color: #6B7280; gap: 16px; }
        .spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #E8192C; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>

      <Toast show={toast.show} type={toast.type} message={toast.message} />

      <nav className="top-nav">
        <Link href={backHref} className="logo">Autoria</Link>
        <Link href={backHref} className="nav-back">
          <i className="fa-solid fa-arrow-left" /> {backLabel}
        </Link>
      </nav>

      <main className="content">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Reviews</h1>
            <p className="page-subtitle">Feedback you&apos;ve left for service centers.</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <p>Loading your reviews...</p>
          </div>
        ) : error ? (
          <div className="empty-state" style={{ borderColor: "#FCA5A5" }}>
            <i className="fa-solid fa-circle-exclamation empty-icon" style={{ color: "#EF4444" }} />
            <h2 className="empty-title">{error}</h2>
            <button onClick={fetchReviews} className="btn-action btn-edit" style={{ marginTop: "12px" }}>
              Try Again
            </button>
          </div>
        ) : reviews.length > 0 ? (
          <div className="reviews-list">
            {reviews.map((review) => (
              <div className="review-card" key={review.id}>
                <div className="card-header">
                  <div className="center-info">
                    <div className="center-icon"><i className="fa-solid fa-wrench" /></div>
                    <div>
                      <div className="center-name">{review.serviceCenterName}</div>
                      <div className="review-date">
                        Posted on {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="status-badge">Published</div>
                </div>

                <div className="card-body">
                  <div className="rating-row">
                    <StarRating rating={review.rating} />
                    <span className="rating-text">{review.rating}.0 Rating</span>
                  </div>

                  <div className="review-text">&ldquo;{review.comment}&rdquo;</div>

                  {review.replyComment && (
                    <div className="center-reply">
                      <div className="reply-header">
                        <i className="fa-solid fa-reply" style={{ color: "#10B981" }} />
                        Response from {review.serviceCenterName}
                      </div>
                      <div className="reply-text">&ldquo;{review.replyComment}&rdquo;</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <i className="fa-regular fa-comment-dots empty-icon" />
            <h2 className="empty-title">No reviews yet</h2>
            <p className="empty-desc">
              You haven&apos;t left any reviews for service centers. After your next booking, come back here to share your experience!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
