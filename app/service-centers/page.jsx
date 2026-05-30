"use client";

import { useState, useEffect, useMemo } from "react";
import { getMe } from "@/lib/api/usersService";
import {
  serviceCentersService,
  getServiceCenterItems,
} from "@/lib/api/serviceCentersService";
import Navbar from "@/components/Navbar";




const R  = "#E8272A";
const RD = "#B81C1F";


const row  = (gap = 0) => ({ display: "flex", alignItems: "center", gap });
const flex = (extra = {}) => ({ display: "flex", ...extra });






function SearchBanner({ query, setQuery, location, setLocation, onSearch, onAiSupportClick }) {
  return (
    <section style={{ background: `linear-gradient(135deg,#111 0%,#2d1010 52%,${RD} 100%)`, padding: "52px 5% 44px", textAlign: "center" }}>
      <p style={{ color: "rgba(255,255,255,.45)", fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 10 }}>— Service Centers —</p>
      <h1 style={{ color: "#fff", fontSize: 38, fontWeight: 900, lineHeight: 1.1, letterSpacing: -1.2, marginBottom: 10 }}>
        Find a <em style={{ color: "#ff6b6b", fontStyle: "normal" }}>Trusted Center</em> Near You
      </h1>
      <p style={{ color: "rgba(255,255,255,.5)", fontSize: 14, lineHeight: 1.7, maxWidth: 420, margin: "0 auto 28px" }}>
        Browse 200+ certified centers, compare ratings & book instantly.
      </p>

      {/* Search Bar and AI Support Button Flex Wrapper */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", maxWidth: "820px", margin: "0 auto", flexWrap: "wrap" }}>
        <div style={{ background: "#fff", borderRadius: 12, display: "flex", alignItems: "center", flex: 1, minWidth: "300px", boxShadow: "0 4px 24px rgba(0,0,0,.22)", overflow: "hidden" }}>
          <div style={{ flex: 1, ...row(8), padding: "0 18px", borderRight: "1px solid #e5e7eb", height: 52 }}>
            <span style={{ fontSize: 15, opacity: .35 }}>🔍</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && onSearch()}
              placeholder="Center name or service…"
              style={{ border: "none", outline: "none", width: "100%", fontSize: 14, color: "#374151", background: "transparent" }}
            />
          </div>
          <div style={{ flex: 1, ...row(8), padding: "0 18px", height: 52 }}>
            <span style={{ fontSize: 15, opacity: .35 }}>📍</span>
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              onKeyDown={e => e.key === "Enter" && onSearch()}
              placeholder="City or area…"
              style={{ border: "none", outline: "none", width: "100%", fontSize: 14, color: "#374151", background: "transparent" }}
            />
          </div>
          <button
            className="btn-hover"
            onClick={onSearch}
            style={{ background: R, color: "#fff", border: "none", height: 52, padding: "0 26px", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
          >
            Search
          </button>
        </div>

        {/* AI Support trigger button */}
        <button
          className="btn-hover"
          type="button"
          onClick={onAiSupportClick}
          style={{
            background: "#ffffff",
            color: "#111111",
            border: "1.5px solid #E6C687",
            height: "52px",
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
    </section>
  );
}


function Sidebar({ city, setCity, minRating, setMinRating, serviceFilter, setServiceFilter, onlyOpen, setOnlyOpen, total, showing, allCities, allServices }) {
  const ratingOptions = [0, 4, 4.5, 4.8];

  return (
    <aside style={{ width: 230, flexShrink: 0 }}>

      <div style={{ background: "#fff0f0", border: `1.5px solid ${R}`, borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
        <span style={{ color: RD, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Results</span>
        <p style={{ color: "#111", fontSize: 22, fontWeight: 900, margin: "4px 0 0", letterSpacing: -.5 }}>
          {showing}<span style={{ color: "#9ca3af", fontSize: 13, fontWeight: 400 }}> / {total}</span>
        </p>
      </div>

      <FilterBox title="City">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {allCities.map(c => (
            <label key={c} style={{ ...row(8), cursor: "pointer", fontSize: 13, color: city === c ? R : "#374151", fontWeight: city === c ? 700 : 400 }}>
              <input
                type="radio"
                name="city"
                checked={city === c}
                onChange={() => setCity(c)}
                style={{ accentColor: R }}
              />
              {c}
            </label>
          ))}
        </div>
      </FilterBox>

      <FilterBox title="Min Rating">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {ratingOptions.map(r => (
            <label key={r} style={{ ...row(8), cursor: "pointer", fontSize: 13, color: minRating === r ? R : "#374151", fontWeight: minRating === r ? 700 : 400 }}>
              <input
                type="radio"
                name="rating"
                checked={minRating === r}
                onChange={() => setMinRating(r)}
                style={{ accentColor: R }}
              />
              {r === 0 ? "Any Rating" : `${r}★ & above`}
            </label>
          ))}
        </div>
      </FilterBox>

      <FilterBox title="Service Type">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {allServices.map(s => (
            <label key={s} style={{ ...row(8), cursor: "pointer", fontSize: 13, color: serviceFilter === s ? R : "#374151", fontWeight: serviceFilter === s ? 700 : 400 }}>
              <input
                type="radio"
                name="service"
                checked={serviceFilter === s}
                onChange={() => setServiceFilter(s)}
                style={{ accentColor: R }}
              />
              {s}
            </label>
          ))}
        </div>
      </FilterBox>

      <FilterBox title="Availability">
        <label style={{ ...row(8), cursor: "pointer", fontSize: 13 }}>
          <input
            type="checkbox"
            checked={onlyOpen}
            onChange={e => setOnlyOpen(e.target.checked)}
            style={{ accentColor: R, width: 15, height: 15 }}
          />
          <span style={{ color: onlyOpen ? R : "#374151", fontWeight: onlyOpen ? 700 : 400 }}>Open Now Only</span>
        </label>
      </FilterBox>
    </aside>
  );
}

function FilterBox({ title, children }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "14px 16px", marginBottom: 12 }}>
      <h3 style={{ fontSize: 11, fontWeight: 800, letterSpacing: "1.2px", textTransform: "uppercase", color: "#9ca3af", marginBottom: 12 }}>{title}</h3>
      {children}
    </div>
  );
}


function CenterCard({ c }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        border: `1.5px solid ${hovered ? R : "#e5e7eb"}`,
        borderRadius: 16,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.22s ease",
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered ? "0 12px 32px rgba(232,39,42,.13)" : "0 1px 4px rgba(0,0,0,.05)",
      }}
    >

      <div style={{ 
        height: 140, 
        background: c.cover ? `url(${c.cover}) center/cover no-repeat` : c.bg, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        fontSize: 40, 
        position: "relative" 
      }}>
        {!c.cover && (c.icon || <i className="fa-solid fa-wrench" style={{ color: "#9ca3af" }}></i>)}
        <span style={{ position: "absolute", top: 9, left: 9, background: R, color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20 }}>{c.badge}</span>
        <span style={{
          position: "absolute", top: 9, right: 9,
          background: c.open ? "#dcfce7" : "#f3f4f6",
          color: c.open ? "#15803d" : "#9ca3af",
          fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20
        }}>
          {c.open ? "● Open" : "● Closed"}
        </span>
      </div>


      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 2, color: "#111" }}>{c.name}</div>
        <div style={{ ...row(4), marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: "#9ca3af" }}>📍</span>
          <span style={{ fontSize: 11, color: "#9ca3af" }}>{c.loc}</span>
        </div>
        <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6, marginBottom: 10 }}>{c.desc}</p>


        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
          {c.tags.map(t => (
            <span key={t} style={{ background: "#f3f4f6", color: "#374151", fontSize: 10, padding: "3px 9px", borderRadius: 6, fontWeight: 600 }}>{t}</span>
          ))}
        </div>


        <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 11, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <span style={{ color: "#f59e0b", fontSize: 12 }}>{"★".repeat(Math.round(c.stars))}{"☆".repeat(5 - Math.round(c.stars))}</span>
            <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: 4 }}>{c.rating} ({c.reviews})</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 900, color: R }}>{c.price}</span>
        </div>


        <button
          className="btn-hover"
          style={{
            marginTop: 12,
            width: "100%",
            background: hovered ? R : "transparent",
            border: `1.5px solid ${R}`,
            color: hovered ? "#fff" : R,
            padding: "9px 0",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          Book Now
        </button>
      </div>
    </div>
  );
}


function EmptyState({ onReset }) {
  return (
    <div style={{ textAlign: "center", padding: "64px 24px" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: "#111", marginBottom: 8 }}>No centers found</h3>
      <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 20 }}>Try adjusting your filters or search term.</p>
      <button className="btn-hover" onClick={onReset} style={{ background: R, color: "#fff", border: "none", padding: "10px 24px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
        Reset Filters
      </button>
    </div>
  );
}


function SortBar({ sort, setSort, count }) {
  return (
    <div style={{ ...row(0), justifyContent: "space-between", marginBottom: 20 }}>
      <span style={{ fontSize: 13, color: "#6b7280" }}>
        Showing <strong style={{ color: "#111" }}>{count}</strong> service centers
      </span>
      <div style={{ ...row(6) }}>
        <span style={{ fontSize: 12, color: "#9ca3af" }}>Sort by:</span>
        {[["Rating", "rating"], ["Price", "price"], ["Reviews", "reviews"]].map(([label, val]) => (
          <button
            key={val}
            onClick={() => setSort(val)}
            style={{
              background: sort === val ? R : "#f3f4f6",
              color: sort === val ? "#fff" : "#374151",
              border: "none",
              padding: "5px 12px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}


const MOCK_CENTERS_LIST = [
  { id: "1", bg: "#fff0f0", icon: "🏭", badge: "Top Rated", name: "ProCare Auto Center", loc: "Nasr City, Cairo", city: "Cairo", desc: "Top Rated center — Oil Change, Brakes, AC Service.", tags: ["Oil Change", "Brakes", "AC Service"], stars: 5, rating: 4.9, reviews: 312, price: "From 150 EGP", open: true },
  { id: "2", bg: "#fefce8", icon: "🔩", badge: "Fast Service", name: "SpeedFix Workshop", loc: "Heliopolis, Cairo", city: "Cairo", desc: "Fast Service center — Engine Repair, Diagnostics.", tags: ["Engine Repair", "Diagnostics"], stars: 5, rating: 4.7, reviews: 198, price: "From 200 EGP", open: true },
  { id: "3", bg: "#f0fdf4", icon: "🚗", badge: "New", name: "GreenWheel Service", loc: "6th of October, Giza", city: "Giza", desc: "New center — Tires, Alignment, Wash.", tags: ["Tires", "Alignment", "Wash"], stars: 4, rating: 4.5, reviews: 87, price: "From 80 EGP", open: true },
];

export default function ServiceCentersPage() {
  const [centers, setCenters]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [user, setUser]                 = useState(null);
  const [query, setQuery]               = useState("");
  const [locationQ, setLocationQ]       = useState("");
  const [activeQuery, setActiveQuery]   = useState("");
  const [activeLocation, setActiveLocation] = useState("");
  const [city, setCity]                 = useState("All Cities");
  const [minRating, setMinRating]       = useState(0);
  const [serviceFilter, setServiceFilter] = useState("All Services");
  const [onlyOpen, setOnlyOpen]         = useState(false);
  const [sort, setSort]                 = useState("rating");

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
      .then((res) => {
        if (res?.data?.fullName) setUser({ name: res.data.fullName });
      })
      .catch(() => {});

    serviceCentersService
      .getAll()
      .then((res) => {
        const items = getServiceCenterItems(res);
        setCenters(items || []);
      })
      .catch((err) => {
        console.error("Service centers:", err);
        setCenters([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const ALL_CITIES = useMemo(
    () => ["All Cities", ...Array.from(new Set(centers.map((c) => c.city).filter(Boolean)))],
    [centers]
  );
  const ALL_SERVICES = useMemo(
    () => ["All Services", ...Array.from(new Set(centers.flatMap((c) => c.tags))).sort()],
    [centers]
  );

  const handleSearch = () => {
    setActiveQuery(query.trim().toLowerCase());
    setActiveLocation(locationQ.trim().toLowerCase());
  };

  const resetFilters = () => {
    setQuery(""); setLocationQ("");
    setActiveQuery(""); setActiveLocation("");
    setCity("All Cities"); setMinRating(0);
    setServiceFilter("All Services"); setOnlyOpen(false);
    setSort("rating");
  };

  const filtered = useMemo(() => {
    let list = [...centers];


    if (activeQuery) list = list.filter(c =>
      c.name.toLowerCase().includes(activeQuery) ||
      c.tags.some(t => t.toLowerCase().includes(activeQuery))
    );
    if (activeLocation) list = list.filter(c =>
      c.loc.toLowerCase().includes(activeLocation) ||
      c.city.toLowerCase().includes(activeLocation)
    );


    if (city !== "All Cities")       list = list.filter(c => c.city === city);
    if (minRating > 0)               list = list.filter(c => (c.rating ?? 0) >= minRating);
    if (serviceFilter !== "All Services") list = list.filter(c => c.tags.includes(serviceFilter));
    if (onlyOpen)                    list = list.filter(c => c.open);


    if (sort === "rating")  list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    if (sort === "reviews") list.sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0));

    return list;
  }, [centers, activeQuery, activeLocation, city, minRating, serviceFilter, onlyOpen, sort]);

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", color: "#111", background: "#f7f7f8", lineHeight: 1.6, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .nav-link  { transition: all 0.2s ease; opacity: 0.82; }
        .nav-link:hover { opacity: 1; transform: translateY(-1px); }
        .btn-hover { transition: all 0.2s ease; }
        .btn-hover:hover  { transform: scale(1.04); filter: brightness(1.08); box-shadow: 0 4px 15px rgba(0,0,0,.1); }
        .btn-hover:active { transform: scale(0.97); }
        input::placeholder { color: #9ca3af; }
        @media (max-width: 768px) {
          .page-layout { flex-direction: column !important; }
          .sidebar     { width: 100% !important; display: flex; flex-wrap: wrap; gap: 12px; }
          .cards-grid  { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <Navbar user={user} />
      <SearchBanner
        query={query} setQuery={setQuery}
        location={locationQ} setLocation={setLocationQ}
        onSearch={handleSearch}
        onAiSupportClick={() => setShowAiModal(true)}
      />

      {/* Body */}
      <div className="page-layout" style={{ ...row(0), alignItems: "flex-start", gap: 24, padding: "32px 5% 60px", maxWidth: 1240, margin: "0 auto" }}>
        {/* Sidebar */}
        <div className="sidebar">
          <Sidebar
            city={city} setCity={setCity}
            minRating={minRating} setMinRating={setMinRating}
            serviceFilter={serviceFilter} setServiceFilter={setServiceFilter}
            onlyOpen={onlyOpen} setOnlyOpen={setOnlyOpen}
            total={centers.length}
            showing={filtered.length}
            allCities={ALL_CITIES}
            allServices={ALL_SERVICES}
          />
        </div>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* AI Support Banner */}
          <div style={{
            background: "#111111",
            borderRadius: "16px",
            padding: "20px 24px",
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 4px 20px rgba(232, 39, 42, 0.2)",
            border: "1.5px solid #E8272A",
            flexWrap: "wrap",
            gap: "16px"
          }}>
            <div>
              <h4 style={{ color: "#fff", fontSize: "16px", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="fa-solid fa-wand-magic-sparkles" style={{ color: "#E6C687" }}></i> AI Support
              </h4>
              <p style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "13px", marginTop: "4px", marginBottom: 0 }}>
                Describe your car issues in plain Arabic or English and get ranked certified service center suggestions.
              </p>
            </div>
            <button
              className="btn-hover"
              onClick={() => setShowAiModal(true)}
              style={{
                background: "#ffffff",
                color: "#111111",
                border: "1.5px solid #E6C687",
                padding: "10px 20px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 4px 12px rgba(230, 198, 135, 0.25)"
              }}
            >
              <i className="fa-solid fa-wand-magic-sparkles" style={{ color: "#E6C687" }}></i> Try AI Support
            </button>
          </div>

          <SortBar sort={sort} setSort={setSort} count={filtered.length} />

          {loading ? (
            <p style={{ textAlign: "center", padding: 48, color: "#6b7280" }}>Loading service centers…</p>
          ) : filtered.length === 0 ? (
            <EmptyState onReset={resetFilters} />
          ) : (
            <div
              className="cards-grid"
              style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}
            >
              {filtered.map(c => (
                <a key={c.id} href={`/service-center-profile/${c.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <CenterCard c={c} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Glassmorphism AI Support Diagnosis Modal */}
      {showAiModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.5)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "rgba(255, 255, 255, 0.95)", borderRadius: "20px", width: "100%", maxWidth: "650px", padding: "32px", border: "1px solid rgba(255, 255, 255, 0.3)", boxShadow: "0 20px 50px rgba(0, 0, 0, 0.15)", maxHeight: "90vh", overflowY: "auto" }}>
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
