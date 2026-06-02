"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { reviewsService } from "@/lib/api/reviewsService";

const StarRating = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <i 
        key={i} 
        className={`fa-solid fa-star`}
        style={{ color: i <= rating ? '#F59E0B' : '#E5E7EB', marginRight: '2px', fontSize: '14px' }}
      ></i>
    );
  }
  return <div style={{ display: 'flex' }}>{stars}</div>;
};

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await reviewsService.getMyReviews();
      setReviews(res.data || []);
    } catch (err) {
      console.error("Failed to load reviews:", err);
      setError("Failed to load your reviews. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (reviewId) => {
    if (confirm("Are you sure you want to delete this review?")) {
      try {
        await reviewsService.deleteReview(reviewId);
        alert("Review deleted successfully!");
        fetchReviews();
      } catch (err) {
        console.error("Failed to delete review:", err);
        alert("Failed to delete review. Please try again.");
      }
    }
  };

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
        
        .status-badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; }
        .status-badge.published { background: #D1FAE5; color: #059669; }
        .status-badge.pending { background: #FEF3C7; color: #D97706; }

        .card-body { padding: 24px; }
        .rating-row { margin-bottom: 16px; display: flex; align-items: center; gap: 12px; }
        .rating-text { font-size: 14px; font-weight: 700; color: #374151; }
        
        .review-text { font-size: 15px; color: #4B5563; line-height: 1.6; margin-bottom: 20px; }
        
        .center-reply { background: #F9FAFB; border-left: 3px solid #10B981; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 20px; }
        .reply-header { font-size: 13px; font-weight: 700; color: #111827; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }
        .reply-text { font-size: 14px; color: #4B5563; line-height: 1.5; }

        .review-actions { display: flex; gap: 16px; border-top: 1px solid #F3F4F6; paddingTop: 16px; padding: 16px 0 0 0; margin-top: 16px; }
        .btn-action { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 600; text-decoration: none; border: none; background: none; cursor: pointer; transition: color 0.2s; }
        .btn-edit { color: #2563EB; }
        .btn-edit:hover { color: #1D4ED8; }
        .btn-delete { color: #DC2626; }
        .btn-delete:hover { color: #B91C1C; }

        .empty-state { background: #fff; border-radius: 12px; border: 1px dashed #D1D5DB; padding: 60px 20px; text-align: center; }
        .empty-icon { font-size: 48px; color: #D1D5DB; margin-bottom: 16px; }
        .empty-title { font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 8px; }
        .empty-desc { font-size: 14px; color: #6B7280; }
        
        .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px 20px; color: #6B7280; gap: 16px; }
        .spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #E8192C; border-radius: 50%; animation: spin 1s linear infinite; }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <nav className="top-nav">
        <Link href="/user-dashboard" className="logo">Autoria</Link>
        <Link href="/user-dashboard" className="nav-back">
          <i className="fa-solid fa-arrow-left"></i> Back to Dashboard
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
            <div className="spinner"></div>
            <p>Loading your reviews...</p>
          </div>
        ) : error ? (
          <div className="empty-state" style={{ borderColor: '#FCA5A5' }}>
            <i className="fa-solid fa-circle-exclamation empty-icon" style={{ color: '#EF4444' }}></i>
            <h2 className="empty-title">{error}</h2>
            <button onClick={fetchReviews} className="btn-action btn-edit" style={{ marginTop: '12px' }}>Try Again</button>
          </div>
        ) : reviews.length > 0 ? (
          <div className="reviews-list">
            {reviews.map(review => (
              <div className="review-card" key={review.id}>
                <div className="card-header">
                  <div className="center-info">
                    <div className="center-icon"><i className="fa-solid fa-wrench"></i></div>
                    <div>
                      <div className="center-name">{review.serviceCenterName}</div>
                      <div className="review-date">
                        Posted on {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="status-badge published">
                    Published
                  </div>
                </div>
                
                <div className="card-body">
                  <div className="rating-row">
                    <StarRating rating={review.rating} />
                    <span className="rating-text">{review.rating}.0 Rating</span>
                  </div>
                  
                  <div className="review-text">
                    &ldquo;{review.comment}&rdquo;
                  </div>

                  {review.replyComment && (
                    <div className="center-reply">
                      <div className="reply-header">
                        <i className="fa-solid fa-reply" style={{color: '#10B981'}}></i> Response from {review.serviceCenterName}
                      </div>
                      <div className="reply-text">
                        &ldquo;{review.replyComment}&rdquo;
                      </div>
                    </div>
                  )}

                  <div className="review-actions">
                    <Link 
                      href={`/reviews/edit?id=${review.id}&serviceCenterName=${encodeURIComponent(review.serviceCenterName)}&rating=${review.rating}&comment=${encodeURIComponent(review.comment)}`}
                      className="btn-action btn-edit"
                    >
                      <i className="fa-solid fa-pen-to-square"></i> Edit
                    </Link>
                    <button 
                      onClick={() => handleDelete(review.id)}
                      className="btn-action btn-delete"
                    >
                      <i className="fa-solid fa-trash-can"></i> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <i className="fa-regular fa-comment-dots empty-icon"></i>
            <h2 className="empty-title">No reviews yet</h2>
            <p className="empty-desc">You haven&apos;t left any reviews for service centers. After your next booking, come back here to share your experience!</p>
          </div>
        )}
      </main>
    </div>
  );
}
