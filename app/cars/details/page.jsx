"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useRoleGuard } from "@/lib/hooks/useRoleGuard";
import { carsService } from "@/lib/api/carsService";
import { mileageService } from "@/lib/api/mileageService";
import Navbar from "@/components/Navbar";

// ── Brand tokens ──────────────────────────────────────────────────────────────
const R = "#E8272A";
const BG = "#F8F9FA";
const BRD = "#E9ECEF";
const WH = "#FFFFFF";
const TL = "#000000";
const SH = "0 4px 20px rgba(0,0,0,0.05)";

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type, show }) {
  if (!show) return null;
  return (
    <div style={{
      position: "fixed", top: 24, right: 24, zIndex: 9999,
      background: type === "success" ? "#10B981" : R,
      color: "#fff", padding: "14px 28px", borderRadius: 12,
      fontWeight: 700, fontSize: 14, boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
      animation: "slideIn 0.3s ease",
    }}>
      {type === "success" ? "✅" : "❌"} {message}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ w = "100%", h = 20, r = 8 }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: "linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />;
}

// ── Mileage Summary Card ──────────────────────────────────────────────────────
function MileageSummary({ car, history, loading }) {
  const latestRecord = history.length > 0 ? history[0] : null;
  const currentMileage = latestRecord?.mileage ?? car?.mileage ?? 0;

  if (loading) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ background: WH, borderRadius: 16, padding: 24, border: `1px solid ${BRD}` }}>
            <Skeleton h={12} w="50%" /><br />
            <Skeleton h={32} w="60%" />
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    { label: "CURRENT MILEAGE", value: `${currentMileage.toLocaleString()} km`, icon: "🛣️", color: "#6366F1" },
    { label: "LATEST RECORD", value: latestRecord ? new Date(latestRecord.loggedAt).toLocaleDateString() : "No records", icon: "📅", color: "#10B981" },
    { label: "TOTAL RECORDS", value: String(history.length), icon: "📊", color: "#F59E0B" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
      {stats.map((s, i) => (
        <div key={i} style={{ background: WH, borderRadius: 16, padding: 24, border: `1px solid ${BRD}`, boxShadow: SH }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#000000", textTransform: "uppercase", letterSpacing: "1px" }}>{s.label}</div>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{s.icon}</div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#111111" }}>{s.value}</div>
        </div>
      ))}
    </div>
  );
}

// ── Mileage Form (modal) ──────────────────────────────────────────────────────
function MileageForm({ carId, open, onClose, onSuccess }) {
  const [mileage, setMileage] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mileage || Number(mileage) <= 0) { setError("Please enter a valid mileage"); return; }
    setError("");
    setSubmitting(true);
    try {
      await mileageService.addMileage({ carId, mileage: Number(mileage), notes: notes.trim() || undefined });
      setMileage("");
      setNotes("");
      onSuccess("Mileage logged successfully!");
      onClose();
    } catch (err) {
      setError(err.message || "Failed to log mileage");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: WH, borderRadius: 20, padding: "36px 32px", maxWidth: 460, width: "90%", boxShadow: "0 25px 60px rgba(0,0,0,0.2)", animation: "fadeIn 0.25s ease" }}>
        <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
          🛣️ Log Mileage
        </h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, display: "block" }}>
              Mileage (km) <span style={{ color: R }}>*</span>
            </label>
            <input
              type="number"
              value={mileage}
              onChange={e => setMileage(e.target.value)}
              placeholder="e.g. 45200"
              style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${BRD}`, fontSize: 15, outline: "none", fontFamily: "inherit" }}
              onFocus={e => e.target.style.borderColor = R}
              onBlur={e => e.target.style.borderColor = BRD}
              min="0"
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, display: "block" }}>Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Engine oil and brake pads need inspection"
              style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${BRD}`, fontSize: 14, minHeight: 80, resize: "vertical", outline: "none", fontFamily: "inherit" }}
              onFocus={e => e.target.style.borderColor = R}
              onBlur={e => e.target.style.borderColor = BRD}
            />
          </div>
          {error && <div style={{ color: R, fontSize: 13, fontWeight: 600, marginBottom: 12 }}>❌ {error}</div>}
          <div style={{ display: "flex", gap: 12 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "12px 0", borderRadius: 10, fontWeight: 700, fontSize: 14, background: "#F1F5F9", color: "#111111", border: "none", cursor: "pointer" }}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} style={{ flex: 1, padding: "12px 0", borderRadius: 10, fontWeight: 700, fontSize: 14, background: R, color: "#fff", border: "none", cursor: "pointer", opacity: submitting ? 0.6 : 1 }}>
              {submitting ? "Saving..." : "Log Mileage"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Mileage History Table ─────────────────────────────────────────────────────
function MileageHistory({ history, loading }) {
  if (loading) {
    return (
      <div style={{ background: WH, borderRadius: 16, border: `1px solid ${BRD}`, padding: 24, boxShadow: SH, marginBottom: 28 }}>
        <Skeleton h={16} w="30%" /><br />
        {[1, 2, 3].map(i => <div key={i} style={{ marginBottom: 12 }}><Skeleton h={40} /></div>)}
      </div>
    );
  }

  return (
    <div style={{ background: WH, borderRadius: 16, border: `1px solid ${BRD}`, boxShadow: SH, overflow: "hidden", marginBottom: 28 }}>
      <div style={{ padding: "20px 24px", borderBottom: `1px solid ${BRD}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#000000" }}>📋 Mileage History</div>
          <div style={{ fontSize: 12, color: TL, marginTop: 2 }}>{history.length} record{history.length !== 1 ? "s" : ""} logged</div>
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        {history.length === 0 ? (
          <div style={{ padding: "40px 24px", textAlign: "center", color: TL }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>No mileage records yet</div>
            <div style={{ fontSize: 13 }}>Start logging your mileage to track your car&apos;s usage.</div>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: `1px solid ${BRD}`, color: "#000000", fontSize: 12, fontWeight: 800 }}>
                <th style={{ padding: "12px 24px" }}>DATE</th>
                <th style={{ padding: "12px 16px" }}>MILEAGE</th>
                <th style={{ padding: "12px 16px" }}>NOTES</th>
              </tr>
            </thead>
            <tbody>
              {history.map((record, idx) => (
                <tr key={record.id || idx} style={{ borderBottom: `1px solid ${BRD}`, fontSize: 13.5, transition: "background 0.15s" }}>
                  <td style={{ padding: "16px 24px", fontWeight: 700, color: "#111827" }}>
                    {record.loggedAt ? new Date(record.loggedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                    <div style={{ fontSize: 12, color: "#000000", marginTop: 2, fontWeight: 500 }}>
                      {record.loggedAt ? new Date(record.loggedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : ""}
                    </div>
                  </td>
                  <td style={{ padding: "16px", fontWeight: 800, fontSize: 16 }}>
                    {record.mileage?.toLocaleString()} <span style={{ fontSize: 12, color: "#000000", fontWeight: 500 }}>km</span>
                  </td>
                  <td style={{ padding: "16px", color: record.notes ? "#111111" : "#000000", fontStyle: record.notes ? "normal" : "italic" }}>
                    {record.notes || "No notes"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Reminder Form (modal) ─────────────────────────────────────────────────────
function ReminderForm({ carId, open, onClose, onSuccess }) {
  const [title, setTitle] = useState("");
  const [threshold, setThreshold] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError("Please enter a reminder title"); return; }
    if (!threshold || Number(threshold) <= 0) { setError("Please enter a valid mileage threshold"); return; }
    setError("");
    setSubmitting(true);
    try {
      await mileageService.createReminder({ carId, title: title.trim(), mileageThreshold: Number(threshold) });
      setTitle("");
      setThreshold("");
      onSuccess("Reminder created successfully!");
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create reminder");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: WH, borderRadius: 20, padding: "36px 32px", maxWidth: 460, width: "90%", boxShadow: "0 25px 60px rgba(0,0,0,0.2)", animation: "fadeIn 0.25s ease" }}>
        <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
          🔔 Create Reminder
        </h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, display: "block" }}>
              Reminder Title <span style={{ color: R }}>*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Oil Change Reminder"
              style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${BRD}`, fontSize: 15, outline: "none", fontFamily: "inherit" }}
              onFocus={e => e.target.style.borderColor = R}
              onBlur={e => e.target.style.borderColor = BRD}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, display: "block" }}>
              Mileage Threshold (km) <span style={{ color: R }}>*</span>
            </label>
            <input
              type="number"
              value={threshold}
              onChange={e => setThreshold(e.target.value)}
              placeholder="e.g. 5000"
              style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${BRD}`, fontSize: 15, outline: "none", fontFamily: "inherit" }}
              onFocus={e => e.target.style.borderColor = R}
              onBlur={e => e.target.style.borderColor = BRD}
              min="0"
            />
            <div style={{ fontSize: 11, color: TL, marginTop: 4 }}>You will be reminded when this mileage is reached.</div>
          </div>
          {error && <div style={{ color: R, fontSize: 13, fontWeight: 600, marginBottom: 12 }}>❌ {error}</div>}
          <div style={{ display: "flex", gap: 12 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "12px 0", borderRadius: 10, fontWeight: 700, fontSize: 14, background: "#F1F5F9", color: "#111111", border: "none", cursor: "pointer" }}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} style={{ flex: 1, padding: "12px 0", borderRadius: 10, fontWeight: 700, fontSize: 14, background: R, color: "#fff", border: "none", cursor: "pointer", opacity: submitting ? 0.6 : 1 }}>
              {submitting ? "Creating..." : "Create Reminder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Reminder List ─────────────────────────────────────────────────────────────
function ReminderList({ reminders, loading, onDelete }) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await onDelete(deleteTarget);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return (
      <div style={{ background: WH, borderRadius: 16, border: `1px solid ${BRD}`, padding: 24, boxShadow: SH }}>
        <Skeleton h={16} w="30%" /><br />
        {[1, 2].map(i => <div key={i} style={{ marginBottom: 12 }}><Skeleton h={60} /></div>)}
      </div>
    );
  }

  return (
    <>
      <div style={{ background: WH, borderRadius: 16, border: `1px solid ${BRD}`, boxShadow: SH, overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${BRD}` }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#000000" }}>🔔 Maintenance Reminders</div>
          <div style={{ fontSize: 12, color: TL, marginTop: 2 }}>{reminders.length} reminder{reminders.length !== 1 ? "s" : ""} set</div>
        </div>

        {reminders.length === 0 ? (
          <div style={{ padding: "40px 24px", textAlign: "center", color: TL }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔕</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>No reminders yet</div>
            <div style={{ fontSize: 13 }}>Create reminders to get notified at specific mileage thresholds.</div>
          </div>
        ) : (
          <div style={{ padding: "12px 24px" }}>
            {reminders.map((rem, idx) => (
              <div key={rem.id || idx} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "16px 0", borderBottom: idx < reminders.length - 1 ? `1px solid ${BRD}` : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: rem.isTriggered ? "#FEF2F2" : "#F0F9FF",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, flexShrink: 0,
                  }}>
                    {rem.isTriggered ? "✅" : "⏰"}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#111111" }}>{rem.title}</div>
                    <div style={{ fontSize: 12, color: TL, marginTop: 2 }}>
                      Threshold: <strong>{rem.mileageThreshold?.toLocaleString()} km</strong>
                      {rem.isTriggered && <span style={{ color: "#10B981", marginLeft: 8, fontWeight: 700 }}>• Triggered</span>}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setDeleteTarget(rem.id)}
                  style={{
                    background: "#FEF2F2", border: "1px solid #FCA5A5", color: R,
                    width: 36, height: 36, borderRadius: 10, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 700, transition: "all 0.15s",
                  }}
                  title="Delete reminder"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }} onClick={() => setDeleteTarget(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: WH, borderRadius: 20, padding: "32px", maxWidth: 400, width: "90%", boxShadow: "0 25px 60px rgba(0,0,0,0.2)", animation: "fadeIn 0.25s ease", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>Delete Reminder?</h3>
            <p style={{ fontSize: 13, color: TL, marginBottom: 24 }}>This action cannot be undone.</p>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setDeleteTarget(null)} style={{ flex: 1, padding: "12px 0", borderRadius: 10, fontWeight: 700, fontSize: 14, background: "#F1F5F9", color: "#111111", border: "none", cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleConfirmDelete} disabled={deleting} style={{ flex: 1, padding: "12px 0", borderRadius: 10, fontWeight: 700, fontSize: 14, background: R, color: "#fff", border: "none", cursor: "pointer", opacity: deleting ? 0.6 : 1 }}>
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function CarDetailsContent() {
  const { authorized, checking } = useRoleGuard();
  const searchParams = useSearchParams();
  const carId = searchParams.get("id");

  const [car, setCar] = useState(null);
  const [history, setHistory] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [remindersLoading, setRemindersLoading] = useState(true);

  const [mileageFormOpen, setMileageFormOpen] = useState(false);
  const [reminderFormOpen, setReminderFormOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const triggerToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  // ── Load car details ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!carId) { setLoading(false); return; }
    (async () => {
      try {
        const res = await carsService.getById(carId);
        setCar(res?.data ?? res);
      } catch (err) {
        console.error("Failed to load car:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [carId]);

  // ── Load mileage history ──────────────────────────────────────────────────
  const loadHistory = useCallback(async () => {
    if (!carId) return;
    setHistoryLoading(true);
    try {
      const res = await mileageService.getMileageHistory(carId);
      const data = res?.data;
      setHistory(data?.items || data || []);
    } catch (err) {
      console.error("Failed to load history:", err);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [carId]);

  // ── Load reminders ────────────────────────────────────────────────────────
  const loadReminders = useCallback(async () => {
    if (!carId) return;
    setRemindersLoading(true);
    try {
      const res = await mileageService.getReminders(carId);
      setReminders(res?.data || []);
    } catch (err) {
      console.error("Failed to load reminders:", err);
      setReminders([]);
    } finally {
      setRemindersLoading(false);
    }
  }, [carId]);

  useEffect(() => {
    loadHistory();
    loadReminders();
  }, [loadHistory, loadReminders]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleMileageSuccess = (msg) => {
    triggerToast(msg);
    loadHistory();
  };

  const handleReminderSuccess = (msg) => {
    triggerToast(msg);
    loadReminders();
  };

  const handleDeleteReminder = async (id) => {
    try {
      await mileageService.deleteReminder(id);
      triggerToast("Reminder deleted");
      loadReminders();
    } catch (err) {
      triggerToast(err.message || "Failed to delete", "error");
    }
  };

  if (checking) return null;
  if (!authorized) return null;

  // ── No car ID ─────────────────────────────────────────────────────────────
  if (!carId) {
    return (
      <>
        <Navbar />
        <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: BG, color: "#000000", fontFamily: "'Outfit', sans-serif" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🚗</div>
          <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>No car selected</h2>
          <p style={{ color: TL, marginBottom: 24 }}>Please select a car from your garage to view details.</p>
          <Link href="/cars" style={{ background: R, color: "#fff", padding: "12px 28px", borderRadius: 10, fontWeight: 700, textDecoration: "none" }}>
            ← Back to My Cars
          </Link>
        </div>
      </>
    );
  }

  const FUEL_TYPES = ["Petrol", "Diesel", "Hybrid", "Electric", "LPG"];
  const TRANSMISSIONS = ["Manual", "Automatic"];

  return (
    <>
      <Navbar />
      <div style={{ minHeight: "100vh", background: BG, color: "#000000", fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        <style>{`
          @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
          @keyframes slideIn { from{transform:translateY(-20px);opacity:0} to{transform:translateY(0);opacity:1} }
          @keyframes fadeIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
          * { box-sizing: border-box; }
          .action-btn { transition: all 0.2s ease; cursor: pointer; border: none; }
          .action-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.1); }
          .action-btn:active { transform: translateY(0); }
        `}</style>

        <Toast {...toast} />
        <MileageForm carId={carId} open={mileageFormOpen} onClose={() => setMileageFormOpen(false)} onSuccess={handleMileageSuccess} />
        <ReminderForm carId={carId} open={reminderFormOpen} onClose={() => setReminderFormOpen(false)} onSuccess={handleReminderSuccess} />

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 32px" }}>

          {/* ── Back link + header ───────────────────────────────── */}
          <Link href="/cars" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: TL, fontSize: 13, fontWeight: 600, textDecoration: "none", marginBottom: 20 }}>
            ← Back to My Cars
          </Link>

          {/* ── Car info banner ──────────────────────────────────── */}
          {loading ? (
            <div style={{ background: WH, borderRadius: 20, padding: 32, border: `1px solid ${BRD}`, marginBottom: 28 }}>
              <Skeleton h={28} w="40%" /><br />
              <Skeleton h={16} w="60%" />
            </div>
          ) : car ? (
            <div style={{
              background: "linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)",
              borderRadius: 20, padding: "32px 36px", marginBottom: 28, color: "#fff",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: -20, right: -20, fontSize: 100, opacity: 0.05 }}>🚗</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
                <div>
                  <div style={{ fontSize: 26, fontWeight: 900, marginBottom: 6 }}>
                    {car.make} {car.model}
                  </div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, opacity: 0.95 }}>
                    <span>📅 {car.year}</span>
                    <span>⛽ {FUEL_TYPES[car.fuelType] || car.fuelType || "—"}</span>
                    <span>⚙️ {TRANSMISSIONS[car.transmission] || car.transmission || "—"}</span>
                    <span>🔢 {car.licensePlate || "—"}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="action-btn" onClick={() => setMileageFormOpen(true)} style={{ background: R, color: "#fff", padding: "12px 24px", borderRadius: 12, fontWeight: 700, fontSize: 14 }}>
                    + Log Mileage
                  </button>
                  <button className="action-btn" onClick={() => setReminderFormOpen(true)} style={{ background: "rgba(255,255,255,0.12)", color: "#fff", padding: "12px 24px", borderRadius: 12, fontWeight: 700, fontSize: 14, border: "1px solid rgba(255,255,255,0.2)" }}>
                    + Add Reminder
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ background: WH, borderRadius: 20, padding: "40px", textAlign: "center", border: `1px solid ${BRD}`, marginBottom: 28 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🚫</div>
              <h3 style={{ fontWeight: 800, marginBottom: 8 }}>Car not found</h3>
              <Link href="/cars" style={{ color: R, fontWeight: 700, textDecoration: "none" }}>← Back to My Cars</Link>
            </div>
          )}

          {/* ── Mileage Summary ──────────────────────────────────── */}
          <MileageSummary car={car} history={history} loading={historyLoading} />

          {/* ── Split layout: History + Reminders ────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 28 }}>
            <MileageHistory history={history} loading={historyLoading} />
            <ReminderList reminders={reminders} loading={remindersLoading} onDelete={handleDeleteReminder} />
          </div>

        </div>
      </div>
    </>
  );
}

export default function CarDetailsPage() {
  return (
    <Suspense fallback={
      <>
        <Navbar />
        <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: BG, color: "#000000", fontFamily: "'Outfit', sans-serif" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🚗</div>
          <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>Loading Car Details...</h2>
          <Skeleton w={120} h={32} />
        </div>
      </>
    }>
      <CarDetailsContent />
    </Suspense>
  );
}
