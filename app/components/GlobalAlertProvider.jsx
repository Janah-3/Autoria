"use client";

import React, { useState, useEffect } from "react";

export default function GlobalAlertProvider() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Save originals
    const originalAlert = window.alert;
    const originalPrompt = window.prompt;

    // Override alert → custom modal
    window.alert = (msg) => {
      setMessage(String(msg || ""));
      setOpen(true);
    };

    // Override prompt → returns "" so callers don't crash; real UIs use dedicated modals
    window.prompt = () => "";

    return () => {
      window.alert = originalAlert;
      window.prompt = originalPrompt;
    };
  }, []);

  if (!open) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(15, 23, 42, 0.4)",
      backdropFilter: "blur(6px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 99999,
      fontFamily: "'Outfit', -apple-system, sans-serif",
      padding: "20px",
      animation: "fadeIn 0.25s ease-out"
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.92); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .modal-card {
          background: #ffffff;
          border-radius: 24px;
          padding: 32px;
          max-width: 440px;
          width: 100%;
          box-shadow: 0 20px 50px rgba(15, 23, 42, 0.15);
          border: 1px solid rgba(226, 232, 240, 0.8);
          text-align: center;
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .modal-title {
          font-size: 20px;
          font-weight: 800;
          color: #0F172A;
          margin-bottom: 12px;
          letter-spacing: -0.5px;
        }
        .modal-msg {
          font-size: 14.5px;
          color: #475569;
          line-height: 1.6;
          margin-bottom: 24px;
          white-space: pre-line;
        }
        .modal-btn {
          background: #E8272A;
          color: #ffffff;
          border: none;
          padding: 12px 32px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(232, 39, 42, 0.2);
          width: 100%;
        }
        .modal-btn:hover {
          background: #B81C1F;
          transform: translateY(-1px);
        }
        .modal-btn:active {
          transform: translateY(0);
        }
      `}</style>
      <div className="modal-card">
        <div style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "#FEF2F2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
          border: "2px solid #FCA5A5"
        }}>
          <i className="fa-solid fa-circle-info" style={{ color: "#E8272A", fontSize: "24px" }}></i>
        </div>
        <h3 className="modal-title">Attention</h3>
        <p className="modal-msg">{message}</p>
        <button className="modal-btn" onClick={() => setOpen(false)}>
          OK
        </button>
      </div>
    </div>
  );
}
