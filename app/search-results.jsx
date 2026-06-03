"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { serviceCentersService, getServiceCenterItems } from "@/lib/api/serviceCentersService";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";

const COLORS = {
  primary: "#E8272A", primaryDark: "#B81C1F", bg: "#F8F9FA", text: "#1A1A1A",
  textLight: "#6C757D", border: "#E9ECEF", white: "#FFFFFF", success: "#28A745",
};
const SHADOWS = { sm: "0 2px 4px rgba(0,0,0,0.05)", md: "0 4px 12px rgba(0,0,0,0.08)", lg: "0 10px 30px rgba(0,0,0,0.12)" };
const TRANSITION = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";

const FilterSection = ({ title, children }) => (
  <div style={{ marginBottom: "24px" }}>
    <h4 style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: COLORS.textLight, marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      {title}<span style={{ fontSize: "16px", opacity: 0.5 }}>▾</span>
    </h4>
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>{children}</div>
  </div>
);

const Checkbox = ({ label, checked, onChange }) => (
  <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "14px", color: checked ? COLORS.primary : COLORS.text, fontWeight: checked ? 600 : 400, transition: TRANSITION }}>
    <input type="checkbox" checked={checked} onChange={onChange} style={{ width: "18px", height: "18px", accentColor: COLORS.primary, cursor: "pointer" }} />
    {label}
  </label>
);

const CenterCard = ({ center, t }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: COLORS.white, borderRadius: "20px", overflow: "hidden", border: `1px solid ${hovered ? COLORS.primary : COLORS.border}`, boxShadow: hovered ? SHADOWS.lg : SHADOWS.sm, transform: hovered ? "translateY(-6px)" : "none", transition: TRANSITION, cursor: "pointer", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "relative", height: "180px" }}>
        <img src={center.cover || `https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=1000`} alt={center.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", top: "12px", left: "12px", background: COLORS.primary, color: COLORS.white, padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700 }}>{center.badge || t("common.verified")}</div>
        {center.open && <div style={{ position: "absolute", top: "12px", right: "12px", background: "#E6F4EA", color: "#1E8E3E", padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700 }}>{t("searchResults.openNowBadge")}</div>}
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
          <span>📍</span> {center.loc}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "20px" }}>
          {center.tags?.slice(0, 3).map(tag => (<span key={tag} style={{ background: COLORS.bg, padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, color: COLORS.text }}>{tag}</span>))}
          {center.tags?.length > 3 && <span style={{ fontSize: "11px", color: COLORS.textLight, alignSelf: "center" }}>+{center.tags.length - 3} more</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "16px", borderTop: `1px solid ${COLORS.border}` }}>
          <div>
            <span style={{ fontSize: "12px", color: COLORS.textLight }}>{t("searchResults.startingFrom")}</span>
            <div style={{ fontSize: "16px", fontWeight: 900, color: COLORS.primary }}>{center.price || "250 EGP"}</div>
          </div>
          <a href={`/service-center-profile/${center.id}`} style={{ textDecoration: "none" }}>
            <button style={{ background: hovered ? COLORS.primary : "transparent", color: hovered ? COLORS.white : COLORS.primary, border: `2px solid ${COLORS.primary}`, padding: "8px 24px", borderRadius: "10px", fontSize: "13px", fontWeight: 800, cursor: "pointer", transition: TRANSITION }}>
              {t("searchResults.viewProfile")}
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
  const { t } = useLanguage();
  const initialQuery = searchParams.get("q") || "";
  const initialLoc = searchParams.get("loc") || "";
  const [query, setQuery] = useState(initialQuery);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [filters, setFilters] = useState({ city: initialLoc || "All", rating: 0, services: [], openOnly: false });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (filters.city !== "All") params.set("loc", filters.city);
    router.push(`/search-results?${params.toString()}`);
  };

  useEffect(() => {
    setLoading(true);
    serviceCentersService.getAll()
      .then((res) => { setCenters((getServiceCenterItems(res) || []).map(c => ({ id: c.id, name: c.name, loc: c.loc, tags: c.tags, rating: c.rating ?? 0, reviews: c.reviews ?? 0, open: c.open, price: c.price, badge: c.badge, cover: c.cover }))); })
      .catch(() => setCenters([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredCenters = useMemo(() => centers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(query.toLowerCase()) || c.tags.some(t => t.toLowerCase().includes(query.toLowerCase()));
    const matchesCity = filters.city === "All" || c.loc.includes(filters.city);
    const matchesRating = c.rating >= filters.rating;
    const matchesOpen = !filters.openOnly || c.open;
    return matchesSearch && matchesCity && matchesRating && matchesOpen;
  }), [centers, query, filters]);

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        .loading-shimmer { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>
      <Navbar />

      <div style={{ background: COLORS.white, padding: "30px 6%", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "40px" }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "28px", fontWeight: 900, margin: "0 0 8px 0" }}>{t("searchResults.title")}</h1>
          <p style={{ color: COLORS.textLight, fontSize: "14px", margin: 0 }}>
            {t("searchResults.found")} {filteredCenters.length} {t("searchResults.centersFor")} <strong style={{ color: COLORS.text }}>"{query || t("searchResults.allServices")}"</strong> {t("searchResults.in")} <strong style={{ color: COLORS.text }}>{initialLoc || t("searchResults.egypt")}</strong>
          </p>
        </div>
        <div style={{ flex: 1, maxWidth: "600px", display: "flex", background: COLORS.bg, borderRadius: "12px", padding: "6px", border: `1px solid ${COLORS.border}` }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 12px", gap: "10px" }}>
            <span style={{ opacity: 0.5 }}>🔍</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} placeholder={t("searchResults.searchPlaceholder")} style={{ background: "transparent", border: "none", outline: "none", width: "100%", fontSize: "14px" }} />
          </div>
          <button onClick={handleSearch} style={{ background: COLORS.primary, color: COLORS.white, border: "none", padding: "10px 24px", borderRadius: "8px", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>
            {t("common.search")}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", padding: "40px 6%", gap: "40px", maxWidth: "1440px", margin: "0 auto" }}>
        <aside style={{ width: "280px", flexShrink: 0 }}>
          <div style={{ background: COLORS.white, borderRadius: "20px", padding: "24px", border: `1px solid ${COLORS.border}`, position: "sticky", top: "100px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800 }}>{t("searchResults.filters")}</h3>
              <button onClick={() => setFilters({ city: "All", rating: 0, services: [], openOnly: false })} style={{ background: "none", border: "none", color: COLORS.primary, fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>{t("searchResults.reset")}</button>
            </div>

            <FilterSection title={t("searchResults.location")}>
              {["All", "Cairo", "Giza", "Alexandria"].map(city => (
                <Checkbox key={city} label={city === "All" ? t("serviceCenters.allCities") : city} checked={filters.city === city} onChange={() => setFilters({ ...filters, city })} />
              ))}
            </FilterSection>

            <FilterSection title={t("searchResults.minRating")}>
              {[4.5, 4.0, 3.5, 0].map(r => (
                <Checkbox key={r} label={r === 0 ? t("searchResults.anyRating") : `${r}${t("searchResults.andAbove")}`} checked={filters.rating === r} onChange={() => setFilters({ ...filters, rating: r })} />
              ))}
            </FilterSection>

            <FilterSection title={t("searchResults.availability")}>
              <Checkbox label={t("searchResults.openNow")} checked={filters.openOnly} onChange={(e) => setFilters({ ...filters, openOnly: e.target.checked })} />
            </FilterSection>

            <div style={{ marginTop: "30px", padding: "20px", background: "#FFF4F4", borderRadius: "12px", textAlign: "center" }}>
              <p style={{ fontSize: "12px", color: COLORS.primaryDark, fontWeight: 600, margin: "0 0 10px 0" }}>{t("searchResults.needHelp")}</p>
              <button style={{ background: COLORS.primary, color: COLORS.white, border: "none", padding: "8px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer", width: "100%" }}>{t("searchResults.chatExpert")}</button>
            </div>
          </div>
        </aside>

        <main style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <div style={{ fontSize: "15px", color: COLORS.textLight }}>
              {t("searchResults.showing")} <strong style={{ color: COLORS.text }}>{filteredCenters.length}</strong> {t("searchResults.serviceCenters")}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ display: "flex", background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: "8px", padding: "2px" }}>
                {[{ val: "grid", label: t("searchResults.viewList") }, { val: "map", label: t("searchResults.viewMap") }].map(({ val, label }) => (
                  <button key={val} onClick={() => setViewMode(val)} style={{ padding: "6px 12px", borderRadius: "6px", background: viewMode === val ? COLORS.primary : "transparent", color: viewMode === val ? COLORS.white : COLORS.text, border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 700 }}>{label}</button>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "14px", color: COLORS.textLight }}>{t("searchResults.sortBy")}</span>
                <select style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, padding: "8px 16px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, outline: "none" }}>
                  <option>{t("searchResults.sortOptions.recommended")}</option>
                  <option>{t("searchResults.sortOptions.highestRated")}</option>
                  <option>{t("searchResults.sortOptions.lowestPrice")}</option>
                  <option>{t("searchResults.sortOptions.nearest")}</option>
                </select>
              </div>
            </div>
          </div>

          {viewMode === "map" ? (
            <div style={{ height: "600px", background: "#E5E3DF", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "20px", left: "20px", background: COLORS.white, padding: "10px 20px", borderRadius: "10px", boxShadow: SHADOWS.md }}>
                <span style={{ fontWeight: 700 }}>{filteredCenters.length}</span> {t("searchResults.centersInArea")}
              </div>
            </div>
          ) : loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} style={{ height: "400px", borderRadius: "20px" }} className="loading-shimmer" />)}
            </div>
          ) : filteredCenters.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
              {filteredCenters.map(center => <CenterCard key={center.id} center={center} t={t} />)}
            </div>
          ) : (
            <div style={{ background: COLORS.white, borderRadius: "20px", padding: "80px 40px", textAlign: "center", border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: "60px", marginBottom: "20px" }}>🔍</div>
              <h2 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "12px" }}>{t("searchResults.noResults")}</h2>
              <p style={{ color: COLORS.textLight, fontSize: "16px", maxWidth: "400px", margin: "0 auto 30px" }}>{t("searchResults.noResultsDesc")}</p>
              <button onClick={() => { setQuery(""); setFilters({ city: "All", rating: 0, services: [], openOnly: false }); }} style={{ background: COLORS.primary, color: COLORS.white, border: "none", padding: "12px 30px", borderRadius: "10px", fontWeight: 700, cursor: "pointer" }}>
                {t("searchResults.clearFilters")}
              </button>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default function SearchResultsPage() {
  const { t } = useLanguage();
  return (
    <Suspense fallback={<div>{t("searchResults.loadingSearch")}</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
