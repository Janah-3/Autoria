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

  // ── Subscribe ────────────────────────────────────────────────────────────
  const handleSubscribe = async (plan) => {
    if (!centerId) return;

    setSubscribing(true);

    try {
      await subscriptionService.subscribe(centerId, {
        plan: plan.name || plan.plan,
      });

      localStorage.setItem("isPremium", "true");

      const updatedStatus =
        await subscriptionService.getStatus(centerId);

      setStatus(updatedStatus?.data || updatedStatus);

      alert("🎉 Premium activated successfully!");

      router.push("/service-center/analytics");
    } catch (err) {
      console.error(err);
      alert("Subscription failed");
    } finally {
      setSubscribing(false);
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
                  }}
                >
                  Your service center is currently subscribed to
                  Premium.
                </div>
              </div>

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
                      subscribing ||
                      (isPremium && !isFreePlan) ||
                      isFreePlan
                    }
                    onClick={() =>
                      !isFreePlan && handleSubscribe(plan)
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
                      : subscribing
                      ? "Subscribing..."
                      : "Upgrade to Premium"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}