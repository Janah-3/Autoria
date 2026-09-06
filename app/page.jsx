"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getMe, usersService } from "@/lib/api/usersService";
import {
  serviceCentersService,
  getServiceCenterItems,
} from "@/lib/api/serviceCentersService";
import { sparePartsService } from "@/lib/sparePartsService";
import { getSparePartItems } from "@/lib/api/mappers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { reviewsService } from "@/lib/api/reviewsService";
import { SkeletonBox, SkeletonCard } from "@/components/Skeleton";

const R = "#E8272A";
const RD = "#B81C1F";

const CENTERS = [
  { id: "1", bg: "#fff0f0", icon: "🏭", badge: "Top Rated", name: "ProCare Auto Center", loc: "Nasr City, Cairo", tags: ["Oil Change", "Brakes", "AC Service"], stars: 5, rating: "4.9", reviews: "312", price: "From 150 EGP" },
  { id: "2", bg: "#fefce8", icon: "🔩", badge: "Fast Service", name: "SpeedFix Workshop", loc: "Heliopolis, Cairo", tags: ["Engine Repair", "Diagnostics"], stars: 5, rating: "4.7", reviews: "198", price: "From 200 EGP" },
  { id: "3", bg: "#f0fdf4", icon: "🚗", badge: "New", name: "GreenWheel Service", loc: "6th of October, Giza", tags: ["Tires", "Alignment", "Wash"], stars: 4, rating: "4.5", reviews: "87", price: "From 80 EGP" },
];

const PARTS = [
  { icon: "🔋", name: "Car Battery", desc: "12V / 60Ah — All brands", price: "1,200 EGP" },
  { icon: "🛞", name: "All-Season Tires", desc: "195/65 R15 — Michelin", price: "850 EGP" },
  { icon: "💡", name: "Headlight Bulb", desc: "H7 LED — OSRAM Pro", price: "320 EGP" },
  { icon: "🛢️", name: "Engine Oil Filter", desc: "Universal — Bosch", price: "180 EGP" },
];

const STEPS = [
  { n: "1", title: "Search & Explore", desc: "Enter your service and location to find nearby certified centers." },
  { n: "2", title: "Compare & Choose", desc: "Filter by rating and price. Read real verified reviews." },
  { n: "3", title: "Book & Relax", desc: "Pick a date and time, confirm, and we handle the rest." },
];

const WHY = [
  { iconClass: "fa-solid fa-circle-check", title: "Verified Centers Only", desc: "Every center is vetted before listing. No surprises." },
  { iconClass: "fa-solid fa-tags", title: "Transparent Pricing", desc: "See prices upfront. Compare across centers side by side." },
  { iconClass: "fa-solid fa-calendar-check", title: "Instant Booking", desc: "Book in under 2 minutes. No calls, no waiting." },
  { iconClass: "fa-solid fa-star", title: "Trusted Reviews", desc: "Ratings from real verified customers only." },
  { iconClass: "fa-solid fa-cart-shopping", title: "Parts Marketplace", desc: "Order genuine parts online, delivered to your door." },
  { iconClass: "fa-solid fa-mobile-screen-button", title: "Track Everything", desc: "All bookings and orders in one dashboard." },
];

const REVIEWS = [
  { init: "AM", name: "Ahmed Mostafa", car: "Toyota Corolla · Cairo", stars: 5, text: "Booked an oil change in under 2 minutes. Price was exactly as listed. Will use again!" },
  { init: "SK", name: "Sara Khaled", car: "Hyundai Tucson · Giza", stars: 5, text: "The comparison feature saved me 300 EGP. AUTORIA is a game changer for car owners." },
  { init: "MH", name: "Mohamed Hassan", car: "Kia Sportage · Alexandria", stars: 4, text: "Ordered brake pads — arrived next day. Booking was smooth. Really impressed." },
];

const HERO_STATS = [
  { n: "200+", l: "Service Centers" },
  { n: "15K+", l: "Happy Customers" },
  { n: "4.8★", l: "Avg Rating" },
  { n: "50+", l: "Parts Brands" },
];

const HERO_BG =
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1920";

// ── shared inline style shortcuts ──────────────────────────────────────────
const row = (gap = 0) => ({ display: "flex", alignItems: "center", gap });
const grid = (cols, gap = 16) => ({ display: "grid", gridTemplateColumns: `repeat(${cols},1fr)`, gap });

// ── SectionHeader ──────────────────────────────────────────────────────────
function SH({ tag, h2, em, sub, dark = false }) {
  const lc = dark ? "rgba(255,255,255,.35)" : R;
  const tc = dark ? "rgba(255,255,255,.65)" : R;
  const hc = dark ? "#fff" : "#111";
  const sc = dark ? "rgba(255,255,255,.45)" : "#6b7280";
  return (
    <div style={{ textAlign: "center", marginBottom: 48 }}>
      <div style={{ ...row(10), justifyContent: "center", marginBottom: 12 }}>
        <span style={{ flex: "0 0 28px", height: 2.5, background: lc, borderRadius: 2, display: "block" }} />
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "1.8px", textTransform: "uppercase", color: tc }}>{tag}</span>
        <span style={{ flex: "0 0 28px", height: 2.5, background: lc, borderRadius: 2, display: "block" }} />
      </div>
      <h2 style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1.2, lineHeight: 1.08, marginBottom: 10, color: hc }}>
        {h2} <em style={{ color: dark ? "rgba(255,255,255,.6)" : R, fontStyle: "normal" }}>{em}</em>
      </h2>
      <p style={{ color: sc, fontSize: 13.5, maxWidth: 440, margin: "0 auto", lineHeight: 1.7 }}>{sub}</p>
      <div style={{ width: 44, height: 4, background: dark ? "rgba(255,255,255,.4)" : R, borderRadius: 3, margin: "14px auto 0" }} />
    </div>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────────
function Hero({ setCenters, onAiSupportClick }) {
  const router = useRouter();
  const [service, setService] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <section
      style={{
        position: "relative",
        background: `linear-gradient(135deg, rgba(17,17,17,.86) 0%, rgba(45,16,16,.82) 52%, rgba(184,28,31,.6) 100%), url('${HERO_BG}') center/cover no-repeat`,
        padding: "96px 5% 88px",
        textAlign: "center"
      }}
    >
      <h1 style={{ color: "#fff", fontSize: 48, fontWeight: 900, lineHeight: 1.12, letterSpacing: -1.5, marginBottom: 14 }}>
        Find the <em style={{ color: "#ff6b6b", fontStyle: "normal" }}>Best Car Service</em> Near You
      </h1>
      <p style={{ color: "rgba(255,255,255,.62)", fontSize: 15, lineHeight: 1.7, maxWidth: 480, margin: "0 auto 32px" }}>
        Compare certified service centers, book instantly, and get your car back on the road — fast.
      </p>

      {/* Search bar & AI Support Wrapper */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", maxWidth: "780px", margin: "0 auto 30px", flexWrap: "wrap" }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: "6px 6px 6px 0", display: "flex", alignItems: "center", flex: 1, minWidth: "300px", boxShadow: "0 4px 24px rgba(0,0,0,.2)" }}>
          <div style={{ flex: 1, ...row(8), padding: "0 16px", borderRight: "1px solid #e5e7eb" }}>
            <i className="fa-solid fa-wrench" style={{ opacity: .3, color: "#374151" }}></i>
            <input
              value={service}
              onChange={(e) => setService(e.target.value)}
              placeholder="Service type (Oil change, Repair...)"
              style={{ border: "none", outline: "none", width: "100%", fontSize: 14, color: "#374151", background: "transparent" }}
            />
          </div>
          <div style={{ flex: 1, ...row(8), padding: "0 16px" }}>
            <i className="fa-solid fa-location-dot" style={{ opacity: .3, color: "#374151" }}></i>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Your location"
              style={{ border: "none", outline: "none", width: "100%", fontSize: 14, color: "#374151", background: "transparent" }}
            />
          </div>
          <button
            className="btn-hover"
            disabled={loading}
            onClick={() => {
              if (!service && !location) {
                router.push("/search-results");
                return;
              }
              router.push(`/search-results?q=${encodeURIComponent(service)}&loc=${encodeURIComponent(location)}`);
            }}
            style={{ background: R, color: "#fff", border: "none", padding: "12px 24px", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: loading ? 0.7 : 1 }}
          >
            Search Centers
          </button>
        </div>

        {/* Sparkling AI Support Button */}
        <button
          className="btn-hover"
          type="button"
          onClick={onAiSupportClick}
          style={{
            background: "#ffffff",
            color: "#111111",
            border: "1.5px solid #E6C687",
            height: "56px",
            padding: "0 24px",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 20px rgba(230, 198, 135, 0.25)",
            whiteSpace: "nowrap"
          }}
        >
          <i className="fa-solid fa-wand-magic-sparkles" style={{ color: "#E6C687", fontSize: "15px" }}></i>
          AI Support
        </button>
      </div>

      {/* Hero stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, maxWidth: 640, margin: "0 auto" }}>
        {HERO_STATS.map(s => (
          <div key={s.l} className="hero-stat" style={{ background: "rgba(0,0,0,.35)", border: "1px solid rgba(255,255,255,.16)", borderRadius: 14, padding: "16px 8px", backdropFilter: "blur(8px)" }}>
            <div style={{ color: "#fff", fontSize: 23, fontWeight: 900, letterSpacing: -0.5 }}>{s.n}</div>
            <div style={{ color: "rgba(255,255,255,.62)", fontSize: 11, fontWeight: 600, marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Service Centers Top-Rated Slider ──────────────────────────────────────
function SliderCard({ c, i }) {
  const [hovered, setHovered] = useState(false);
  const stars = Math.min(5, Math.max(0, Math.round(c.stars ?? c.rating ?? 5)));
  return (
    <a
      className="sc-card"
      href={`/service-center-profile/${c.id}`}
      style={{ animation: "fadeUp .6s ease both", animationDelay: `${Math.min(i * 70, 500)}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        background: "#fff",
        border: `1px solid ${hovered ? R : "#e5e7eb"}`,
        borderRadius: 16,
        overflow: "hidden",
        height: "100%",
        transition: "all .25s ease",
        transform: hovered ? "translateY(-6px)" : "none",
        boxShadow: hovered ? "0 14px 30px rgba(0,0,0,.12)" : "0 2px 8px rgba(0,0,0,.04)"
      }}>
        <div style={{ height: 150, background: c.cover ? `url(${c.cover}) center/cover no-repeat` : c.bg || "#fff0f0", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42 }}>
          {!c.cover && (c.icon && c.icon.startsWith("fa-")
            ? <i className={c.icon} style={{ fontSize: 40, color: "#9ca3af" }}></i>
            : <span style={{ fontSize: 44 }}>{c.icon || "🔧"}</span>)}
          <span className="sc-badge">{c.badge || "Top Rated"}</span>
          <span className="sc-open"><i className="fa-solid fa-circle" style={{ fontSize: 7, marginRight: 4, color: "#22c55e" }}></i>Open</span>
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
          <div style={{ fontSize: 11.5, color: "#9ca3af", marginBottom: 10 }}>
            <i className="fa-solid fa-location-dot" style={{ color: R, marginRight: 4 }}></i>{c.loc}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12, minHeight: 30 }}>
            {(c.tags || []).slice(0, 3).map(t => (
              <span key={t} style={{ background: "#f3f4f6", color: "#374151", fontSize: 10, padding: "3px 8px", borderRadius: 6, fontWeight: 600 }}>{t}</span>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f3f4f6", paddingTop: 11 }}>
            <span>
              <span style={{ color: "#f59e0b", fontSize: 12, letterSpacing: 1 }}>{"★".repeat(stars)}</span>
              <span style={{ fontSize: 11, color: "#6b7280", marginLeft: 3, fontWeight: 700 }}>{c.rating || "4.5"}</span>
              <span style={{ fontSize: 10, color: "#9ca3af", marginLeft: 3 }}>({c.reviews || "0"})</span>
            </span>
            {c.price && c.price.toLowerCase().includes("contact for price") ? (
              <span style={{ fontSize: 10.5, fontWeight: 800, color: R, background: "#FFF4F4", padding: "4px 8px", borderRadius: 6, border: `1px solid ${R}20` }}>Contact for price</span>
            ) : (
              <span style={{ fontSize: 13.5, fontWeight: 900, color: R }}>{c.price || "—"}</span>
            )}
          </div>
        </div>
      </div>
    </a>
  );
}

function ServiceCenters({ centers }) {
  const trackRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [paused, setPaused] = useState(false);

  const sorted = useMemo(() => {
    const src = Array.isArray(centers) && centers.length ? centers : CENTERS;
    return [...src].sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0));
  }, [centers]);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 12);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 12);
  }, []);

  const scrollByCard = useCallback((dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector(".sc-card");
    const step = card ? card.offsetWidth + 18 : Math.round(el.clientWidth * 0.8);
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows]);

  useEffect(() => {
    if (paused || !canRight || sorted.length < 2) return;
    const t = setInterval(() => scrollByCard(1), 4500);
    return () => clearInterval(t);
  }, [paused, canRight, sorted.length, scrollByCard]);

  return (
    <section style={{ padding: "72px 5%", background: "#f7f7f8", overflow: "hidden" }}>
      <SH tag="Service Centers" h2="Top-Rated Centers" em="Near You" sub="Browse the highest-rated certified centers, compare prices and ratings, then book in seconds." />
      <div className="slider-shell">
        <button className="slider-arrow slider-arrow-left" disabled={!canLeft} onClick={() => scrollByCard(-1)} aria-label="Scroll left">
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <div
          className="slider-track"
          ref={trackRef}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {sorted.map((c, i) => <SliderCard key={c.id || c.name || i} c={c} i={i} />)}
        </div>
        <button className="slider-arrow slider-arrow-right" disabled={!canRight} onClick={() => scrollByCard(1)} aria-label="Scroll right">
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
      <div style={{ textAlign: "center", marginTop: 24 }}>
        <a href="/service-centers" style={{ textDecoration: "none" }}>
          <button className="btn-hover" style={{ background: "transparent", border: `1.5px solid ${R}`, color: R, padding: "10px 26px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>View All Centers →</button>
        </a>
      </div>
    </section>
  );
}

// ── Spare Parts ────────────────────────────────────────────────────────────
const SPARE_PART_CATEGORIES = [
  { iconClass: "fa-solid fa-circle-notch", title: "Brakes & Pads" },
  { iconClass: "fa-solid fa-gears", title: "Engine Parts" },
  { iconClass: "fa-solid fa-filter", title: "Filters" },
  { iconClass: "fa-solid fa-bolt", title: "Electrical" },
  { iconClass: "fa-solid fa-compress", title: "Suspension" },
  { iconClass: "fa-solid fa-snowflake", title: "Air Conditioning" },
];

function SpareParts() {
  const router = useRouter();
  const [hoveredIdx, setHoveredIdx] = useState(null);

  return (
    <section style={{ padding: "72px 5%" }}>
      <SH tag="Spare Parts" h2="Browse by" em="Category" sub="Genuine parts from trusted suppliers — live availability from verified centers." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "16px" }}>
        {SPARE_PART_CATEGORIES.map((cat, idx) => {
          const hovered = hoveredIdx === idx;
          return (
            <div
              key={cat.title}
              onClick={() => router.push(`/spare-parts-results?q=${encodeURIComponent(cat.title)}`)}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                background: "#ffffff",
                border: `1.5px solid ${hovered ? R : "#e5e7eb"}`,
                borderRadius: "16px",
                padding: "28px 20px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all .2s ease",
                transform: hovered ? "translateY(-3px)" : "none",
                boxShadow: hovered ? "0 8px 24px rgba(232,39,42,.08)" : "0 2px 8px rgba(0,0,0,.03)",
              }}
            >
              <div style={{ fontSize: "36px", marginBottom: "12px", color: hovered ? R : "#4b5563", transition: "color 0.2s" }}>
                <i className={cat.iconClass}></i>
              </div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "14px", fontWeight: 700, marginBottom: "4px", color: "#111111" }}>{cat.title}</div>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: "center", marginTop: 28 }}>
        <a href="/spare-parts-search" style={{ textDecoration: "none" }}>
          <button className="btn-hover" style={{ background: "transparent", border: `1.5px solid ${R}`, color: R, padding: "10px 26px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Shop All Parts →</button>
        </a>
      </div>
    </section>
  );
}

// ── How It Works ───────────────────────────────────────────────────────────
function HowItWorks() {
  return (
    <section style={{ padding: "72px 5%", background: "#f7f7f8", position: "relative" }}>
      <SH tag="How It Works" h2="Book in" em="3 Simple Steps" sub="From finding a center to booking — under 2 minutes." />
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start", maxWidth: 900, margin: "0 auto", gap: 16 }}>
        <div className="hw-line" />
        {STEPS.map(st => (
          <div key={st.n} style={{ textAlign: "center", flex: 1, padding: "0 8px", position: "relative", zIndex: 1 }}>
            <div className="btn-hover" style={{ width: 76, height: 76, borderRadius: "50%", background: R, color: "#fff", fontSize: 28, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", border: "5px solid #fff", boxShadow: "0 6px 20px rgba(232,39,42,.35)", cursor: "default" }}>{st.n}</div>
            <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 7 }}>{st.title}</h3>
            <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.7, margin: "0 auto", maxWidth: 220 }}>{st.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Why Autoria ────────────────────────────────────────────────────────────
function WhyAutoria() {
  return (
    <section style={{ padding: "72px 5%" }}>
      <SH tag="Why AUTORIA" h2="Built for" em="Every Car Owner" sub="Everything to keep your car running — in one place." />
      <div style={grid(3, 16)}>
        {WHY.map(w => (
          <div key={w.title} className="why-card" style={{ background: "#fff", borderRadius: 14, padding: 24 }}>
            <div style={{ width: 44, height: 44, background: "linear-gradient(135deg,#fff0f0,#ffe0e0)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, color: R }}>
              <i className={w.iconClass} style={{ fontSize: 18 }}></i>
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 7 }}>{w.title}</h3>
            <p style={{ fontSize: 12.5, color: "#6b7280", lineHeight: 1.7, margin: 0 }}>{w.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Reviews ────────────────────────────────────────────────────────────────
function Reviews({ reviews }) {
  return (
    <section style={{ padding: "72px 5%", background: "#f7f7f8" }}>
      <SH tag="Customer Reviews" h2="Trusted by" em="Thousands" sub="Real experiences from real car owners across Egypt." />
      <div style={grid(3, 16)}>
        {reviews.map((r, idx) => {
          const key = r.id || r.Id || r.name || `review-${idx}`;
          const stars = r.stars ?? r.rating ?? r.Rating ?? 5;
          const text = r.text ?? r.comment ?? r.Comment ?? "";
          const name = r.name ?? r.userName ?? r.UserName ?? "Customer";
          const car = r.car ?? r.carModel ?? r.CarModel ?? "";
          const init = r.init ?? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
          return (
            <div key={key} className="rev-card" style={{ background: "#fff", borderRadius: 14, padding: 22, position: "relative" }}>
              <i className="fa-solid fa-quote-left" style={{ position: "absolute", top: 16, right: 18, fontSize: 24, color: "#ffe2e2" }}></i>
              <div style={{ marginBottom: 10 }}>
                <span style={{ color: "#f59e0b", fontSize: 12, letterSpacing: 1 }}>{"★".repeat(stars)}{"☆".repeat(5 - stars)}</span>
                <span style={{ background: "#fff0f0", color: R, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, marginLeft: 6 }}><i className="fa-solid fa-check" style={{ marginRight: 3 }}></i>Verified</span>
              </div>
              <p style={{ fontSize: 12, color: "#374151", lineHeight: 1.75, marginBottom: 14, borderLeft: `3px solid ${R}`, paddingLeft: 12, fontStyle: "italic" }}>{text}</p>
              <div style={row(9)}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#fff0f0", border: `2px solid ${R}`, display: "flex", alignItems: "center", justifyContent: "center", color: RD, fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{init}</div>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, display: "block" }}>{name}</span>
                  {car && <span style={{ fontSize: 11, color: "#9ca3af" }}>{car}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── CTA ────────────────────────────────────────────────────────────────────
function CTA() {
  return (
    <section style={{ background: `linear-gradient(135deg, ${R} 0%, ${RD} 100%)`, padding: "72px 5%", textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 280, height: 280, borderRadius: "50%", background: "rgba(255,255,255,.06)", top: -90, right: -70 }} />
      <div style={{ position: "absolute", width: 360, height: 360, borderRadius: "50%", background: "rgba(255,255,255,.05)", bottom: -140, left: -100 }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <SH tag="Get Started" h2="Ready to Get Your Car" em="Serviced?" sub="Join thousands of Egyptians who trust AUTORIA to keep their cars running." dark />
        <div style={{ ...row(12), justifyContent: "center", marginTop: 28 }}>
          <a href="/book-service" style={{ textDecoration: "none" }}>
            <button className="btn-hover" style={{ background: "#fff", color: R, border: "none", padding: "13px 28px", borderRadius: 9, fontSize: 13, fontWeight: 800, cursor: "pointer" }}>Book a Service Now</button>
          </a>
        </div>
      </div>
    </section>
  );
}

// ── Main export
export default function AutoriaHomePage() {
  const [centers, setCenters] = useState([]);
  const [parts, setParts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);

  // AI Matching States
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiIssue, setAiIssue] = useState("");
  const [aiLat, setAiLat] = useState("");
  const [aiLng, setAiLng] = useState("");
  const [aiRadius, setAiRadius] = useState(15);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [matchingLoader, setMatchingLoader] = useState(false);
  const [aiMatches, setAiMatches] = useState([]);
  const [aiInterpreted, setAiInterpreted] = useState(null);
  const [aiError, setAiError] = useState("");
  const [saveStatus, setSaveStatus] = useState(""); // "" | "saving" | "saved" | "error"

  const handleGetLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      console.warn("Geolocation is not supported by your browser.");
      return;
    }
    setGettingLocation(true);
    setSaveStatus("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        setAiLat(lat);
        setAiLng(lng);
        setGettingLocation(false);

        // Save to user profile persistently
        try {
          setSaveStatus("saving");
          await usersService.setMyLocation(parseFloat(lat), parseFloat(lng));
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus(""), 4000);
        } catch (err) {
          console.warn("Failed to sync location to profile:", err);
          setSaveStatus("error");
        }
      },
      (error) => {
        console.warn("Location acquisition failed: " + (error?.message || "Unknown error"));
        setAiLat("30.0444");
        setAiLng("31.2357");
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const handleAiMatchSubmit = async (e) => {
    e.preventDefault();
    if (!aiIssue) {
      alert("Please describe your car issue first.");
      return;
    }
    
    let lat = aiLat || "30.0444";
    let lng = aiLng || "31.2357";
    
    setMatchingLoader(true);
    setAiError("");
    setAiMatches([]);
    setAiInterpreted(null);
    
    try {
      const response = await serviceCentersService.match({
        issue: aiIssue,
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        radiusKm: parseFloat(aiRadius)
      });
      
      const dataObj = response?.data || response;
      const matches = dataObj?.matches || dataObj?.Matches || [];
      const interpreted = dataObj?.interpretedIssue || dataObj?.InterpretedIssue || null;
      
      if (interpreted || matches.length > 0) {
        setAiMatches(matches);
        setAiInterpreted(interpreted);
      } else {
        throw new Error(response?.message || "No matching service centers found.");
      }
    } catch (err) {
      console.warn("AI Matching failed:", err);
      setAiError(err.message || "Something went wrong while communicating with Gemini AI.");
    } finally {
      setMatchingLoader(false);
    }
  };

  useEffect(() => {
    getMe()
      .then(res => {
        if (res?.data?.fullName) {
          setUser({ name: res.data.fullName });
        }
        if (res?.data?.latitude && res?.data?.longitude) {
          setAiLat(String(res.data.latitude));
          setAiLng(String(res.data.longitude));
        }
      })
      .catch(() => setUser(null));

    serviceCentersService.getAll()
      .then(res => {
        const items = getServiceCenterItems(res);
        setCenters(items || []);
      })
      .catch(() => {});

    sparePartsService.getSpareParts()
      .then(data => {
        setParts(data || []);
      })
      .catch(() => {});

    reviewsService.getMyReviews()
      .then(res => {
        const items = res?.data ?? res ?? [];
        setReviews(items.slice(0, 6)); // Display latest 6 reviews
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", color: "#111", background: "#fff", lineHeight: 1.6 }}>
      <style>{`
      .btn-hover { transition: all 0.2s ease; }
      .btn-hover:hover { transform: scale(1.04); filter: brightness(1.1); box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
      .btn-hover:active { transform: scale(0.96); }
      @keyframes pulseGlow {
        0% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.4); }
        70% { box-shadow: 0 0 0 10px rgba(168, 85, 247, 0); }
        100% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0); }
      }

      /* Hero */
      .hero-stat { transition: transform .2s ease, background .2s ease; }
      .hero-stat:hover { transform: translateY(-3px); background: rgba(255,255,255,.12); }

      /* Top-Rated Centers Slider */
      .slider-shell { position: relative; max-width: 1180px; margin: 0 auto; padding: 0 52px; }
      .slider-track {
        display: flex; gap: 18px; overflow-x: auto; scroll-snap-type: x mandatory;
        padding: 20px 2px; scrollbar-width: none; -webkit-overflow-scrolling: touch;
      }
      .slider-track::-webkit-scrollbar { display: none; }
      .sc-card { flex: 0 0 calc((100% - 36px) / 3); scroll-snap-align: start; text-decoration: none; color: inherit; min-width: 0; }
      .slider-arrow {
        position: absolute; top: 50%; transform: translateY(-50%); z-index: 6;
        width: 46px; height: 46px; border-radius: 50%; border: 1px solid #e5e7eb;
        background: #fff; color: #111; cursor: pointer; display: flex; align-items: center;
        justify-content: center; font-size: 13px;
        box-shadow: 0 4px 16px rgba(0,0,0,.12); transition: all .2s ease;
      }
      .slider-arrow:hover:not(:disabled) { background: #E8272A; border-color: #E8272A; color: #fff; transform: translateY(-50%) scale(1.05); }
      .slider-arrow:disabled { opacity: .35; cursor: default; }
      .slider-arrow-left { left: 0; }
      .slider-arrow-right { right: 0; }
      .sc-badge { position: absolute; top: 10px; left: 10px; background: #E8272A; color: #fff; font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 20px; letter-spacing: .3px; }
      .sc-open { position: absolute; top: 10px; right: 10px; background: #dcfce7; color: #15803d; font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 20px; display: flex; align-items: center; }

      /* HowItWorks connector */
      .hw-line { position: absolute; top: 38px; left: 12%; right: 12%; border-top: 2px dashed rgba(232,39,42,.3); }
      @media (max-width: 720px) { .hw-line { display: none; } }

      /* Card hover lifts */
      .why-card, .rev-card { border: 1px solid #e5e7eb; transition: all .25s ease; }
      .why-card:hover, .rev-card:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,0,0,.08); border-color: rgba(232,39,42,.4) !important; }

      @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }

      @media (max-width: 980px) {
        .sc-card { flex: 0 0 calc((100% - 18px) / 2); }
      }
      @media (max-width: 640px) {
        .sc-card { flex: 0 0 100%; }
        .slider-shell { padding: 0 14px; }
        .slider-arrow { width: 38px; height: 38px; }
      }
    `}</style>
      <Navbar user={user} />
      <Hero setCenters={setCenters} onAiSupportClick={() => setShowAiModal(true)} />
      <ServiceCenters centers={centers} />
      <SpareParts />
      <HowItWorks />
      <WhyAutoria />
      <Reviews reviews={reviews.length ? reviews : REVIEWS} />
      <CTA />
      <Footer />

      {/* Glassmorphism AI Support Diagnosis Modal */}
      {showAiModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.5)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "rgba(255, 255, 255, 0.95)", borderRadius: "20px", width: "100%", maxWidth: "650px", padding: "32px", border: "1.5px solid rgba(255, 255, 255, 0.3)", boxShadow: "0 20px 50px rgba(0, 0, 0, 0.15)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1.5px solid #F1F5F9", paddingBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="fa-solid fa-wand-magic-sparkles" style={{ color: "#E8272A", fontSize: "20px" }}></i>
                <h3 style={{ fontSize: "20px", fontWeight: 800, margin: 0, color: "#111111" }}>AI Support</h3>
              </div>
              <button 
                onClick={() => {
                  setShowAiModal(false);
                  setAiMatches([]);
                  setAiInterpreted(null);
                  setAiIssue("");
                }} 
                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#64748B" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAiMatchSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: 700, color: "#475569" }}>Describe your car issue in detail (عربي أو إنجليزي)</label>
                <textarea 
                  value={aiIssue}
                  onChange={(e) => setAiIssue(e.target.value)}
                  placeholder="e.g. My car engine is overheating and there is steam coming out, or تكييف السيارة لا يعمل ويخرج هواء ساخن..."
                  required
                  rows="4"
                  style={{ padding: "12px 16px", border: "1.5px solid #E2E8F0", borderRadius: "10px", fontSize: "14px", fontFamily: "inherit", outline: "none", resize: "none", transition: "all 0.2s" }}
                  onFocus={(e) => e.target.style.borderColor = "#E8272A"}
                  onBlur={(e) => e.target.style.borderColor = "#E2E8F0"}
                />
              </div>

              {/* Location acquisition section */}
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#475569" }}>Latitude</label>
                  <input 
                    type="text" 
                    value={aiLat} 
                    onChange={(e) => setAiLat(e.target.value)} 
                    placeholder="30.0444"
                    style={{ padding: "10px 14px", border: "1.5px solid #E2E8F0", borderRadius: "8px", fontSize: "13px", background: "#F8FAFC" }}
                  />
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "#475569" }}>Longitude</label>
                  <input 
                    type="text" 
                    value={aiLng} 
                    onChange={(e) => setAiLng(e.target.value)} 
                    placeholder="31.2357"
                    style={{ padding: "10px 14px", border: "1.5px solid #E2E8F0", borderRadius: "8px", fontSize: "13px", background: "#F8FAFC" }}
                  />
                </div>
                <button 
                  type="button" 
                  onClick={handleGetLocation} 
                  disabled={gettingLocation}
                  style={{ background: "#F1F5F9", color: "#475569", border: "1.5px solid #CBD5E1", height: "39px", padding: "0 16px", borderRadius: "8px", fontSize: "12.5px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", transition: "all 0.2s" }}
                >
                  <i className="fa-solid fa-location-crosshairs" style={{ color: "#E8272A" }}></i> {gettingLocation ? "Locating..." : "Get My Location"}
                </button>
              </div>

              {saveStatus && (
                <div style={{ 
                  fontSize: "12px", 
                  fontWeight: 700, 
                  color: saveStatus === "saved" ? "#10B981" : saveStatus === "saving" ? "#3B82F6" : "#EF4444",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginTop: "-8px",
                  marginLeft: "2px"
                }}>
                  {saveStatus === "saving" && <><i className="fa-solid fa-spinner fa-spin" style={{ color: "#3B82F6" }}></i> Saving location to your profile...</>}
                  {saveStatus === "saved" && <><i className="fa-solid fa-circle-check" style={{ color: "#10B981" }}></i> ✓ Saved to profile persistently!</>}
                  {saveStatus === "error" && <><i className="fa-solid fa-circle-exclamation" style={{ color: "#EF4444" }}></i> Sync failed — using locally only</>}
                </div>
              )}

              {/* Radius slider */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", fontWeight: 700, color: "#475569" }}>
                  <span>Search Radius</span>
                  <span style={{ color: "#E8272A" }}>{aiRadius} km</span>
                </div>
                <input 
                  type="range" 
                  min="2" 
                  max="50" 
                  value={aiRadius}
                  onChange={(e) => setAiRadius(parseInt(e.target.value))}
                  style={{ width: "100%", accentColor: "#E8272A", cursor: "pointer" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                <button 
                  type="submit" 
                  disabled={matchingLoader}
                  style={{ 
                    background: "#ffffff", 
                    color: "#111111", 
                    border: "1.5px solid #E6C687", 
                    padding: "12px 32px", 
                    borderRadius: "10px", 
                    fontSize: "14px", 
                    fontWeight: 800, 
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 15px rgba(230, 198, 135, 0.25)"
                  }}
                >
                  {matchingLoader ? (
                    <>
                      <div style={{ width: "16px", height: "16px", border: "2px solid #111111", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                      Analyzing Issue...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-wand-magic-sparkles" style={{ color: "#E6C687" }}></i> AI Support
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Error notifications */}
            {aiError && (
              <div style={{ background: "#FEF2F2", color: "#EF4444", padding: "12px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, marginTop: "16px" }}>
                ⚠️ {aiError}
              </div>
            )}

            {/* AI Results Section */}
            {(aiMatches.length > 0 || aiInterpreted) && (
              <div style={{ marginTop: "24px", animation: "slideDown 0.3s ease-out" }}>
                {/* AI Interpretation block */}
                {aiInterpreted && (
                  <div style={{ background: "linear-gradient(135deg, #FFF5F5 0%, #FFF0F0 100%)", border: "1px solid #FCA5A5", padding: "16px", borderRadius: "12px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: 800, color: "#B81C1F", textTransform: "uppercase", letterSpacing: "0.5px" }}>Gemini AI Analysis</div>
                      <div style={{ fontSize: "14px", fontWeight: 800, color: "#1E1B4B", marginTop: "4px" }}>
                        Category: <span style={{ color: "#E8272A" }}>{aiInterpreted.serviceType || "General Maintenance"}</span>
                      </div>
                    </div>
                    <div>
                      <span style={{ 
                        background: 
                          aiInterpreted.urgency === "high" ? "#FEE2E2" :
                          aiInterpreted.urgency === "medium" ? "#FEF3C7" : "#ECFDF5",
                        color:
                          aiInterpreted.urgency === "high" ? "#991B1B" :
                          aiInterpreted.urgency === "medium" ? "#92400E" : "#065F46",
                        fontSize: "11px",
                        fontWeight: 800,
                        padding: "5px 12px",
                        borderRadius: "20px",
                        textTransform: "uppercase"
                      }}>
                        🚨 Urgency: {aiInterpreted.urgency || "low"}
                      </span>
                    </div>
                  </div>
                )}

                <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#1E293B", marginBottom: "12px" }}>Top Matched Service Centers</h4>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {aiMatches.map((match, idx) => (
                    <div key={match.serviceCenterId} style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "14px", padding: "16px", display: "flex", flexDirection: "column", gap: "10px", transition: "all 0.2s" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ background: "#E8272A", color: "#fff", width: "20px", height: "20px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 900 }}>{idx + 1}</span>
                            <span style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A" }}>{match.name}</span>
                          </div>
                          <div style={{ fontSize: "12px", color: "#64748B", marginTop: "3px", marginLeft: "28px" }}>
                            <i className="fa-solid fa-location-dot" style={{ color: "#E8272A", marginRight: "4px" }}></i> {match.distanceKm.toFixed(1)} km away • ⭐ {match.rating.toFixed(1)}
                          </div>
                        </div>
                        <a href={`/service-center-profile/${match.serviceCenterId}`} style={{ textDecoration: "none" }}>
                          <button style={{ background: "#F1F5F9", color: "#1E293B", border: "none", padding: "6px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                            Book Service
                          </button>
                        </a>
                      </div>

                      {match.explanation && (
                        <div style={{ marginLeft: "28px", background: "#F8FAFC", borderLeft: "3.5px solid #E8272A", padding: "8px 12px", borderRadius: "0 8px 8px 0" }}>
                          <p style={{ fontSize: "12.5px", color: "#475569", lineHeight: 1.5, margin: 0, fontStyle: "italic" }}>
                            <span style={{ color: "#E8272A", fontWeight: 800 }}>&ldquo;</span>
                            {match.explanation}
                            <span style={{ color: "#E8272A", fontWeight: 800 }}>&rdquo;</span>
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {aiMatches.length === 0 && (
                    <div style={{ textAlign: "center", padding: "20px", color: "#64748B", fontSize: "13px" }}>
                      No service centers matched your criteria within the radius. Try increasing search range!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
