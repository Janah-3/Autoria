"use client";

import React, { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SkeletonCard } from "@/components/Skeleton";
import jobRequestsService from "@/lib/api/jobRequestsService";

const R = "#E8272A";
const COLORS = { border: "#E9ECEF", text: "#1A1A1A", muted: "#6C757D", bg: "#F8F9FA", white: "#fff" };

const STATUSES = ["All", "Pending", "Accepted", "Completed", "Rejected"];

const badgeStyle = (status) => {
  const map = { Pending: { background: "#FFF8E1", color: "#F57F17" }, Accepted: { background: "#E3F2FD", color: "#1565C0" }, Completed: { background: "#E8F5E9", color: "#1B5E20" }, Rejected: { background: "#FFEBEE", color: "#C62828" }, Cancelled: { background: "#F5F5F5", color: "#616161" } };
  return { ...map[status] || map.Cancelled, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, display: "inline-flex", alignItems: "center" };
};

const s = {
  input: { width: "100%", padding: "10px 14px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, color: COLORS.text, background: "#fff", outline: "none", fontFamily: "inherit", boxSizing: "border-box" },
  label: { fontSize: 12, fontWeight: 600, color: COLORS.muted, marginBottom: 4, display: "block" },
  group: { marginBottom: 14 },
  btn: (v = "primary") => ({ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: v === "outline" ? `1px solid ${COLORS.border}` : "none", background: v === "primary" ? R : v === "success" ? "#1B5E20" : v === "danger" ? "#C62828" : "#fff", color: v === "primary" || v === "success" || v === "danger" ? "#fff" : COLORS.text, display: "inline-flex", alignItems: "center", gap: 6 }),
};

function RejectModal({ job, onClose, onRejected }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!reason.trim()) { setError("Please provide a reason"); return; }
    setLoading(true); setError("");
    try {
      await jobRequestsService.reject(job.id, reason);
      onRejected();
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
          <span style={{ fontSize: 16, fontWeight: 700 }}>Reject Job Request</span>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>×</button>
        </div>
        <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 14 }}>Provide a reason so the car owner understands.</p>
        <div style={s.group}><label style={s.label}>Reason</label><textarea style={{ ...s.input, minHeight: 80, resize: "vertical" }} placeholder="e.g. I am fully booked on the requested date." value={reason} onChange={e => setReason(e.target.value)} /></div>
        {error && <p style={{ color: R, fontSize: 12, marginBottom: 10 }}>{error}</p>}
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ ...s.btn("outline"), flex: 1, justifyContent: "center" }} onClick={onClose}>Cancel</button>
          <button style={{ ...s.btn("danger"), flex: 1, justifyContent: "center" }} onClick={submit} disabled={loading}>{loading ? "Rejecting..." : "Confirm Reject"}</button>
        </div>
      </div>
    </div>
  );
}

function CompleteModal({ job, onClose, onCompleted }) {
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!price || isNaN(price) || parseFloat(price) <= 0) { setError("Please enter a valid price"); return; }
    setLoading(true); setError("");
    try {
      await jobRequestsService.complete(job.id, parseFloat(price));
      onCompleted();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: 28, width: "100%", maxWidth: 400 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>Complete Job</span>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>×</button>
        </div>
        <div style={s.group}><label style={s.label}>Final Price (EGP)</label><input style={s.input} type="number" min="1" placeholder="e.g. 350" value={price} onChange={e => setPrice(e.target.value)} /></div>
        {error && <p style={{ color: R, fontSize: 12, marginBottom: 10 }}>{error}</p>}
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ ...s.btn("outline"), flex: 1, justifyContent: "center" }} onClick={onClose}>Cancel</button>
          <button style={{ ...s.btn("success"), flex: 1, justifyContent: "center" }} onClick={submit} disabled={loading}>{loading ? "Completing..." : "✓ Mark Complete"}</button>
        </div>
      </div>
    </div>
  );
}

export default function MyJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [expandedId, setExpandedId] = useState(null);
  const [rejectJob, setRejectJob] = useState(null);
  const [completeJob, setCompleteJob] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [accepting, setAccepting] = useState(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = { page, pageSize: 10 };
      if (activeTab !== "All") params.status = activeTab;
      const res = await jobRequestsService.getMyJobs(params);
      setJobs(res?.data?.items || []);
      setTotalPages(res?.data?.totalPages || 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  async function acceptJob(id) {
    setAccepting(id);
    try {
      await jobRequestsService.accept(id);
      fetchJobs();
    } catch (e) {
      setError(e.message);
    } finally {
      setAccepting(null);
    }
  }

  return (
    <>
      <Navbar />
      <div style={{ minHeight: "100vh", background: COLORS.bg, padding: "32px 5%" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>My Jobs</h1>
            <p style={{ fontSize: 13, color: COLORS.muted }}>Manage your incoming service requests</p>
          </div>

          <div style={{ display: "flex", gap: 4, background: "#f3f4f6", borderRadius: 10, padding: 4, marginBottom: 20, overflowX: "auto" }}>
            {STATUSES.map(t => (
              <button key={t} onClick={() => { setActiveTab(t); setPage(1); }} style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", whiteSpace: "nowrap", background: activeTab === t ? "#fff" : "transparent", color: activeTab === t ? COLORS.text : COLORS.muted, boxShadow: activeTab === t ? "0 1px 3px rgba(0,0,0,.08)" : "none" }}>{t}</button>
            ))}
          </div>

          {error && <div style={{ background: "#FFEBEE", color: "#C62828", padding: "12px 16px", borderRadius: 10, marginBottom: 16, fontSize: 13 }}>{error}</div>}

          {loading ? [1, 2, 3].map(i => <SkeletonCard key={i} />) : jobs.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: COLORS.muted }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔧</div>
              <p style={{ fontSize: 15, fontWeight: 600 }}>No {activeTab !== "All" ? activeTab.toLowerCase() : ""} jobs</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {jobs.map(job => (
                <div key={job.id} style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ padding: 16, cursor: "pointer" }} onClick={() => setExpandedId(prev => prev === job.id ? null : job.id)}>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>👤</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: 14 }}>{job.mechanicName}</span>
                          <span style={badgeStyle(job.status)}>{job.status}</span>
                        </div>
                        <div style={{ fontSize: 12, color: COLORS.muted, display: "flex", gap: 12, marginBottom: 5 }}>
                          <span>🚗 {job.carInfo}</span>
                          <span>🕐 {new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p style={{ fontSize: 13, color: COLORS.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.problemDescription}</p>
                      </div>
                      <span style={{ color: COLORS.muted, fontSize: 12, flexShrink: 0 }}>{expandedId === job.id ? "▲" : "▼"}</span>
                    </div>
                  </div>

                  {expandedId === job.id && (
                    <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${COLORS.border}` }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "14px 0 12px" }}>
                        <div><span style={s.label}>Car Owner</span><span style={{ fontSize: 13 }}>{job.carOwnerName}</span></div>
                        <div><span style={s.label}>Phone</span><a href={`tel:${job.carOwnerPhone}`} style={{ fontSize: 13, color: R, textDecoration: "none" }}>{job.carOwnerPhone}</a></div>
                        <div><span style={s.label}>Location</span><span style={{ fontSize: 13 }}>{job.locationAddress}</span></div>
                        {job.scheduledAt && <div><span style={s.label}>Scheduled</span><span style={{ fontSize: 13 }}>{new Date(job.scheduledAt).toLocaleString()}</span></div>}
                        {job.price && <div><span style={s.label}>Price</span><span style={{ fontSize: 17, fontWeight: 700, color: "#1B5E20" }}>{job.price} EGP</span></div>}
                      </div>
                      <div style={{ background: "#f8f9fa", borderRadius: 8, padding: 12, marginBottom: 12 }}>
                        <p style={{ fontSize: 13, color: COLORS.muted }}>{job.problemDescription}</p>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {job.status === "Pending" && (
                          <>
                            <button style={s.btn("success")} onClick={() => acceptJob(job.id)} disabled={accepting === job.id}>{accepting === job.id ? "Accepting..." : "✓ Accept"}</button>
                            <button style={s.btn("danger")} onClick={() => setRejectJob(job)}>✕ Reject</button>
                          </>
                        )}
                        {job.status === "Accepted" && (
                          <button style={s.btn("primary")} onClick={() => setCompleteJob(job)}>✓ Mark Complete</button>
                        )}
                        {job.status === "Completed" && (
                          <span style={{ fontSize: 13, color: "#1B5E20", display: "flex", alignItems: "center", gap: 4 }}>✓ Completed — {job.price} EGP</span>
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

      {rejectJob && <RejectModal job={rejectJob} onClose={() => setRejectJob(null)} onRejected={() => { setRejectJob(null); fetchJobs(); }} />}
      {completeJob && <CompleteModal job={completeJob} onClose={() => setCompleteJob(null)} onCompleted={() => { setCompleteJob(null); fetchJobs(); }} />}
      <Footer />
    </>
  );
}