"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          router.push("/login");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a0000, #3a0000)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', -apple-system, sans-serif",
      padding: "24px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        @keyframes checkPop {
          0% { transform: scale(0) rotate(-10deg); opacity: 0; }
          60% { transform: scale(1.2) rotate(4deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(232,39,42,0.5); }
          70%  { transform: scale(1);    box-shadow: 0 0 0 20px rgba(232,39,42,0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(232,39,42,0); }
        }
        .check-circle {
          animation: checkPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.2s both;
        }
        .card {
          animation: fadeUp 0.5s ease 0.1s both;
        }
        .pulse-btn {
          animation: pulse-ring 2s ease-in-out infinite;
        }
      `}</style>

      <div className="card" style={{
        background: "#ffffff",
        borderRadius: "28px",
        padding: "60px 48px",
        maxWidth: "480px",
        width: "100%",
        textAlign: "center",
        boxShadow: "0 40px 80px rgba(0,0,0,0.35)",
      }}>
        {/* Autoria Logo */}
        <div style={{ marginBottom: "32px" }}>
          <span style={{ fontSize: "22px", fontWeight: 900, color: "#111827", letterSpacing: "-0.5px" }}>
            AUTO<span style={{ color: "#E8272A" }}>RIA</span>
          </span>
        </div>

        {/* Check Icon */}
        <div className="check-circle" style={{
          width: "96px",
          height: "96px",
          background: "linear-gradient(135deg, #E8272A, #B81C1F)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 32px",
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        {/* Heading */}
        <h1 style={{ fontSize: "28px", fontWeight: 900, color: "#111827", marginBottom: "12px", lineHeight: 1.2 }}>
          Account Created!
        </h1>
        <p style={{ fontSize: "15px", color: "#6B7280", lineHeight: 1.7, marginBottom: "40px" }}>
          Welcome to <strong style={{ color: "#E8272A" }}>Autoria</strong>. Your account has been successfully created.
          You can now log in and start booking expert car care services.
        </p>

        {/* CTA */}
        <Link href="/login" className="pulse-btn" style={{
          display: "inline-block",
          background: "linear-gradient(135deg, #E8272A, #B81C1F)",
          color: "#ffffff",
          padding: "14px 40px",
          borderRadius: "14px",
          fontSize: "15px",
          fontWeight: 800,
          textDecoration: "none",
          letterSpacing: "0.3px",
        }}>
          Go to Login →
        </Link>

        {/* Countdown */}
        <p style={{ marginTop: "20px", fontSize: "13px", color: "#9CA3AF" }}>
          Redirecting automatically in <strong style={{ color: "#E8272A" }}>{countdown}s</strong>
        </p>
      </div>
    </div>
  );
}
