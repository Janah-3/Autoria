"use client";

import React from "react";

const COLORS = {
  primary: "#E8272A",
  bg: "#0F1115",
  text: "#FFFFFF",
  textLight: "#8E95A2",
  border: "#23272F",
};

export default function Footer() {
  return (
    <footer style={{ background: COLORS.bg, color: COLORS.text, padding: "60px 6% 30px", borderTop: `1px solid ${COLORS.border}`, marginTop: "80px" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "60px", marginBottom: "40px" }}>
          
          <div>
            <div style={{ fontSize: "24px", fontWeight: 900, marginBottom: "20px", letterSpacing: "-1px" }}>
              AUTO<span style={{ color: COLORS.primary }}>RIA</span>
            </div>
            <p style={{ color: COLORS.textLight, fontSize: "14px", lineHeight: "1.8", maxWidth: "300px" }}>
              Egypt's leading marketplace for car services and spare parts.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: "16px", fontWeight: 800, marginBottom: "25px", color: COLORS.primary }}>Services</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "15px" }}>
              {["Spare Parts Search", "Service Centers", "Mobile Mechanics"].map(link => (
                <li key={link} style={{ color: COLORS.textLight, fontSize: "14px", cursor: "pointer" }}>{link}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: "16px", fontWeight: 800, marginBottom: "25px", color: COLORS.primary }}>Support</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "15px" }}>
              {["Contact Us", "FAQs", "Terms of Service"].map(link => (
                <li key={link} style={{ color: COLORS.textLight, fontSize: "14px", cursor: "pointer" }}>{link}</li>
              ))}
            </ul>
          </div>

        </div>

        <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: "30px", textAlign: "center", fontSize: "13px", color: COLORS.textLight }}>
          © 2026 Autoria Egypt. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
