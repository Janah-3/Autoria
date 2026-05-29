"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SkeletonCard } from "@/components/Skeleton";
import jobRequestsService from "@/lib/api/jobRequestsService";
import reviewsService from "@/lib/api/reviewsService";

const R = "#E8272A";
const COLORS = { border: "#E9ECEF", text: "#1A1A1A", muted: "#6C757D", bg: "#F8F9FA", white: "#fff" };

const STATUSES = ["All", "Pending", "Accepted", "Completed", "Cancelled", "Rejected"];

const badgeStyle = (status) => {
  const map = {
    Pending: { background: "#FFF8E1", color: "#F57F17" },
    Accepted: { background: "#E3F2FD", color: "#1565C0" },
    Completed: { background: "#E8F5E9", color: "#1B5E20" },
    Rejected: { background: "#FFEBEE", color: "#C62828" },
    Cancelled: { background: "#F5F5F5", color: "#616161" },
  };
  return { ...map[status] || map.Cancelled, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, display: "inline-flex", alignItems: "center" };
};

const s = {
  input: { width: "100%", padding: "10px 14px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, color: COLORS.text, background: "#fff", outline: "none", fontFamily: "inherit", boxSizing: "border-box" },
  label: { fontSize: 12, fontWeight: 600, color: COLORS.muted, marginBottom: 4, display: "block" },
  group: { marginBottom: 14 },
  btn: (variant = "primary") => ({
    padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", display: "inline-flex", alignItems: "center", gap: 6,
    background: variant === "primary" ? R : variant === "outline" ? "#fff" : "#f3f4f6",
    color: variant === "primary" ? "#fff" : variant === "danger" ? "#C62828" : COLORS.text,
    border: variant === "outline" ? `1px solid ${COLORS.border}` : "none",
  }),
};

function StarRating({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} onClick={() => onChange(i)} style={{ fontSize: 28, cursor: "pointer", color: i <= value ? "#FFB800" : "#ddd", transition: "color .15s" }}>★</span>
      ))}
    </div>
  );
}

function ReviewModal({ job, onClose, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!rating) { setError("Please select a rating"); return; }
    if (!comment.trim()) { setError("Please write a comment"); return; }
    setLoading(true); setError("");
    try {
      const formData = new FormData();
      formData.append("targetType", "Mechanic");
      formData.append("targetId", job.mechanicId);
      formData.append("sourceId", job.id);
      formData.append("rating", rating);
      formData.append("comment", comment);
      photos.forEach(p => formData.append("photos", p));
      await reviewsService.submit(formData);
      onSubmitted();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: 28, width: "100%", maxWidth: 460 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>Leave a Review</span>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: COLORS.muted }}>×</button>
        </div>
        <div style={s.group}><label style={s.label}>Rating</label><StarRating value={rating} onChange={setRating} /></div>
        <div style={s.group}><label style={s.label}>Comment</label><textarea style={{ ...s.input, minHeight: 90, resize: "vertical" }} placeholder="Share your experience..." value={comment} onChange={e => setComment(e.target.value)} /></div>
        <div style={s.group}>
          <label style={s.label}>Photos (optional)</label>
          <label style={{ display: "block", border: `2px dashed ${COLORS.border}`, borderRadius: 10, padding: 14, textAlign: "center", cursor: "pointer" }}>
            <input type="file" multiple accept="image/*" style={{ display: "none" }} onChange={e => setPhotos(Array.from(e.target.files))} />
            <p style={{ fontSize: 12, color: COLORS.muted }}>{photos.length ? `${photos.length} file(s) selected` : "Upload photos"}</p>
          </label>
        </div>
        {error && <p style={{ color: R, fontSize: 12, marginBottom: 10 }}>{error}</p>}
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ ...s.btn("outline"), flex: 1, justifyContent: "center" }} onClick={onClose}>Cancel</button>
          <button style={{ ...s.btn("primary"), flex: 1, justifyContent: "center" }} onClick={submit} disabled={loading}>{loading ? "Submitting..." : "Submit Review"}</button>
        </div>
      </div>
    </div>
  );
}

function CancelModal({ job, onClose, onCancelled }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setLoading(true); setError("");
    try {
      await jobRequestsService.cancel(job.id, reason);
      onCancelled();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: 28, width: "100%", maxWidth: 420 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>Cancel Job Request</span>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>×</button>
        </div>
        <div style={s.group}><label style={s.label}>Reason (optional)</label><textarea style={{ ...s.input, minHeight: 70, resize: "vertical" }} placeholder="Why are you cancelling?" value={reason} onChange={e => setReason(e.target.value)} /></div>
        {error && <p style={{ color: R, fontSize: 12, marginBottom: 10 }}>{error}</p>}
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ ...s.btn("outline"), flex: 1, justifyContent: "center" }} onClick={onClose}>Go Back</button>
          <button style={{ ...s.btn("primary"), flex: 1, justifyContent: "center", background: "#C62828" }} onClick={submit} disabled={loading}>{loading ? "Cancelling..." : "Confirm Cancel"}</button>
        </div>
      </div>
    </div>
  );
}

export default function MyJobRequestsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [expandedId, setExpandedId] = useState(null);
  const [reviewJob, setReviewJob] = useState(null);
  const [cancelJob, setCancelJob] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchJobs = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = { page, pageSize: 10 };
      if (activeTab !== "All") params.status = activeTab;
      const res = await jobRequestsService.getMy(params);
      setJobs(res?.data?.items || []);
      setTotalPages(res?.data?.totalPages || 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  function toggleExpand(id) { setExpandedId(prev => prev === id ? null : id); }

  return (
    <>
      <Navbar />
      <div style={{ minHeight: "100vh", background: COLORS.bg, padding: "32px 5%" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>My Job Requests</h1>
              <p style={{ fontSize: 13, color: COLORS.muted }}>Track your mechanic service requests</p>
            </div>
            <Link href="/mechanics" style={{ textDecoration: "none" }}>
              <button style={s.btn("primary")}>+ Request Mechanic</button>
            </Link>
          </div>

          <div style={{ display: "flex", gap: 4, background: "#f3f4f6", borderRadius: 10, padding: 4, marginBottom: 20, overflowX: "auto" }}>
            {STATUSES.map(t => (
              <button key={t} onClick={() => { setActiveTab(t); setPage(1); }} style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", whiteSpace: "nowrap", background: activeTab === t ? "#fff" : "transparent", color: activeTab === t ? COLORS.text : COLORS.muted, boxShadow: activeTab === t ? "0 1px 3px rgba(0,0,0,.08)" : "none" }}>{t}</button>
            ))}
          </div>

          {error && <div style={{ background: "#FFEBEE", color: "#C62828", padding: "12px 16px", borderRadius: 10, marginBottom: 16, fontSize: 13 }}>{error}</div>}

          {loading ? (
            [1, 2, 3].map(i => <SkeletonCard key={i} />)
          ) : jobs.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: COLORS.muted }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
              <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No {activeTab !== "All" ? activeTab.toLowerCase() : ""} job requests</p>
              <p style={{ fontSize: 13 }}>Browse mechanics and send your first request.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {jobs.map(job => (
                <div key={job.id} style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ padding: 16, cursor: "pointer" }} onClick={() => toggleExpand(job.id)}>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, color: R, flexShrink: 0 }}>
                        {job.mechanicName?.slice(0, 2).toUpperCase() || "M"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: 14 }}>{job.mechanicName}</span>
                          <span style={badgeStyle(job.status)}>{job.status}</span>
                        </div>
                        <div style={{ fontSize: 12, color: COLORS.muted, display: "flex", gap: 12, marginBottom: 6 }}>
                          <span>🚗 {job.carInfo}</span>
                          <span>📅 {new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p style={{ fontSize: 13, color: COLORS.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.problemDescription}</p>
                      </div>
                      <span style={{ color: COLORS.muted, fontSize: 12, flexShrink: 0 }}>{expandedId === job.id ? "▲" : "▼"}</span>
                    </div>
                  </div>

                  {expandedId === job.id && (
                    <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${COLORS.border}` }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "14px 0 12px" }}>
                        {job.locationAddress && <div><span style={s.label}>Location</span><span style={{ fontSize: 13 }}>{job.locationAddress}</span></div>}
                        {job.scheduledAt && <div><span style={s.label}>Scheduled</span><span style={{ fontSize: 13 }}>{new Date(job.scheduledAt).toLocaleString()}</span></div>}
                        {job.price && <div><span style={s.label}>Price</span><span style={{ fontSize: 17, fontWeight: 700, color: R }}>{job.price} EGP</span></div>}
                        {job.cancellationReason && <div><span style={s.label}>Cancellation Reason</span><span style={{ fontSize: 13 }}>{job.cancellationReason}</span></div>}
                        {job.rejectionReason && <div><span style={s.label}>Rejection Reason</span><span style={{ fontSize: 13 }}>{job.rejectionReason}</span></div>}
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {(job.status === "Pending" || job.status === "Accepted") && (
                          <button style={{ ...s.btn("outline"), color: "#C62828", borderColor: "#ffcdd2" }} onClick={() => setCancelJob(job)}>✕ Cancel</button>
                        )}
                        {job.status === "Completed" && !job.reviewed && (
                          <button style={s.btn("primary")} onClick={() => setReviewJob(job)}>★ Leave Review</button>
                        )}
                        {job.status === "Completed" && job.reviewed && (
                          <span style={{ fontSize: 12, color: "#1B5E20", display: "flex", alignItems: "center", gap: 4 }}>✓ Reviewed</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
              <button style={s.btn("outline")} disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <span style={{ padding: "8px 16px", fontSize: 13, color: COLORS.muted }}>Page {page} of {totalPages}</span>
              <button style={s.btn("outline")} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          )}
        </div>
      </div>

      {reviewJob && (
        <ReviewModal job={reviewJob} onClose={() => setReviewJob(null)} onSubmitted={() => { setReviewJob(null); fetchJobs(); }} />
      )}
      {cancelJob && (
        <CancelModal job={cancelJob} onClose={() => setCancelJob(null)} onCancelled={() => { setCancelJob(null); fetchJobs(); }} />
      )}
      <Footer />
    </>
  );
}