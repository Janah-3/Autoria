"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { reviewsService } from "@/lib/api/reviewsService";
import { getTokenRole } from "@/lib/utils/toast";
import { useRoleGuard } from "@/lib/hooks/useRoleGuard";

// ── Brand colors ──────────────────────────────────────────────────────────────
const R   = "#E8272A";
const BG  = "#F4F6F8";
const WH  = "#FFFFFF";
const BRD = "#E5E7EB";
const TL  = "#6B7280";

// ── Star Rating (interactive) ─────────────────────────────────────────────────
function StarRating({ rating, onChange }) {
  const [hovered, setHovered] = useState(0);
  const effective = hovered || rating;
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          onClick={() => onChange?.(i)}
          onMouseEnter={() => onChange && setHovered(i)}
          onMouseLeave={() => onChange && setHovered(0)}
          style={{
            fontSize: 22,
            color: i <= effective ? "#F59E0B" : "#D1D5DB",
            cursor: onChange ? "pointer" : "default",
            transition: "color 0.15s",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ show, type, message }) {
  return (
    <div style={{
      position: "fixed", top: 24, right: 24, zIndex: 99999,
      transform: show ? "translateY(0)" : "translateY(-100px)",
      opacity: show ? 1 : 0,
      transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
      background: type === "success" ? "#10B981" : type === "error" ? "#EF4444" : "#F59E0B",
      color: "#fff", borderRadius: 12, padding: "14px 20px",
      fontSize: 14, fontWeight: 700, boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
      display: "flex", alignItems: "center", gap: 10, maxWidth: 340,
      pointerEvents: "none",
    }}>
      <span>{type === "success" ? "✅" : type === "error" ? "❌" : "⚠️"}</span>
      {message}
    </div>
  );
}

// ── Edit Modal ────────────────────────────────────────────────────────────────
function EditModal({ review, onClose, onSave }) {
  const [rating, setRating]   = useState(review.rating ?? review.Rating ?? 5);
  const [comment, setComment] = useState(review.comment ?? review.Comment ?? "");
  const [saving, setSaving]   = useState(false);

  const handleSave = async () => {
    if (!comment.trim()) return;
    setSaving(true);
    try {
      await onSave(review.id ?? review.Id, { rating, comment });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 9999, padding: 20, backdropFilter: "blur(4px)",
    }}>
      <div style={{
        background: WH, borderRadius: 20, padding: 36, width: "100%", maxWidth: 480,
        boxShadow: "0 20px 60px rgba(0,0,0,0.18)", animation: "scaleIn 0.25s ease",
      }}>
        <style>{`@keyframes scaleIn { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }`}</style>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, fontWeight: 900, color: "#111" }}>✏️ Edit Review</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: TL }}>✕</button>
        </div>

        {/* Rating */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: TL, textTransform: "uppercase", display: "block", marginBottom: 10, letterSpacing: "0.5px" }}>
            Your Rating
          </label>
          <StarRating rating={rating} onChange={setRating} />
        </div>

        {/* Comment */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: TL, textTransform: "uppercase", display: "block", marginBottom: 8, letterSpacing: "0.5px" }}>
            Comment
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={500}
            placeholder="Share your experience..."
            style={{
              width: "100%", padding: "12px 14px", borderRadius: 10,
              border: `1.5px solid ${BRD}`, fontSize: 14, resize: "vertical",
              fontFamily: "inherit", outline: "none", color: "#111",
              boxSizing: "border-box",
            }}
          />
          <div style={{ fontSize: 11, color: TL, textAlign: "right", marginTop: 4 }}>{comment.length}/500</div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: "12px", borderRadius: 10, border: `1.5px solid ${BRD}`,
              background: "#F9FAFB", fontWeight: 700, fontSize: 14, cursor: "pointer", color: TL,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !comment.trim()}
            style={{
              flex: 1, padding: "12px", borderRadius: 10, border: "none",
              background: saving ? "#ccc" : R, color: "#fff",
              fontWeight: 800, fontSize: 14, cursor: saving ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteModal({ review, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try { await onConfirm(review.id ?? review.Id); }
    finally { setDeleting(false); }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 9999, padding: 20, backdropFilter: "blur(4px)",
    }}>
      <div style={{
        background: WH, borderRadius: 20, padding: 36, width: "100%", maxWidth: 400,
        boxShadow: "0 20px 60px rgba(0,0,0,0.18)", textAlign: "center",
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🗑️</div>
        <h3 style={{ fontSize: 20, fontWeight: 900, color: "#111", marginBottom: 10 }}>Delete Review?</h3>
        <p style={{ fontSize: 14, color: TL, lineHeight: 1.6, marginBottom: 28 }}>
          This action is permanent and cannot be undone. Your review for <strong>{review.serviceCenterName ?? review.ServiceCenterName ?? "this center"}</strong> will be removed.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: "12px", borderRadius: 10, border: `1.5px solid ${BRD}`,
              background: "#F9FAFB", fontWeight: 700, fontSize: 14, cursor: "pointer", color: TL,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            style={{
              flex: 1, padding: "12px", borderRadius: 10, border: "none",
              background: deleting ? "#ccc" : R, color: "#fff",
              fontWeight: 800, fontSize: 14, cursor: deleting ? "not-allowed" : "pointer",
            }}
          >
            {deleting ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Review Card ───────────────────────────────────────────────────────────────
function ReviewCard({ review, onEdit, onDelete }) {
  const name = review.serviceCenterName ?? review.ServiceCenterName ?? "Service Center";
  const rating = review.rating ?? review.Rating ?? 0;
  const comment = review.comment ?? review.Comment ?? "";
  const date = review.createdAt ?? review.CreatedAt;
  const reply = review.replyComment ?? review.ReplyComment;

  return (
    <div style={{
      background: WH, borderRadius: 16, border: `1px solid ${BRD}`,
      boxShadow: "0 2px 12px rgba(0,0,0,0.04)", overflow: "hidden",
      transition: "box-shadow 0.2s",
    }}>
      {/* Card Header */}
      <div style={{
        padding: "18px 24px", background: "#FAFAFA", borderBottom: `1px solid ${BRD}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "#FEE2E2", color: R,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
          }}>
            🔧
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#111" }}>{name}</div>
            {date && (
              <div style={{ fontSize: 12, color: TL, marginTop: 2 }}>
                {new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => onEdit(review)}
            style={{
              padding: "7px 16px", borderRadius: 8, border: `1.5px solid ${BRD}`,
              background: WH, color: "#374151", fontSize: 13, fontWeight: 700,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#6366F1"; e.currentTarget.style.color = "#6366F1"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = BRD; e.currentTarget.style.color = "#374151"; }}
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => onDelete(review)}
            style={{
              padding: "7px 16px", borderRadius: 8, border: `1.5px solid #FCA5A5`,
              background: "#FFF5F5", color: R, fontSize: 13, fontWeight: 700,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#FEE2E2"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#FFF5F5"; }}
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <StarRating rating={rating} />
          <span style={{ fontSize: 14, fontWeight: 700, color: "#374151" }}>{rating}.0</span>
        </div>

        {comment && (
          <p style={{ fontSize: 15, color: "#4B5563", lineHeight: 1.7, fontStyle: "italic" }}>
            &ldquo;{comment}&rdquo;
          </p>
        )}

        {/* Center Reply */}
        {reply && (
          <div style={{
            background: "#F0FDF4", borderLeft: `3px solid #10B981`,
            padding: "14px 16px", borderRadius: "0 10px 10px 0", marginTop: 18,
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#059669", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
              💬 Response from {name}
            </div>
            <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.6 }}>&ldquo;{reply}&rdquo;</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MyReviewsPage() {
  const { authorized, checking } = useRoleGuard();
  const role = getTokenRole();
  const isServiceCenter = ["servicecenter", "servicecenterowner", "mechanic"].includes(role?.toLowerCase());

  const [reviews, setReviews]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });

  const triggerToast = (message, type = "success") => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 4000);
  };

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await reviewsService.getMyReviews();
      const items = res?.data ?? res ?? [];
      setReviews(Array.isArray(items) ? items : []);
    } catch (err) {
      console.warn("Failed to load reviews:", err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReviews(); }, []);

  const handleEdit = async (reviewId, payload) => {
    try {
      await reviewsService.editReview(reviewId, payload);
      triggerToast("Review updated successfully!", "success");
      setEditTarget(null);
      loadReviews();
    } catch (err) {
      triggerToast(err.message || "Failed to update review", "error");
    }
  };

  const handleDelete = async (reviewId) => {
    try {
      await reviewsService.deleteReview(reviewId);
      triggerToast("Review deleted.", "success");
      setDeleteTarget(null);
      loadReviews();
    } catch (err) {
      triggerToast(err.message || "Failed to delete review", "error");
    }
  };

  if (checking || !authorized) return null;

  const backHref = isServiceCenter ? "/service-center" : "/user-dashboard";

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <Toast show={toast.show} type={toast.type} message={toast.message} />

      {/* Modals */}
      {editTarget && (
        <EditModal
          review={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleEdit}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          review={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}

      {/* Nav */}
      <nav style={{
        background: WH, borderBottom: `2px solid ${R}`, height: 68,
        padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(232,39,42,0.07)", position: "sticky", top: 0, zIndex: 10,
      }}>
        <Link href={backHref} style={{ fontSize: 22, fontWeight: 900, color: R, textDecoration: "none" }}>
          Autoria
        </Link>
        <Link href={backHref} style={{ fontSize: 14, fontWeight: 600, color: TL, textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          ← Back to Dashboard
        </Link>
      </nav>

      {/* Content */}
      <main style={{ maxWidth: 860, margin: "40px auto", padding: "0 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 800, color: TL, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 4 }}>YOUR FEEDBACK</p>
            <h1 style={{ fontSize: 30, fontWeight: 900, color: "#111", margin: 0 }}>My Reviews</h1>
            <p style={{ fontSize: 14, color: TL, marginTop: 6 }}>
              {reviews.length > 0 ? `${reviews.length} review${reviews.length > 1 ? "s" : ""} submitted` : "No reviews yet"}
            </p>
          </div>
          {!isServiceCenter && (
            <Link href="/reviews/write" style={{ textDecoration: "none" }}>
              <button style={{
                background: R, color: "#fff", border: "none", padding: "11px 22px",
                borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8,
                boxShadow: "0 4px 14px rgba(232,39,42,0.25)", transition: "all 0.2s",
              }}>
                ✍️ Write a Review
              </button>
            </Link>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 0", gap: 16 }}>
            <div style={{
              width: 40, height: 40, border: "4px solid #F3F4F6",
              borderTop: `4px solid ${R}`, borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }} />
            <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
            <p style={{ color: TL, fontSize: 14, fontWeight: 600 }}>Loading your reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div style={{
            background: WH, borderRadius: 16, border: `2px dashed ${BRD}`,
            padding: "70px 20px", textAlign: "center",
          }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>💬</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111", marginBottom: 10 }}>No Reviews Yet</h2>
            <p style={{ fontSize: 14, color: TL, maxWidth: 340, margin: "0 auto 24px", lineHeight: 1.6 }}>
              After visiting a service center, share your experience to help others choose the right one.
            </p>
            {!isServiceCenter && (
              <Link href="/reviews/write" style={{ textDecoration: "none" }}>
                <button style={{
                  background: R, color: "#fff", border: "none", padding: "12px 28px",
                  borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: "pointer",
                }}>
                  ✍️ Write Your First Review
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {reviews.map((review) => (
              <ReviewCard
                key={review.id ?? review.Id ?? Math.random()}
                review={review}
                onEdit={setEditTarget}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
