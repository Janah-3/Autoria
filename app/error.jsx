"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#F4F7F6", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <style>{`
          .error-card {
            background: #fff;
            border-radius: 20px;
            box-shadow: 0 10px 30px -5px rgba(232, 25, 44, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            max-width: 480px;
            width: 100%;
            padding: 48px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          
          .error-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 6px;
            background: linear-gradient(90deg, #E8192C, #FF4B5A);
          }

          .icon-circle {
            width: 96px;
            height: 96px;
            background: #FFF5F6;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
            position: relative;
          }

          .icon-circle::after {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 2px solid #FFE0E3;
            animation: pulse 2s infinite;
          }

          .error-icon {
            font-size: 40px;
            color: #E8192C;
          }

          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1.3); opacity: 0; }
          }

          .error-title {
            font-size: 28px;
            font-weight: 800;
            color: #111827;
            margin-bottom: 12px;
            letter-spacing: -0.5px;
          }

          .error-desc {
            font-size: 15px;
            color: #6B7280;
            line-height: 1.6;
            margin-bottom: 32px;
          }

          .error-code {
            background: #F9FAFB;
            padding: 12px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 13px;
            color: #4B5563;
            margin-bottom: 32px;
            word-break: break-all;
            border: 1px solid #E5E7EB;
          }

          .actions {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .btn {
            width: 100%;
            padding: 14px 24px;
            border-radius: 10px;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            border: none;
            text-decoration: none;
          }

          .btn-primary {
            background: #E8192C;
            color: #fff;
            box-shadow: 0 4px 6px -1px rgba(232, 25, 44, 0.2);
          }

          .btn-primary:hover {
            background: #D01526;
            transform: translateY(-1px);
            box-shadow: 0 6px 8px -1px rgba(232, 25, 44, 0.3);
          }
          
          .btn-primary:active {
            transform: translateY(0);
          }

          .btn-secondary {
            background: #fff;
            color: #374151;
            border: 1px solid #D1D5DB;
          }

          .btn-secondary:hover {
            background: #F9FAFB;
            border-color: #9CA3AF;
          }
        `}</style>

        <div className="error-card">
          <div className="icon-circle">
            <span style={{ fontSize: "40px" }}>⚠️</span>
          </div>
          <h1 className="error-title">Oops! Something went wrong</h1>
          <p className="error-desc">
            We encountered an unexpected error while trying to process your request. Don't worry, our team has been notified.
          </p>
          
          {error?.message && (
            <div className="error-code">
              {error.message}
            </div>
          )}

          <div className="actions">
            <button className="btn btn-primary" onClick={() => reset()}>
              Try Again
            </button>
            <Link href="/" className="btn btn-secondary">
              Return to Homepage
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
