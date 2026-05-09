"use client";

import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const COLORS = {
  primary: "#E8272A",
  bg: "#F8F9FA",
  text: "#1A1A1A",
  textLight: "#6C757D",
  border: "#E9ECEF",
};

export default function Error({ error, reset }) {
  useEffect(() => {

    console.error(error);
  }, [error]);

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 6%", textAlign: "center" }}>
        <div style={{ maxWidth: "600px" }}>
          <div style={{ fontSize: "120px", color: COLORS.primary, marginBottom: "20px", opacity: 0.1 }}>
            ⚠️
          </div>
          
          <h1 style={{ fontSize: "42px", fontWeight: 900, marginBottom: "20px", color: "#111" }}>Something Went Wrong</h1>
          <p style={{ color: COLORS.textLight, fontSize: "18px", lineHeight: "1.6", marginBottom: "40px" }}>
            An unexpected error occurred. Our team has been notified.
          </p>
          
          <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
            <button 
              onClick={() => reset()}
              style={{ 
                background: COLORS.primary, 
                color: "#FFF", 
                padding: "15px 35px", 
                borderRadius: "12px", 
                fontWeight: 800, 
                border: "none",
                cursor: "pointer",
                boxShadow: "0 10px 20px rgba(232, 39, 42, 0.2)",
              }}
            >
              Try Again
            </button>
            <a href="/" style={{ 
              background: "#FFF", 
              color: COLORS.text, 
              padding: "15px 35px", 
              borderRadius: "12px", 
              fontWeight: 700, 
              textDecoration: "none",
              border: `1px solid ${COLORS.border}`,
            }}>
              Go to Homepage
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
