"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { premiumService } from "@/lib/api/premiumService";
import { subscriptionService } from "@/lib/api/subscriptionService";
import { serviceCentersService } from "@/lib/api/serviceCentersService";
import { useRoleGuard } from "@/lib/hooks/useRoleGuard";

// ── Brand tokens ──────────────────────────────────────────────────────────────
const R = "#E8272A";
const RD = "#B81C1F";
const BG = "#F8F9FA";
const BRD = "#E9ECEF";
const WH = "#FFFFFF";
const TL = "#6C757D";
const ACT = "#FEEBEB";

// ── Sidebar ───────────────────────────────────────────────────────────────────
const Sidebar = () => (
  <aside style={{ width: 240, background: WH, borderRight: `1px solid ${BRD}`, padding: "30px 0", height: "100vh", position: "sticky", top: 0, flexShrink: 0 }}>
    <div style={{ padding: "0 25px", marginBottom: 40 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: TL, letterSpacing: "1.5px", marginBottom: 20 }}>MANAGE</div>
      {[
        { id: "Dashboard", icon: "📊", path: "/service-center" },
        { id: "Analytics", icon: "📈", path: "/service-center/analytics" },
        { id: "Booking requests", icon: "📬", path: "/booking-requests" },
        { id: "Availability", icon: "📅", path: "/availability" },
        { id: "Spare parts", icon: "⚙️", path: "/spare-parts-inventory" },
        { id: "Reviews", icon: "⭐", path: "/reviews" },
        { id: "Business profile", icon: "🏢", path: "/service-center/edit" },
        { id: "Subscription", icon: "💎", path: "/service-center/subscription" },
        { id: "Promotions", icon: "📣", path: "/service-center/promotions", active: true },
      ].map(item => (
        <Link href={item.path} key={item.id} style={{ textDecoration: "none" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 12, padding: "12px 25px",
            margin: "4px 15px", borderRadius: 10, fontSize: 14,
            fontWeight: item.active ? 700 : 500, cursor: "pointer",
            background: item.active ? ACT : "transparent",
            color: item.active ? R : TL,
            borderLeft: item.active ? `4px solid ${R}` : "none",
          }}>
            <span>{item.icon}</span> {item.id}
          </div>
        </Link>
      ))}
    </div>
  </aside>
);

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

const MAX_SUBJECT = 100;
const MAX_BODY = 2000;

// ─────────────────────────────────────────────────────────────────────────────
export default function PromotionsPage() {
  const { authorized, checking } = useRoleGuard();
  const router = useRouter();
  const [centerId, setCenterId] = useState(null);
  const [centerName, setCenterName] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const triggerToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  useEffect(() => {
    (async () => {
      try {
        const myCenter = await serviceCentersService.getMy();
        const d = myCenter?.data ?? myCenter;
        const id = d?.id ?? d?.Id;
        setCenterId(id);
        setCenterName(d?.name || d?.Name || "Your Service Center");

        if (id) {
          const statusRes = await subscriptionService.getStatus(id).catch(() => null);
          const premium = statusRes?.data?.isPremium ?? statusRes?.isPremium ?? false;
          setIsPremium(premium);
          if (!premium) {
            router.push("/service-center/subscription");
            return;
          }
        }
      } catch (err) {
        console.error("Failed to load:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (checking || !authorized) return null;

  const handleSend = async () => {
    if (!subject.trim() || !body.trim() || !centerId) return;
    setSending(true);
    try {
      await premiumService.sendPromotion(centerId, {
        subject: subject.trim(),
        body: body.trim(),
      });
      triggerToast("🎉 Promotional email sent to all past clients!");
      setSent(true);
      setSubject("");
      setBody("");
      setTimeout(() => setSent(false), 5000);
    } catch (err) {
      triggerToast(err.message || "Failed to send promotion", "error");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: BG }}>
        <div style={{ color: R, fontSize: 18, fontWeight: "bold" }}>Loading Promotions...</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: BG, fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <style>{`
        @keyframes slideIn { from{transform:translateY(-20px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes fadeIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.02)} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .promo-input { width: 100%; border: 1.5px solid ${BRD}; border-radius: 12px; padding: 14px 16px; font-size: 15px; font-family: inherit; outline: none; transition: border-color 0.2s, box-shadow 0.2s; background: ${WH}; }
        .promo-input:focus { border-color: ${R}; box-shadow: 0 0 0 3px rgba(232,39,42,0.1); }
        .send-btn { transition: all 0.2s ease; cursor: pointer; border: none; }
        .send-btn:hover:not(:disabled) { transform: scale(1.02); filter: brightness(1.1); box-shadow: 0 8px 25px rgba(232,39,42,0.3); }
        .send-btn:active:not(:disabled) { transform: scale(0.98); }
        .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <Toast {...toast} />
      <Sidebar />

      <main style={{ flex: 1, padding: "36px 40px", overflowY: "auto", maxWidth: 1100 }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: TL, letterSpacing: "1.5px" }}>PROMOTIONS</span>
            <span style={{ background: R, color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 4, letterSpacing: "0.5px" }}>PREMIUM</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#1A1A1A", letterSpacing: -0.5 }}>
            Marketing Campaigns
          </h1>
          <p style={{ fontSize: 14, color: TL, marginTop: 6 }}>
            Send promotional emails to all your past clients. Keep them engaged and coming back.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 32 }}>

          {/* ── Compose area ──────────────────────────────────────── */}
          <div style={{ background: WH, borderRadius: 20, padding: "32px", border: `1px solid ${BRD}`, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 24 }}>📧 Compose Promotion</h2>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#1A1A1A", marginBottom: 6, display: "block" }}>
                Subject Line
              </label>
              <input
                className="promo-input"
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value.slice(0, MAX_SUBJECT))}
                placeholder="e.g. Summer Car Service Discount"
              />
              <div style={{ textAlign: "right", fontSize: 11, color: subject.length >= MAX_SUBJECT ? R : TL, marginTop: 4, fontWeight: 600 }}>
                {subject.length}/{MAX_SUBJECT}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#1A1A1A", marginBottom: 6, display: "block" }}>
                Email Body
              </label>
              <textarea
                className="promo-input"
                value={body}
                onChange={e => setBody(e.target.value.slice(0, MAX_BODY))}
                placeholder="Write your promotion message here... Include special offers, discounts, or service updates."
                style={{ minHeight: 200, resize: "vertical" }}
              />
              <div style={{ textAlign: "right", fontSize: 11, color: body.length >= MAX_BODY ? R : TL, marginTop: 4, fontWeight: 600 }}>
                {body.length}/{MAX_BODY}
              </div>
            </div>

            <button
              className="send-btn"
              onClick={handleSend}
              disabled={sending || !subject.trim() || !body.trim()}
              style={{
                width: "100%", padding: "16px 0", borderRadius: 14,
                background: R, color: "#fff", fontWeight: 800, fontSize: 16,
              }}
            >
              {sending ? "Sending..." : sent ? "✅ Sent Successfully!" : "📣 Send Promotional Email"}
            </button>

            <p style={{ fontSize: 11, color: TL, marginTop: 12, textAlign: "center" }}>
              This email will be sent to all clients who have previously booked with your service center.
            </p>
          </div>

          {/* ── Email preview ─────────────────────────────────────── */}
          <div>
            <div style={{ background: WH, borderRadius: 20, padding: "28px", border: `1px solid ${BRD}`, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <span style={{ fontSize: 16 }}>👁️</span>
                <span style={{ fontSize: 14, fontWeight: 800 }}>Email Preview</span>
              </div>

              {/* Mini email mockup */}
              <div style={{ border: `1px solid ${BRD}`, borderRadius: 14, overflow: "hidden" }}>
                {/* Email header */}
                <div style={{ background: "#F8F9FA", padding: "14px 18px", borderBottom: `1px solid ${BRD}` }}>
                  <div style={{ fontSize: 11, color: TL, marginBottom: 4 }}>FROM: <strong>{centerName}</strong></div>
                  <div style={{ fontSize: 11, color: TL }}>SUBJECT: <strong style={{ color: "#1A1A1A" }}>{subject || "Your subject line here..."}</strong></div>
                </div>
                {/* Email body */}
                <div style={{ padding: "20px 18px", minHeight: 160 }}>
                  {body ? (
                    <p style={{ fontSize: 13, lineHeight: 1.7, color: "#333", whiteSpace: "pre-wrap" }}>{body}</p>
                  ) : (
                    <p style={{ fontSize: 13, color: TL, fontStyle: "italic" }}>Your email content will appear here as you type...</p>
                  )}
                </div>
                {/* Email footer */}
                <div style={{ background: "#F8F9FA", padding: "12px 18px", borderTop: `1px solid ${BRD}`, textAlign: "center" }}>
                  <span style={{ fontSize: 11, color: TL }}>Sent via <strong style={{ color: R }}>Autoria</strong> Premium</span>
                </div>
              </div>
            </div>

            {/* Tips card */}
            <div style={{ background: "linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)", borderRadius: 20, padding: "24px 28px", color: "#fff" }}>
              <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>💡 Promotion Tips</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  "Use a clear, attention-grabbing subject line",
                  "Include specific offers with discounts",
                  "Set a deadline to create urgency",
                  "Keep the message concise and friendly",
                  "Mention your most popular services",
                ].map((tip, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, opacity: 0.85 }}>
                    <span style={{ color: "#10B981", fontWeight: 900 }}>✓</span>
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
