"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/api/usersService";
import {
  serviceCentersService,
  getServiceCenterItems,
} from "@/lib/api/serviceCentersService";
import { sparePartsService } from "@/lib/sparePartsService";
import { getSparePartItems } from "@/lib/api/mappers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
  { icon: "✅", title: "Verified Centers Only", desc: "Every center is vetted before listing. No surprises." },
  { icon: "💰", title: "Transparent Pricing", desc: "See prices upfront. Compare across centers side by side." },
  { icon: "⚡", title: "Instant Booking", desc: "Book in under 2 minutes. No calls, no waiting." },
  { icon: "⭐", title: "Trusted Reviews", desc: "Ratings from real verified customers only." },
  { icon: "🛒", title: "Parts Marketplace", desc: "Order genuine parts online, delivered to your door." },
  { icon: "📱", title: "Track Everything", desc: "All bookings and orders in one dashboard." },
];

const REVIEWS = [
  { init: "AM", name: "Ahmed Mostafa", car: "Toyota Corolla · Cairo", stars: 5, text: "Booked an oil change in under 2 minutes. Price was exactly as listed. Will use again!" },
  { init: "SK", name: "Sara Khaled", car: "Hyundai Tucson · Giza", stars: 5, text: "The comparison feature saved me 300 EGP. AUTORIA is a game changer for car owners." },
  { init: "MH", name: "Mohamed Hassan", car: "Kia Sportage · Alexandria", stars: 4, text: "Ordered brake pads — arrived next day. Booking was smooth. Really impressed." },
];

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

  const [stats, setStats] = useState([
    ["200+", "Service Centers"],
    ["15K+", "Happy Customers"],
    ["4.8★", "Avg Rating"],
    ["50+", "Parts Brands"]
  ]);
  return (
    <section style={{ background: `linear-gradient(135deg,#111 0%,#2d1010 52%,${RD} 100%)`, padding: "72px 5% 64px", textAlign: "center" }}>
      <h1 style={{ color: "#fff", fontSize: 44, fontWeight: 900, lineHeight: 1.12, letterSpacing: -1.5, marginBottom: 14 }}>
        Find the <em style={{ color: "#ff6b6b", fontStyle: "normal" }}>Best Car Service</em><br />Near You
      </h1>
      <p style={{ color: "rgba(255,255,255,.55)", fontSize: 15, lineHeight: 1.7, maxWidth: 460, margin: "0 auto 32px" }}>
        Compare certified service centers, book instantly, and get your car back on the road — fast.
      </p>

      {/* Search bar & AI Support Wrapper */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", maxWidth: "780px", margin: "0 auto 28px", flexWrap: "wrap" }}>
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

      <div style={{ ...row(40), justifyContent: "center" }}>
        {stats.map(([v, l]) => (
          <div key={l} style={{ textAlign: "center" }}>
            <strong style={{ display: "block", color: "#fff", fontSize: 22, fontWeight: 900, letterSpacing: -.5 }}>{v}</strong>
            <span style={{ color: "rgba(255,255,255,.4)", fontSize: 10, textTransform: "uppercase", letterSpacing: .6, fontWeight: 600 }}>{l}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Service Centers ────────────────────────────────────────────────────────
function ServiceCenters({ centers }) {
  return (
    <section style={{ padding: "72px 5%", background: "#f7f7f8" }}>
      <SH tag="Service Centers" h2="Top-Rated Centers" em="Near You" sub="Browse certified centers, compare prices and ratings, then book in seconds." />
      <div style={grid(3, 18)}>
        {centers.map(c => (
          <a key={c.id || c.name} href={`/service-center-profile/${c.id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, overflow: "hidden", cursor: "pointer" }}>
              <div style={{
                height: 130,
                background: c.cover ? `url(${c.cover}) center/cover no-repeat` : c.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 42,
                position: "relative"
              }}>
                {!c.cover && (c.icon?.startsWith("fa-") ? <i className={c.icon} style={{ fontSize: 36, color: "#9ca3af" }}></i> : <span style={{ fontSize: 42 }}>{c.icon || "🔧"}</span>)}
                <span style={{ position: "absolute", top: 9, left: 9, background: R, color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20 }}>{c.badge}</span>
                <span style={{ position: "absolute", top: 9, right: 9, background: "#dcfce7", color: "#15803d", fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20 }}>● Open</span>
              </div>
              <div style={{ padding: 15 }}>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 3 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 9 }}><i className="fa-solid fa-location-dot" style={{ marginRight: 4 }}></i>{c.loc}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 11 }}>
                  {c.tags.map(t => <span key={t} style={{ background: "#f3f4f6", color: "#374151", fontSize: 10, padding: "3px 8px", borderRadius: 6, fontWeight: 600 }}>{t}</span>)}
                </div>
                <div style={{ ...row(0), justifyContent: "space-between", borderTop: "1px solid #f3f4f6", paddingTop: 10 }}>
                  <span>
                    <span style={{ color: "#f59e0b", fontSize: 11 }}>{"★".repeat(c.stars || 5)}{"☆".repeat(5 - (c.stars || 5))}</span>
                    <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: 3 }}>{c.rating} ({c.reviews})</span>
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 900, color: R }}>{c.price}</span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 28 }}>
        <a href="/service-centers" style={{ textDecoration: "none" }}>
          <button className="btn-hover" style={{ background: "transparent", border: `1.5px solid ${R}`, color: R, padding: "10px 26px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>View All Centers →</button>
        </a>
      </div>
    </section>
  );
}

// ── Spare Parts ────────────────────────────────────────────────────────────
function SpareParts({ parts }) {
  return (
    <section style={{ padding: "72px 5%" }}>
      <SH tag="Spare Parts" h2="Browse the" em="Marketplace" sub="Genuine parts from trusted suppliers — delivered to your door." />
      <div style={grid(4, 16)}>
        {parts.map(p => (
          <div key={p.name} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 18, textAlign: "center", cursor: "pointer" }}>
            <span style={{ fontSize: "36px", marginBottom: 10, display: "block" }}>{p.icon || "📦"}</span>
            <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 3 }}>{p.name}</div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 9 }}>{p.desc || p.car}</div>
            <div style={{ fontSize: 15, fontWeight: 900, color: R }}>{p.price}</div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 28 }}>
        <a href="/spare-parts-results" style={{ textDecoration: "none" }}>
          <button className="btn-hover" style={{ background: "transparent", border: `1.5px solid ${R}`, color: R, padding: "10px 26px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Shop All Parts →</button>
        </a>
      </div>
    </section>
  );
}

// ── How It Works ───────────────────────────────────────────────────────────
function HowItWorks() {
  return (
    <section style={{ padding: "72px 5%", background: "#f7f7f8" }}>
      <SH tag="How It Works" h2="Book in" em="3 Simple Steps" sub="From finding a center to booking — under 2 minutes." />
      <div style={grid(3, 16)}>
        {STEPS.map(st => (
          <div key={st.n} style={{ textAlign: "center", padding: "0 16px" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: R, color: "#fff", fontSize: 26, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", border: "4px solid #fff0f0", boxShadow: "0 4px 16px rgba(232,39,42,.3)" }}>{st.n}</div>
            <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 7 }}>{st.title}</h3>
            <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.7 }}>{st.desc}</p>
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
          <div key={w.title} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 22 }}>
            <div style={{ width: 42, height: 42, background: "#fff0f0", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 13 }}>
              <span style={{ fontSize: "20px" }}>{w.icon}</span>
            </div>
            <h3 style={{ fontSize: 13, fontWeight: 800, marginBottom: 6 }}>{w.title}</h3>
            <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.65 }}>{w.desc}</p>
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
        {reviews.map(r => (
          <div key={r.name} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
            <div style={{ marginBottom: 10 }}>
              <span style={{ color: "#f59e0b", fontSize: 12, letterSpacing: 1 }}>{"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}</span>
              <span style={{ background: "#fff0f0", color: R, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, marginLeft: 6 }}><i className="fa-solid fa-check" style={{ marginRight: 3 }}></i>Verified</span>
            </div>
            <p style={{ fontSize: 12, color: "#374151", lineHeight: 1.75, marginBottom: 14, borderLeft: `3px solid ${R}`, paddingLeft: 12, fontStyle: "italic" }}>{r.text}</p>
            <div style={row(9)}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#fff0f0", border: `2px solid ${R}`, display: "flex", alignItems: "center", justifyContent: "center", color: RD, fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{r.init}</div>
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, display: "block" }}>{r.name}</span>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>{r.car}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── CTA ────────────────────────────────────────────────────────────────────
function CTA() {
  return (
    <section style={{ background: R, padding: "72px 5%", textAlign: "center" }}>
      <SH tag="Get Started" h2="Ready to Get Your Car" em="Serviced?" sub="Join thousands of Egyptians who trust AUTORIA to keep their cars running." dark />
      <div style={{ ...row(12), justifyContent: "center", marginTop: 28 }}>
        <a href="/book-service" style={{ textDecoration: "none" }}>
          <button className="btn-hover" style={{ background: "#fff", color: R, border: "none", padding: "13px 28px", borderRadius: 9, fontSize: 13, fontWeight: 800, cursor: "pointer" }}>Book a Service Now</button>
        </a>
        <a href="/search-results" style={{ textDecoration: "none" }}>
          <button className="btn-hover" style={{ background: "transparent", color: "#fff", border: "2px solid rgba(255,255,255,.4)", padding: "13px 28px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Explore Centers</button>
        </a>
      </div>
    </section>
  );
}

// ── Main export
export default function AutoriaHomePage() {
  const [centers, setCenters] = useState(CENTERS);
  const [parts, setParts] = useState(PARTS);
  const [reviews, setReviews] = useState(REVIEWS);
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

  const handleGetLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      console.warn("Geolocation is not supported by your browser.");
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setAiLat(position.coords.latitude.toFixed(6));
        setAiLng(position.coords.longitude.toFixed(6));
        setGettingLocation(false);
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
      })
      .catch(() => setUser(null));

    serviceCentersService.getAll()
      .then(res => {
        const items = getServiceCenterItems(res);
        if (items.length) setCenters(items);
      })
      .catch(() => {});

    sparePartsService.getSpareParts()
      .then(data => {
        if (data.length) setParts(data);
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
    `}</style>
      <Navbar user={user} />
      <Hero setCenters={setCenters} onAiSupportClick={() => setShowAiModal(true)} />
      <ServiceCenters centers={centers} />
      <SpareParts parts={parts} />
      <HowItWorks />
      <WhyAutoria />
      <Reviews reviews={reviews} />
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
                            "{match.explanation}"
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
