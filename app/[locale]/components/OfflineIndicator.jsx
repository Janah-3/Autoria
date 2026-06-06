"use client";

import React, { useState, useEffect } from "react";

export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Handler functions
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    // Initial state
    if (typeof window !== "undefined" && !navigator.onLine) {
      setIsOffline(true);
    }

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="offline-overlay">
      <style>{`
        .offline-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(10px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .offline-card {
          text-align: center;
          max-width: 400px;
          padding: 40px 24px;
        }

        .offline-icon-wrapper {
          width: 120px;
          height: 120px;
          background: #F3F4F6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 32px;
          position: relative;
        }

        .offline-icon {
          font-size: 50px;
          color: #9CA3AF;
        }

        .pulse-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 3px solid #E5E7EB;
          animation: pulse-ring 2s infinite cubic-bezier(0.215, 0.61, 0.355, 1);
        }

        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        .offline-title {
          font-size: 28px;
          font-weight: 800;
          color: #111827;
          margin-bottom: 12px;
          letter-spacing: -0.5px;
        }

        .offline-desc {
          font-size: 16px;
          color: #6B7280;
          line-height: 1.6;
          margin-bottom: 32px;
        }

        .retry-btn {
          background: #111827;
          color: #fff;
          border: none;
          padding: 14px 32px;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }

        .retry-btn:hover {
          background: #374151;
          transform: translateY(-2px);
        }
        
        .retry-btn:active {
          transform: translateY(0);
        }
      `}</style>
      
      <div className="offline-card">
        <div className="offline-icon-wrapper">
          <div className="pulse-ring"></div>
          <i className="fa-solid fa-wifi error-icon offline-icon" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 40%, 0 40%)' }}></i>
          {/* using fontawesome wifi slash instead if available, or just standard styling */}
          <i className="fa-solid fa-wifi" style={{position: 'absolute', fontSize: '50px', color: '#E5E7EB'}}></i>
          <i className="fa-solid fa-slash" style={{position: 'absolute', fontSize: '60px', color: '#9CA3AF'}}></i>
        </div>
        
        <h2 className="offline-title">No Internet Connection</h2>
        <p className="offline-desc">
          You are currently offline. Please check your network connection and try again to continue using Autoria.
        </p>
        
        <button className="retry-btn" onClick={() => window.location.reload()}>
          <i className="fa-solid fa-rotate-right"></i> Retry Connection
        </button>
      </div>
    </div>
  );
}
