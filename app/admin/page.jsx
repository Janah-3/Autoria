"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { adminService } from "@/lib/api/adminService";
import {
  serviceCentersService,
  getServiceCenterItems,
} from "@/lib/api/serviceCentersService";


const COLORS = {
  primary: "#E8272A",
  primaryDark: "#B81C1F",
  bg: "#F8FAFC",
  sidebar: "#FFFFFF",
  border: "#E2E8F0",
  text: "#1E293B",
  textLight: "#64748B",
  success: "#10B981",
  warning: "#F59E0B",
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [metrics, setMetrics] = useState(null);
  const [verificationQueue, setVerificationQueue] = useState([]);
  const [flaggedReviews, setFlaggedReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [dash, pending] = await Promise.all([
        adminService.getDashboard(),
        serviceCentersService.getPending(),
      ]);

      if (dash?.data?.metrics) setMetrics(dash.data.metrics);

      setFlaggedReviews(
        (dash?.data?.recentReports || []).map((r) => ({
          id: r.reportId,
          user: r.reportedBy,
          target: r.targetName,
          text: `${r.reason} — ${r.targetType}`,
          reason: r.status,
          isUrgent: r.isUrgent,
        }))
      );

      const pendingItems = getServiceCenterItems(pending);
      setVerificationQueue(
        pendingItems.map((c) => ({
          id: c.id,
          name: c.name,
          city: c.governorate || c.city,
          type: c.type,
          phone: c.phone,
          date: c.submittedAt
            ? new Date(c.submittedAt).toLocaleDateString()
            : "—",
        }))
      );
    } catch (err) {
      console.error("Admin load:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApprove = async (id) => {
    try {
      await serviceCentersService.approve(id);
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Rejection reason:");
    if (!reason) return;
    try {
      await serviceCentersService.reject(id, reason);
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDismissReport = (id) => {
    setFlaggedReviews((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div style={{ display: "flex", background: COLORS.bg, minHeight: "100vh", fontFamily: "sans-serif" }}>
      
      {/* Sidebar Component - Extracted for cleaner code */}
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        badges={{
          verification: verificationQueue.length,
          reviews: flaggedReviews.length,
          reports: flaggedReviews.filter((r) => r.isUrgent).length,
          featured: 0,
        }}
        colors={COLORS}
      />

      {/* Main Panel */}
      <main style={{ flex: 1, padding: "40px" }}>
        
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>{activeTab}</h1>
          <Link href="/" style={{ color: COLORS.primary, textDecoration: "none", fontWeight: "bold", fontSize: "14px" }}>← Back to Website</Link>
        </header>

        {loading && (
          <p style={{ color: COLORS.textLight, marginBottom: 20 }}>Loading admin data…</p>
        )}

        {activeTab === "Dashboard" && (
          <div>
            <div style={{ display: "flex", gap: "20px", marginBottom: "30px", flexWrap: "wrap" }}>
              {[
                ["TOTAL USERS", metrics?.totalUsers],
                ["BOOKINGS THIS MONTH", metrics?.bookingsThisMonth],
                ["ACTIVE CENTERS", metrics?.activeCenters],
                ["PENDING CENTERS", metrics?.pendingCenterRequests],
                ["URGENT REPORTS", metrics?.urgentReports],
              ].map(([label, value]) => (
              <div key={label} style={{ background: "#fff", padding: "20px", borderRadius: "15px", border: `1px solid ${COLORS.border}`, flex: "1 1 180px" }}>
                <div style={{ color: COLORS.textLight, fontSize: "12px", marginBottom: "5px" }}>{label}</div>
                <div style={{ fontSize: "24px", fontWeight: "bold" }}>{value ?? "—"}</div>
              </div>
              ))}
            </div>

            <div style={{ background: "#fff", padding: "25px", borderRadius: "15px", border: `1px solid ${COLORS.border}` }}>
              <h3 style={{ marginBottom: "20px" }}>Admin Overview</h3>
              <p style={{ color: COLORS.textLight }}>Manage the platform entities and user activities from the sidebar menu.</p>
            </div>
          </div>
        )}

        {activeTab === "Center verification" && (
          <div style={{ background: "#fff", padding: "25px", borderRadius: "15px", border: `1px solid ${COLORS.border}` }}>
            <h2 style={{ marginBottom: "20px" }}>Verification Queue</h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: `2px solid ${COLORS.bg}` }}>
                  <th style={{ padding: "10px", fontSize: "12px", color: COLORS.textLight }}>CENTER NAME</th>
                  <th style={{ padding: "10px", fontSize: "12px", color: COLORS.textLight }}>CITY</th>
                  <th style={{ padding: "10px", fontSize: "12px", color: COLORS.textLight }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {verificationQueue.length === 0 ? (
                  <tr><td colSpan={3} style={{ padding: 20, color: COLORS.textLight }}>No pending registrations.</td></tr>
                ) : verificationQueue.map(c => (
                  <tr key={c.id} style={{ borderBottom: `1px solid ${COLORS.bg}` }}>
                    <td style={{ padding: "15px 10px", fontWeight: "bold" }}>{c.name}</td>
                    <td style={{ padding: "15px 10px" }}>{c.city}</td>
                    <td style={{ padding: "15px 10px" }}>
                      <button onClick={() => handleApprove(c.id)} style={{ background: COLORS.success, color: "#fff", border: "none", padding: "5px 10px", borderRadius: "5px", cursor: "pointer", marginRight: "5px" }}>Approve</button>
                      <button onClick={() => handleReject(c.id)} style={{ background: COLORS.primary, color: "#fff", border: "none", padding: "5px 10px", borderRadius: "5px", cursor: "pointer" }}>Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "Review moderation" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {flaggedReviews.length === 0 ? (
              <p style={{ color: COLORS.textLight }}>No open reports.</p>
            ) : flaggedReviews.map(r => (
              <div key={r.id} style={{ background: "#fff", padding: "20px", borderRadius: "15px", border: `1px solid ${COLORS.border}` }}>
                <div style={{ fontWeight: "bold", marginBottom: "5px" }}>{r.user}</div>
                <div style={{ color: COLORS.primary, fontSize: "12px", marginBottom: "10px" }}>Target: {r.target} {r.isUrgent ? "• Urgent" : ""}</div>
                <p style={{ fontSize: "14px", fontStyle: "italic", marginBottom: "15px" }}>"{r.text}"</p>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => handleDismissReport(r.id)} style={{ flex: 1, padding: "8px", borderRadius: "5px", border: `1px solid ${COLORS.border}`, background: "#fff", cursor: "pointer" }}>Dismiss</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "User reports" && (
          <div style={{ background: "#fff", padding: "25px", borderRadius: "15px", border: `1px solid ${COLORS.border}` }}>
            <p style={{ color: COLORS.textLight }}>Reports are shown under Review moderation from the admin dashboard API.</p>
          </div>
        )}

        {activeTab === "Featured listings" && (
          <div style={{ background: "#fff", padding: "25px", borderRadius: "15px", border: `1px solid ${COLORS.border}` }}>
            <p style={{ color: COLORS.textLight }}>Featured listings API is not available yet.</p>
          </div>
        )}

      </main>
    </div>
  );
}
