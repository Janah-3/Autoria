"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { subscriptionService } from "@/lib/api/subscriptionService";
import { serviceCentersService } from "@/lib/api/serviceCentersService";

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
  const [paymentMethod, setPaymentMethod] = useState("Visa");
  const [monthsDuration, setMonthsDuration] = useState(3); // Default to 3 months (Recommended!)
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Card details state
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

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
      // 1. Create Subscription (expects monthsDuration)
      const subRes = await subscriptionService.subscribe(centerId, {
        monthsDuration: parseInt(monthsDuration),
      });

      const subId = subRes?.data || subRes;

      if (!subId) {
        throw new Error("Failed to initialize subscription.");
      }

      // 2. Process Payment (expects subscriptionId, method, cardToken)
      const payRes = await subscriptionService.pay(centerId, {
        subscriptionId: subId,
        method: paymentMethod === "Visa" ? "Card" : "Cash",
        cardToken: paymentMethod === "Visa" ? "mock_card_visa_token" : null
      });

      if (payRes.success || payRes.data) {
        localStorage.setItem("isPremium", "true");
        // Update status
        const updatedStatus = await subscriptionService.getStatus(centerId);
        setStatus(updatedStatus?.data || updatedStatus);
        
        alert("🎉 Premium plan activated successfully!");
        setShowCheckoutModal(false);
        router.push("/service-center/analytics");
      } else {
        alert("Payment failed: " + (payRes.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Subscription failed: " + (err.message || "Please check your details and try again."));
    } finally {
      setCheckoutLoading(false);
    }
  };

  // ── Cancel Active Subscription ───────────────────────────────────────────
  const handleCancelSubscription = async () => {
    if (!centerId) return;
    const reason = prompt("Please enter the reason for cancelling your Premium subscription (optional):");
    if (reason === null) return; // User cancelled prompt

    try {
      await subscriptionService.cancelSubscription(centerId, {
        reason: reason || "No reason provided",
      });

      const updatedStatus = await subscriptionService.getStatus(centerId);
      setStatus(updatedStatus?.data || updatedStatus);
      alert("Subscription cancelled successfully. Your premium features will remain active until the end of your billing cycle.");
    } catch (err) {
      console.error(err);
      alert("Cancellation failed: " + (err.message || "Please try again later."));
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
                    onClick={() =>
                      !isFreePlan && setShowCheckoutModal(true)
                    }
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
                {/* Duration Picker */}
                <div style={{ marginBottom: "24px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 800, color: TL, textTransform: "uppercase", display: "block", marginBottom: "12px", letterSpacing: "0.5px" }}>
                    Select Duration
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    {[
                      { val: 1, label: "1 Month", price: "EGP 299", desc: "Basic trial" },
                      { val: 3, label: "3 Months", price: "EGP 799", desc: "Best Value (Save 11%)", recommended: true },
                      { val: 6, label: "6 Months", price: "EGP 1499", desc: "Save 16%" },
                      { val: 12, label: "12 Months", price: "EGP 2799", desc: "Save 22%" }
                    ].map((dur) => (
                      <div
                        key={dur.val}
                        onClick={() => setMonthsDuration(dur.val)}
                        style={{
                          padding: "16px", borderRadius: "16px",
                          border: `2px solid ${monthsDuration === dur.val ? R : BRD}`,
                          background: monthsDuration === dur.val ? ACT : WH,
                          cursor: "pointer", transition: "all 0.2s", position: "relative"
                        }}
                      >
                        {dur.recommended && (
                          <div style={{
                            position: "absolute", top: -8, right: 10, background: R, color: "#fff",
                            fontSize: "8px", fontWeight: 800, padding: "2px 6px", borderRadius: "999px"
                          }}>
                            RECOMMENDED
                          </div>
                        )}
                        <div style={{ fontSize: "14px", fontWeight: 700, color: monthsDuration === dur.val ? R : "#111" }}>{dur.label}</div>
                        <div style={{ fontSize: "16px", fontWeight: 900, margin: "4px 0", color: "#111" }}>{dur.price}</div>
                        <div style={{ fontSize: "11px", color: TL }}>{dur.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div style={{ marginBottom: "24px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 800, color: TL, textTransform: "uppercase", display: "block", marginBottom: "12px", letterSpacing: "0.5px" }}>
                    Payment Method
                  </label>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <div 
                      onClick={() => setPaymentMethod("Visa")}
                      style={{
                        flex: 1, padding: "14px", borderRadius: "12px", border: `2px solid ${paymentMethod === "Visa" ? R : BRD}`,
                        background: paymentMethod === "Visa" ? ACT : WH, display: "flex", flexDirection: "column",
                        alignItems: "center", cursor: "pointer", gap: "8px", transition: "all 0.2s"
                      }}
                    >
                      <span style={{ fontSize: "20px" }}>💳</span>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: paymentMethod === "Visa" ? R : "#334155" }}>Credit Card / Visa</span>
                    </div>
                    <div 
                      onClick={() => setPaymentMethod("Cash")}
                      style={{
                        flex: 1, padding: "14px", borderRadius: "12px", border: `2px solid ${paymentMethod === "Cash" ? R : BRD}`,
                        background: paymentMethod === "Cash" ? ACT : WH, display: "flex", flexDirection: "column",
                        alignItems: "center", cursor: "pointer", gap: "8px", transition: "all 0.2s"
                      }}
                    >
                      <span style={{ fontSize: "20px" }}>💵</span>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: paymentMethod === "Cash" ? R : "#334155" }}>Cash Desk</span>
                    </div>
                  </div>
                </div>

                {paymentMethod === "Visa" && (
                  <>
                    {/* Premium Credit Card Graphic Preview (Gold & Dark design for Premium!) */}
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

                    {/* Visa Form inputs */}
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
                  </>
                )}

                {/* Total Summary & Checkout Button */}
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px dashed ${BRD}`, paddingTop: "16px", marginTop: "16px", marginBottom: "24px" }}>
                  <span style={{ fontSize: "16px", fontWeight: 700, color: "#111" }}>TOTAL DUE:</span>
                  <span style={{ fontSize: "20px", fontWeight: 900, color: R }}>EGP {getSubscriptionPrice(monthsDuration)}</span>
                </div>

                <button
                  type="submit"
                  disabled={checkoutLoading}
                  style={{
                    width: "100%", padding: "14px", borderRadius: "12px", fontWeight: 800, fontSize: "16px",
                    background: R, color: "#fff", border: "none", cursor: "pointer", transition: "all 0.2s"
                  }}
                >
                  {checkoutLoading ? "Processing..." : `Pay EGP ${getSubscriptionPrice(monthsDuration)} & Activate`}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}