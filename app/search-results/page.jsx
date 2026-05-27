"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  serviceCentersService,
  getServiceCenterItems,
} from "@/lib/api/serviceCentersService";
import Navbar from "@/components/Navbar";





const COLORS = {
  primary: "#E8272A",
  primaryDark: "#B81C1F",
  bg: "#F8F9FA",
  text: "#1A1A1A",
  textLight: "#6C757D",
  border: "#E9ECEF",
  white: "#FFFFFF",
  success: "#28A745",
  warning: "#FFC107",
};

const SHADOWS = {
  sm: "0 2px 4px rgba(0,0,0,0.05)",
  md: "0 4px 12px rgba(0,0,0,0.08)",
  lg: "0 10px 30px rgba(0,0,0,0.12)",
};

const TRANSITION = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";




const FilterSection = ({ title, children }) => (
  <div style={{ marginBottom: "24px" }}>
    <h4 style={{ 
      fontSize: "12px", 
      fontWeight: 700, 
      textTransform: "uppercase", 
      letterSpacing: "1px", 
      color: COLORS.textLight,
      marginBottom: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }}>
      {title}
      <span style={{ fontSize: "16px", opacity: 0.5 }}>▾</span>
    </h4>
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {children}
    </div>
  </div>
);

const Checkbox = ({ label, checked, onChange }) => (
  <label style={{ 
    display: "flex", 
    alignItems: "center", 
    gap: "10px", 
    cursor: "pointer",
    fontSize: "14px",
    color: checked ? COLORS.primary : COLORS.text,
    fontWeight: checked ? 600 : 400,
    transition: TRANSITION
  }}>
    <input 
      type="checkbox" 
      checked={checked} 
      onChange={onChange}
      style={{ 
        width: "18px", 
        height: "18px", 
        accentColor: COLORS.primary,
        cursor: "pointer"
      }}
    />
    {label}
  </label>
);

const CenterCard = ({ center }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: COLORS.white,
        borderRadius: "20px",
        overflow: "hidden",
        border: `1px solid ${hovered ? COLORS.primary : COLORS.border}`,
        boxShadow: hovered ? SHADOWS.lg : SHADOWS.sm,
        transform: hovered ? "translateY(-6px)" : "none",
        transition: TRANSITION,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <div style={{ position: "relative", height: "180px" }}>
        <img 
          src={center.cover || `https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=1000`} 
          alt={center.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{
          position: "absolute",
          top: "12px",
          left: "12px",
          background: COLORS.primary,
          color: COLORS.white,
          padding: "4px 12px",
          borderRadius: "20px",
          fontSize: "11px",
          fontWeight: 700,
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
        }}>
          {center.badge || "Verified"}
        </div>
        {center.open && (
          <div style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "#E6F4EA",
            color: "#1E8E3E",
            padding: "4px 12px",
            borderRadius: "20px",
            fontSize: "11px",
            fontWeight: 700
          }}>
            ● Open Now
          </div>
        )}
      </div>

      <div style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 800, margin: 0 }}>{center.name}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ color: "#FFB800", fontSize: "16px" }}>★</span>
            <span style={{ fontWeight: 700, fontSize: "14px" }}>{center.rating || "4.8"}</span>
          </div>
        </div>
        
        <p style={{ fontSize: "13px", color: COLORS.textLight, margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "16px" }}>📍</span> {center.loc}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "20px" }}>
          {center.tags?.slice(0, 3).map(tag => (
            <span key={tag} style={{ 
              background: COLORS.bg, 
              padding: "4px 10px", 
              borderRadius: "6px", 
              fontSize: "11px", 
              fontWeight: 600,
              color: COLORS.text
            }}>{tag}</span>
          ))}
          {center.tags?.length > 3 && <span style={{ fontSize: "11px", color: COLORS.textLight, alignSelf: "center" }}>+{center.tags.length - 3} more</span>}
        </div>

        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          paddingTop: "16px",
          borderTop: `1px solid ${COLORS.border}`
        }}>
          <div>
            <span style={{ fontSize: "12px", color: COLORS.textLight }}>Starting from</span>
            <div style={{ fontSize: "16px", fontWeight: 900, color: COLORS.primary }}>{center.price || "250 EGP"}</div>
          </div>
          <a href={`/service-center-profile/${center.id}`} style={{ textDecoration: "none" }}>
            <button style={{
              background: hovered ? COLORS.primary : "transparent",
              color: hovered ? COLORS.white : COLORS.primary,
              border: `2px solid ${COLORS.primary}`,
              padding: "8px 24px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 800,
              cursor: "pointer",
              transition: TRANSITION
            }}>
              View Profile
            </button>
          </a>
        </div>

      </div>
    </div>
  );
};

function SearchResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialLoc = searchParams.get("loc") || "";

  const [query, setQuery] = useState(initialQuery);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "map"
  const [filters, setFilters] = useState({
    city: initialLoc || "All",
    rating: 0,
    services: [],
    openOnly: false
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (filters.city !== "All") params.set("loc", filters.city);
    router.push(`/search-results?${params.toString()}`);
  };


  useEffect(() => {
    setLoading(true);
    serviceCentersService
      .getAll()
      .then((res) => {
        const items = getServiceCenterItems(res);
        setCenters(
          items.map((c) => ({
            id: c.id,
            name: c.name,
            loc: c.loc,
            tags: c.tags,
            rating: c.rating ?? 0,
            reviews: c.reviews ?? 0,
            open: c.open,
            price: c.price,
            badge: c.badge,
            cover: c.cover,
          }))
        );
      })
      .catch((err) => {
        console.error("Search results:", err);
        setCenters([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredCenters = useMemo(() => {
    return centers.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(query.toLowerCase()) || 
                            c.tags.some(t => t.toLowerCase().includes(query.toLowerCase()));
      const matchesCity = filters.city === "All" || c.loc.includes(filters.city);
      const matchesRating = c.rating >= filters.rating;
      const matchesOpen = !filters.openOnly || c.open;
      return matchesSearch && matchesCity && matchesRating && matchesOpen;
    });
  }, [centers, query, filters]);

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .loading-shimmer {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      
      <Navbar />

      {/* Sub-header with Search */}
      <div style={{ 
        background: COLORS.white, 
        padding: "30px 6%", 
        borderBottom: `1px solid ${COLORS.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "40px"
      }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "28px", fontWeight: 900, margin: "0 0 8px 0" }}>
            Search Results
          </h1>
          <p style={{ color: COLORS.textLight, fontSize: "14px", margin: 0 }}>
            Found {filteredCenters.length} centers for <strong style={{ color: COLORS.text }}>"{query || "All Services"}"</strong> in <strong style={{ color: COLORS.text }}>{initialLoc || "Egypt"}</strong>
          </p>
        </div>

        <div style={{ 
          flex: 1, 
          maxWidth: "600px", 
          display: "flex", 
          background: COLORS.bg, 
          borderRadius: "12px", 
          padding: "6px",
          border: `1px solid ${COLORS.border}`
        }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 12px", gap: "10px" }}>
            <span style={{ opacity: 0.5 }}>🔍</span>
            <input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="What service are you looking for?" 
              style={{ background: "transparent", border: "none", outline: "none", width: "100%", fontSize: "14px" }}
            />
          </div>
          <button 
            onClick={handleSearch}
            style={{ 
              background: COLORS.primary, 
              color: COLORS.white, 
              border: "none", 
              padding: "10px 24px", 
              borderRadius: "8px", 
              fontWeight: 700, 
              fontSize: "14px",
              cursor: "pointer"
            }}
          >
            Search
          </button>
        </div>

      </div>

      <div style={{ display: "flex", padding: "40px 6%", gap: "40px", maxWidth: "1440px", margin: "0 auto" }}>
        
        {/* Sidebar Filters */}
        <aside style={{ width: "280px", flexShrink: 0 }}>
          <div style={{ 
            background: COLORS.white, 
            borderRadius: "20px", 
            padding: "24px", 
            border: `1px solid ${COLORS.border}`,
            position: "sticky",
            top: "100px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800 }}>Filters</h3>
              <button 
                onClick={() => setFilters({ city: "All", rating: 0, services: [], openOnly: false })}
                style={{ background: "none", border: "none", color: COLORS.primary, fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
              >Reset</button>
            </div>

            <FilterSection title="Location">
              {["All", "Cairo", "Giza", "Alexandria"].map(city => (
                <Checkbox 
                  key={city} 
                  label={city} 
                  checked={filters.city === city} 
                  onChange={() => setFilters({...filters, city})} 
                />
              ))}
            </FilterSection>

            <FilterSection title="Minimum Rating">
              {[4.5, 4.0, 3.5, 0].map(r => (
                <Checkbox 
                  key={r} 
                  label={r === 0 ? "Any Rating" : `${r}★ & Above`} 
                  checked={filters.rating === r} 
                  onChange={() => setFilters({...filters, rating: r})} 
                />
              ))}
            </FilterSection>

            <FilterSection title="Availability">
              <Checkbox 
                label="Open Now Only" 
                checked={filters.openOnly} 
                onChange={(e) => setFilters({...filters, openOnly: e.target.checked})} 
              />
            </FilterSection>

            <div style={{ 
              marginTop: "30px", 
              padding: "20px", 
              background: "#FFF4F4", 
              borderRadius: "12px",
              textAlign: "center"
            }}>
              <p style={{ fontSize: "12px", color: COLORS.primaryDark, fontWeight: 600, margin: "0 0 10px 0" }}>Need Help Choosing?</p>
              <button style={{ 
                background: COLORS.primary, 
                color: COLORS.white, 
                border: "none", 
                padding: "8px 16px", 
                borderRadius: "8px", 
                fontSize: "12px", 
                fontWeight: 700,
                cursor: "pointer",
                width: "100%"
              }}>Chat with Expert</button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1 }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginBottom: "24px" 
          }}>
            <div style={{ fontSize: "15px", color: COLORS.textLight }}>
              Showing <strong style={{ color: COLORS.text }}>{filteredCenters.length}</strong> service centers
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ 
                display: "flex", 
                background: COLORS.white, 
                border: `1px solid ${COLORS.border}`,
                borderRadius: "8px",
                padding: "2px"
              }}>
                <button 
                  onClick={() => setViewMode("grid")}
                  style={{ 
                    padding: "6px 12px", 
                    borderRadius: "6px", 
                    background: viewMode === "grid" ? COLORS.primary : "transparent",
                    color: viewMode === "grid" ? COLORS.white : COLORS.text,
                    border: "none",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: 700
                  }}>List</button>
                <button 
                  onClick={() => setViewMode("map")}
                  style={{ 
                    padding: "6px 12px", 
                    borderRadius: "6px", 
                    background: viewMode === "map" ? COLORS.primary : "transparent",
                    color: viewMode === "map" ? COLORS.white : COLORS.text,
                    border: "none",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: 700
                  }}>Map</button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "14px", color: COLORS.textLight }}>Sort by:</span>
                <select style={{ 
                  background: COLORS.white, 
                  border: `1px solid ${COLORS.border}`, 
                  padding: "8px 16px", 
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  outline: "none"
                }}>
                  <option>Most Recommended</option>
                  <option>Highest Rated</option>
                  <option>Lowest Price</option>
                  <option>Nearest to Me</option>
                </select>
              </div>
            </div>
          </div>

          {viewMode === "map" ? (
            <div style={{ 
              height: "600px", 
              background: "#E5E3DF", 
              borderRadius: "20px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              position: "relative",
              overflow: "hidden"
            }}>
              <img 
                src="https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/31.2357,30.0444,11,0/1000x600?access_token=DUMMY_TOKEN" 
                alt="Map View"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div style={{ position: "absolute", top: "20px", left: "20px", background: COLORS.white, padding: "10px 20px", borderRadius: "10px", boxShadow: SHADOWS.md }}>
                <span style={{ fontWeight: 700 }}>{filteredCenters.length}</span> centers in this area
              </div>
            </div>
          ) : loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} style={{ height: "400px", borderRadius: "20px" }} className="loading-shimmer" />
              ))}
            </div>
          ) : filteredCenters.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
              {filteredCenters.map(center => (
                <CenterCard key={center.id} center={center} />
              ))}
            </div>
          ) : (
            <div style={{ 
              background: COLORS.white, 
              borderRadius: "20px", 
              padding: "80px 40px", 
              textAlign: "center",
              border: `1px solid ${COLORS.border}`
            }}>
              <div style={{ fontSize: "60px", marginBottom: "20px" }}>🔍</div>
              <h2 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "12px" }}>No Results Found</h2>
              <p style={{ color: COLORS.textLight, fontSize: "16px", maxWidth: "400px", margin: "0 auto 30px" }}>
                We couldn't find any service centers matching your search. Try adjusting your filters or search for something else.
              </p>
              <button 
                onClick={() => { setQuery(""); setFilters({ city: "All", rating: 0, services: [], openOnly: false }); }}
                style={{ 
                  background: COLORS.primary, 
                  color: COLORS.white, 
                  border: "none", 
                  padding: "12px 30px", 
                  borderRadius: "10px", 
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >Clear All Filters</button>
            </div>
          )}

        </main>

      </div>

      {/* Footer */}
      <footer style={{ background: "#111", padding: "60px 6% 30px", marginTop: "60px", color: "#888" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "40px", marginBottom: "40px" }}>
          <div>
            <h3 style={{ color: COLORS.white, fontSize: "20px", fontWeight: 900, marginBottom: "20px" }}>AUTORIA</h3>
            <p style={{ fontSize: "13px", lineHeight: 1.6 }}>Egypt's leading platform for car services and spare parts. Trusted by thousands of car owners.</p>
          </div>
          {["Services", "Company", "Legal", "Connect"].map(title => (
            <div key={title}>
              <h4 style={{ color: COLORS.white, fontSize: "14px", fontWeight: 700, marginBottom: "20px" }}>{title}</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                <span>Link 1</span>
                <span>Link 2</span>
                <span>Link 3</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid #222", paddingTop: "30px", textAlign: "center", fontSize: "12px" }}>
          © 2026 AUTORIA. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
