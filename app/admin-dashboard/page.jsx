"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { adminService } from "@/lib/api/adminService";

const mapReportToReview = (r) => ({
  id: r.reportId,
  user: r.reportedBy,
  center: r.targetName,
  centerType: `${r.targetType} — ${r.reason}`,
  car: "—",
  bookingDate: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—",
  timeAgo: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—",
  status: r.status,
  statusColor: r.isUrgent ? "#EF4444" : "#F59E0B",
  rating: 0,
  ratingText: r.reason,
  snippet: `${r.reason} report on ${r.targetName}`,
  fullText: `Reported by ${r.reportedBy}. Status: ${r.status}. Target: ${r.targetType}.`,
  subRatings: { quality: 0, value: 0, waitTime: 0, staff: 0 },
});

const StarRating = ({ rating, size = "small" }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <i 
        key={i} 
        className={`fa-solid fa-star ${i <= rating ? 'active-star' : 'inactive-star'}`}
        style={{ 
          fontSize: size === 'small' ? '12px' : '16px',
          color: i <= rating ? '#F59E0B' : '#E5E7EB',
          marginRight: '2px'
        }}
      ></i>
    );
  }
  return <div style={{ display: 'flex' }}>{stars}</div>;
};

export default function ReviewsInboxPage() {
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [adminNote, setAdminNote] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getDashboard()
      .then((res) => {
        const mapped = (res?.data?.recentReports || []).map(mapReportToReview);
        setReviews(mapped);
        if (mapped.length) setSelectedReview(mapped[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filters = [`All (${reviews.length})`, "Pending", "UnderReview"];

  return (
    <div className="admin-layout">
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .admin-layout { display: flex; height: 100vh; background: #F9FAFB; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; overflow: hidden; }

        /* Sidebar */
        .sidebar { width: 260px; background: #fff; border-right: 1px solid #E5E7EB; display: flex; flex-direction: column; flex-shrink: 0; }
        .sidebar-logo { padding: 24px; font-size: 18px; font-weight: 800; color: #111827; border-bottom: 1px solid #E5E7EB; }
        .sidebar-menu { padding: 20px 12px; display: flex; flex-direction: column; gap: 4px; overflow-y: auto; }
        .menu-label { font-size: 11px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.5px; padding: 0 12px; margin-bottom: 8px; }
        .menu-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 8px; font-size: 14px; font-weight: 600; color: #4B5563; text-decoration: none; transition: all 0.2s; }
        .menu-item i { width: 20px; text-align: center; font-size: 16px; }
        .menu-item:hover { background: #F3F4F6; color: #111827; }
        .menu-item.active { background: #ECFDF5; color: #10B981; }

        /* Topbar Global */
        .topbar { height: 64px; background: #fff; border-bottom: 1px solid #E5E7EB; display: flex; align-items: center; justify-content: flex-end; padding: 0 32px; width: 100%; }
        .admin-user { display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 600; color: #374151; }
        .admin-avatar { width: 32px; height: 32px; background: #3B82F6; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; }

        /* Layout structure */
        .content-wrapper { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .split-view { display: flex; flex: 1; overflow: hidden; }

        /* Left Column - List */
        .reviews-list-col { width: 380px; background: #fff; border-right: 1px solid #E5E7EB; display: flex; flex-direction: column; flex-shrink: 0; }
        .list-header { padding: 24px; border-bottom: 1px solid #E5E7EB; }
        .list-title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .list-title h1 { font-size: 18px; font-weight: 800; color: #111827; }
        .pending-badge { background: #FEF3C7; color: #D97706; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; }
        
        .search-box { position: relative; margin-bottom: 16px; }
        .search-box i { position: absolute; left: 12px; top: 10px; color: #9CA3AF; font-size: 14px; }
        .search-box input { width: 100%; padding: 8px 12px 8px 36px; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 14px; outline: none; }
        .search-box input:focus { border-color: #10B981; }

        .filters { display: flex; gap: 8px; }
        .filter-chip { padding: 6px 14px; border: 1px solid #E5E7EB; border-radius: 20px; font-size: 12px; font-weight: 600; color: #4B5563; background: #fff; cursor: pointer; }
        .filter-chip.active { border-color: #10B981; color: #10B981; background: #ECFDF5; }

        .reviews-scroll { flex: 1; overflow-y: auto; }
        .review-item { padding: 20px 24px; border-bottom: 1px solid #E5E7EB; cursor: pointer; border-left: 3px solid transparent; transition: background 0.2s; }
        .review-item:hover { background: #F9FAFB; }
        .review-item.selected { background: #F9FAFB; border-left-color: #10B981; }
        
        .item-head { display: flex; justify-content: space-between; margin-bottom: 4px; }
        .item-user { font-weight: 700; font-size: 14px; color: #111827; }
        .item-time { font-size: 12px; color: #9CA3AF; }
        .item-center { font-size: 13px; color: #6B7280; margin-bottom: 8px; }
        .item-snippet { font-size: 13px; color: #4B5563; margin-bottom: 12px; line-height: 1.4; }
        
        .status-pill { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }
        .status-pill.orange { background: #FEF3C7; color: #D97706; }
        .status-pill.red { background: #FEE2E2; color: #DC2626; }
        .status-pill.green { background: #D1FAE5; color: #059669; }

        /* Right Column - Detail */
        .review-detail-col { flex: 1; overflow-y: auto; padding: 40px; background: #F9FAFB; }
        .detail-card { background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-bottom: 24px; }
        
        .detail-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
        .reviewer-info { display: flex; gap: 16px; align-items: center; }
        .reviewer-avatar { width: 48px; height: 48px; background: #E5E7EB; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; color: #10B981; }
        .reviewer-name { font-size: 18px; font-weight: 800; color: #111827; margin-bottom: 4px; }
        .reviewer-meta { font-size: 13px; color: #6B7280; }
        
        .center-box { background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 16px; margin-bottom: 24px; display: flex; align-items: flex-start; gap: 12px; }
        .center-box i { color: #9CA3AF; margin-top: 2px; }
        .center-name { font-weight: 700; font-size: 14px; color: #111827; }
        .center-desc { font-size: 13px; color: #6B7280; }

        .main-review { border: 1px solid #E5E7EB; border-radius: 8px; padding: 24px; margin-bottom: 24px; }
        .rating-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .rating-score { font-size: 16px; font-weight: 800; color: #111827; }
        .review-text { font-size: 14px; color: #374151; line-height: 1.6; margin-bottom: 24px; }
        
        .photo-grid { display: flex; gap: 12px; }
        .photo-box { width: 80px; height: 60px; background: #E5E7EB; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #9CA3AF; font-size: 20px; }

        .sub-ratings { display: flex; justify-content: space-between; border-top: 1px solid #E5E7EB; padding-top: 24px; }
        .sub-rating-item { text-align: center; }
        .sub-rating-label { font-size: 12px; font-weight: 600; color: #6B7280; margin-bottom: 8px; text-transform: uppercase; }

        .action-buttons { display: flex; gap: 12px; margin-bottom: 40px; }
        .btn { padding: 10px 16px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .btn-green { background: #10B981; color: #fff; border: 1px solid #10B981; }
        .btn-green:hover { background: #059669; }
        .btn-outline-red { background: #fff; color: #EF4444; border: 1px solid #EF4444; }
        .btn-outline { background: #fff; color: #374151; border: 1px solid #D1D5DB; }
        .btn-outline:hover { background: #F9FAFB; }

        /* Admin Reply Section */
        .reply-section h3 { font-size: 16px; font-weight: 800; color: #111827; margin-bottom: 8px; }
        .reply-desc { font-size: 13px; color: #6B7280; margin-bottom: 16px; }
        .reply-textarea { width: 100%; height: 120px; padding: 16px; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 14px; font-family: inherit; resize: none; margin-bottom: 16px; outline: none; }
        .reply-textarea:focus { border-color: #10B981; }
        .reply-actions { display: flex; gap: 12px; }
      `}</style>

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">Autoria admin</div>
        <div className="sidebar-menu">
          <div className="menu-label">Menu</div>
          <Link href="/admin-dashboard" className="menu-item">
            <i className="fa-solid fa-chart-pie" style={{ color: "#10B981" }}></i> Dashboard
          </Link>
          <Link href="#" className="menu-item">
            <i className="fa-solid fa-star" style={{ color: "#FBBF24" }}></i> Review moderation
          </Link>
          <Link href="#" className="menu-item">
            <i className="fa-solid fa-flag" style={{ color: "#EF4444" }}></i> User reports
          </Link>
          <Link href="#" className="menu-item">
            <i className="fa-solid fa-bullhorn" style={{ color: "#EC4899" }}></i> Featured listings
          </Link>
          <Link href="#" className="menu-item">
            <i className="fa-solid fa-tags" style={{ color: "#F59E0B" }}></i> Services & pricing
          </Link>
          <Link href="/admin-dashboard/reviews-inbox" className="menu-item active">
            <i className="fa-solid fa-inbox" style={{ color: "#10B981" }}></i> Reviews inbox
          </Link>
          <Link href="#" className="menu-item">
            <i className="fa-solid fa-check-circle" style={{ color: "#14B8A6" }}></i> Center verification
          </Link>
          <Link href="#" className="menu-item">
            <i className="fa-solid fa-chart-bar" style={{ color: "#8B5CF6" }}></i> Platform analytics
          </Link>
        </div>
      </aside>

      <div className="content-wrapper">
        {/* TOPBAR */}
        <header className="topbar">
          <div className="admin-user">
            Admin user
            <div className="admin-avatar">AU</div>
          </div>
        </header>

        <div className="split-view">
          {/* LEFT COLUMN: LIST */}
          <div className="reviews-list-col">
            <div className="list-header">
              <div className="list-title">
                <h1>Reviews inbox</h1>
                <span className="pending-badge">12 pending</span>
              </div>
              <div className="search-box">
                <i className="fa-solid fa-search"></i>
                <input type="text" placeholder="Search reviews..." />
              </div>
              <div className="filters">
                {filters.map(f => (
                  <button 
                    key={f}
                    className={`filter-chip ${activeFilter === f ? 'active' : ''}`}
                    onClick={() => setActiveFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="reviews-scroll">
              {loading ? (
                <p style={{ padding: 20, color: '#6B7280' }}>Loading reports…</p>
              ) : reviews.length === 0 ? (
                <p style={{ padding: 20, color: '#6B7280' }}>No open reports.</p>
              ) : reviews.map(review => (
                <div 
                  key={review.id} 
                  className={`review-item ${selectedReview.id === review.id ? 'selected' : ''}`}
                  onClick={() => setSelectedReview(review)}
                >
                  <div className="item-head">
                    <span className="item-user">
                      {review.status === "Flagged" && <div style={{display:'inline-block', width:'6px',height:'6px',borderRadius:'50%',background:'#EF4444',marginRight:'6px'}}></div>}
                      {review.status === "Pending reply" && <div style={{display:'inline-block', width:'6px',height:'6px',borderRadius:'50%',background:'#F59E0B',marginRight:'6px'}}></div>}
                      {review.user}
                    </span>
                    <span className="item-time">{review.timeAgo}</span>
                  </div>
                  <div className="item-center">{review.center}</div>
                  <div style={{ marginBottom: '8px' }}>
                    <StarRating rating={review.rating} />
                  </div>
                  <div className="item-snippet">"{review.snippet}"</div>
                  <div>
                    <span className={`status-pill ${review.status === 'Flagged' ? 'red' : review.status === 'Replied' ? 'green' : 'orange'}`}>
                      {review.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: DETAIL */}
          <div className="review-detail-col">
            {!selectedReview ? (
              <p style={{ padding: 24, color: '#6B7280' }}>Select a report to view details.</p>
            ) : (
            <div className="detail-card">
              <div className="detail-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">
                    {selectedReview.user.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="reviewer-name">{selectedReview.user}</div>
                    <div className="reviewer-meta">{selectedReview.car} • Verified booking • {selectedReview.bookingDate}</div>
                  </div>
                </div>
                <span className={`status-pill ${selectedReview.status === 'Flagged' ? 'red' : selectedReview.status === 'Replied' ? 'green' : 'orange'}`}>
                  {selectedReview.status}
                </span>
              </div>

              <div className="center-box">
                <i className="fa-solid fa-wrench"></i>
                <div>
                  <div className="center-name">{selectedReview.center}</div>
                  <div className="center-desc">{selectedReview.centerType}</div>
                </div>
              </div>

              <div className="main-review">
                <div className="rating-header">
                  <StarRating rating={selectedReview.rating} size="large" />
                  <span className="rating-score">{selectedReview.rating.toFixed(1)} — {selectedReview.ratingText}</span>
                </div>
                <div className="review-text">"{selectedReview.fullText}"</div>
                
                <div className="photo-grid">
                  <div className="photo-box"><i className="fa-regular fa-image"></i></div>
                  <div className="photo-box"><i className="fa-regular fa-image"></i></div>
                </div>

                <div className="sub-ratings">
                  <div className="sub-rating-item">
                    <div className="sub-rating-label">Quality</div>
                    <StarRating rating={selectedReview.subRatings.quality} />
                  </div>
                  <div className="sub-rating-item">
                    <div className="sub-rating-label">Value</div>
                    <StarRating rating={selectedReview.subRatings.value} />
                  </div>
                  <div className="sub-rating-item">
                    <div className="sub-rating-label">Wait time</div>
                    <StarRating rating={selectedReview.subRatings.waitTime} />
                  </div>
                  <div className="sub-rating-item">
                    <div className="sub-rating-label">Staff</div>
                    <StarRating rating={selectedReview.subRatings.staff} />
                  </div>
                </div>
              </div>

              <div className="action-buttons">
                <button className="btn btn-green">Approve & publish</button>
                <button className="btn btn-outline-red">Remove review</button>
                <button className="btn btn-outline">Flag for further review</button>
                <button className="btn btn-outline">Contact reviewer</button>
              </div>

              <div className="reply-section">
                <h3>Admin reply to service center</h3>
                <p className="reply-desc">Send a note to {selectedReview.center} about this review (Visible to center admin only).</p>
                <textarea 
                  className="reply-textarea" 
                  placeholder="Write a note to the service center..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                ></textarea>
                <div className="reply-actions">
                  <button className="btn btn-green">Send note</button>
                  <button className="btn btn-outline">Save draft</button>
                </div>
              </div>

            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
