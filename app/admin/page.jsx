"use client";

import { useState } from "react";
import Link from "next/link";
import AdminSidebar from "@/components/admin/AdminSidebar";


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

  // Mock data for the platform management
  const [verificationQueue, setVerificationQueue] = useState([
    { id: 1, name: "Al Faris Auto", city: "Cairo", type: "Full Service", phone: "01012345678", date: "12 Mar 2026" },
    { id: 2, name: "QuickFix Heliopolis", city: "Cairo", type: "Tires & Oil", phone: "01198765432", date: "12 Mar 2026" },
    { id: 3, name: "Nile Motors Alex", city: "Alexandria", type: "Engine Repair", phone: "01200000000", date: "11 Mar 2026" },
  ]);

  const [flaggedReviews, setFlaggedReviews] = useState([
    { id: 1, user: "Ahmed M.", rating: 1, target: "AutoFix Cairo", text: "They overcharged me and the parts were not original!", reason: "Spam" },
    { id: 2, user: "Sara K.", rating: 5, target: "SpeedFix Maadi", text: "Best ever!!!!!", reason: "Potential Bot" },
  ]);

  const [complaints, setComplaints] = useState([
    { id: 101, type: "Overcharging", from: "Youssef Z.", target: "Gulf Auto", date: "14 Mar", status: "High Priority" },
    { id: 102, type: "Bad Behavior", from: "Mona A.", target: "TechMotors", date: "13 Mar", status: "Medium" },
  ]);

  const [featured, setFeatured] = useState([
    { id: 1, name: "AutoCare Nasr City", city: "Cairo", expires: "31 Mar" },
    { id: 2, name: "Gulf Auto Alex", city: "Alexandria", expires: "15 Apr" },
  ]);

  // Action handlers
  const handleAction = (id, type) => {
    if (type === 'center') {
      setVerificationQueue(verificationQueue.filter(c => c.id !== id));
    } else if (type === 'review') {
      setFlaggedReviews(flaggedReviews.filter(r => r.id !== id));
    } else if (type === 'report') {
      setComplaints(complaints.filter(c => c.id !== id));
    } else if (type === 'removeFeatured') {
      setFeatured(featured.filter(f => f.id !== id));
    }
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
          reports: complaints.length,
          featured: featured.length
        }}
        colors={COLORS}
      />

      {/* Main Panel */}
      <main style={{ flex: 1, padding: "40px" }}>
        
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>{activeTab}</h1>
          <Link href="/" style={{ color: COLORS.primary, textDecoration: "none", fontWeight: "bold", fontSize: "14px" }}>← Back to Website</Link>
        </header>

        {activeTab === "Dashboard" && (
          <div>
            <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
              <div style={{ background: "#fff", padding: "20px", borderRadius: "15px", border: `1px solid ${COLORS.border}`, flex: 1 }}>
                <div style={{ color: COLORS.textLight, fontSize: "12px", marginBottom: "5px" }}>TOTAL USERS</div>
                <div style={{ fontSize: "24px", fontWeight: "bold" }}>12,480</div>
              </div>
              <div style={{ background: "#fff", padding: "20px", borderRadius: "15px", border: `1px solid ${COLORS.border}`, flex: 1 }}>
                <div style={{ color: COLORS.textLight, fontSize: "12px", marginBottom: "5px" }}>TOTAL BOOKINGS</div>
                <div style={{ fontSize: "24px", fontWeight: "bold" }}>3,241</div>
              </div>
              <div style={{ background: "#fff", padding: "20px", borderRadius: "15px", border: `1px solid ${COLORS.border}`, flex: 1 }}>
                <div style={{ color: COLORS.textLight, fontSize: "12px", marginBottom: "5px" }}>ACTIVE CENTERS</div>
                <div style={{ fontSize: "24px", fontWeight: "bold" }}>184</div>
              </div>
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
                {verificationQueue.map(c => (
                  <tr key={c.id} style={{ borderBottom: `1px solid ${COLORS.bg}` }}>
                    <td style={{ padding: "15px 10px", fontWeight: "bold" }}>{c.name}</td>
                    <td style={{ padding: "15px 10px" }}>{c.city}</td>
                    <td style={{ padding: "15px 10px" }}>
                      <button onClick={() => handleAction(c.id, 'center')} style={{ background: COLORS.success, color: "#fff", border: "none", padding: "5px 10px", borderRadius: "5px", cursor: "pointer", marginRight: "5px" }}>Approve</button>
                      <button onClick={() => handleAction(c.id, 'center')} style={{ background: COLORS.primary, color: "#fff", border: "none", padding: "5px 10px", borderRadius: "5px", cursor: "pointer" }}>Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "Review moderation" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {flaggedReviews.map(r => (
              <div key={r.id} style={{ background: "#fff", padding: "20px", borderRadius: "15px", border: `1px solid ${COLORS.border}` }}>
                <div style={{ fontWeight: "bold", marginBottom: "5px" }}>{r.user}</div>
                <div style={{ color: COLORS.primary, fontSize: "12px", marginBottom: "10px" }}>Target: {r.target}</div>
                <p style={{ fontSize: "14px", fontStyle: "italic", marginBottom: "15px" }}>"{r.text}"</p>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => handleAction(r.id, 'review')} style={{ flex: 1, padding: "8px", borderRadius: "5px", border: `1px solid ${COLORS.border}`, background: "#fff", cursor: "pointer" }}>Keep</button>
                  <button onClick={() => handleAction(r.id, 'review')} style={{ flex: 1, padding: "8px", borderRadius: "5px", border: "none", background: COLORS.primary, color: "#fff", cursor: "pointer" }}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "User reports" && (
          <div style={{ background: "#fff", padding: "25px", borderRadius: "15px", border: `1px solid ${COLORS.border}` }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: `2px solid ${COLORS.bg}` }}>
                  <th style={{ padding: "10px", fontSize: "12px", color: COLORS.textLight }}>TYPE</th>
                  <th style={{ padding: "10px", fontSize: "12px", color: COLORS.textLight }}>AGAINST</th>
                  <th style={{ padding: "10px", fontSize: "12px", color: COLORS.textLight }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map(c => (
                  <tr key={c.id} style={{ borderBottom: `1px solid ${COLORS.bg}` }}>
                    <td style={{ padding: "15px 10px", fontWeight: "bold" }}>{c.type}</td>
                    <td style={{ padding: "15px 10px", color: COLORS.primary }}>{c.target}</td>
                    <td style={{ padding: "15px 10px" }}>
                      <button onClick={() => handleAction(c.id, 'report')} style={{ background: COLORS.success, color: "#fff", border: "none", padding: "5px 10px", borderRadius: "5px", cursor: "pointer" }}>Resolve</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "Featured listings" && (
          <div style={{ background: "#fff", padding: "25px", borderRadius: "15px", border: `1px solid ${COLORS.border}` }}>
            <h3 style={{ marginBottom: "20px" }}>Featured Centers</h3>
            {featured.map(f => (
              <div key={f.id} style={{ display: "flex", justifyContent: "space-between", padding: "15px", borderBottom: `1px solid ${COLORS.bg}` }}>
                <div>
                  <div style={{ fontWeight: "bold" }}>{f.name}</div>
                  <div style={{ fontSize: "12px", color: COLORS.textLight }}>Expires: {f.expires}</div>
                </div>
                <button onClick={() => handleAction(f.id, 'removeFeatured')} style={{ color: COLORS.primary, background: "none", border: "none", fontWeight: "bold", cursor: "pointer" }}>Remove</button>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
