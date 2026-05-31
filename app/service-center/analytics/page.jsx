"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { bookingsService, getBookingItems } from "@/lib/api/bookingsService";
import { serviceCentersService } from "@/lib/api/serviceCentersService";
import { getMe } from "@/lib/api/usersService";

// ── Brand colors ──────────────────────────────────────────────────────────────
const R   = "#E8272A";
const RD  = "#B81C1F";
const BG  = "#F8F9FA";
const BRD = "#E9ECEF";
const WH  = "#FFFFFF";
const TL  = "#6C757D";
const ACT = "#FEEBEB";

// ── Sidebar (same as dashboard) ──────────────────────────────────────────────
const Sidebar = () => (
  <aside style={{ width: 240, background: WH, borderRight: `1px solid ${BRD}`, padding: "30px 0", height: "100vh", position: "sticky", top: 0, flexShrink: 0 }}>
    <div style={{ padding: "0 25px", marginBottom: 40 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: TL, letterSpacing: "1.5px", marginBottom: 20 }}>MANAGE</div>
      {[
        { id: "Dashboard",        icon: "📊", path: "/service-center" },
        { id: "Analytics",        icon: "📈", path: "/service-center/analytics", active: true },
        { id: "Booking requests", icon: "📬", path: "/booking-requests" },
        { id: "Availability",     icon: "📅", path: "/availability" },
        { id: "Services & pricing",icon: "🏷️", path: "/service-center/services-pricing" },
        { id: "Spare parts",      icon: "⚙️", path: "/spare-parts-inventory" },
        { id: "Reviews",          icon: "⭐", path: "/reviews" },
        { id: "Business profile", icon: "🏢", path: "/service-center/edit" },
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

// ── Mini bar chart drawn purely with divs ────────────────────────────────────
function BarChart({ data, color = R }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80, padding: "0 4px" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{
            width: "100%", background: color,
            height: `${Math.round((d.value / max) * 72)}px`,
            borderRadius: "4px 4px 0 0",
            opacity: 0.85,
            minHeight: d.value > 0 ? 6 : 0,
            transition: "height 0.5s ease",
          }} />
          <span style={{ fontSize: 10, color: TL, fontWeight: 600 }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Donut chart with CSS ─────────────────────────────────────────────────────
function DonutSegment({ pct, color, offset }) {
  const r = 40, circ = 2 * Math.PI * r;
  return (
    <circle
      cx="50" cy="50" r={r}
      fill="none" stroke={color} strokeWidth="18"
      strokeDasharray={`${pct * circ} ${circ}`}
      strokeDashoffset={-offset * circ}
      strokeLinecap="butt"
      style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
    />
  );
}

function DonutChart({ segments }) {
  let offset = 0;
  const rendered = segments.map((s, i) => {
    const el = <DonutSegment key={i} pct={s.pct} color={s.color} offset={offset} />;
    offset += s.pct;
    return el;
  });
  return (
    <svg viewBox="0 0 100 100" width={130} height={130}>
      <circle cx="50" cy="50" r="40" fill="none" stroke="#F1F5F9" strokeWidth="18" />
      {rendered}
    </svg>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ label, value, icon, color, sub }) {
  return (
    <div style={{
      background: WH, borderRadius: 16, padding: 24, border: `1px solid ${BRD}`,
      boxShadow: "0 4px 20px rgba(0,0,0,0.05)", flex: 1, minWidth: 140,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: TL, textTransform: "uppercase", letterSpacing: "1px" }}>{label}</div>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{icon}</div>
      </div>
      <div style={{ fontSize: 32, fontWeight: 900, color: "#1A1A1A", marginBottom: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: TL, fontWeight: 600 }}>{sub}</div>}
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, sub, children, action }) {
  return (
    <div style={{ background: WH, borderRadius: 16, border: `1px solid ${BRD}`, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", overflow: "hidden", marginBottom: 24 }}>
      <div style={{ padding: "20px 24px", borderBottom: `1px solid ${BRD}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#1A1A1A" }}>{title}</div>
          {sub && <div style={{ fontSize: 12, color: TL, marginTop: 2 }}>{sub}</div>}
        </div>
        {action}
      </div>
      <div style={{ padding: "20px 24px" }}>{children}</div>
    </div>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function Skeleton({ w = "100%", h = 20, r = 8 }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: "linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [bookings, setBookings]   = useState([]);
  const [centerName, setCenterName] = useState("");
  const [ownerName, setOwnerName] = useState("Partner");
  const [loading, setLoading]     = useState(true);
  const [period, setPeriod]       = useState("all"); // "week" | "month" | "all"

  useEffect(() => {
    Promise.all([
      bookingsService.getServiceCenterBookings(),
      serviceCentersService.getMy().catch(() => null),
      getMe().catch(() => null),
    ]).then(([bRes, cRes, meRes]) => {
      setBookings(getBookingItems(bRes));
      if (cRes?.data?.name) setCenterName(cRes.data.name);
      if (meRes?.data?.fullName) setOwnerName(meRes.data.fullName);
    }).finally(() => setLoading(false));
  }, []);

  // ── Filter bookings by selected period ─────────────────────────────────────
  const filtered = useMemo(() => {
    if (period === "all") return bookings;
    const now = new Date();
    const cutoff = new Date();
    if (period === "week")  cutoff.setDate(now.getDate() - 7);
    if (period === "month") cutoff.setMonth(now.getMonth() - 1);
    return bookings.filter(b => {
      const d = new Date(b.date || b.createdAt || b.scheduledDate || 0);
      return d >= cutoff;
    });
  }, [bookings, period]);

  // ── Derived stats ───────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total     = filtered.length;
    const pending   = filtered.filter(b => b.status === "Pending").length;
    const confirmed = filtered.filter(b => b.status === "Confirmed").length;
    const completed = filtered.filter(b => b.status === "Completed").length;
    const cancelled = filtered.filter(b => b.status === "Cancelled").length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const cancellationRate = total > 0 ? Math.round((cancelled / total) * 100) : 0;

    // Service type breakdown
    const serviceMap = {};
    filtered.forEach(b => {
      const svc = b.service?.type || b.serviceType || "Other";
      serviceMap[svc] = (serviceMap[svc] || 0) + 1;
    });
    const topServices = Object.entries(serviceMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count, pct: total > 0 ? Math.round((count / total) * 100) : 0 }));

    // Daily booking trend (last 7 days)
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dayMap = Object.fromEntries(days.map(d => [d, 0]));
    filtered.forEach(b => {
      const d = new Date(b.date || b.createdAt || b.scheduledDate || 0);
      if (!isNaN(d)) {
        const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
        if (dayMap[dayName] !== undefined) dayMap[dayName]++;
      }
    });
    const weekTrend = days.map(d => ({ label: d, value: dayMap[d] }));

    // Status donut segments
    const donut = [
      { label: "Completed", value: completed, color: "#10B981", pct: total > 0 ? completed / total : 0 },
      { label: "Confirmed", value: confirmed, color: "#3B82F6", pct: total > 0 ? confirmed / total : 0 },
      { label: "Pending",   value: pending,   color: "#F59E0B", pct: total > 0 ? pending / total : 0 },
      { label: "Cancelled", value: cancelled, color: R,         pct: total > 0 ? cancelled / total : 0 },
    ];

    return { total, pending, confirmed, completed, cancelled, completionRate, cancellationRate, topServices, weekTrend, donut };
  }, [filtered]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: BG, fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .period-btn { padding: 7px 18px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; border: 1.5px solid ${BRD}; background: ${WH}; color: ${TL}; transition: all 0.15s; }
        .period-btn.active { background: ${R}; color: ${WH}; border-color: ${R}; }
        .period-btn:hover:not(.active) { border-color: ${R}; color: ${R}; }
      `}</style>

      <Sidebar />

      <main style={{ flex: 1, padding: "36px 40px", overflowY: "auto", maxWidth: 1100 }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: TL, letterSpacing: "1.5px", marginBottom: 4 }}>ANALYTICS</div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: "#1A1A1A", letterSpacing: -0.5 }}>
              {centerName || "Performance Overview"}
            </h1>
            <p style={{ fontSize: 13, color: TL, marginTop: 4 }}>
              Welcome back, {ownerName} — here&apos;s how your center is performing.
            </p>
          </div>
          {/* Period selector */}
          <div style={{ display: "flex", gap: 8 }}>
            {[["all","All Time"],["month","This Month"],["week","This Week"]].map(([val, label]) => (
              <button key={val} className={`period-btn${period === val ? " active" : ""}`} onClick={() => setPeriod(val)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Row */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          {loading ? [1,2,3,4].map(i => (
            <div key={i} style={{ flex: 1, minWidth: 140, background: WH, borderRadius: 16, padding: 24, border: `1px solid ${BRD}` }}>
              <Skeleton h={12} w="60%" /><br/>
              <Skeleton h={32} w="50%" /><br/>
              <Skeleton h={12} w="80%" />
            </div>
          )) : (<>
            <KpiCard label="Total Bookings"   value={stats.total}     icon="📋" color="#6366F1" sub="All recorded requests" />
            <KpiCard label="Completed"        value={stats.completed} icon="✅" color="#10B981" sub={`${stats.completionRate}% completion rate`} />
            <KpiCard label="Pending"          value={stats.pending}   icon="⏳" color="#F59E0B" sub="Awaiting your action" />
            <KpiCard label="Cancellations"    value={stats.cancelled} icon="❌" color={R}        sub={`${stats.cancellationRate}% cancellation rate`} />
          </>)}
        </div>

        {/* Middle row: chart + donut */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, marginBottom: 24 }}>

          {/* Weekly trend bar chart */}
          <Section title="Weekly Booking Trend" sub="Number of bookings per day of the week">
            {loading ? <Skeleton h={80} /> : (
              bookings.length === 0
                ? <div style={{ textAlign: "center", color: TL, fontSize: 13, padding: "20px 0" }}>No booking data yet — chart will populate automatically.</div>
                : <BarChart data={stats.weekTrend} color={R} />
            )}
          </Section>

          {/* Status donut */}
          <Section title="Booking Status" sub="Distribution by status">
            {loading ? <Skeleton h={130} r={999} /> : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                {bookings.length === 0 ? (
                  <div style={{ color: TL, fontSize: 13 }}>No data yet</div>
                ) : (
                  <>
                    <DonutChart segments={stats.donut} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
                      {stats.donut.map(seg => (
                        <div key={seg.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: seg.color }} />
                            <span style={{ fontSize: 12, color: TL, fontWeight: 600 }}>{seg.label}</span>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 800, color: "#1A1A1A" }}>{seg.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </Section>
        </div>

        {/* Top services */}
        <Section
          title="Top Requested Services"
          sub="Most booked service types"
          action={
            <Link href="/service-center/services-pricing" style={{ fontSize: 12, fontWeight: 700, color: R, textDecoration: "none" }}>
              Manage Pricing →
            </Link>
          }
        >
          {loading ? [1,2,3].map(i => <div key={i} style={{ marginBottom: 12 }}><Skeleton h={14} w={`${70 - i * 15}%`} /></div>) : (
            stats.topServices.length === 0 ? (
              <div style={{ color: TL, fontSize: 13 }}>No service data yet.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {stats.topServices.map((svc, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#1A1A1A" }}>
                        {i === 0 && <span style={{ color: R, marginRight: 6 }}>🏆</span>}{svc.name}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: R }}>{svc.count} <span style={{ fontSize: 11, color: TL, fontWeight: 500 }}>({svc.pct}%)</span></span>
                    </div>
                    <div style={{ height: 8, background: "#F1F5F9", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${svc.pct}%`, background: i === 0 ? R : `${R}88`, borderRadius: 4, transition: "width 0.6s ease" }} />
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </Section>

        {/* Quick links footer */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[
            { label: "📬 Manage Bookings",   href: "/booking-requests" },
            { label: "🏷️ Services & Pricing", href: "/service-center/services-pricing" },
            { label: "⚙️ Spare Parts",        href: "/spare-parts-inventory" },
            { label: "⭐ Reviews",             href: "/reviews" },
            { label: "🏢 Edit Profile",        href: "/service-center/edit" },
          ].map(link => (
            <Link key={link.href} href={link.href} style={{
              padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700,
              background: WH, color: "#1A1A1A", border: `1px solid ${BRD}`,
              textDecoration: "none", transition: "all 0.2s",
            }}>
              {link.label}
            </Link>
          ))}
        </div>

      </main>
    </div>
  );
}
