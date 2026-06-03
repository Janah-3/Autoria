"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { serviceCentersService, mapServiceCenterListItem } from "@/lib/api/serviceCentersService";
import { bookingService, getBookingItems } from "@/lib/api/bookingsService";
import { getMe } from "@/lib/api/usersService";
import { useLanguage } from "@/context/LanguageContext";

const COLORS = { primary: "#E8272A", primaryDark: "#B81C1F", bg: "#F8F9FA", sidebar: "#FFFFFF", border: "#E9ECEF", text: "#1A1A1A", textLight: "#6C757D", success: "#1B5E20", successBg: "#E7F5EA", warning: "#FFB800", white: "#FFFFFF", activeBg: "#FEEBEB" };
const SHADOW = "0 4px 20px rgba(0,0,0,0.05)";

const Sidebar = ({ active, t }) => (
  <aside style={{ width: "240px", background: COLORS.sidebar, borderRight: `1px solid ${COLORS.border}`, padding: "30px 0", height: "100vh", position: "sticky", top: 0, flexShrink: 0 }}>
    <div style={{ padding: "0 25px", marginBottom: "40px" }}>
      <div style={{ fontSize: "11px", fontWeight: 800, color: COLORS.textLight, letterSpacing: "1.5px", marginBottom: "20px" }}>MANAGE</div>
      {[
        { id: "Dashboard", label: t("nav.dashboard"), icon: "📊", path: "/service-center" },
        { id: "Analytics", label: t("nav.analytics"), icon: "📈", path: "/service-center/analytics" },
        { id: "Booking requests", label: "Booking requests", icon: "📬", path: "/booking-requests" },
        { id: "Availability", label: "Availability", icon: "📅", path: "/availability" },
        { id: "Spare parts", label: t("nav.spareParts"), icon: "⚙️", path: "/spare-parts-inventory" },
        { id: "Reviews", label: "Reviews", icon: "⭐", path: "/reviews" },
        { id: "Business profile", label: t("nav.editBusiness"), icon: "🏢", path: "/service-center/edit" },
        { id: "Subscription", label: t("nav.subscription"), icon: "💎", path: "/service-center/subscription" },
        { id: "Promotions", label: t("nav.promotions"), icon: "📣", path: "/service-center/promotions" }
      ].map(item => (
        <Link href={item.path} key={item.id} style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 25px", margin: "4px 15px", borderRadius: "10px", fontSize: "14px", fontWeight: active === item.id ? 700 : 500, cursor: "pointer", background: active === item.id ? COLORS.activeBg : "transparent", color: active === item.id ? COLORS.primary : COLORS.textLight, borderLeft: active === item.id ? `4px solid ${COLORS.primary}` : "none" }}>
            <span>{item.icon}</span> {item.label}
          </div>
        </Link>
      ))}
    </div>
  </aside>
);

const Card = ({ title, children, badge, badgeColor, actionText, onAction }) => (
  <div style={{ background: COLORS.white, borderRadius: "16px", padding: "24px", border: `1px solid ${COLORS.border}`, boxShadow: SHADOW, height: "100%" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
      <div>
        <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0 }}>{title}</h3>
        {badge && <span style={{ background: badgeColor || "#F8F9FA", color: COLORS.primary, fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", marginTop: "4px", display: "inline-block" }}>{badge}</span>}
      </div>
      {actionText && <button onClick={onAction} style={{ background: "none", border: "none", color: COLORS.primary, fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>{actionText}</button>}
    </div>
    {children}
  </div>
);

const StatCard = ({ label, value, trend, trendUp, vsLastMonth }) => (
  <div style={{ background: COLORS.white, borderRadius: "16px", padding: "24px", border: `1px solid ${COLORS.border}`, flex: 1, boxShadow: SHADOW }}>
    <div style={{ color: COLORS.textLight, fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>{label}</div>
    <div style={{ fontSize: "28px", fontWeight: 900, marginBottom: "8px" }}>{value}</div>
    <div style={{ fontSize: "12px", color: trendUp ? COLORS.success : COLORS.textLight, fontWeight: 600 }}>
      {trendUp ? "↑" : "→"} {trend} <span style={{ color: COLORS.textLight, fontWeight: 400 }}>{vsLastMonth}</span>
    </div>
  </div>
);

export default function ServiceCenterDashboard() {
  const { t } = useLanguage();
  const [center, setCenter] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ownerName, setOwnerName] = useState("Partner");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const closeDropdown = () => setDropdownOpen(false);
    window.addEventListener("click", closeDropdown);
    return () => window.removeEventListener("click", closeDropdown);
  }, []);

  useEffect(() => {
    getMe().then(res => { const name = res?.data?.fullName ?? res?.fullName; if (name) setOwnerName(name); }).catch(() => {});
    serviceCentersService.getMy()
      .then(res => { const d = res?.data ?? res; if (d && (d.name || d.Name)) setCenter(mapServiceCenterListItem(d)); else setCenter(null); })
      .catch(() => setCenter(null));
    bookingService.getServiceCenterBookings()
      .then(res => setBookings(getBookingItems(res) || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.bg }}>
      <div style={{ color: COLORS.primary, fontSize: "18px", fontWeight: "bold" }}>{t("serviceCenterDashboard.loading")}</div>
    </div>
  );

  if (!center) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: COLORS.bg, padding: "20px", fontFamily: "sans-serif" }}>
      <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#111827", marginBottom: "12px" }}>{t("serviceCenterDashboard.noProfile")}</h2>
      <p style={{ color: COLORS.textLight, marginBottom: "24px", textAlign: "center", maxWidth: "400px" }}>{t("serviceCenterDashboard.noProfileDesc")}</p>
      <div style={{ display: "flex", gap: "12px" }}>
        <Link href="/service-center-registration"><button style={{ background: COLORS.primary, color: "white", border: "none", padding: "12px 24px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>{t("serviceCenterDashboard.registerBusiness")}</button></Link>
        <Link href="/login"><button style={{ background: "transparent", color: COLORS.text, border: `1px solid ${COLORS.border}`, padding: "12px 24px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>{t("serviceCenterDashboard.partnerLogin")}</button></Link>
      </div>
    </div>
  );

  const pendingBookings = bookings.filter(b => (b.status ?? b.Status) === "Pending");
  const confirmedBookings = bookings.filter(b => (b.status ?? b.Status) === "Confirmed");
  const completedValue = confirmedBookings.length * (center.minServicePrice || 250);
  const initials = ownerName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div style={{ display: "flex", background: COLORS.bg, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <style>{`.partner-btn { transition: opacity 0.2s ease; cursor: pointer; } .partner-btn:hover { opacity: 0.85; } .back-link { transition: background 0.2s ease; } .back-link:hover { background: #f5f5f5 !important; }`}</style>
      <Sidebar active="Dashboard" t={t} />

      <main style={{ flex: 1, padding: "40px", maxWidth: "1600px" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 900, margin: 0 }}>{t("serviceCenterDashboard.title")}</h1>
            <p style={{ color: COLORS.textLight, fontSize: "14px", margin: "4px 0 0" }}>{t("serviceCenterDashboard.subtitle")}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <Link href="/service-center/analytics" className="back-link" style={{ color: COLORS.text, textDecoration: "none", fontWeight: 700, fontSize: "14px", padding: "8px 16px", borderRadius: "8px", border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: "6px" }}>{t("serviceCenterDashboard.viewAnalytics")}</Link>
              <Link href="/service-center/edit" className="back-link" style={{ color: COLORS.text, textDecoration: "none", fontWeight: 700, fontSize: "14px", padding: "8px 16px", borderRadius: "8px", border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: "6px" }}>{t("serviceCenterDashboard.editProfile")}</Link>
              <Link href="/" className="back-link" style={{ color: COLORS.text, textDecoration: "none", fontWeight: 700, fontSize: "14px", padding: "8px 16px", borderRadius: "8px", border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: "6px" }}>{t("serviceCenterDashboard.backToWebsite")}</Link>
            </div>
            <div style={{ position: "relative" }}>
              <div onClick={(e) => { e.stopPropagation(); setDropdownOpen(!dropdownOpen); }} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", userSelect: "none" }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "14px", fontWeight: 800 }}>{ownerName}</div>
                  <div style={{ fontSize: "11px", color: COLORS.textLight }}>{t("serviceCenterDashboard.serviceCenterPartner")}</div>
                </div>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: COLORS.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>{initials}</div>
                <span style={{ fontSize: "9px", color: COLORS.textLight }}>▼</span>
              </div>
              {dropdownOpen && (
                <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#ffffff", borderRadius: "10px", boxShadow: "0 10px 25px rgba(0,0,0,0.15)", border: `1px solid ${COLORS.border}`, minWidth: "160px", overflow: "hidden", zIndex: 1000 }}>
                  <Link href="/service-center" style={{ display: "block", padding: "10px 16px", color: COLORS.text, fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>{t("common.businessProfile")}</Link>
                  <div style={{ borderTop: `1px solid ${COLORS.border}` }} />
                  <Link href="/logout" style={{ display: "block", padding: "10px 16px", color: COLORS.primary, fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>{t("common.logOut")}</Link>
                </div>
              )}
            </div>
          </div>
        </header>

        <div style={{ display: "flex", gap: "24px", marginBottom: "32px" }}>
          <StatCard label={t("serviceCenterDashboard.totalRequests")} value={String(bookings.length)} trend="5%" trendUp vsLastMonth={t("admin.vsLastMonth")} />
          <StatCard label={t("serviceCenterDashboard.pendingApproval")} value={String(pendingBookings.length)} trend="Action required" vsLastMonth="" />
          <StatCard label={t("serviceCenterDashboard.estimatedRevenue")} value={`EGP ${completedValue.toLocaleString()}`} trend="Based on confirmed" trendUp vsLastMonth="" />
          <StatCard label={t("serviceCenterDashboard.centerRating")} value="4.8 ★" trend="Stable" vsLastMonth="" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "32px" }}>
          <Card title={t("serviceCenterDashboard.pendingBookings")} badge={`${pendingBookings.length} ${t("serviceCenterDashboard.new")}`} actionText={t("serviceCenterDashboard.viewAll")} onAction={() => router.push("/booking-requests")}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: `1px solid ${COLORS.border}`, color: COLORS.textLight, fontSize: "11px", fontWeight: 800 }}>
                    <th style={{ padding: "12px 8px" }}>{t("serviceCenterDashboard.customer")}</th>
                    <th style={{ padding: "12px 8px" }}>{t("serviceCenterDashboard.vehicle")}</th>
                    <th style={{ padding: "12px 8px" }}>{t("serviceCenterDashboard.serviceRequested")}</th>
                    <th style={{ padding: "12px 8px" }}>{t("serviceCenterDashboard.dateTime")}</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingBookings.slice(0, 4).map((b, idx) => (
                    <tr key={idx} style={{ borderBottom: `1px solid ${COLORS.border}`, fontSize: "13px" }}>
                      <td style={{ padding: "16px 8px", fontWeight: 700 }}>{b.customerName || b.CustomerName || "Client"}</td>
                      <td style={{ padding: "16px 8px" }}>{b.carModel || b.CarModel || "Car"}</td>
                      <td style={{ padding: "16px 8px" }}>{b.serviceType || b.ServiceType || "Maintenance"}</td>
                      <td style={{ padding: "16px 8px", color: COLORS.textLight }}>{b.date || b.Date}, {b.time || b.Time}</td>
                    </tr>
                  ))}
                  {pendingBookings.length === 0 && (
                    <tr><td colSpan="4" style={{ padding: "32px", textAlign: "center", color: COLORS.textLight }}>{t("serviceCenterDashboard.noPending")}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            <Card title={t("serviceCenterDashboard.workshopProfile")}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <div style={{ fontSize: "12px", color: COLORS.textLight, fontWeight: 700 }}>{t("serviceCenterDashboard.workshopName")}</div>
                  <div style={{ fontSize: "16px", fontWeight: 800 }}>{center.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: COLORS.textLight, fontWeight: 700 }}>{t("serviceCenterDashboard.location")}</div>
                  <div style={{ fontSize: "14px", fontWeight: 600 }}>{center.district}, {center.governorate}</div>
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: COLORS.textLight, fontWeight: 700 }}>{t("serviceCenterDashboard.phone")}</div>
                  <div style={{ fontSize: "14px" }}>{center.phone || t("serviceCenterDashboard.notConfigured")}</div>
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: COLORS.textLight, fontWeight: 700, marginBottom: "8px" }}>{t("serviceCenterDashboard.supportedServices")}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {(center.serviceTypes || []).slice(0, 5).map(s => (
                      <span key={s} style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#E8272A", fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "6px" }}>{t(`serviceTypes.${s}`) || s}</span>
                    ))}
                    {(center.serviceTypes || []).length > 5 && <span style={{ fontSize: "11px", color: COLORS.textLight, alignSelf: "center" }}>+{center.serviceTypes.length - 5} more</span>}
                  </div>
                </div>
              </div>
            </Card>

            <Card title={t("serviceCenterDashboard.bookingDistribution")}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {[
                  { label: t("serviceCenterDashboard.pendingBar"), count: pendingBookings.length },
                  { label: t("serviceCenterDashboard.confirmedBar"), count: confirmedBookings.length, isGreen: true }
                ].map(({ label, count, isGreen }) => (
                  <div key={label}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                      <span>{label}</span>
                      <span>{bookings.length > 0 ? Math.round((count / bookings.length) * 100) : 0}%</span>
                    </div>
                    <div style={{ height: "8px", background: "#F1F5F9", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ width: `${bookings.length > 0 ? (count / bookings.length) * 100 : 0}%`, height: "100%", background: isGreen ? COLORS.success : COLORS.primary }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
