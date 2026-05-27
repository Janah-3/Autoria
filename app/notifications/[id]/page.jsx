"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { notificationsService } from "@/lib/api/notificationsService";

const R = "#E8272A";
const RD = "#B81C1F";

const row = (gap = 0) => ({ display: "flex", alignItems: "center", gap });

export default function NotificationDetailsPage({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    notificationsService.getNotificationById(id)
      .then(res => {
        const data = res?.data ?? res;
        if (data) {
          setNotification({
            title: data.title || "Notification",
            fullDesc: data.message || data.body || data.description || "",
            time: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : "—",
            type: data.type || "general",
            icon: data.type === "booking" ? "✅" : data.type === "offer" ? "🔥" : data.type === "order" ? "📦" : "🔔",
            color: data.type === "booking" ? "#f0fdf4" : data.type === "offer" ? "#fff0f0" : data.type === "order" ? "#eff6ff" : "#f8f9fa",
            details: data.details || [],
            actionLabel: data.actionLabel || "Go Back",
            actionLink: data.actionLink || "#",
          });
        }
      })
      .catch(err => {
        console.error("Failed to fetch notification:", err.message);
        setNotification(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "'Inter', sans-serif" }}>
        <Navbar />
        <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: "16px", fontWeight: "bold", color: R }}>Loading notification...</div>
        </div>
      </div>
    );
  }

  if (!notification) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "'Inter', sans-serif" }}>
        <Navbar />
        <main style={{ maxWidth: 650, margin: "40px auto", padding: "0 20px", textAlign: "center" }}>
          <div style={{ fontSize: "60px", marginBottom: "20px" }}>🔔</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Notification not found</h2>
          <p style={{ color: "#718096", marginBottom: 24 }}>This notification may have been removed or is no longer available.</p>
          <button
            onClick={() => router.push("/notifications")}
            style={{ background: R, color: "#fff", border: "none", padding: "12px 28px", borderRadius: 10, fontWeight: 700, cursor: "pointer" }}
          >Back to Notifications</button>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .nav-link { transition: all 0.2s ease; opacity: 0.82; }
        .nav-link:hover { opacity: 1; transform: translateY(-1px); }
        .btn-hover { transition: all 0.2s ease; }
        .btn-hover:hover { transform: scale(1.02); filter: brightness(1.1); box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .btn-hover:active { transform: scale(0.98); }
        .back-btn { transition: all 0.2s ease; cursor: pointer; color: #718096; text-decoration: none; display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; margin-bottom: 24px; }
        .back-btn:hover { color: ${R}; }
      `}</style>
      
      <Navbar />

      <main style={{ maxWidth: 650, margin: "40px auto", padding: "0 20px" }}>
        <a onClick={() => router.back()} className="back-btn">
          ← Back to Notifications
        </a>

        <div style={{ background: "#fff", borderRadius: 24, overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,0.04)", border: "1px solid #edf2f7" }}>

          <div style={{ background: notification.color, padding: "48px 40px", textAlign: "center" }}>
            <div style={{ 
              width: 80, 
              height: 80, 
              borderRadius: 24, 
              background: "#fff", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              fontSize: 40, 
              margin: "0 auto 24px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.05)"
            }}>
              {notification.icon}
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1a202c", marginBottom: 8, letterSpacing: -0.5 }}>{notification.title}</h1>
            <span style={{ fontSize: 12, color: "#718096", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{notification.time}</span>
          </div>


          <div style={{ padding: 40 }}>
            <p style={{ fontSize: 16, color: "#4a5568", lineHeight: 1.8, marginBottom: 32 }}>
              {notification.fullDesc}
            </p>

            {notification.details.length > 0 && (
              <div style={{ background: "#f8f9fa", borderRadius: 16, padding: "20px 24px", marginBottom: 40 }}>
                {notification.details.map((detail, index) => (
                  <div key={index} style={{ 
                    ...row(0), 
                    justifyContent: "space-between", 
                    padding: "12px 0",
                    borderBottom: index === notification.details.length - 1 ? "none" : "1px solid #edf2f7"
                  }}>
                    <span style={{ fontSize: 13, color: "#718096", fontWeight: 500 }}>{detail.label}</span>
                    <span style={{ fontSize: 14, color: "#2d3748", fontWeight: 700 }}>{detail.value}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button 
                onClick={() => router.push(notification.actionLink)}
                className="btn-hover"
                style={{ 
                  background: R, 
                  color: "#fff", 
                  border: "none", 
                  padding: "16px", 
                  borderRadius: 12, 
                  fontSize: 15, 
                  fontWeight: 800, 
                  cursor: "pointer",
                  width: "100%"
                }}
              >
                {notification.actionLabel}
              </button>
              
              <button 
                style={{ 
                  background: "transparent", 
                  color: "#718096", 
                  border: "1.5px solid #edf2f7", 
                  padding: "16px", 
                  borderRadius: 12, 
                  fontSize: 14, 
                  fontWeight: 700, 
                  cursor: "pointer",
                  width: "100%"
                }}
                className="btn-hover"
              >
                Delete Notification
              </button>
            </div>
          </div>
        </div>

        <p style={{ textAlign: "center", color: "#a0aec0", fontSize: 12, marginTop: 40 }}>
          If you didn't expect this notification, please contact our <a href="#" style={{ color: R, textDecoration: "none", fontWeight: 600 }}>Support Team</a>.
        </p>
      </main>
    </div>
  );
}
