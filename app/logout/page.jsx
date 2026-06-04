"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout } from "../../src/API/authService";

export default function LogoutPage() {
  const router = useRouter();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout();
    } catch (error) {

      console.error("Logout API error:", error);
    } finally {
      setIsDone(true);
      setTimeout(() => {
        router.push("/");
      }, 1800);
    }
  };

  if (isDone) {
    return (
      <div className="screen">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          .screen {
            min-height: 100vh;
            background: #F7F8FA;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Cairo', sans-serif;
            text-align: center;
          }
          .done-title { font-size: 22px; font-weight: 900; color: #212121; margin-bottom: 8px; }
          .done-sub { font-size: 14px; color: #9E9E9E; }
        `}</style>
        <div>
          <div className="done-title">You have been logged out</div>
          <div className="done-sub">Redirecting to home...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');

        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .page-container {
          min-height: 100vh;
          background: #F7F8FA;
          font-family: 'Cairo', sans-serif;
          display: flex;
          flex-direction: column;
        }

        .top-nav {
          background: #fff;
          border-bottom: 2px solid #E8192C;
          height: 60px;
          padding: 0 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 2px 8px rgba(232, 25, 44, 0.07);
        }

        .logo {
          font-size: 20px;
          font-weight: 900;
          color: #E8192C;
        }

        .nav-back {
          font-size: 13px;
          font-weight: 600;
          color: #616161;
          text-decoration: none;
          transition: color 0.2s;
        }

        .nav-back:hover {
          color: #E8192C;
        }

        .page-content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
        }

        .card {
          background: #fff;
          border: 1.5px solid #F0F0F0;
          border-radius: 20px;
          padding: 48px 40px;
          max-width: 440px;
          width: 100%;
          text-align: center;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
        }

        .card-title {
          font-size: 24px;
          font-weight: 900;
          color: #212121;
          margin-bottom: 10px;
        }

        .card-subtitle {
          font-size: 14px;
          color: #757575;
          line-height: 1.6;
          margin-bottom: 36px;
        }

        .warning-banner {
          background: #FFF8E1;
          border: 1.5px solid #FFE082;
          border-radius: 12px;
          padding: 14px 16px;
          font-size: 13px;
          color: #6D4C00;
          line-height: 1.6;
          margin-bottom: 28px;
          text-align: left;
        }

        .warning-banner strong {
          font-weight: 800;
        }

        .btn-logout {
          width: 100%;
          padding: 15px;
          background: #E8192C;
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Cairo', sans-serif;
          box-shadow: 0 4px 14px rgba(232, 25, 44, 0.25);
          margin-bottom: 12px;
        }

        .btn-logout:hover:not(:disabled) {
          background: #C8001E;
          box-shadow: 0 6px 20px rgba(232, 25, 44, 0.35);
        }

        .btn-logout:disabled {
          background: #FFAAB1;
          cursor: wait;
          box-shadow: none;
        }

        .btn-cancel {
          width: 100%;
          padding: 14px;
          background: #F0F0F0;
          color: #424242;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          text-align: center;
          text-decoration: none;
          display: block;
          transition: background 0.2s;
          font-family: 'Cairo', sans-serif;
        }

        .btn-cancel:hover {
          background: #E0E0E0;
        }
      `}</style>

      <nav className="top-nav">
        <span className="logo">Autoria</span>
        <Link href="/" className="nav-back">Back to Home</Link>
      </nav>

      <div className="page-content">
        <div className="card">
          <div className="card-title">Sign Out</div>
          <div className="card-subtitle">
            Are you sure you want to sign out of your Autoria account?
          </div>

          <div className="warning-banner">
            <strong>Note:</strong> You will need to log in again to access your account,
            bookings, and vehicle information.
          </div>

          <button
            className="btn-logout"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Signing out..." : "Sign Out"}
          </button>

          <Link href="/" className="btn-cancel">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
