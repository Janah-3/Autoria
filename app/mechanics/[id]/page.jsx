"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SkeletonCard } from "@/components/Skeleton";
import mechanicsService from "@/lib/api/mechanicsService";
import reviewsService from "@/lib/api/reviewsService";

const R  = "#E8272A";
const RD = "#B81C1F";
const row = (gap = 0) => ({ display: "flex", alignItems: "center", gap });

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 20, position: "relative", paddingLeft: 16 }}>
        <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: R, borderRadius: 2 }} />
        {title}
      </h2>
      {children}
    </div>
  );
}

function StarDisplay({ rating, size = 14 }) {
  const full  = Math.floor(rating);
  const empty = 5 - full;
  return (
    <span style={{ color: "#f59e0b", fontSize: size, letterSpacing: 1 }}>
      {"★".repeat(full)}{"☆".repeat(empty)}
    </span>
  );
}

function ReviewCard({ review }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 20, marginBottom: 14 }}>
      <div style={{ ...row(0), justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ ...row(10) }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: R, flexShrink: 0 }}>
            {review.reviewerName?.slice(0, 2).toUpperCase() || "U"}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{review.reviewerName}</div>
            <StarDisplay rating={review.rating} />
          </div>
        </div>
        <span style={{ fontSize: 12, color: "#9ca3af" }}>
          {new Date(review.createdAt).toLocaleDateString("en-EG", { year: "numeric", month: "short", day: "numeric" })}
        </span>
      </div>
      <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7, margin: 0 }}>{review.comment}</p>
      {review.photos?.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          {review.photos.map((url, i) => (
            <img key={i} src={url} alt="review" style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb" }} />
          ))}
        </div>
      )}
      {review.reply && (
        <div style={{ marginTop: 12, padding: "12px 14px", background: "#f8f9fa", borderRadius: 10, borderLeft: `3px solid ${R}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: R, marginBottom: 4, textTransform: "uppercase", letterSpacing: .5 }}>Mechanic Reply</div>
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0, lineHeight: 1.6 }}>{review.reply}</p>
        </div>
      )}
    </div>
  );
}

export default function MechanicProfilePage() {
  const { id } = useParams();

  const [mechanic, setMechanic]           = useState(null);
  const [reviews, setReviews]             = useState([]);
  const [reviewsPage, setReviewsPage]     = useState(1);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(1);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");

  useEffect(() => {
    mechanicsService.getById(id)
      .then(res => setMechanic(res?.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!mechanic) return;
    setReviewsLoading(true);
    reviewsService
      .getReviews({ targetType: "Mechanic", targetId: mechanic.id, page: reviewsPage, pageSize: 5 })
      .then(res => {
        setReviews(res?.data?.items || []);
        setReviewsTotalPages(res?.data?.totalPages || 1);
      })
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  }, [mechanic, reviewsPage]);

  if (loading) return (
    <>
      <Navbar />
      <div style={{ height: "100vh", ...row(0), justifyContent: "center", background: "#f7f7f8" }}>
        <div style={{ color: R, fontSize: 18, fontWeight: 700 }}>Loading Mechanic Profile...</div>
      </div>
    </>
  );

  if (error || !mechanic) return (
    <>
      <Navbar />
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f7f7f8" }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>Profile not found</h2>
        <Link href="/mechanics" style={{ color: R, fontWeight: 700, textDecoration: "none" }}>← Back to mechanics</Link>
      </div>
    </>
  );

  const ratingRounded = Math.round((mechanic.rating || 0) * 10) / 10;

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", background: "#f7f7f8", minHeight: "100vh", color: "#111" }}>
      <style>{`
        .btn-hover { transition: all 0.2s ease; }
        .btn-hover:hover { transform: scale(1.03); filter: brightness(1.08); box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
      `}</style>

      <Navbar />

      {/* ── Hero Banner ── */}
      <div style={{
        height: 300,
        background: mechanic.profilePhotoUrl
          ? `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.65)), url(${mechanic.profilePhotoUrl}) center/cover no-repeat`
          : `linear-gradient(135deg, #111, ${RD})`,
        display: "flex",
        alignItems: "flex-end",
        padding: "0 5% 36px",
        color: "#fff",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", ...row(24), alignItems: "flex-end" }}>
          <div style={{ width: 90, height: 90, borderRadius: "50%", border: "4px solid #fff", background: R, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 30, color: "#fff", flexShrink: 0, overflow: "hidden" }}>
            {mechanic.profilePhotoUrl
              ? <img src={mechanic.profilePhotoUrl} alt={mechanic.fullName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : mechanic.fullName?.slice(0, 2).toUpperCase()
            }
          </div>
          <div>
            <div style={{ background: R, display: "inline-block", padding: "3px 12px", borderRadius: 6, fontSize: 11, fontWeight: 800, textTransform: "uppercase", marginBottom: 10, letterSpacing: 1 }}>
              Mobile Mechanic
            </div>
            <h1 style={{ fontSize: 38, fontWeight: 900, letterSpacing: -1.5, marginBottom: 8, lineHeight: 1 }}>{mechanic.fullName}</h1>
            <div style={{ ...row(20), flexWrap: "wrap", gap: 12 }}>
              <span style={{ ...row(5), fontSize: 14 }}>📍 {mechanic.city}, Egypt</span>
              <span style={{ ...row(5), fontSize: 14, color: "#f59e0b" }}>
                ★ {ratingRounded > 0 ? ratingRounded : "No ratings yet"}
              </span>
              <span style={{ ...row(5), fontSize: 14 }}>💼 {mechanic.yearsOfExperience} yrs experience</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: 1200, margin: "40px auto", padding: "0 5%", display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32 }}>

        {/* ── Left Column ── */}
        <div>
          <Section title="About">
            <p style={{ color: "#6b7280", lineHeight: 1.8, fontSize: 15 }}>
              {mechanic.fullName} is a certified mobile mechanic based in {mechanic.city} with {mechanic.yearsOfExperience} years of hands-on experience.
              Specializing in {mechanic.specializations?.join(", ")}, providing reliable on-demand automotive services at your location.
            </p>
          </Section>

          <Section title="Specializations">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {mechanic.specializations?.map(sp => (
                <div key={sp} style={{ background: "#fff", padding: "16px", borderRadius: 12, border: "1px solid #e5e7eb", ...row(12) }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#fff0f0", color: R, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>🔧</div>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{sp}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Reviews ── */}
          <Section title={`Reviews ${reviews.length > 0 ? `(${reviews.length})` : ""}`}>
            {reviewsLoading ? (
              <><SkeletonCard /><SkeletonCard /></>
            ) : reviews.length === 0 ? (
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "40px 20px", textAlign: "center", color: "#9ca3af" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
                <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>No reviews yet</p>
                <p style={{ fontSize: 13 }}>Be the first to review after your service.</p>
              </div>
            ) : (
              <>
                {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
                {reviewsTotalPages > 1 && (
                  <div style={{ ...row(10), justifyContent: "center", marginTop: 8 }}>
                    <button
                      className="btn-hover"
                      disabled={reviewsPage === 1}
                      onClick={() => setReviewsPage(p => p - 1)}
                      style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", fontSize: 13, fontWeight: 600, cursor: reviewsPage === 1 ? "not-allowed" : "pointer", opacity: reviewsPage === 1 ? .5 : 1 }}>
                      ← Prev
                    </button>
                    <span style={{ fontSize: 13, color: "#9ca3af" }}>Page {reviewsPage} of {reviewsTotalPages}</span>
                    <button
                      className="btn-hover"
                      disabled={reviewsPage === reviewsTotalPages}
                      onClick={() => setReviewsPage(p => p + 1)}
                      style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", fontSize: 13, fontWeight: 600, cursor: reviewsPage === reviewsTotalPages ? "not-allowed" : "pointer", opacity: reviewsPage === reviewsTotalPages ? .5 : 1 }}>
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </Section>
        </div>

        {/* ── Right Sidebar ── */}
        <div style={{ position: "sticky", top: 100, height: "fit-content" }}>
          <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #e5e7eb", padding: 24, boxShadow: "0 10px 30px rgba(0,0,0,0.05)", marginBottom: 16 }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Request Service</h3>

            {/* Rating summary */}
            <div style={{ background: "#f8f9fa", borderRadius: 12, padding: "14px 16px", marginBottom: 20, ...row(14) }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: R, lineHeight: 1 }}>{ratingRounded || "—"}</div>
                <StarDisplay rating={mechanic.rating || 0} size={12} />
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Rating</div>
              </div>
              <div style={{ width: 1, height: 48, background: "#e5e7eb" }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#111", lineHeight: 1 }}>{mechanic.yearsOfExperience}</div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Yrs Exp</div>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#9ca3af", marginBottom: 6, textTransform: "uppercase" }}>Location</label>
              <div style={{ fontSize: 15, fontWeight: 600 }}>📍 {mechanic.city}, Egypt</div>
            </div>

            <Link href={`/mechanics/${id}/request`} style={{ textDecoration: "none" }}>
              <button className="btn-hover" style={{ width: "100%", background: R, color: "#fff", border: "none", padding: "16px", borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: "pointer", marginBottom: 10 }}>
                Request This Mechanic
              </button>
            </Link>
            <p style={{ textAlign: "center", fontSize: 12, color: "#9ca3af" }}>No payment required upfront</p>

            <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #f3f4f6" }}>
              <h4 style={{ fontSize: 13, fontWeight: 800, marginBottom: 12 }}>Approximate Area</h4>
              <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>{mechanic.city}<br />Egypt</p>
             {mechanic.latitude && mechanic.longitude && (
  <a
    href={`https://maps.google.com/?q=${mechanic.latitude},${mechanic.longitude}`}
    target="_blank"
    rel="noreferrer"
    style={{
      display: "block",
      marginTop: 10,
      textDecoration: "none",
    }}
  >
    <div
      className="btn-hover"
      style={{
        height: 120,
        background: "#f3f4f6",
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#9ca3af",
        fontSize: 13,
        fontWeight: 600,
        gap: 6,
        border: "1px solid #e5e7eb",
      }}
    >
      📍 Open in Google Maps
    </div>
  </a>
)}
            </div>
          </div>

          {/* Specializations summary card */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #e5e7eb", padding: 20 }}>
            <h4 style={{ fontSize: 14, fontWeight: 800, marginBottom: 14 }}>Specializations</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {mechanic.specializations?.map(sp => (
                <span key={sp} style={{ background: "#FEF2F2", color: R, padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{sp}</span>
              ))}
            </div>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}