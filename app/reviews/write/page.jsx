"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { reviewsService } from "@/lib/api/reviewsService";

const Toast = ({ show, type, message }) => (
  <div style={{
    position: "fixed", top: "24px", right: "24px", zIndex: 9999,
    transform: show ? "translateY(0)" : "translateY(-80px)",
    opacity: show ? 1 : 0,
    transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
    background: type === "success" ? "#10B981" : "#EF4444",
    color: "#fff", borderRadius: "12px", padding: "14px 20px",
    fontSize: "14px", fontWeight: 700, boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
    display: "flex", alignItems: "center", gap: "10px", maxWidth: "340px",
  }}>
    <i className={`fa-solid ${type === "success" ? "fa-circle-check" : "fa-circle-xmark"}`} />
    {message}
  </div>
);

const StarSelector = ({ label, rating, onRatingChange }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="star-selector-group">
      <div className="star-label">{label}</div>
      <div className="stars-container" onMouseLeave={() => setHoverRating(0)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className={`fa-solid fa-star star-icon ${(hoverRating || rating) >= star ? 'active' : ''}`}
            onMouseEnter={() => setHoverRating(star)}
            onClick={() => onRatingChange(star)}
          ></i>
        ))}
      </div>
    </div>
  );
};

export default function WriteReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get context from URL params (passed from booking details)
  const serviceCenterId = searchParams.get("serviceCenterId");
  const serviceCenterName = searchParams.get("serviceCenterName") || "this service center";
  const bookingId = searchParams.get("bookingId");

  const [mainRating, setMainRating] = useState(0);
  const [subRatings, setSubRatings] = useState({ quality: 0, value: 0, waitTime: 0, staff: 0 });
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });
  const triggerToast = (message, type = "success") => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 4000);
  };

  const handleSubRating = (key, value) => {
    setSubRatings(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (serviceCenterId) {
        await reviewsService.submitReview({
          serviceCenterId,
          bookingId,
          rating: mainRating,
          comment: reviewText,
        });
      }
      triggerToast("Review submitted! Thank you for your feedback.", "success");
      setTimeout(() => router.push("/user-dashboard"), 1500);
    } catch (err) {
      console.error("Review submit failed:", err);
      triggerToast(err.message || "Failed to submit review. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = mainRating > 0 && reviewText.length > 10;

  return (
    <div className="page-container">
      <Toast show={toast.show} type={toast.type} message={toast.message} />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .page-container { min-height: 100vh; background: #F4F7F6; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; flex-direction: column; }
        
        .top-nav { background: #fff; border-bottom: 2px solid #E8192C; height: 70px; padding: 0 40px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 8px rgba(232, 25, 44, 0.07); }
        .logo { font-size: 24px; font-weight: 900; color: #E8192C; letter-spacing: -0.5px; text-decoration: none; }
        .nav-back { font-size: 14px; font-weight: 600; color: #6B7280; text-decoration: none; display: flex; align-items: center; gap: 8px; }
        .nav-back:hover { color: #E8192C; }

        .content { max-width: 800px; margin: 40px auto; width: 100%; padding: 0 24px; }
        .page-header { margin-bottom: 32px; text-align: center; }
        .page-title { font-size: 28px; font-weight: 800; color: #111827; margin-bottom: 8px; }
        .page-subtitle { font-size: 16px; color: #6B7280; }
        .center-highlight { color: #E8192C; font-weight: 700; }

        .review-card { background: #fff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); padding: 40px; }
        
        .section-title { font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 16px; border-bottom: 1px solid #E5E7EB; padding-bottom: 12px; }

        /* Main Rating */
        .main-rating-box { display: flex; flex-direction: column; align-items: center; margin-bottom: 40px; }
        .main-rating-label { font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 16px; }
        .stars-container { display: flex; gap: 8px; cursor: pointer; }
        .star-icon { font-size: 32px; color: #E5E7EB; transition: color 0.2s, transform 0.1s; }
        .star-icon.active { color: #F59E0B; }
        .star-icon:active { transform: scale(0.9); }

        /* Sub Ratings */
        .sub-ratings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 40px; }
        .star-selector-group { display: flex; flex-direction: column; gap: 8px; }
        .star-label { font-size: 14px; font-weight: 600; color: #4B5563; }
        .star-selector-group .star-icon { font-size: 24px; }

        /* Text Review */
        .review-textarea-group { margin-bottom: 32px; }
        .textarea-label { display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px; }
        .review-textarea { width: 100%; height: 160px; padding: 16px; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 15px; font-family: inherit; resize: vertical; outline: none; transition: border-color 0.2s; }
        .review-textarea:focus { border-color: #E8192C; box-shadow: 0 0 0 3px rgba(232, 25, 44, 0.1); }
        .textarea-hint { font-size: 12px; color: #9CA3AF; margin-top: 6px; }

        /* Actions */
        .actions-bar { display: flex; justify-content: flex-end; gap: 16px; border-top: 1px solid #E5E7EB; padding-top: 24px; }
        .btn { padding: 12px 24px; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; border: none; }
        .btn-cancel { background: #fff; color: #374151; border: 1px solid #D1D5DB; }
        .btn-cancel:hover { background: #F3F4F6; }
        .btn-submit { background: #E8192C; color: #fff; }
        .btn-submit:hover { background: #C8001E; }
        .btn-submit:disabled { background: #FCA5A5; cursor: not-allowed; }
      `}</style>

      <nav className="top-nav">
        <Link href="/user-dashboard" className="logo">Autoria</Link>
        <Link href="/bookings" className="nav-back">
          <i className="fa-solid fa-arrow-left"></i> Back to Bookings
        </Link>
      </nav>

      <main className="content">
        <div className="page-header">
          <h1 className="page-title">Rate your experience</h1>
          <p className="page-subtitle">How was your service at <span className="center-highlight">{serviceCenterName}</span>?</p>
        </div>

        <div className="review-card">
          <div className="main-rating-box">
            <div className="main-rating-label">Overall Rating</div>
            <div className="stars-container">
              {[1, 2, 3, 4, 5].map((star) => (
                <i
                  key={star}
                  className={`fa-solid fa-star star-icon ${mainRating >= star ? 'active' : ''}`}
                  onClick={() => setMainRating(star)}
                ></i>
              ))}
            </div>
          </div>

          <h2 className="section-title">Detailed Feedback</h2>
          <div className="sub-ratings-grid">
            <StarSelector label="Quality of Work" rating={subRatings.quality} onRatingChange={(val) => handleSubRating('quality', val)} />
            <StarSelector label="Value for Money" rating={subRatings.value} onRatingChange={(val) => handleSubRating('value', val)} />
            <StarSelector label="Wait Time" rating={subRatings.waitTime} onRatingChange={(val) => handleSubRating('waitTime', val)} />
            <StarSelector label="Staff Professionalism" rating={subRatings.staff} onRatingChange={(val) => handleSubRating('staff', val)} />
          </div>

          <div className="review-textarea-group">
            <label className="textarea-label">Write your review</label>
            <textarea 
              className="review-textarea"
              placeholder="Tell others about your experience. What did they do well? What could be improved?"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            ></textarea>
            <p className="textarea-hint">Minimum 10 characters.</p>
          </div>

          <div className="actions-bar">
            <Link href="/bookings" className="btn btn-cancel">Cancel</Link>
            <button
              className="btn btn-submit"
              disabled={!isFormValid || submitting}
              onClick={handleSubmit}
            >
              {submitting ? "Submitting..." : "⭐ Submit Review"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
