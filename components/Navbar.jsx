"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getMe } from "@/lib/api/usersService";
import { clearAuthTokens } from "@/lib/api/client";

const R = "#E8272A";
const row = (gap = 0) => ({ display: "flex", alignItems: "center", gap });

export default function Navbar({ user: initialUser }) {
  const [user, setUser] = useState(initialUser || null);
  const [dashboardUrl, setDashboardUrl] = useState("/user-dashboard");
  const [profileUrl, setProfileUrl] = useState("/user-profile");
  const [userRole, setUserRole] = useState("User");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setDropdownOpen(prev => !prev);
  };

  useEffect(() => {
    const closeDropdown = () => setDropdownOpen(false);
    window.addEventListener("click", closeDropdown);
    return () => window.removeEventListener("click", closeDropdown);
  }, []);

  useEffect(() => {
    const cachedToken = localStorage.getItem("token");
    const cachedRole = localStorage.getItem("userRole");
    const cachedName = localStorage.getItem("userName");
    
    if (cachedToken) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser({ name: cachedName || "User" });
      if (cachedRole === "Admin") {
        setDashboardUrl("/admin");
        setProfileUrl("/admin");
        setUserRole("Admin");
      } else if (cachedRole === "ServiceCenter" || cachedRole === "Center" || cachedRole === "ServiceCenterOwner") {
        setDashboardUrl("/service-center");
        setProfileUrl("/service-center/edit");
        setUserRole("ServiceCenter");
      } else {
        setDashboardUrl("/user-dashboard");
        setProfileUrl("/user-profile");
        setUserRole("User");
      }
    }

    const fetchUser = async () => {
      try {
        const result = await getMe();
        if (result?.data?.fullName) {
          setUser({ name: result.data.fullName });
          localStorage.setItem("userName", result.data.fullName);
          const role = result?.data?.role ?? result?.data?.Role ?? localStorage.getItem("userRole") ?? "User";
          localStorage.setItem("userRole", role);
          if (role === "Admin") {
            setDashboardUrl("/admin");
            setProfileUrl("/admin");
            setUserRole("Admin");
          } else if (role === "ServiceCenter" || role === "Center" || role === "ServiceCenterOwner") {
            setDashboardUrl("/service-center");
            setProfileUrl("/service-center/edit");
            setUserRole("ServiceCenter");
          } else {
            setDashboardUrl("/user-dashboard");
            setProfileUrl("/user-profile");
            setUserRole("User");
          }
        }
      } catch (error) {
        if (error?.status === 401) {
          clearAuthTokens();
          setUser(null);
        }
        console.log("Waiting for Backend to turn on...", error.message);
      }
    };

    fetchUser();
  }, []);

  return (
    <>
      <style>{`
        .nav-link { transition: all 0.2s ease; opacity: 0.82; }
        .nav-link:hover { opacity: 1; transform: translateY(-1px); }
        .btn-hover { transition: all 0.2s ease; }
        .btn-hover:hover { transform: scale(1.04); filter: brightness(1.1); box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .btn-hover:active { transform: scale(0.96); }
        .profile-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: #ffffff;
          border-radius: 10px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          border: 1.5px solid #f0f0f0;
          min-width: 160px;
          overflow: hidden;
          opacity: 0;
          transform: translateY(-8px) scale(0.96);
          transform-origin: top right;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
          z-index: 1000;
        }
        .profile-dropdown.open {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          color: #333;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .dropdown-item:hover {
          background: #f7f8fa;
        }
        .dropdown-item.logout {
          color: #E8272A;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .dropdown-item.logout:hover {
          background: #fff5f5;
        }
        .dropdown-item.logout .logout-arrow {
          transition: transform 0.2s ease;
          font-weight: 900;
        }
        .dropdown-item.logout:hover .logout-arrow {
          transform: translateX(4px);
        }
        .chevron-icon {
          transition: transform 0.2s ease;
        }
        .chevron-icon.open {
          transform: rotate(180deg);
        }
      `}</style>

      <nav style={{ 
        background: R, 
        height: 62, 
        ...row(0), 
        justifyContent: "space-between", 
        padding: "0 5%", 
        position: "sticky", 
        top: 0, 
        zIndex: 100, 
        boxShadow: "0 2px 12px rgba(0,0,0,.18)" 
      }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ color: "#fff", fontSize: 20, fontWeight: 900, letterSpacing: -.5 }}>
            AUTO<span style={{ opacity: .4, fontWeight: 400 }}>RIA</span>
          </span>
        </Link>

        <div style={row(20)}>
          {[
            ["Home", "/"], 
            ...(userRole === "User" || !user ? [["Services", "/search-results"], ["Spare Parts", "/spare-parts-search"]] : []),
          ].map(([l, h]) => (
            <Link key={l} href={h} className="nav-link" style={{ color: "#fff", fontSize: 12, fontWeight: 600, textDecoration: "none", display: "inline-block" }}>{l}</Link>
          ))}
          {user && (
            <Link href={dashboardUrl} className="nav-link" style={{ color: "#fff", fontSize: 12, fontWeight: 600, textDecoration: "none", display: "inline-block" }}>Dashboard</Link>
          )}
        </div>

        <div style={row(15)}>

          <Link href="/notifications" style={{ textDecoration: "none", position: "relative", display: "flex", alignItems: "center" }} className="btn-hover">
            <span style={{ fontSize: 20 }}>🔔</span>
            <span style={{ 
              position: "absolute", 
              top: -2, 
              right: -2, 
              background: "#fff", 
              color: R, 
              fontSize: 9, 
              fontWeight: 900, 
              width: 14, 
              height: 14, 
              borderRadius: "50%", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              border: `1.5px solid ${R}`
            }}>2</span>
          </Link>

          {user ? (
            <div style={{ position: "relative" }}>
              <div 
                className="btn-hover" 
                onClick={toggleDropdown}
                style={{ ...row(8), cursor: "pointer", userSelect: "none" }}
              >
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{user.name}</span>
                <div style={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: "50%", 
                  background: "#fff", 
                  color: R, 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  fontWeight: 800, 
                  fontSize: 12 
                }}>
                  {user.name?.[0].toUpperCase() || "U"}
                </div>
                <span className={`chevron-icon ${dropdownOpen ? "open" : ""}`} style={{ color: "#fff", fontSize: 10, display: "inline-block" }}>
                  ▼
                </span>
              </div>

              <div className={`profile-dropdown ${dropdownOpen ? "open" : ""}`}>
                <Link href={profileUrl} className="dropdown-item" style={{ borderBottom: "1.5px solid #f0f0f0" }}>
                  {userRole === "Admin" ? "🔑 Admin Panel" :
                   userRole === "ServiceCenter" ? "🏪 Edit Profile" :
                   "👤 My Profile"}
                </Link>
                <Link href={dashboardUrl} className="dropdown-item" style={{ borderBottom: "1.5px solid #f0f0f0" }}>
                  {userRole === "Admin" ? "📊 Admin Dashboard" :
                   userRole === "ServiceCenter" ? "📋 My Dashboard" :
                   "🏠 My Dashboard"}
                </Link>
                <Link href="/logout" className="dropdown-item logout">
                  Log Out <span className="logout-arrow">→</span>
                </Link>
              </div>
            </div>
          ) : (
            <div style={row(8)}>
              <Link href="/login" style={{ textDecoration: "none" }}>
                <button className="btn-hover" style={{ background: "transparent", border: "1.5px solid rgba(255,255,255,.45)", color: "#fff", padding: "6px 16px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Login</button>
              </Link>
              <Link href="/signup" style={{ textDecoration: "none" }}>
                <button className="btn-hover" style={{ background: "#fff", border: "none", color: R, padding: "6px 16px", borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Sign Up</button>
              </Link>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
