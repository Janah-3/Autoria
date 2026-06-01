"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getMe } from "@/lib/api/usersService";
import { serviceCentersService, getServiceCenterItems } from "@/lib/api/serviceCentersService";
import { reportsService } from "@/lib/api/reportsService";

const R = "#E8272A";
const RD = "#B81C1F";
const BG = "#F8F9FA";
const BORDER = "#E9ECEF";
const TEXT_MUTED = "#6C757D";

// Constants for enums matching OpenAPI spec
const TARGET_TYPES = [
  { value: "ServiceCenter", label: "Service Center" },
  { value: "Review", label: "Review" },
  { value: "issue", label: "General Issue / Platform Bug" },
];

const REASONS = [
  { value: "Spam", label: "Spam / Unsolicited content" },
  { value: "Inappropriate", label: "Inappropriate behavior / Language" },
  { value: "Fake", label: "Fake profile / Misleading reviews" },
  { value: "Offensive", label: "Offensive or abusive content" },
  { value: "Other", label: "Other issue (Provide details below)" },
];

const GENERAL_ISSUE_GUID = "00000000-0000-0000-0000-000000000000";

export default function SubmitReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Route query params
  const paramTargetType = searchParams.get("targetType");
  const paramTargetId = searchParams.get("targetId");
  const paramName = searchParams.get("name");

  // Authentication & Profile States
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // List of service centers (if reporting a center directly)
  const [centers, setCenters] = useState([]);
  const [centersLoading, setCentersLoading] = useState(false);

  // Form inputs state
  const [targetType, setTargetType] = useState(paramTargetType || "ServiceCenter");
  const [targetId, setTargetId] = useState(paramTargetId || "");
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [errors, setErrors] = useState({});

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  // 1. Authenticate user
  useEffect(() => {
    getMe()
      .then((res) => {
        const u = res?.data ?? res;
        if (u) setCurrentUser(u);
      })
      .catch((err) => {
        console.error("Unauthorized visit to reports page", err);
      })
      .finally(() => setAuthLoading(false));
  }, []);

  // 2. Fetch service centers if targetType is ServiceCenter and not pre-filled
useEffect(() => {
  if (targetType === "ServiceCenter" && !paramTargetId) {
    setCentersLoading(true);

    serviceCentersService
      .getAll()
      .then((res) => {
        const allCenters = getServiceCenterItems(res) || [];

        // 👇 هنا بقى اللي طلبتيه
        console.log("ALL CENTERS:", allCenters[0]);

        setCenters(allCenters);
      })
      .catch((err) =>
        console.error("Failed to load service centers", err)
      )
      .finally(() => setCentersLoading(false));
  }
}, [targetType, paramTargetId]);

// Handle targetType changes
const handleTargetTypeChange = (e) => {
  const val = e.target.value;
  setTargetType(val);
  setErrors((prev) => ({ ...prev, targetId: null }));

  if (val === "issue") {
    setTargetId(GENERAL_ISSUE_GUID);
  } else {
    setTargetId(paramTargetId || "");
  }
};

// GUID validation regex helper
const isValidGuid = (id) => {
  const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return guidRegex.test(id);
};

// Form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  setErrors({});

  const validationErrors = {};
  if (!targetType) validationErrors.targetType = "Please select report type";

  if (!targetId) {
    validationErrors.targetId = "Please specify what you are reporting";
  } else if (targetType !== "issue" && !isValidGuid(targetId)) {
    validationErrors.targetId = "Invalid unique identifier format (must be a valid GUID)";
  }

  if (!reason) validationErrors.reason = "Please select a reason";
  if (details && details.length > 500) {
    validationErrors.details = "Description cannot exceed 500 characters";
  }

  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    showToast("Please correct the errors in the form", "error");
    return;
  }

  setSubmitting(true);
  try {
    await reportsService.createReport({
      targetType,
      targetId,
      reason,
      details: details || "No additional explanation provided",
    });

    showToast("Thank you! Report submitted successfully", "success");
    // Reset form if not pre-filled
    if (!paramTargetId) {
      setReason("");
      setDetails("");
      if (targetType === "issue") {
        setTargetId(GENERAL_ISSUE_GUID);
      } else {
        setTargetId("");
      }
    }

    // Redirect after a brief delay
    setTimeout(() => {
      if (currentUser?.role === "Admin") {
        router.push("/admin");
      } else {
        router.push("/user-dashboard");
      }
    }, 2000);
  } catch (err) {
    console.error(err);
    showToast(err.message || "Failed to submit report. Please try again.", "error");
  } finally {
    setSubmitting(false);
  }
};

if (authLoading) {
  return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: BG }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: `3px solid ${BORDER}`, borderTopColor: R, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
        <p style={{ color: TEXT_MUTED, fontSize: 14, fontWeight: 600 }}>Authenticating portal session...</p>
      </div>
    </div>
  );
}

// Not logged in state
if (!currentUser) {
  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Inter', sans-serif" }}>
      <Navbar user={null} />
      <div style={{ maxWidth: 500, margin: "100px auto 40px", padding: 32, background: "#fff", borderRadius: 20, border: `1px solid ${BORDER}`, boxShadow: "0 10px 30px rgba(0,0,0,0.05)", textAlign: "center" }}>
        <span style={{ fontSize: 48 }}>🔒</span>
        <h2 style={{ fontSize: 22, fontWeight: 900, marginTop: 16, marginBottom: 8 }}>Authentication Required</h2>
        <p style={{ fontSize: 14, color: TEXT_MUTED, lineHeight: 1.5, marginBottom: 24 }}>You must be logged in to submit reports or complaints about workshop centers and reviews.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link href="/login" style={{ flex: 1, textDecoration: "none", background: R, color: "#fff", padding: "12px", borderRadius: 10, fontWeight: 700, fontSize: 14 }}>Log In</Link>
          <Link href="/" style={{ flex: 1, textDecoration: "none", background: "#fff", color: "#111", border: `1px solid ${BORDER}`, padding: "12px", borderRadius: 10, fontWeight: 600, fontSize: 14 }}>Go Home</Link>
        </div>
      </div>
    </div>
  );
}

const userDisplayName = currentUser.fullName || currentUser.email || "Reporter";

return (
  <div style={{ background: BG, minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: "#111" }}>
    <Navbar user={{ name: userDisplayName }} />

    {/* Toast Alert */}
    <div style={{
      position: "fixed", top: 80, right: 24, zIndex: 9999, display: "flex", alignItems: "center", gap: 10,
      padding: "16px 24px", borderRadius: 12, background: "#fff", border: `1.5px solid ${toast.type === "success" ? "#C3E6CB" : "#F5C6CB"}`,
      boxShadow: "0 10px 25px rgba(0,0,0,0.08)", transform: toast.show ? "translateX(0)" : "translateX(120%)",
      transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)", pointerEvents: "none"
    }}>
      <span style={{ fontSize: 18 }}>{toast.type === "success" ? "✅" : "❌"}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: toast.type === "success" ? "#155724" : "#721C24" }}>{toast.message}</span>
    </div>

    <main style={{ maxWidth: 700, margin: "40px auto", padding: "0 24px" }}>

      {/* Breadcrumbs */}
      <div style={{ display: "flex", gap: 6, fontSize: 12, color: TEXT_MUTED, fontWeight: 600, marginBottom: 16 }}>
        <Link href="/" style={{ color: TEXT_MUTED, textDecoration: "none" }}>Home</Link>
        <span>/</span>
        <span style={{ color: R }}>Submit a Report</span>
      </div>

      {/* Page Title */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1, marginBottom: 8 }}>Report an Issue</h1>
        <p style={{ color: TEXT_MUTED, fontSize: 14, lineHeight: 1.6 }}>
          Submit reports about inappropriate service centers, fake reviews, abusive messaging, or general platform issues. Our admin team will investigate and take actions.
        </p>
      </div>

      {/* Report Form Container */}
      <div style={{ background: "#fff", borderRadius: 20, border: `1px solid ${BORDER}`, padding: 36, boxShadow: "0 10px 30px rgba(0,0,0,0.02)" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Target Type selector */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, color: "#374151" }}>What are you reporting?</label>
            {paramTargetType ? (
              <div style={{ background: "#F3F4F6", padding: "12px 16px", borderRadius: 10, fontSize: 14, fontWeight: 700, color: "#111", border: `1px solid ${BORDER}` }}>
                🔒 {paramTargetType === "ServiceCenter" ? "Service Center" : paramTargetType}
              </div>
            ) : (
              <select
                value={targetType}
                onChange={handleTargetTypeChange}
                style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${errors.targetType ? R : BORDER}`, fontSize: 14, outline: "none", background: "#fff" }}
              >
                {TARGET_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            )}
            {errors.targetType && <span style={{ fontSize: 12, color: R, fontWeight: 600 }}>{errors.targetType}</span>}
          </div>

          {/* Target ID / Selection */}
          {targetType === "ServiceCenter" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, color: "#374151" }}>Select Service Center</label>
              {paramTargetId ? (
                <div style={{ background: "#F9FAFB", padding: "12px 16px", borderRadius: 10, border: `1px solid ${BORDER}` }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: R }}>{paramName || "Selected Center"}</div>
                  <div style={{ fontSize: 11, color: TEXT_MUTED, fontFamily: "monospace", marginTop: 4 }}>ID: {paramTargetId}</div>
                </div>
              ) : (
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${errors.targetId ? R : BORDER}`, fontSize: 14, outline: "none", background: "#fff" }}
                >
                  <option value="">-- Choose Workshop Center --</option>
                  {centers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.district}, {c.governorate})</option>
                  ))}
                </select>
              )}
              {errors.targetId && <span style={{ fontSize: 12, color: R, fontWeight: 600 }}>{errors.targetId}</span>}
            </div>
          )}

          {targetType === "Review" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, color: "#374151" }}>Review Identifier (GUID)</label>
              {paramTargetId ? (
                <div style={{ background: "#F9FAFB", padding: "12px 16px", borderRadius: 10, border: `1px solid ${BORDER}`, fontFamily: "monospace", fontSize: 12 }}>
                  ID: {paramTargetId}
                </div>
              ) : (
                <input
                  placeholder="e.g. 829b02b0-4265-4ff0-86a3-e91f9f8a9a41"
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${errors.targetId ? R : BORDER}`, fontSize: 14, outline: "none" }}
                />
              )}
              {errors.targetId && <span style={{ fontSize: 12, color: R, fontWeight: 600 }}>{errors.targetId}</span>}
            </div>
          )}

          {targetType === "issue" && (
            <div style={{ padding: "12px 16px", background: "#F3F4F6", borderRadius: 10, border: `1px solid ${BORDER}`, display: "flex", gap: 10 }}>
              <span style={{ fontSize: 16 }}>ℹ️</span>
              <span style={{ fontSize: 13, color: "#475569", lineHeight: 1.4 }}>
                Reporting a general website issue, payment error, or bug. No ID is required (using platform reference ID).
              </span>
            </div>
          )}

          {/* Reason Selector */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, color: "#374151" }}>Reason for Report</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${errors.reason ? R : BORDER}`, fontSize: 14, outline: "none", background: "#fff" }}
            >
              <option value="">-- Choose Reason --</option>
              {REASONS.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            {errors.reason && <span style={{ fontSize: 12, color: R, fontWeight: 600 }}>{errors.reason}</span>}
          </div>

          {/* Details Textarea */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, color: "#374151" }}>Additional Explanation (Optional)</label>
              <span style={{ fontSize: 11, color: TEXT_MUTED }}>{details.length}/500</span>
            </div>
            <textarea
              placeholder="Explain the issue in detail so that our moderators can take accurate actions..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={5}
              style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${errors.details ? R : BORDER}`, fontSize: 14, outline: "none", resize: "vertical", fontFamily: "inherit" }}
            />
            {errors.details && <span style={{ fontSize: 12, color: R, fontWeight: 600 }}>{errors.details}</span>}
          </div>

          {/* Submit Button */}
          <div style={{ marginTop: 8 }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%", background: submitting ? RD : R, color: "#fff",
                border: "none", padding: "14px", borderRadius: 10, fontWeight: 800,
                fontSize: 15, cursor: submitting ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                transition: "opacity 0.2s"
              }}
            >
              {submitting ? (
                <>
                  <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                  Submitting report...
                </>
              ) : "Submit Report"}
            </button>
          </div>

        </form>
      </div>

    </main>
  </div>
);
}
