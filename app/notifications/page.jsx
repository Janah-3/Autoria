"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

const R = "#E8272A";
const RD = "#B81C1F";

const NOTIFICATIONS = [];

const row = (gap = 0) => ({ display: "flex", alignItems: "center", gap });



export default function NotificationListPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .nav-link { transition: all 0.2s ease; opacity: 0.82; }
        .nav-link:hover { opacity: 1; transform: translateY(-1px); }
        .btn-hover { transition: all 0.2s ease; }
        .btn-hover:hover { transform: scale(1.04); filter: brightness(1.1); }
        .notification-card { transition: all 0.2s ease; cursor: pointer; border: 1px solid #edf2f7; }
        .notification-card:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0,0,0,0.05); border-color: ${R}40; }
        .unread-dot { width: 8px; height: 8px; background: ${R}; borderRadius: 50%; }
      `}</style>
      
      <Navbar />

      <main style={{ maxWidth: 800, margin: "40px auto", padding: "0 20px" }}>
        <div style={{ ...row(0), justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: "#1a202c", letterSpacing: -0.5 }}>Notifications</h1>
            <p style={{ fontSize: 14, color: "#718096", marginTop: 4 }}>Stay updated with your car's health and bookings.</p>
          </div>
          <button 
            onClick={markAllRead}
            style={{ background: "transparent", border: "none", color: R, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
            className="btn-hover"
          >
            Mark all as read
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {notifications.map((n) => (
            <div 
              key={n.id} 
              onClick={() => router.push(`/notifications/${n.id}`)}
              className="notification-card"
              style={{ 
                background: "#fff", 
                borderRadius: 16, 
                padding: 20, 
                ...row(16),
                position: "relative",
                borderLeft: n.unread ? `4px solid ${R}` : "4px solid transparent"
              }}
            >
              <div style={{ 
                width: 48, 
                height: 48, 
                borderRadius: 12, 
                background: n.color, 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                fontSize: 20,
                flexShrink: 0
              }}>
                {n.icon}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ ...row(8), marginBottom: 4 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: "#2d3748" }}>{n.title}</h3>
                  {n.unread && <div className="unread-dot" />}
                </div>
                <p style={{ fontSize: 13, color: "#4a5568", lineHeight: 1.5, marginBottom: 8 }}>{n.desc}</p>
                <span style={{ fontSize: 11, color: "#a0aec0", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{n.time}</span>
              </div>

              <div style={{ fontSize: 18, color: "#cbd5e0" }}>→</div>
            </div>
          ))}
        </div>

        {notifications.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#2d3748" }}>No notifications yet</h2>
            <p style={{ fontSize: 14, color: "#718096" }}>We'll let you know when something important happens.</p>
          </div>
        )}
      </main>
    </div>
  );
}
