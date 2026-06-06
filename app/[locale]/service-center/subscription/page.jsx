"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { subscriptionService } from "@/lib/api/subscriptionService";
import { serviceCentersService } from "@/lib/api/serviceCentersService";
import { useRoleGuard } from "@/lib/hooks/useRoleGuard";

// ── Brand tokens ──────────────────────────────────────────────────────────────
const R = "#E8272A";
const BG = "#F8F9FA";
const BRD = "#E9ECEF";
const WH = "#FFFFFF";
const TL = "#6C757D";
const ACT = "#FEEBEB";
const SH = "0 4px 20px rgba(0,0,0,0.05)";

// ── Premium Features ─────────────────────────────────────────────────────────
const PREMIUM_FEATURES = [
  "📊 Analytics Dashboard",
  "📣 Promotions & Marketing",
  "🔝 Increased Visibility",
  "⭐ Premium Badge",
  "👥 Customer Insights",
  "📈 Growth Indicators",
];

// ── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar = () => (
  <aside
    style={{
      width: 240,
      background: WH,
      borderRight: `1px solid ${BRD}`,
      padding: "30px 0",
      height: "100vh",
      position: "sticky",
      top: 0,
      flexShrink: 0,
    }}
  >
    <div style={{ padding: "0 25px" }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: TL,
          letterSpacing: "1.5px",
          marginBottom: 20,
        }}
      >
        MANAGE
      </div>

      {[
        { id: "Dashboard", icon: "📊", path: "/service-center" },
        { id: "Analytics", icon: "📈", path: "/service-center/analytics" },
        {
          id: "Subscription",
          icon: "💎",
          path: "/service-center/subscription",
          active: true,
        },
        {
          id: "Promotions",
          icon: "📣",
          path: "/service-center/promotions",
        },
      ].map((item) => (
        <Link
          href={item.path}
          key={item.id}
          style={{ textDecoration: "none" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 25px",
              margin: "4px 15px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: item.active ? 700 : 500,
              cursor: "pointer",
              background: item.active ? ACT : "transparent",
              color: item.active ? R : TL,
              borderLeft: item.active ? `4px solid ${R}` : "none",
            }}
          >
            <span>{item.icon}</span> {item.id}
          </div>
        </Link>
      ))}
    </div>
  </aside>
);

// ─────────────────────────────────────────────────────────────────────────────
export default function SubscriptionPage() {
  const { authorized, checking } = useRoleGuard();
  const router = useRouter();

  const [plans, setPlans] = useState([]);
  const [status, setStatus] = useState(null);
  const [centerId, setCenterId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  // ── Load data ────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const myCenter = await serviceCentersService.getMy();

        const id =
          myCenter?.data?.id ||
          myCenter?.data?.Id ||
          myCenter?.id;

        setCenterId(id);

        const [plansRes, statusRes] = await Promise.all([
          subscriptionService.getPlans(),
          id ? subscriptionService.getStatus(id) : null,
        ]);

        const plansData = plansRes?.data || plansRes || [];

        console.log("PLANS API:", plansData);

        setPlans(plansData);

        if (statusRes) {
          const s = statusRes?.data || statusRes;
          setStatus(s);

          if (s?.isPremium) {
            localStorage.setItem("isPremium", "true");
          }
        }
      } catch (err) {
        console.error("Failed loading subscriptions:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null); // plan from API
  const [paymentMethod] = useState("Visa"); // Credit card only
  const [monthsDuration, setMonthsDuration] = useState(1); // Default 1 month
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Card details state
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // Cancel subscription modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);

  if (checking || !authorized) return null;

  const handleFormatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(" ");
    } else {
      return v.replace(/(\d{4})/g, "$1 ").trim().substr(0, 19);
    }
  };

  const handleFormatExpiry = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return `${v.substr(0, 2)}/${v.substr(2, 2)}`;
    }
    return v;
  };

  const getSubscriptionPrice = (duration) => {
    switch (parseInt(duration)) {
      case 1: return 299;
      case 3: return 799;
      case 6: return 1499;
      case 12: return 2799;
      default: return 299;
    }
  };

  // ── Subscribe & Pay ──────────────────────────────────────────────────────
  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!centerId) return;
    setCheckoutLoading(true);
    try {
      // 1. Create Subscription (expects { monthsDuration })
      console.log("[pay] selectedPlan:", JSON.stringify(selectedPlan));
      // Always send 1 month — no duration picker, single plan
      const duration = 1;
      console.log("[pay] sending monthsDuration:", duration);
      const subRes = await subscriptionService.subscribe(centerId, {
        monthsDuration: duration,
      });

      console.log("[subscribe] raw response:", JSON.stringify(subRes));

      // Extract the subscription GUID — try all common shapes
      const subData = subRes?.data ?? subRes;
      const subId =
        subData?.subscriptionId ||
        subData?.id ||
        subData?.Id ||
        (typeof subData === "string" ? subData : null);

      console.log("[subscribe] extracted subId:", subId);

      if (!subId || typeof subId !== "string") {
        throw new Error("Failed to initialize subscription — no valid subscription ID returned.");
      }

      // 2. Build cardToken from raw card number (last 4 digits)
      const rawCard = cardNumber.replace(/\s+/g, "");
      const cardToken = `tok_test_${rawCard.slice(-4)}`;

      // 3. Process Payment — body: { subscriptionId, cardToken }
      const payRes = await subscriptionService.pay(centerId, subId, cardToken);

      if (payRes?.success || payRes?.data || payRes?.status === 200) {
        localStorage.setItem("isPremium", "true");
        const updatedStatus = await subscriptionService.getStatus(centerId);
        setStatus(updatedStatus?.data || updatedStatus);
        
        alert("🎉 Premium plan activated successfully!");
        setShowCheckoutModal(false);
        router.push("/service-center/analytics");
      } else {
        alert("Payment failed: " + (payRes?.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Subscription failed: " + (err.message || "Please check your details and try again."));
    } finally {
      setCheckoutLoading(false);
    }
  };

  // ── Cancel Active Subscription ───────────────────────────────────────────
  const handleCancelSubscription = () => {
    setCancelReason("");
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!centerId) return;
    setCancelLoading(true);
    try {
      await subscriptionService.cancelSubscription(centerId, {
        reason: cancelReason.trim() || "No reason provided",
      });
      const updatedStatus = await subscriptionService.getStatus(centerId);
      setStatus(updatedStatus?.data || updatedStatus);
      setShowCancelModal(false);
      alert("Subscription cancelled successfully. Your premium features will remain active until the end of your billing cycle.");
    } catch (err) {
      console.error(err);
      alert("Cancellation failed: " + (err.message || "Please try again later."));
    } finally {
      setCancelLoading(false);
    }
  };

  const isPremium = status?.isPremium === true;

  // ────────────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: BG,
        fontFamily:
          "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <style>{`
        * {
          box-sizing: border-box;
        }

        .plan-card {
          transition: all 0.3s ease;
        }

        .plan-card:hover {
          transform: translateY(-6px);
        }

        .sub-btn {
          transition: all 0.2s ease;
          border: none;
          cursor: pointer;
        }

        .sub-btn:hover {
          transform: scale(1.02);
        }

        .sub-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>

      <Sidebar />

      <main
        style={{
          flex: 1,
          padding: "40px",
          maxWidth: 1200,
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: TL,
              letterSpacing: "1.5px",
              marginBottom: 4,
            }}
          >
            SUBSCRIPTION
          </div>

          <h1
            style={{
              fontSize: 32,
              fontWeight: 900,
              marginBottom: 10,
            }}
          >
            Premium Plans
          </h1>

          <p
            style={{
              color: TL,
              fontSize: 14,
              maxWidth: 500,
              lineHeight: 1.6,
            }}
          >
            Unlock analytics, promotions, premium visibility and
            advanced growth tools for your service center.
          </p>
        </div>

        {/* Premium Banner */}
        {isPremium && (
          <div
            style={{
              background:
                "linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)",
              borderRadius: 20,
              padding: "30px",
              color: "#fff",
              marginBottom: 36,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 20,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 900,
                    marginBottom: 8,
                  }}
                >
                  ⭐ Premium Active
                </div>

                <div
                  style={{
                    fontSize: 14,
                    opacity: 0.7,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    marginTop: 8
                  }}
                >
                  <div>
                    📅 <strong>Billing Cycle:</strong> {status?.startDate ? new Date(status.startDate).toLocaleDateString() : "N/A"} - {status?.endDate ? new Date(status.endDate).toLocaleDateString() : "N/A"}
                  </div>
                  <div>
                    ⏳ <strong>Days Remaining:</strong> {status?.daysRemaining ?? 0} days
                  </div>
                  <div>
                    💰 <strong>Amount Paid:</strong> EGP {status?.amountPaid ?? 0}
                  </div>
                  {status?.status === "Cancelled" && (
                    <div style={{ color: "#FFA07A", fontWeight: "bold", marginTop: 4 }}>
                      ⚠️ Cancelled (Will expire on {status?.endDate ? new Date(status.endDate).toLocaleDateString() : "N/A"})
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <Link href="/service-center/analytics">
                  <button
                    className="sub-btn"
                    style={{
                      background: R,
                      color: "#fff",
                      padding: "12px 24px",
                      borderRadius: 10,
                      fontWeight: 700,
                    }}
                  >
                    📈 Open Analytics
                  </button>
                </Link>

                {status?.status !== "Cancelled" && (
                  <button
                    onClick={handleCancelSubscription}
                    className="sub-btn"
                    style={{
                      background: "transparent",
                      color: "#FFA07A",
                      border: "1px solid #FFA07A",
                      padding: "12px 24px",
                      borderRadius: 10,
                      fontWeight: 700,
                    }}
                  >
                    🚫 Cancel Subscription
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 0",
              fontSize: 18,
              fontWeight: 700,
              color: TL,
            }}
          >
            Loading plans...
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
            }}
          >
            {plans.map((plan, idx) => {
              const price =
                plan.monthlyPrice ||
                plan.price ||
                plan.amount ||
                0;

              const isFreePlan =
                price === 0 ||
                (plan.name || "").toLowerCase() === "free";

              const isRecommended =
                (plan.name || "").toLowerCase() === "premium";

              return (
                <div
                  key={idx}
                  className="plan-card"
                  style={{
                    background: isRecommended
                      ? "linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)"
                      : WH,
                    borderRadius: 20,
                    padding: 32,
                    border: isRecommended
                      ? `2px solid ${R}`
                      : `1px solid ${BRD}`,
                    color: isRecommended ? "#fff" : "#111",
                    boxShadow: SH,
                    position: "relative",
                  }}
                >
                  {isRecommended && (
                    <div
                      style={{
                        position: "absolute",
                        top: -10,
                        right: 20,
                        background: R,
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 800,
                        padding: "6px 12px",
                        borderRadius: 999,
                      }}
                    >
                      MOST POPULAR
                    </div>
                  )}

                  {/* Plan Name */}
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      opacity: 0.7,
                      marginBottom: 10,
                      textTransform: "uppercase",
                    }}
                  >
                    {plan.name || plan.plan}
                  </div>

                  {/* Price */}
                  <div style={{ marginBottom: 24 }}>
                    <span
                      style={{
                        fontSize: 42,
                        fontWeight: 900,
                      }}
                    >
                      EGP {price}
                    </span>

                    {!isFreePlan && (
                      <span
                        style={{
                          fontSize: 14,
                          opacity: 0.6,
                          marginLeft: 4,
                        }}
                      >
                        / month
                      </span>
                    )}
                  </div>

                  {/* Features */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                      marginBottom: 28,
                    }}
                  >
                    {(plan.features || PREMIUM_FEATURES).map(
                      (feature, i) => (
                        <div
                          key={i}
                          style={{
                            fontSize: 14,
                            fontWeight: 500,
                            opacity: 0.9,
                          }}
                        >
                          ✅ {feature}
                        </div>
                      )
                    )}
                  </div>

                  {/* Button */}
                  <button
                    className="sub-btn"
                    disabled={
                      checkoutLoading ||
                      (isPremium && !isFreePlan) ||
                      isFreePlan
                    }
                    onClick={() => {
                      if (!isFreePlan) {
                        setSelectedPlan({ price, ...plan });
                        setShowCheckoutModal(true);
                      }
                    }}
                    style={{
                      width: "100%",
                      padding: "14px",
                      borderRadius: 12,
                      fontWeight: 800,
                      fontSize: 15,
                      background: isFreePlan
                        ? "#E5E7EB"
                        : R,
                      color: isFreePlan ? "#6B7280" : "#fff",
                    }}
                  >
                    {isFreePlan
                      ? "Current Free Plan"
                      : isPremium
                      ? "✅ Already Premium"
                      : checkoutLoading
                      ? "Processing..."
                      : "Upgrade to Premium"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
        {/* Checkout Modal with Premium animated Credit Card preview */}
        {showCheckoutModal && (
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 2000, padding: "20px", backdropFilter: "blur(4px)"
          }}>
            <div style={{
              background: "#ffffff", borderRadius: "24px", width: "100%", maxWidth: "560px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)", padding: "40px", position: "relative",
              maxHeight: "95vh", overflowY: "auto"
            }}>
              <button 
                onClick={() => setShowCheckoutModal(false)}
                style={{
                  position: "absolute", top: 20, right: 20, background: "transparent", border: "none",
                  fontSize: "20px", cursor: "pointer", color: TL
                }}
              >
                ✕
              </button>
              <h2 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "4px", color: "#111" }}>💎 Upgrade to Premium</h2>
              <p style={{ fontSize: "14px", color: TL, marginBottom: "24px" }}>
                Get featured, advanced analytics, promotions, and boost your service center.
              </p>

              <form onSubmit={handleSubmitPayment}>

                {/* Premium Credit Card Preview */}
                <div style={{
                  background: "linear-gradient(135deg, #1A1A1A 0%, #D4AF37 50%, #1A1A1A 100%)",
                  width: "100%", height: "200px", borderRadius: "16px", padding: "24px", color: "#fff",
                  display: "flex", flexDirection: "column", justifyContent: "space-between",
                  boxShadow: "0 10px 25px rgba(212, 175, 55, 0.25)", position: "relative",
                  overflow: "hidden", marginBottom: "24px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "20px", fontWeight: 900, fontStyle: "italic", letterSpacing: "-0.5px", color: "#FFD700" }}>AUTORIA PREMIUM</span>
                    <span style={{ fontSize: "11px", fontWeight: 700, background: "rgba(255,255,255,0.15)", padding: "4px 8px", borderRadius: "4px", letterSpacing: "1px", color: "#FFD700" }}>VIP</span>
                  </div>

                  <div style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "2px", margin: "20px 0 10px", fontFamily: "monospace", color: "#FFD700" }}>
                    {cardNumber || "•••• •••• •••• ••••"}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                      <div style={{ fontSize: "9px", opacity: 0.8, textTransform: "uppercase", marginBottom: "2px" }}>Card Holder</div>
                      <div style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase" }}>{cardName || "Your Name"}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "9px", opacity: 0.8, textTransform: "uppercase", marginBottom: "2px" }}>Expires</div>
                      <div style={{ fontSize: "13px", fontWeight: 700 }}>{cardExpiry || "MM/YY"}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "9px", opacity: 0.8, textTransform: "uppercase", marginBottom: "2px" }}>CVV</div>
                      <div style={{ fontSize: "13px", fontWeight: 700 }}>{cardCvv || "•••"}</div>
                    </div>
                  </div>
                </div>

                {/* Card Form inputs */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "11px", fontWeight: 700, color: TL, textTransform: "uppercase" }}>Card Number</label>
                    <input
                      placeholder="4000 1234 5678 9010"
                      maxLength="19"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(handleFormatCardNumber(e.target.value))}
                      required
                      style={{ padding: "12px 14px", borderRadius: "8px", border: `1.5px solid ${BRD}`, fontSize: "14px", background: WH, color: "#111" }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "11px", fontWeight: 700, color: TL, textTransform: "uppercase" }}>Cardholder Name</label>
                    <input
                      placeholder="JOHN DOE"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value.toUpperCase())}
                      required
                      style={{ padding: "12px 14px", borderRadius: "8px", border: `1.5px solid ${BRD}`, fontSize: "14px", background: WH, color: "#111" }}
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "11px", fontWeight: 700, color: TL, textTransform: "uppercase" }}>Expiry Date</label>
                      <input
                        placeholder="MM/YY"
                        maxLength="5"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(handleFormatExpiry(e.target.value))}
                        required
                        style={{ padding: "12px 14px", borderRadius: "8px", border: `1.5px solid ${BRD}`, fontSize: "14px", background: WH, color: "#111" }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "11px", fontWeight: 700, color: TL, textTransform: "uppercase" }}>CVV</label>
                      <input
                        placeholder="123"
                        maxLength="3"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ""))}
                        required
                        style={{ padding: "12px 14px", borderRadius: "8px", border: `1.5px solid ${BRD}`, fontSize: "14px", background: WH, color: "#111" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Total Summary & Checkout Button */}
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px dashed ${BRD}`, paddingTop: "16px", marginTop: "16px", marginBottom: "24px" }}>
                  <span style={{ fontSize: "16px", fontWeight: 700, color: "#111" }}>TOTAL DUE:</span>
                  <span style={{ fontSize: "20px", fontWeight: 900, color: R }}>EGP {selectedPlan?.price ?? getSubscriptionPrice(monthsDuration)}</span>
                </div>

                <button
                  type="submit"
                  disabled={checkoutLoading}
                  style={{
                    width: "100%", padding: "14px", borderRadius: "12px", fontWeight: 800, fontSize: "16px",
                    background: R, color: "#fff", border: "none", cursor: "pointer", transition: "all 0.2s"
                  }}
                >
                  {checkoutLoading ? "Processing..." : `Pay EGP ${selectedPlan?.price ?? getSubscriptionPrice(monthsDuration)} & Activate`}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* ── Cancel Subscription Modal ───────────────────────────────────── */}
      {showCancelModal && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(15, 23, 42, 0.45)",
          backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 99999, padding: "20px",
        }}>
          <div style={{
            background: "#ffffff", borderRadius: "24px", padding: "40px",
            maxWidth: "460px", width: "100%",
            boxShadow: "0 20px 60px rgba(15,23,42,0.18)",
            border: "1px solid #E9ECEF",
            animation: "scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          }}>
            <style>{`
              @keyframes scaleIn {
                from { transform: scale(0.92); opacity: 0; }
                to   { transform: scale(1);    opacity: 1; }
              }
            `}</style>

            {/* Icon */}
            <div style={{
              width: 60, height: 60, borderRadius: "50%",
              background: "#FEF2F2", border: "2px solid #FCA5A5",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <span style={{ fontSize: 28 }}>🚫</span>
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 900, textAlign: "center", marginBottom: 8, color: "#0F172A" }}>
              Cancel Subscription?
            </h3>
            <p style={{ fontSize: 14, color: "#64748B", textAlign: "center", marginBottom: 24, lineHeight: 1.6 }}>
              Your premium features stay active until the billing cycle ends. Optionally tell us why you&apos;re leaving.
            </p>

            <textarea
              rows={4}
              placeholder="Reason for cancellation (optional)..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              style={{
                width: "100%", padding: "12px 14px", borderRadius: "12px",
                border: "1.5px solid #E9ECEF", fontSize: 14, resize: "none",
                fontFamily: "inherit", color: "#0F172A", outline: "none",
                marginBottom: 24, boxSizing: "border-box",
              }}
            />

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelLoading}
                style={{
                  flex: 1, padding: "13px", borderRadius: "12px",
                  border: "1.5px solid #E9ECEF", background: "#F8F9FA",
                  fontWeight: 700, fontSize: 14, cursor: "pointer", color: "#475569",
                }}
              >
                Keep Premium
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={cancelLoading}
                style={{
                  flex: 1, padding: "13px", borderRadius: "12px",
                  background: "#E8272A", border: "none",
                  fontWeight: 700, fontSize: 14, cursor: "pointer", color: "#fff",
                  boxShadow: "0 4px 12px rgba(232,39,42,0.25)",
                  opacity: cancelLoading ? 0.6 : 1,
                }}
              >
                {cancelLoading ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}