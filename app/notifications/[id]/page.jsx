"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useRoleGuard } from "@/lib/hooks/useRoleGuard";
import notificationService, {
  NOTIFICATION_TYPE_META,
} from "@/lib/notificationService";

const R = "#E8272A";

const row = (gap = 0) => ({ display: "flex", alignItems: "center", gap });

const TYPE_TITLE = {
  0: "Booking Confirmed",
  1: "Booking Cancelled",
  2: "Booking Completed",
  3: "Booking Rescheduled",
  4: "Booking Pending",
};

function formatDate(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleString("en-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getTypeMeta(type) {
  return (
    NOTIFICATION_TYPE_META[type] ?? {
      icon: "fa-solid fa-bell",
      color: "#f8f9fa",
      iconColor: "#718096",
    }
  );
}

export default function NotificationDetailsPage({ params }) {
  const { authorized, checking } = useRoleGuard();
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadNotification = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Mark as read when opening, then fetch list to find this item
      await notificationService.markAsRead(id);
      const data = await notificationService.getNotifications({ pageSize: 100 });
      const found = (data?.items ?? []).find((n) => n.id === id);
      if (!found) throw new Error("Notification not found");
      setNotification(found);
    } catch (err) {
      setError(err.message || "Failed to load notification");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadNotification();
  }, [loadNotification]);

  if (checking) return null;
  if (!authorized) return null;

  const meta = notification ? getTypeMeta(notification.type) : null;
  const title = notification ? (TYPE_TITLE[notification.type] ?? "Notification") : "";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8f9fa",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <style>{`
        .btn-hover { transition: all 0.2s ease; }
        .btn-hover:hover { transform: scale(1.02); filter: brightness(1.1); box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .btn-hover:active { transform: scale(0.98); }
        .back-btn { transition: all 0.2s ease; cursor: pointer; color: #718096; text-decoration: none; display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; margin-bottom: 24px; background: none; border: none; padding: 0; }
        .back-btn:hover { color: ${R}; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { width: 40px; height: 40px; border: 3px solid #edf2f7; border-top-color: ${R}; border-radius: 50%; animation: spin 0.7s linear infinite; }
      `}</style>

      <Navbar />

      <main style={{ maxWidth: 650, margin: "40px auto", padding: "0 20px" }}>
        <button onClick={() => router.back()} className="back-btn">
          <i className="fa-solid fa-arrow-left" />
          Back to Notifications
        </button>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <div className="spinner" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            style={{
              background: "#fff5f5",
              border: "1px solid #fed7d7",
              borderRadius: 16,
              padding: "40px",
              textAlign: "center",
            }}
          >
            <i
              className="fa-solid fa-triangle-exclamation"
              style={{ fontSize: 36, color: "#c53030", marginBottom: 12, display: "block" }}
            />
            <p style={{ fontSize: 15, color: "#c53030", fontWeight: 700 }}>{error}</p>
            <button
              onClick={loadNotification}
              style={{
                marginTop: 16,
                background: R,
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "10px 24px",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
              className="btn-hover"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && notification && (
          <div
            style={{
              background: "#fff",
              borderRadius: 24,
              overflow: "hidden",
              boxShadow: "0 10px 40px rgba(0,0,0,0.04)",
              border: "1px solid #edf2f7",
            }}
          >
            {/* Hero header */}
            <div
              style={{
                background: meta.color,
                padding: "48px 40px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 24,
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
                }}
              >
                <i
                  className={meta.icon}
                  style={{ fontSize: 32, color: meta.iconColor }}
                />
              </div>
              <h1
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  color: "#1a202c",
                  marginBottom: 8,
                  letterSpacing: -0.5,
                }}
              >
                {title}
              </h1>
              <span
                style={{
                  fontSize: 12,
                  color: "#718096",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                {formatDate(notification.createdAt)}
              </span>
            </div>

            {/* Body */}
            <div style={{ padding: 40 }}>
              <p
                style={{
                  fontSize: 16,
                  color: "#4a5568",
                  lineHeight: 1.8,
                  marginBottom: 32,
                }}
              >
                {notification.content}
              </p>

              {/* Meta details row */}
              <div
                style={{
                  background: "#f8f9fa",
                  borderRadius: 16,
                  padding: "20px 24px",
                  marginBottom: 40,
                }}
              >
                {[
                  {
                    label: "Status",
                    value: notification.isRead ? "Read" : "Unread",
                    icon: "fa-solid fa-circle-dot",
                    iconColor: notification.isRead ? "#15803d" : R,
                  },
                  {
                    label: "Received",
                    value: formatDate(notification.createdAt),
                    icon: "fa-solid fa-calendar",
                    iconColor: "#718096",
                  },
                  ...(notification.readAt
                    ? [
                        {
                          label: "Read At",
                          value: formatDate(notification.readAt),
                          icon: "fa-solid fa-eye",
                          iconColor: "#718096",
                        },
                      ]
                    : []),
                ].map((detail, index, arr) => (
                  <div
                    key={index}
                    style={{
                      ...row(0),
                      justifyContent: "space-between",
                      padding: "12px 0",
                      borderBottom:
                        index === arr.length - 1
                          ? "none"
                          : "1px solid #edf2f7",
                    }}
                  >
                    <span
                      style={{
                        ...row(8),
                        fontSize: 13,
                        color: "#718096",
                        fontWeight: 500,
                      }}
                    >
                      <i
                        className={detail.icon}
                        style={{ color: detail.iconColor, width: 14 }}
                      />
                      {detail.label}
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        color: "#2d3748",
                        fontWeight: 700,
                      }}
                    >
                      {detail.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <button
                  onClick={() => router.push("/bookings")}
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
                    width: "100%",
                    ...row(10),
                    justifyContent: "center",
                  }}
                >
                  <i className="fa-solid fa-calendar-check" />
                  View My Bookings
                </button>

                <button
                  onClick={() => router.back()}
                  style={{
                    background: "transparent",
                    color: "#718096",
                    border: "1.5px solid #edf2f7",
                    padding: "16px",
                    borderRadius: 12,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    width: "100%",
                    ...row(10),
                    justifyContent: "center",
                  }}
                  className="btn-hover"
                >
                  <i className="fa-solid fa-arrow-left" />
                  Back to Notifications
                </button>
              </div>
            </div>
          </div>
        )}

        <p
          style={{
            textAlign: "center",
            color: "#a0aec0",
            fontSize: 12,
            marginTop: 40,
          }}
        >
          If you didn't expect this notification, please contact our{" "}
          <a
            href="#"
            style={{ color: R, textDecoration: "none", fontWeight: 600 }}
          >
            Support Team
          </a>
          .
        </p>
      </main>
    </div>
  );
}
