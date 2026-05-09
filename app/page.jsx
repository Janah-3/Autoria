"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/apiConfig";
import Navbar from "@/components/Navbar";
import { SkeletonBox, SkeletonCard } from "@/components/Skeleton";




const R = "#E8272A";
const RD = "#B81C1F";

const CENTERS = [
  { bg: "#fff0f0", icon: "🏭", badge: "Top Rated", name: "ProCare Auto Center", loc: "Nasr City, Cairo", tags: ["Oil Change", "Brakes", "AC Service"], stars: 5, rating: "4.9", reviews: "312", price: "From 150 EGP" },
  { bg: "#fefce8", icon: "🔩", badge: "Fast Service", name: "SpeedFix Workshop", loc: "Heliopolis, Cairo", tags: ["Engine Repair", "Diagnostics"], stars: 5, rating: "4.7", reviews: "198", price: "From 200 EGP" },
  { bg: "#f0fdf4", icon: "🚗", badge: "New", name: "GreenWheel Service", loc: "6th of October, Giza", tags: ["Tires", "Alignment", "Wash"], stars: 4, rating: "4.5", reviews: "87", price: "From 80 EGP" },
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
function Hero({ setCenters }) {
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


  useEffect(() => {
    fetch(`${API_BASE_URL}/auth/me`)

      .then(res => res.json())

      .then(data => {
        if (data && data.length) setStats(data);
      })
      .catch(() => { });
  }, []);



  return (
    <section style={{ background: `linear-gradient(135deg,#111 0%,#2d1010 52%,${RD} 100%)`, padding: "72px 5% 64px", textAlign: "center" }}>
      <h1 style={{ color: "#fff", fontSize: 44, fontWeight: 900, lineHeight: 1.12, letterSpacing: -1.5, marginBottom: 14 }}>
        Find the <em style={{ color: "#ff6b6b", fontStyle: "normal" }}>Best Car Service</em><br />Near You
      </h1>
      <p style={{ color: "rgba(255,255,255,.55)", fontSize: 15, lineHeight: 1.7, maxWidth: 460, margin: "0 auto 32px" }}>
        Compare certified service centers, book instantly, and get your car back on the road — fast.
      </p>

      {/* Search bar */}
      <div style={{ background: "#fff", borderRadius: 12, padding: "6px 6px 6px 0", display: "flex", alignItems: "center", maxWidth: 600, margin: "0 auto 28px", boxShadow: "0 4px 24px rgba(0,0,0,.2)" }}>
        <div style={{ flex: 1, ...row(8), padding: "0 16px", borderRight: "1px solid #e5e7eb" }}>
          <span style={{ fontSize: 15, opacity: .3 }}>🔧</span>
          <input
            value={service}
            onChange={(e) => setService(e.target.value)}
            placeholder="Service type (Oil change, Repair...)"
            style={{ border: "none", outline: "none", width: "100%", fontSize: 14, color: "#374151" }}
          />
        </div>
        <div style={{ flex: 1, ...row(8), padding: "0 16px" }}>
          <span style={{ fontSize: 15, opacity: .3 }}>📍</span>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Your location"
            style={{ border: "none", outline: "none", width: "100%", fontSize: 14, color: "#374151" }}
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
                {!c.cover && c.icon}
                <span style={{ position: "absolute", top: 9, left: 9, background: R, color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20 }}>{c.badge}</span>
                <span style={{ position: "absolute", top: 9, right: 9, background: "#dcfce7", color: "#15803d", fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20 }}>● Open</span>
              </div>
              <div style={{ padding: 15 }}>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 3 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 9 }}>📍 {c.loc}</div>
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
        <button className="btn-hover" style={{ background: "transparent", border: `1.5px solid ${R}`, color: R, padding: "10px 26px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>View All Centers →</button>
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
            <span style={{ fontSize: 32, marginBottom: 10, display: "block" }}>{p.icon}</span>
            <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 3 }}>{p.name}</div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 9 }}>{p.desc}</div>
            <div style={{ fontSize: 15, fontWeight: 900, color: R }}>{p.price}</div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 28 }}>
        <button className="btn-hover" style={{ background: "transparent", border: `1.5px solid ${R}`, color: R, padding: "10px 26px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Shop All Parts →</button>
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
            <div style={{ width: 42, height: 42, background: "#fff0f0", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 13 }}>{w.icon}</div>
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
              <span style={{ background: "#fff0f0", color: R, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, marginLeft: 6 }}>✓ Verified</span>
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

// ── Footer ─────────────────────────────────────────────────────────────────
function Footer() {
  const cols = [
    { title: "Platform", links: ["Service Centers", "Spare Parts", "Book a Service", "Dashboard"] },
    { title: "Company", links: ["About Us", "Careers", "Blog", "Contact"] },
    { title: "Support", links: ["Help Center", "Privacy Policy", "Terms", "Partners"] },
  ];
  return (
    <footer style={{ background: "#080808", padding: "48px 5% 22px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 36 }}>
        <div>
          <span style={{ color: "#fff", fontSize: 18, fontWeight: 900, display: "block", marginBottom: 10, letterSpacing: -.5 }}>
            AUTO<span style={{ opacity: .35, fontWeight: 400 }}>RIA</span>
          </span>
          <p style={{ color: "#444", fontSize: 12, lineHeight: 1.8, maxWidth: 210 }}>Egypt's platform connecting car owners with the best service centers and genuine spare parts.</p>
        </div>
        {cols.map(c => (
          <div key={c.title}>
            <h4 style={{ color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 }}>{c.title}</h4>
            <ul style={{ listStyle: "none" }}>
              {c.links.map(l => <li key={l} style={{ marginBottom: 8 }}><a href="#" style={{ color: "#444", fontSize: 12, textDecoration: "none" }}>{l}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid #141414", paddingTop: 18, ...row(0), justifyContent: "space-between" }}>
        <p style={{ color: "#2a2a2a", fontSize: 11 }}>© 202 AUTORIA. All rights reserved.</p>

      </div>
    </footer>
  );
}

// ── Main export
export default function AutoriaHomePage() {

  const [centers, setCenters] = useState(CENTERS);
  const [parts, setParts] = useState(PARTS);
  const [reviews, setReviews] = useState(REVIEWS);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/auth/me`)
      .then(res => res.json())
      .then(data => {
        if (data && data.name) setUser(data);
      })
      .catch(() => setUser(null));

    // Service Centers (Local API)
    fetch(`${API_BASE_URL}/ServiceCenters`)
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data?.items) {
          const mapped = res.data.items.map(item => ({
            id: item.id,
            name: item.name,
            loc: `${item.district}, ${item.governorate}`,
            tags: item.serviceTypes,
            stars: 5,
            rating: 4.8,
            reviews: 120,
            price: "Contact",
            badge: item.type,
            bg: "#f3f4f6",
            cover: item.coverPhoto,
          }));
          setCenters(mapped);
        }
      })
      .catch(err => {
        console.error("❌ Home Page API Error:", err);
      });

    fetch("https://your-api.com/api/spare-parts")
      .then(res => res.json())
      .then(data => {
        if (data.length) setParts(data);
      })
      .catch(() => { });

    /* 
    fetch("https://your-api.com/api/auth/me")
    ...
    */

    // return () => clearTimeout(timer); // Removed simulation timer
  }, []);



  return (
    <div style={{ fontFamily: "'Inter',sans-serif", color: "#111", background: "#fff", lineHeight: 1.6 }}>
      <style>{`
      .btn-hover { transition: all 0.2s ease; }
      .btn-hover:hover { transform: scale(1.04); filter: brightness(1.1); box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
      .btn-hover:active { transform: scale(0.96); }
    `}</style>
      <Navbar user={user} />
      <Hero setCenters={setCenters} />
      <ServiceCenters centers={centers} />
      <SpareParts parts={parts} />
      <HowItWorks />
      <WhyAutoria />
      <Reviews reviews={reviews} />
      <CTA />
      <Footer />
    </div>
  );
}

