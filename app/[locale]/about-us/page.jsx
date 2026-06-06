"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const COLORS = {
  primary: "#E8272A",
  primaryDark: "#B81C1F",
  bg: "#F8F9FA",
  text: "#1A1A1A",
  textLight: "#4B5563",
  white: "#FFFFFF",
  border: "#E5E7EB",
};

const SHADOW = "0 10px 30px rgba(0, 0, 0, 0.04)";

export default function AboutUs() {
  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "80px 24px" }}>
        {/* Hero Section */}
        <section style={{ textAlign: "center", marginBottom: "80px" }}>
          <span style={{ color: COLORS.primary, fontWeight: 800, fontSize: "12px", textTransform: "uppercase", letterSpacing: "2px", display: "inline-block", marginBottom: "12px" }}>
            About Autoria
          </span>
          <h1 style={{ fontSize: "48px", fontWeight: 900, letterSpacing: "-1.5px", color: COLORS.text, margin: "0 0 24px 0", lineHeight: "1.1" }}>
            Redefining Car Care <br />
            <span style={{ color: COLORS.primary }}>Across Egypt</span>
          </h1>
          <p style={{ fontSize: "16px", color: COLORS.textLight, lineHeight: 1.8, maxWidth: "600px", margin: "0 auto" }}>
            Autoria is an automotive platform built to bridge the gap between car owners, premium service centers, and verified spare part suppliers.
          </p>
        </section>

        {/* Brand Mission & Vision Cards */}
        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", marginBottom: "80px" }}>
          <div style={{ background: COLORS.white, borderRadius: "20px", padding: "40px", border: `1px solid ${COLORS.border}`, boxShadow: SHADOW }}>
             <div style={{ marginBottom: "20px" }}>
              <i className="fa-solid fa-bullseye" style={{ fontSize: "36px", color: COLORS.primary }} />
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: COLORS.text, margin: "0 0 16px 0" }}>Our Mission</h3>
            <p style={{ fontSize: "14px", color: COLORS.textLight, lineHeight: 1.7, margin: 0 }}>
              Autoria envisions a future where vehicle owners in Egypt no longer depend on informal referrals, uncertainty, or fragmented service experiences to maintain their vehicles. The company aims to build the trust infrastructure that transforms Egypt’s automotive aftermarket into a transparent, verified, and digitally connected ecosystem where every maintenance decision, service provider, and vehicle record can be trusted, documented, and easily accessed.
            </p>
          </div>

          <div style={{ background: COLORS.white, borderRadius: "20px", padding: "40px", border: `1px solid ${COLORS.border}`, boxShadow: SHADOW }}>
              <div style={{ marginBottom: "20px" }}>
              <i className="fa-solid fa-eye" style={{ fontSize: "36px", color: COLORS.primary }} />
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: COLORS.text, margin: "0 0 16px 0" }}>Our Vision</h3>
            <p style={{ fontSize: "14px", color: COLORS.textLight, lineHeight: 1.7, margin: 0 }}>
              Autoria connects vehicle owners with verified automotive service centers through a structured digital marketplace designed to simplify service discovery, booking management, and long-term vehicle maintenance tracking. Through verified onboarding systems, booking-based reviews, and permanent Digital Vehicle Service History records, Autoria helps vehicle owners make more reliable maintenance decisions while enabling independent service centers to build customer trust, digital presence, and sustainable business growth.
            </p>
          </div>
        </section>

       

        {/* Core Values */}
        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 800, color: COLORS.text, textAlign: "center", marginBottom: "48px" }}>Our Core Values</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px" }}>
            {[
              { title: "Verification First", desc: "We manually verify each service center trade license, equipment grade, and legal files before approval.", icon: "🛡️" },
              { title: "Zero Hardcoded Bias", desc: "No paid placements or fake reviews. Customer ratings and availability represent pure live platform data.", icon: "⭐" },
              { title: "Total Traceability", desc: "Every spare part in our catalog features clear SKUs, manufacturer origin details, and verified center counts.", icon: "📦" },
            ].map((value, i) => (
              <div key={i} style={{ background: COLORS.white, borderRadius: "16px", padding: "32px", border: `1px solid ${COLORS.border}`, borderTop: `4px solid ${COLORS.primary}`, boxShadow: SHADOW }}>
                <span style={{ display: "block", marginBottom: "16px" }}>
                  <i className={value.iconClass} style={{ fontSize: "24px", color: COLORS.primary }} />
                </span>
                <h4 style={{ fontSize: "16px", fontWeight: 800, color: COLORS.text, margin: "0 0 12px 0" }}>{value.title}</h4>
                <p style={{ fontSize: "13px", color: COLORS.textLight, lineHeight: 1.6, margin: 0 }}>{value.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
