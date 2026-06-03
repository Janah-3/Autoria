"use client";

import { useState } from "react";

const COLORS = {
  primary: "#E8272A",
  white: "#FFFFFF",
  text: "#1A1A1A",
  textLight: "#6C757D",
  border: "#E9ECEF",
  bg: "#F8F9FA",
};

export default function CenterCard({ center }) {
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
        boxShadow: hovered ? "0 10px 30px rgba(0,0,0,0.12)" : "0 2px 4px rgba(0,0,0,0.05)",
        transform: hovered ? "translateY(-6px)" : "none",
        transition: "all 0.3s ease",
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
          fontWeight: 700
        }}>
          {center.badge || "Verified"}
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 800, margin: 0 }}>{center.name}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ color: "#FFB800", fontSize: "16px" }}>★</span>
            <span style={{ fontWeight: 700, fontSize: "14px" }}>{center.rating || "4.8"}</span>
          </div>
        </div>
        
        <p style={{ fontSize: "13px", color: COLORS.textLight, margin: "0 0 16px 0" }}>
          📍 {center.loc}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "20px" }}>
          {center.tags?.slice(0, 3).map(tag => (
            <span key={tag} style={{ 
              background: COLORS.bg, 
              padding: "4px 10px", 
              borderRadius: "6px", 
              fontSize: "11px", 
              fontWeight: 600
            }}>{tag}</span>
          ))}
        </div>

        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          paddingTop: "16px",
          borderTop: `1px solid ${COLORS.border}`
        }}>
          <div>
            {center.price && center.price.toLowerCase().includes("contact for price") ? (
              <div style={{ fontSize: "12px", fontWeight: 600, color: COLORS.textLight }}>Contact for price</div>
            ) : (
              <div style={{ fontSize: "16px", fontWeight: 900, color: COLORS.primary }}>{center.price || "250 EGP"}</div>
            )}
          </div>
          <a href={`/service-center-profile/${center.id}`} style={{ textDecoration: "none" }}>
            <button style={{
              background: COLORS.primary,
              color: COLORS.white,
              border: "none",
              padding: "8px 20px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 800,
              cursor: "pointer"
            }}>
              View Profile
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}
