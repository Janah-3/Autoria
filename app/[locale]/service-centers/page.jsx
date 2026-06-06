"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
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

function SearchBanner({ query, setQuery, location, setLocation, onSearch }) {
  const t = useTranslations("serviceCenters");
  const tHomeServiceCenters = useTranslations("home.serviceCenters");
  return (
    <section style={{ background: `linear-gradient(135deg,#111 0%,#2d1010 52%,${RD} 100%)`, padding: "52px 5% 44px", textAlign: "center" }}>
      <p style={{ color: "rgba(255,255,255,.45)", fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 10 }}>— {tHomeServiceCenters("tag")} —</p>
      <h1 style={{ color: "#fff", fontSize: 38, fontWeight: 900, lineHeight: 1.1, letterSpacing: -1.2, marginBottom: 10 }}>
        {t("bannerTitle")} <em style={{ color: "#ff6b6b", fontStyle: "normal" }}>{t("bannerTitleEm")}</em> {t("bannerTitleRest")}
      </h1>
      <p style={{ color: "rgba(255,255,255,.5)", fontSize: 14, lineHeight: 1.7, maxWidth: 420, margin: "0 auto 28px" }}>
        {t("bannerSubtitle")}
      </p>
      <div style={{ maxWidth: "820px", margin: "0 auto" }}>
        <div style={{ background: "#fff", borderRadius: 12, display: "flex", alignItems: "center", boxShadow: "0 4px 24px rgba(0,0,0,.22)", overflow: "hidden" }}>
          <div style={{ flex: 1, ...row(8), padding: "0 18px", borderRight: "1px solid #e5e7eb", height: 52 }}>
            <i className="fa-solid fa-magnifying-glass" style={{ fontSize: 15, opacity: .35, color: "#374151" }}></i>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && onSearch()}
              placeholder={t("searchPlaceholder")}
              style={{ border: "none", outline: "none", width: "100%", fontSize: 14, color: "#374151", background: "transparent" }}
            />
          </div>
          <div style={{ flex: 1, ...row(8), padding: "0 18px", height: 52 }}>
            <span style={{ fontSize: 15, opacity: .35 }}>📍</span>
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              onKeyDown={e => e.key === "Enter" && onSearch()}
              placeholder={t("locationPlaceholder")}
              style={{ border: "none", outline: "none", width: "100%", fontSize: 14, color: "#374151", background: "transparent" }}
            />
          </div>
          <button
            className="btn-hover"
            onClick={onSearch}
            style={{ background: R, color: "#fff", border: "none", height: 52, padding: "0 26px", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
          >
            {t("searchBtn")}
          </button>
        </div>
      </div>
    </section>
  );
}

function Sidebar({ city, setCity, minRating, setMinRating, serviceFilter, setServiceFilter, onlyOpen, setOnlyOpen, total, showing, allCities, allServices }) {
  const t = useTranslations("serviceCenters");
  const tCommon = useTranslations("common");
  const tTypes = useTranslations("serviceTypes");
  const ratingOptions = [0, 4, 4.5, 4.8];

  return (
    <aside style={{ width: 230, flexShrink: 0 }}>
      <div style={{ background: "#fff0f0", border: `1.5px solid ${R}`, borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
        <span style={{ color: RD, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{tCommon("Results")}</span>
        <p style={{ color: "#111", fontSize: 22, fontWeight: 900, margin: "4px 0 0", letterSpacing: -.5 }}>
          {showing}<span style={{ color: "#9ca3af", fontSize: 13, fontWeight: 400 }}> / {total}</span>
        </p>
      </div>

      <FilterBox title={t("cityFilter")}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {allCities.map(c => (
            <label key={c} style={{ ...row(8), cursor: "pointer", fontSize: 13, color: city === c ? R : "#374151", fontWeight: city === c ? 700 : 400 }}>
              <input type="radio" name="city" checked={city === c} onChange={() => setCity(c)} style={{ accentColor: R }} />
              {c === "All Cities" ? t("allCities") : c}
            </label>
          ))}
        </div>
      </FilterBox>

      <FilterBox title={t("ratingFilter")}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {ratingOptions.map(r => (
            <label key={r} style={{ ...row(8), cursor: "pointer", fontSize: 13, color: minRating === r ? R : "#374151", fontWeight: minRating === r ? 700 : 400 }}>
              <input type="radio" name="rating" checked={minRating === r} onChange={() => setMinRating(r)} style={{ accentColor: R }} />
              {r === 0 ? t("anyRating") : `${r}★ ${t("ratingAbove")}`}
            </label>
          ))}
        </div>
      </FilterBox>

      <FilterBox title={t("serviceFilter")}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {allServices.map(s => (
            <label key={s} style={{ ...row(8), cursor: "pointer", fontSize: 13, color: serviceFilter === s ? R : "#374151", fontWeight: serviceFilter === s ? 700 : 400 }}>
              <input type="radio" name="service" checked={serviceFilter === s} onChange={() => setServiceFilter(s)} style={{ accentColor: R }} />
              {s === "All Services" ? t("allServices") : (tTypes.has(s) ? tTypes(s) : s)}
            </label>
          ))}
        </div>
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
  const t = useTranslations("serviceCenters");
  const tCommon = useTranslations("common");
  const tTypes = useTranslations("serviceTypes");
  const tAdmin = useTranslations("admin");
  const [hovered, setHovered] = useState(false);
  const badge =
    c.badge === 0 || c.badge === "Maintenance"
      ? tAdmin("maintenanceCenter")
      : c.badge === 1 || c.badge === "PartsStore"
        ? tAdmin("partsStore")
        : c.badge === 2 || c.badge === "Both"
          ? tAdmin("hybridCenter")
          : c.badge;

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
      <div style={{ height: 140, background: c.cover ? `url(${c.cover}) center/cover no-repeat` : c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, position: "relative" }}>
        {!c.cover && (c.icon || <i className="fa-solid fa-wrench" style={{ color: "#9ca3af" }}></i>)}
        <span style={{ position: "absolute", top: 9, left: 9, background: R, color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20 }}>{badge}</span>
        <span style={{
          position: "absolute", top: 9, right: 9,
          background: c.open ? "#dcfce7" : "#f3f4f6",
          color: c.open ? "#15803d" : "#9ca3af",
          fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20
        }}>
          {c.open ? t("openBadge") : t("closedBadge")}
        </span>
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 2, color: "#111" }}>{c.name}</div>
        <div style={{ ...row(4), marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: "#9ca3af" }}>📍</span>
          <span style={{ fontSize: 11, color: "#9ca3af" }}>{c.address}</span>
        </div>
        <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6, marginBottom: 10 }}>{c.desc}</p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
          {c.tags.map(tag => (
            <span key={tag} style={{ background: "#f3f4f6", color: "#374151", fontSize: 10, padding: "3px 9px", borderRadius: 6, fontWeight: 600 }}>{tTypes.has(tag) ? tTypes(tag) : tag}</span>
          ))}
        </div>

        <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 11, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <span style={{ color: "#f59e0b", fontSize: 12 }}>{"★".repeat(Math.min(5, Math.max(0, Math.round(c.stars ?? c.rating ?? 5))))}{"☆".repeat(5 - Math.min(5, Math.max(0, Math.round(c.stars ?? c.rating ?? 5))))}</span>
            <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: 4 }}>{c.rating} ({c.reviews})</span>
          </div>
          {c.price && c.price.toLowerCase().includes("contact for price") ? (
            <span style={{ fontSize: 11, fontWeight: 800, color: R, background: "#FFF4F4", padding: "4px 8px", borderRadius: "6px", border: `1px solid ${R}20` }}>{t("contactForPrice")}</span>
          ) : (
            <span style={{ fontSize: 12, fontWeight: 900, color: R }}>{c.price}</span>
          )}
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
          {tCommon("viewAll")}
        </button>
      </div>
    </div>
  );
}

function EmptyState({ onReset }) {
  const t = useTranslations("serviceCenters");
  return (
    <div style={{ textAlign: "center", padding: "64px 24px" }}>
      <i className="fa-solid fa-magnifying-glass" style={{ fontSize: "48px", color: "#9ca3af", display: "block", marginBottom: 16 }}></i>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: "#111", marginBottom: 8 }}>{t("noResults")}</h3>
      <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 20 }}>{t("noResultsDesc")}</p>
      <button className="btn-hover" onClick={onReset} style={{ background: R, color: "#fff", border: "none", padding: "10px 24px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
        {t("resetFilters")}
      </button>
    </div>
  );
}

function SortBar({ count }) {
  const t = useTranslations("serviceCenters");
  return (
    <div style={{ ...row(0), justifyContent: "space-between", marginBottom: 20 }}>
      <span style={{ fontSize: 13, color: "#6b7280" }}>
        {t("showing")} <strong style={{ color: "#111" }}>{count}</strong> {t("serviceCenters")}
      </span>
    </div>
  );
}

const MOCK_CENTERS_LIST = [
  { id: "1", bg: "#fff0f0", icon: "🏭", badge: "Top Rated", name: "ProCare Auto Center", loc: "Nasr City, Cairo", city: "Cairo", desc: "Top Rated center — Oil Change, Brakes, AC Service.", tags: ["Oil Change", "Brakes", "AC Service"], stars: 5, rating: 4.9, reviews: 312, price: "From 150 EGP", open: true },
  { id: "2", bg: "#fefce8", icon: "🔩", badge: "Fast Service", name: "SpeedFix Workshop", loc: "Heliopolis, Cairo", city: "Cairo", desc: "Fast Service center — Engine Repair, Diagnostics.", tags: ["Engine Repair", "Diagnostics"], stars: 5, rating: 4.7, reviews: 198, price: "From 200 EGP", open: true },
  { id: "3", bg: "#f0fdf4", icon: "🚗", badge: "New", name: "GreenWheel Service", loc: "6th of October, Giza", city: "Giza", desc: "New center — Tires, Alignment, Wash.", tags: ["Tires", "Alignment", "Wash"], stars: 4, rating: 4.5, reviews: 87, price: "From 80 EGP", open: true },
];

export default function ServiceCentersPage() {
  const tCommon = useTranslations("common");
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
      (c.loc || "").toLowerCase().includes(activeLocation) ||
      (c.city || "").toLowerCase().includes(activeLocation)
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
      />

      <div className="page-layout" style={{ ...row(0), alignItems: "flex-start", gap: 24, padding: "32px 5% 60px", maxWidth: 1240, margin: "0 auto" }}>
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

        <div style={{ flex: 1, minWidth: 0 }}>
          <SortBar count={filtered.length} />

          {loading ? (
            <p style={{ textAlign: "center", padding: 48, color: "#6b7280" }}>{tCommon("loading")}</p>
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
    </div>
  );
}
