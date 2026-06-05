"use client";

import React from "react";

const COLORS = {
  primary: "#E8272A",
  bg: "#080808",
  text: "#FFFFFF",
  textLight: "#6b7280",
  border: "#141414",
};

export default function Footer() {
  return (
    <footer style={{ background: COLORS.bg, color: COLORS.text, padding: "60px 6% 30px", borderTop: `1px solid ${COLORS.border}`, marginTop: "60px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "40px", marginBottom: "40px" }}>
          
          <div>
            <div style={{ fontSize: "20px", fontWeight: 900, marginBottom: "15px", letterSpacing: "-0.5px" }}>
              AUTO<span style={{ opacity: 0.4 }}>RIA</span>
            </div>
            <p style={{ color: COLORS.textLight, fontSize: "12px", lineHeight: "1.8", maxWidth: "250px" }}>
              Egypt&apos;s leading platform connecting car owners with verified service centers and genuine spare parts.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "20px", color: "#FFF" }}>Platform</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { name: "Service Centers", href: "/service-centers" },
                { name: "Spare Parts", href: "/spare-parts-search" },
                { name: "Book a Service", href: "/book-service" }
              ].map(link => (
                <li key={link.name}>
                  <a href={link.href} style={{ color: COLORS.textLight, fontSize: "12px", textDecoration: "none", transition: "0.2s" }}>{link.name}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "20px", color: "#FFF" }}>Business </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { name: "Register Center", href: "/service-center-registration" }
              ].map(link => (
                <li key={link.name}>
                  <a href={link.href} style={{ color: COLORS.textLight, fontSize: "12px", textDecoration: "none", transition: "0.2s" }}>{link.name}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "20px", color: "#FFF" }}>Support</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { name: "About Us", href: "/about-us" },
                { name: "Contact Us", href: "/contact-us" }
              ].map(link => (
                <li key={link.name}>
                  <a href={link.href} style={{ color: COLORS.textLight, fontSize: "12px", textDecoration: "none", transition: "0.2s" }}>{link.name}</a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: "24px", display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#2a2a2a" }}>
          <span>© 2026 AUTORIA. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
