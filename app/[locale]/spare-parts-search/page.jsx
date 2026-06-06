"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTranslations } from "next-intl";

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

function CategoryCard({ iconClass, title, onClick }) {
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
      <div style={{ fontSize: "36px", marginBottom: "12px", color: hovered ? T.accent : "#4b5563", transition: "color 0.2s" }}>
        <i className={iconClass}></i>
      </div>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "14px", fontWeight: 700, color: T.text }}>{title}</div>
    </div>
  );
}

export default function SparePartsSearchPage() {
  const router = useRouter();
  const [form, setForm] = useState({ query: "", brand: "", model: "", year: "" });

  const tNav    = useTranslations("nav");
  const tCommon = useTranslations("common");
  const tCars   = useTranslations("cars");
  const tHome   = useTranslations("home");
  const tTypes  = useTranslations("serviceTypes");
  const tParts  = useTranslations("spareParts");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (form.query) params.set("q", form.query);
    if (form.brand) params.set("brand", form.brand);
    if (form.model) params.set("model", form.model);
    if (form.year)  params.set("year", form.year);
    router.push(`/spare-parts-results?${params.toString()}`);
  };

  const categories = [
    { iconClass: "fa-solid fa-circle-notch", title: tTypes("Brakes"),          value: "Brakes & Pads" },
    { iconClass: "fa-solid fa-gears",         title: tTypes("Engine"),          value: "Engine Parts" },
    { iconClass: "fa-solid fa-filter",        title: tTypes("Filters"),         value: "Filters" },
    { iconClass: "fa-solid fa-bolt",          title: tTypes("Electrical"),      value: "Electrical" },
    { iconClass: "fa-solid fa-compress",      title: tTypes("Suspension"),      value: "Suspension" },
    { iconClass: "fa-solid fa-snowflake",     title: tTypes("Air Conditioning"), value: "Air Conditioning" },
  ];

  const brands = ["TOYOTA", "BMW", "MERCEDES", "HYUNDAI", "NISSAN", "KIA", "MITSUBISHI", "HONDA"];

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.text }}>
      <Navbar />

      {/* SEARCH HEADER */}
      <div style={{ background: T.surface, borderBottom: `1px solid T.border}`, padding: "40px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "32px", fontWeight: 800, marginBottom: "6px" }}>
                {tParts("heroTitle")}
              </h1>
              <p style={{ color: T.muted2, fontSize: "14px", margin: 0 }}>
                {tParts("heroSubtitle")}
              </p>
            </div>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 180px 180px 180px auto",
            gap: "12px",
            alignItems: "end",
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "10px", fontWeight: 700, color: T.muted2, textTransform: "uppercase", letterSpacing: "0.8px" }}>
                {tParts("partNameLabel")}
              </label>
              <input
                value={form.query}
                onChange={e => setForm({ ...form, query: e.target.value })}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder={tParts("partNamePlaceholder")}
                style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: "12px 14px", fontSize: "14px", color: T.text, transition: "border-color .2s" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "10px", fontWeight: 700, color: T.muted2, textTransform: "uppercase", letterSpacing: "0.8px" }}>
                {tCars("brand")}
              </label>
              <input
                value={form.brand}
                onChange={e => setForm({ ...form, brand: e.target.value })}
                placeholder="Toyota"
                style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: "12px 14px", fontSize: "14px", color: T.text }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "10px", fontWeight: 700, color: T.muted2, textTransform: "uppercase", letterSpacing: "0.8px" }}>
                {tCars("model")}
              </label>
              <input
                value={form.model}
                onChange={e => setForm({ ...form, model: e.target.value })}
                placeholder="Corolla"
                style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: "12px 14px", fontSize: "14px", color: T.text }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "10px", fontWeight: 700, color: T.muted2, textTransform: "uppercase", letterSpacing: "0.8px" }}>
                {tCars("year")}
              </label>
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
                transition: "all .2s",
              }}
            >
              {tParts("findPartsBtn")}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "50px 40px" }}>

        {/* BROWSE BY CATEGORY */}
        <div style={{ marginBottom: "60px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
            <div>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "22px", fontWeight: 800 }}>
                {tParts("browseByCategoryTitle")}
              </h2>
              <p style={{ fontSize: "13px", color: T.muted2, marginTop: "4px" }}>
                {tParts("browseByCategorySubtitle")}
              </p>
            </div>
            <button
              onClick={() => router.push("/spare-parts-results")}
              style={{ background: "none", border: "none", color: T.accent, fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
            >
              {tHome("spareParts.shopAllBtn")}
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "16px" }}>
            {categories.map(cat => (
              <CategoryCard
                key={cat.value}
                iconClass={cat.iconClass}
                title={cat.title}
                onClick={() => router.push(`/spare-parts-results?q=${encodeURIComponent(cat.value)}`)}
              />
            ))}
          </div>
        </div>

        {/* POPULAR BRANDS */}
        <div style={{ marginBottom: "60px" }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "22px", fontWeight: 800, marginBottom: "24px" }}>
            {tParts("popularBrandsTitle")}
          </h2>
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

        {/* WHY BUY FROM US */}
        <div style={{
          background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radiusLg,
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0",
          overflow: "hidden"
        }}>
          {[
            { titleKey: "whyVerifiedTitle", descKey: "whyVerifiedDesc" },
            { titleKey: "whyGenuineTitle",  descKey: "whyGenuineDesc"  },
            { titleKey: "whyPriceTitle",    descKey: "whyPriceDesc"    },
          ].map((item, i) => (
            <div key={item.titleKey} style={{
              padding: "32px",
              borderRight: i < 2 ? `1px solid ${T.border}` : "none",
            }}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "16px", fontWeight: 800, color: T.accent, marginBottom: "10px" }}>
                {tParts(item.titleKey)}
              </h3>
              <p style={{ fontSize: "13px", color: T.muted2, lineHeight: 1.7 }}>
                {tParts(item.descKey)}
              </p>
            </div>
          ))}
        </div>

      </div>

      <Footer />
    </div>
  );
}