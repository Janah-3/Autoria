"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";

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
  const { t } = useLanguage();

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "80px 24px" }}>
        {/* Hero Section */}
        <section style={{ textAlign: "center", marginBottom: "80px" }}>
          <span style={{ color: COLORS.primary, fontWeight: 800, fontSize: "12px", textTransform: "uppercase", letterSpacing: "2px", display: "inline-block", marginBottom: "12px" }}>
            {t("aboutUs.tag")}
          </span>
          <h1 style={{ fontSize: "48px", fontWeight: 900, letterSpacing: "-1.5px", color: COLORS.text, margin: "0 0 24px 0", lineHeight: "1.1" }}>
            {t("aboutUs.title")} <br />
            <span style={{ color: COLORS.primary }}>{t("aboutUs.titleEm")}</span>
          </h1>
          <p style={{ fontSize: "16px", color: COLORS.textLight, lineHeight: 1.8, maxWidth: "600px", margin: "0 auto" }}>
            {t("aboutUs.subtitle")}
          </p>
        </section>

        {/* Brand Mission & Vision Cards */}
        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", marginBottom: "80px" }}>
          <div style={{ background: COLORS.white, borderRadius: "20px", padding: "40px", border: `1px solid ${COLORS.border}`, boxShadow: SHADOW }}>
            <div style={{ fontSize: "36px", marginBottom: "20px" }}>🎯</div>
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: COLORS.text, margin: "0 0 16px 0" }}>{t("aboutUs.mission.title")}</h3>
            <p style={{ fontSize: "14px", color: COLORS.textLight, lineHeight: 1.7, margin: 0 }}>
              {t("aboutUs.mission.desc")}
            </p>
          </div>

          <div style={{ background: COLORS.white, borderRadius: "20px", padding: "40px", border: `1px solid ${COLORS.border}`, boxShadow: SHADOW }}>
            <div style={{ fontSize: "36px", marginBottom: "20px" }}>👁️‍🗨️</div>
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: COLORS.text, margin: "0 0 16px 0" }}>{t("aboutUs.vision.title")}</h3>
            <p style={{ fontSize: "14px", color: COLORS.textLight, lineHeight: 1.7, margin: 0 }}>
              {t("aboutUs.vision.desc")}
            </p>
          </div>
        </section>

        {/* Stats Row */}
        <section style={{ background: COLORS.white, borderRadius: "24px", padding: "48px", border: `1px solid ${COLORS.border}`, boxShadow: SHADOW, display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "32px", marginBottom: "80px" }}>
          {t("aboutUs.stats").map((stat, i) => (
            <div key={i} style={{ textAlign: "center", minWidth: "180px" }}>
              <div style={{ fontSize: "36px", fontWeight: 900, color: COLORS.primary, marginBottom: "8px" }}>{stat.value}</div>
              <div style={{ fontSize: "12px", color: COLORS.textLight, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>{stat.label}</div>
            </div>
          ))}
        </section>

        {/* Core Values */}
        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 800, color: COLORS.text, textAlign: "center", marginBottom: "48px" }}>{t("aboutUs.coreValues")}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px" }}>
            {t("aboutUs.values").map((value, i) => (
              <div key={i} style={{ background: COLORS.white, borderRadius: "16px", padding: "32px", border: `1px solid ${COLORS.border}`, borderTop: `4px solid ${COLORS.primary}`, boxShadow: SHADOW }}>
                <span style={{ fontSize: "24px", display: "block", marginBottom: "16px" }}>{value.icon}</span>
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
