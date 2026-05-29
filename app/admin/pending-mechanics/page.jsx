"use client";

import React, { useState, useEffect, useCallback } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { SkeletonCard } from "@/components/Skeleton";
import mechanicsService from "@/services/mechanicsService";

const R = "#E8272A";
const COLORS = { primary: R, bg: "#F8F9FA", border: "#E9ECEF", text: "#1A1A1A", muted: "#6C757D", white: "#fff" };

const s = {
  input: { width: "100%", padding: "10px 14px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, color: COLORS.text, background: "#fff", outline: "none", fontFamily: "inherit", boxSizing: "border-box" },
  label: { fontSize: 12, fontWeight: 600, color: COLORS.muted, marginBottom: 4, display: "block" },
  group: { marginBottom: 14 },
  btn: (v = "primary") => ({ padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: v === "outline" ? `1px solid ${COLORS.border}` : "none", background: v === "primary" ? R : v === "success" ? "#1B5E20" : v === "danger" ? "#C62828" : "#fff", color: v === "primary" || v === "success" || v === "danger" ? "#fff" : COLORS.text, display: "inline-flex", alignItems: "center", gap: 6 }),
};

function RejectModal({ mechanic, onClose, onRejected }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!reason.trim()) { setError("Rejection reason is required"); return; }
    setLoading(true); setError("");
    try {
      await mechanicsService.reject(mechanic.id, reason);
      onRejected();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: 28, width: "100%", maxWidth: 440 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>Reject Mechanic</span>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>×</button>
        </div>
        <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 16 }}>Provide a clear reason so the mechanic can correct their application.</p>
        <div style={s.group}><label style={s.label}>Rejection Reason</label><textarea style={{ ...s.input, minHeight: 90, resize: "vertical" }} placeholder="e.g. Submitted national ID is not legible. Please resubmit with a clearer image." value={reason} onChange={e => setReason(e.target.value)} /></div>
        {error && <p style={{ color: R, fontSize: 12, marginBottom: 10 }}>{error}</p>}
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ ...s.btn("outline"), flex: 1, justifyContent: "center" }} onClick={onClose}>Cancel</button>
          <button style={{ ...s.btn("danger"), flex: 1, justifyContent: "center" }} onClick={submit} disabled={loading}>{loading ? "Rejecting..." : "Confirm Reject"}</button>
        </div>
      </div>
    </div>
  );
}

export default function PendingMechanicsPage() {
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMechanics = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await mechanicsService.getPending({ page, pageSize: 10 });
      setMechanics(res?.data?.items || []);
      setTotalPages(res?.data?.totalPages || 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchMechanics(); }, [fetchMechanics]);

  async function approve(id) {
    setApprovingId(id);
    try {
      await mechanicsService.approve(id);
      fetchMechanics();
    } catch (e) {
      setError(e.message);
    } finally {
      setApprovingId(null);
    }
  }

  const badges = { verification: mechanics.length, reviews: 0, reports: 0, featured: 0, users: 0 };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: COLORS.bg }}>
      <AdminSidebar activeTab="Center verification" setActiveTab={() => {}} badges={badges} colors={COLORS} />
      <div style={{ flex: 1, padding: "32px 36px", marginLeft: 280, overflowY: "auto" }}>
        <div style={{ maxWidth: 760 }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Pending Mechanics</h1>
            <p style={{ fontSize: 13, color: COLORS.muted }}>{mechanics.length} application{mechanics.length !== 1 ? "s" : ""} awaiting review</p>
          </div>

          {error && <div style={{ background: "#FFEBEE", color: "#C62828", padding: "12px 16px", borderRadius: 10, marginBottom: 16, fontSize: 13 }}>{error}</div>}

          {loading ? [1, 2, 3].map(i => <SkeletonCard key={i} />) : mechanics.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: COLORS.muted }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <p style={{ fontSize: 15, fontWeight: 600 }}>All caught up</p>
              <p style={{ fontSize: 13 }}>No pending mechanic applications</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {mechanics.map(m => (
                <div key={m.id} style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ padding: 16, cursor: "pointer" }} onClick={() => setExpandedId(prev => prev === m.id ? null : m.id)}>
                    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <div style={{ width: 46, height: 46, borderRadius: "50%", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, color: R, flexShrink: 0 }}>
                        {m.fullName?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: 15 }}>{m.fullName}</span>
                          <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "#FFF8E1", color: "#F57F17" }}>Pending</span>
                        </div>
                        <div style={{ fontSize: 12, color: COLORS.muted, display: "flex", gap: 14 }}>
                          <span>📍 {m.city}</span>
                          <span>💼 {m.yearsOfExperience} yrs</span>
                        </div>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8 }}>
                          {m.specializations?.map(sp => (
                            <span key={sp} style={{ padding: "2px 8px", background: "#f3f4f6", borderRadius: 4, fontSize: 11, color: COLORS.muted }}>{sp}</span>
                          ))}
                        </div>
                      </div>
                      <span style={{ color: COLORS.muted, fontSize: 12, flexShrink: 0 }}>{expandedId === m.id ? "▲" : "▼"}</span>
                    </div>
                  </div>

                  {expandedId === m.id && (
                    <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${COLORS.border}` }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "14px 0 14px" }}>
                        <div><span style={s.label}>Full Name</span><span style={{ fontSize: 13 }}>{m.fullName}</span></div>
                        <div><span style={s.label}>City</span><span style={{ fontSize: 13 }}>{m.city}</span></div>
                        <div><span style={s.label}>Experience</span><span style={{ fontSize: 13 }}>{m.yearsOfExperience} years</span></div>
                        <div><span style={s.label}>Specializations</span><span style={{ fontSize: 13 }}>{m.specializations?.join(", ")}</span></div>
                      </div>
                      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                        <a href={m.nationalIdUrl} target="_blank" rel="noreferrer" style={{ flex: 1, background: "#f8f9fa", borderRadius: 10, padding: 14, textAlign: "center", textDecoration: "none", color: COLORS.muted, border: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer" }}>
                          <span style={{ fontSize: 24 }}>🪪</span>
                          <span style={{ fontSize: 12 }}>National ID</span>
                        </a>
                        <a href={m.profilePhotoUrl} target="_blank" rel="noreferrer" style={{ flex: 1, background: "#f8f9fa", borderRadius: 10, padding: 14, textAlign: "center", textDecoration: "none", color: COLORS.muted, border: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer" }}>
                          <span style={{ fontSize: 24 }}>👤</span>
                          <span style={{ fontSize: 12 }}>Profile Photo</span>
                        </a>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button style={s.btn("success")} onClick={() => approve(m.id)} disabled={approvingId === m.id}>{approvingId === m.id ? "Approving..." : "✓ Approve"}</button>
                        <button style={s.btn("danger")} onClick={() => setRejectTarget(m)}>✕ Reject</button>
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

      {rejectTarget && (
        <RejectModal mechanic={rejectTarget} onClose={() => setRejectTarget(null)} onRejected={() => { setRejectTarget(null); fetchMechanics(); }} />
      )}
    </div>
  );
}