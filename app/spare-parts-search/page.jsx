"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { serviceCentersService } from "@/lib/api/serviceCentersService";


const T = {
  bg:       "#F8F9FA",
  surface:  "#FFFFFF",
  surface2: "#F1F3F5",
  border:   "#E9ECEF",
  text:     "#111111",
  muted:    "#ADB5BD",
  muted2:   "#6C757D",
  accent:   "#E8272A",
  success:  "#28A745",
  radius:   "10px",
  radiusLg: "16px",
};


function CategoryCard({ icon, title, count, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: T.surface,
        border: `1px solid ${hovered ? T.accent : T.border}`,
        borderRadius: T.radiusLg,
        padding: "28px 20px",
        textAlign: "center",
        cursor: "pointer",
        transition: "all .2s",
        transform: hovered ? "translateY(-3px)" : "none",
        boxShadow: hovered ? "0 8px 24px rgba(232,39,42,.08)" : "0 2px 8px rgba(0,0,0,.03)",
      }}
    >
      <div style={{ fontSize: "36px", marginBottom: "12px" }}>{icon}</div>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "14px", fontWeight: 700, marginBottom: "4px", color: T.text }}>{title}</div>
      <div style={{ fontSize: "11px", color: T.muted2 }}>{count} parts</div>
    </div>
  );
}


export default function SparePartsSearchPage() {
  const router = useRouter();
  const [form, setForm] = useState({ query: "", brand: "", model: "", year: "" });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (form.query) params.set("q", form.query);
    if (form.brand) params.set("brand", form.brand);
    if (form.model) params.set("model", form.model);
    if (form.year)  params.set("year", form.year);
    router.push(`/spare-parts-results?${params.toString()}`);
  };

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

  const categories = [
    { icon: "⭕", title: "Brakes & Pads",  count: "1,280" },
    { icon: "⚙️", title: "Engine Parts",   count: "3,420" },
    { icon: "🧼", title: "Filters",         count: "890"   },
    { icon: "⚡", title: "Electrical",      count: "2,150" },
    { icon: "🚗", title: "Suspension",      count: "1,670" },
    { icon: "💨", title: "Exhaust",         count: "540"   },
  ];

  const brands = ["TOYOTA", "BMW", "MERCEDES", "HYUNDAI", "NISSAN", "KIA", "MITSUBISHI", "HONDA"];

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.text }}>

      <Navbar />


      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "40px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "32px", fontWeight: 800, marginBottom: "6px" }}>
                Find Spare Parts Across Egypt
              </h1>
              <p style={{ color: T.muted2, fontSize: "14px", margin: 0 }}>
                Search by part name, number, or your vehicle — see live availability from verified centers.
              </p>
            </div>
            
            {/* AI Support trigger button */}
            <button
              className="btn-hover"
              onClick={() => setShowAiModal(true)}
              style={{
                background: "#ffffff",
                color: "#111111",
                border: "1.5px solid #E6C687",
                height: "46px",
                padding: "0 20px",
                borderRadius: "10px",
                fontSize: "13.5px",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 20px rgba(230, 198, 135, 0.25)",
                whiteSpace: "nowrap"
              }}
            >
              <i className="fa-solid fa-wand-magic-sparkles" style={{ color: "#E6C687", fontSize: "14px" }}></i> AI Support
            </button>
          </div>


          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 180px 180px 180px auto",
            gap: "12px",
            alignItems: "end",
          }}>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "10px", fontWeight: 700, color: T.muted2, textTransform: "uppercase", letterSpacing: "0.8px" }}>Part Name or Number</label>
              <input
                value={form.query}
                onChange={e => setForm({ ...form, query: e.target.value })}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="e.g. Brake Pads, 04466-02040"
                style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: "12px 14px", fontSize: "14px", color: T.text, transition: "border-color .2s" }}
              />
            </div>


            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "10px", fontWeight: 700, color: T.muted2, textTransform: "uppercase", letterSpacing: "0.8px" }}>Brand</label>
              <input
                value={form.brand}
                onChange={e => setForm({ ...form, brand: e.target.value })}
                placeholder="Toyota"
                style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: "12px 14px", fontSize: "14px", color: T.text }}
              />
            </div>


            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "10px", fontWeight: 700, color: T.muted2, textTransform: "uppercase", letterSpacing: "0.8px" }}>Model</label>
              <input
                value={form.model}
                onChange={e => setForm({ ...form, model: e.target.value })}
                placeholder="Corolla"
                style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: "12px 14px", fontSize: "14px", color: T.text }}
              />
            </div>


            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "10px", fontWeight: 700, color: T.muted2, textTransform: "uppercase", letterSpacing: "0.8px" }}>Year</label>
              <input
                value={form.year}
                onChange={e => setForm({ ...form, year: e.target.value })}
                placeholder="2015"
                style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: "12px 14px", fontSize: "14px", color: T.text }}
              />
            </div>


            <button
              onClick={handleSearch}
              style={{
                background: T.accent, color: "#fff", border: "none",
                padding: "13px 28px", borderRadius: T.radius,
                fontFamily: "'Syne', sans-serif", fontSize: "14px", fontWeight: 800,
                cursor: "pointer", whiteSpace: "nowrap",
                boxShadow: "0 6px 16px rgba(232,39,42,.25)",
                transition: "all .2s",
              }}
            >
              Find Parts
            </button>
          </div>
        </div>
      </div>


      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "50px 40px" }}>


        {/* AI Support Banner */}
        <div style={{
          background: "#111111",
          borderRadius: T.radiusLg,
          padding: "24px 32px",
          marginBottom: "40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 10px 30px rgba(232, 39, 42, 0.15)",
          border: "1.5px solid #E8272A",
          flexWrap: "wrap",
          gap: "16px"
        }}>
          <div>
            <h4 style={{ color: "#fff", fontFamily: "'Syne', sans-serif", fontSize: "18px", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <i className="fa-solid fa-wand-magic-sparkles" style={{ color: "#E6C687" }}></i> Need Help Diagnosing? Try AI Support
            </h4>
            <p style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "13px", marginTop: "6px", marginBottom: 0 }}>
              Explain your vehicle's issue (e.g., ticking noises, overheating, fluid leaks) and let Gemini AI match you with the perfect specialized repair shops and parts.
            </p>
          </div>
          <button
            className="btn-hover"
            onClick={() => setShowAiModal(true)}
            style={{
              background: "#ffffff",
              color: "#111111",
              border: "1.5px solid #E6C687",
              padding: "10px 24px",
              borderRadius: T.radius,
              fontSize: "13px",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 4px 12px rgba(230, 198, 135, 0.25)"
            }}
          >
            <i className="fa-solid fa-wand-magic-sparkles" style={{ color: "#E6C687" }}></i> Launch AI Support
          </button>
        </div>

        <div style={{ marginBottom: "60px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
            <div>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "22px", fontWeight: 800 }}>Browse by Category</h2>
              <p style={{ fontSize: "13px", color: T.muted2, marginTop: "4px" }}>Explore thousands of parts organized by type</p>
            </div>
            <button
              onClick={() => router.push("/spare-parts-results")}
              style={{ background: "none", border: "none", color: T.accent, fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
            >
              View All →
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "16px" }}>
            {categories.map(cat => (
              <CategoryCard
                key={cat.title}
                {...cat}
                onClick={() => router.push(`/spare-parts-results?q=${cat.title}`)}
              />
            ))}
          </div>
        </div>


        <div style={{ marginBottom: "60px" }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "22px", fontWeight: 800, marginBottom: "24px" }}>Popular Brands</h2>
          <div style={{
            background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radiusLg,
            display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-around",
            padding: "30px 40px", gap: "20px"
          }}>
            {brands.map(brand => (
              <button
                key={brand}
                onClick={() => router.push(`/spare-parts-results?brand=${brand}`)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: "'Syne', sans-serif", fontSize: "18px", fontWeight: 900,
                  color: T.muted, letterSpacing: "2px", transition: "color .2s",
                }}
                onMouseEnter={e => e.target.style.color = T.accent}
                onMouseLeave={e => e.target.style.color = T.muted}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>


        <div style={{
          background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radiusLg,
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0",
          overflow: "hidden"
        }}>
          {[
            { title: "Verified Sellers",      desc: "We only partner with trusted service centers and verified parts sellers across Egypt." },
            { title: "Genuine & Compatible",  desc: "From original OEM parts to high-quality compatible alternatives — find what fits your budget." },
            { title: "Best Prices",           desc: "Compare prices from multiple sellers in one place and get the best deal for your car." },
          ].map((item, i) => (
            <div key={item.title} style={{
              padding: "32px",
              borderRight: i < 2 ? `1px solid ${T.border}` : "none",
            }}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "16px", fontWeight: 800, color: T.accent, marginBottom: "10px" }}>{item.title}</h3>
              <p style={{ fontSize: "13px", color: T.muted2, lineHeight: 1.7 }}>{item.desc}</p>
            </div>
          ))}
        </div>

      </div>

      <Footer />

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
