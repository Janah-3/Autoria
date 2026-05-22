"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";


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
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "32px", fontWeight: 800, marginBottom: "6px" }}>
            Find Spare Parts Across Egypt
          </h1>
          <p style={{ color: T.muted2, fontSize: "14px", marginBottom: "28px" }}>
            Search by part name, number, or your vehicle — see live availability from verified centers.
          </p>


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
    </div>
  );
}
