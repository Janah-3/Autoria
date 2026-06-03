"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import notificationService, { NOTIFICATION_TYPE_META } from "@/lib/notificationService";
import { useLanguage } from "@/context/LanguageContext";

const R = "#E8272A";
const row = (gap = 0) => ({ display: "flex", alignItems: "center", gap });

function formatRelativeTime(isoString, t) {
  if (!isoString) return "";
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t("notifications.justNow");
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function getTypeMeta(type) {
  return NOTIFICATION_TYPE_META[type] ?? { label: "notification", icon: "fa-solid fa-bell", color: "#f8f9fa", iconColor: "#718096" };
}

export default function NotificationListPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.getNotifications({ pageSize: 50 });
      setNotifications(data?.items ?? []);
    } catch (err) {
      setError(err.message || t("notifications.title"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  const markAllRead = async () => {
    try {
      setMarkingAll(true);
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    } finally {
      setMarkingAll(false);
    }
  };

  const getTypeLabel = (type) => {
    const labels = t("notifications.typeLabels");
    return labels[type] ?? labels.default;
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .notification-card { transition: all 0.2s ease; cursor: pointer; border: 1px solid #edf2f7; }
        .notification-card:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0,0,0,0.05); border-color: ${R}40; }
        .btn-hover { transition: all 0.2s ease; }
        .btn-hover:hover { transform: scale(1.04); filter: brightness(1.1); }
        .unread-dot { width: 8px; height: 8px; background: ${R}; border-radius: 50%; flex-shrink: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { width: 40px; height: 40px; border: 3px solid #edf2f7; border-top-color: ${R}; border-radius: 50%; animation: spin 0.7s linear infinite; }
      `}</style>

      <Navbar />

      <main style={{ maxWidth: 800, margin: "40px auto", padding: "0 20px" }}>
        <div style={{ ...row(0), justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: "#1a202c", letterSpacing: -0.5 }}>
              {t("notifications.title")}
              {unreadCount > 0 && (
                <span style={{ marginLeft: 10, fontSize: 13, fontWeight: 800, background: R, color: "#fff", borderRadius: 999, padding: "2px 10px", verticalAlign: "middle" }}>
                  {unreadCount}
                </span>
              )}
            </h1>
            <p style={{ fontSize: 14, color: "#718096", marginTop: 4 }}>{t("notifications.subtitle")}</p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} disabled={markingAll} className="btn-hover"
              style={{ background: "transparent", border: "none", color: R, fontSize: 13, fontWeight: 700, cursor: markingAll ? "not-allowed" : "pointer", opacity: markingAll ? 0.6 : 1 }}>
              {markingAll ? t("notifications.marking") : t("notifications.markAllRead")}
            </button>
          )}
        </div>

        {loading && <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}><div className="spinner" /></div>}

        {!loading && error && (
          <div style={{ background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: 16, padding: "32px", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
            <p style={{ fontSize: 15, color: "#c53030", fontWeight: 700 }}>{error}</p>
            <button onClick={loadNotifications} className="btn-hover"
              style={{ marginTop: 16, background: R, color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              {t("notifications.tryAgain")}
            </button>
          </div>
        )}

        {!loading && !error && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {notifications.map((n) => {
              const meta = getTypeMeta(n.type);
              return (
                <div key={n.id} onClick={() => router.push(`/notifications/${n.id}`)} className="notification-card"
                  style={{ background: "#fff", borderRadius: 16, padding: 20, ...row(16), position: "relative", borderLeft: !n.isRead ? `4px solid ${R}` : "4px solid transparent" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: meta.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className={meta.icon} style={{ fontSize: 18, color: meta.iconColor }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ ...row(8), marginBottom: 4, flexWrap: "wrap" }}>
                      <h3 style={{ fontSize: 15, fontWeight: 800, color: "#2d3748" }}>{getTypeLabel(n.type)}</h3>
                      {!n.isRead && <div className="unread-dot" />}
                    </div>
                    <p style={{ fontSize: 13, color: "#4a5568", lineHeight: 1.5, marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.content}</p>
                    <span style={{ fontSize: 11, color: "#a0aec0", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{formatRelativeTime(n.createdAt, t)}</span>
                  </div>
                  <div style={{ fontSize: 18, color: "#cbd5e0" }}>→</div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#2d3748" }}>{t("notifications.noNotifications")}</h2>
            <p style={{ fontSize: 14, color: "#718096" }}>{t("notifications.noNotificationsDesc")}</p>
          </div>
        )}
      </main>
    </div>
  );
}
