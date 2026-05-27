"use client";

import React, { useState, useEffect } from "react";
import { getMe } from "@/lib/api/usersService";

const R = "#E8272A";
const row = (gap = 0) => ({ display: "flex", alignItems: "center", gap });

export default function Navbar({ user: initialUser }) {
  const [user, setUser] = useState(initialUser || null);

  useEffect(() => {
  
    const fetchUser = async () => {
      try {
        const result = await getMe();
        if (result?.data?.fullName) {
          setUser({ name: result.data.fullName });
        }
      } catch (error) {
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
        <a href="/" style={{ textDecoration: "none" }}>
          <span style={{ color: "#fff", fontSize: 20, fontWeight: 900, letterSpacing: -.5 }}>
            AUTO<span style={{ opacity: .4, fontWeight: 400 }}>RIA</span>
          </span>
        </a>

        <div style={row(20)}>
          {[
            ["Home", "/"], 
            ["Services", "/search-results"], 
            ["Spare Parts", "/spare-parts-search"],
            ["Register Center", "/service-center-registration"],
            ["Edit Business", "/service-center/edit"],
            ["Inventory", "/spare-parts-inventory"]
          ].map(([l, h]) => (
            <a key={l} href={h} className="nav-link" style={{ color: "#fff", fontSize: 12, fontWeight: 600, textDecoration: "none", display: "inline-block" }}>{l}</a>
          ))}
        </div>

        <div style={row(15)}>

          <a href="/notifications" style={{ textDecoration: "none", position: "relative", display: "flex", alignItems: "center" }} className="btn-hover">
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
          </a>

          {user ? (
            <div className="btn-hover" style={{ ...row(10), cursor: "pointer" }}>
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
            </div>
          ) : (
            <div style={row(8)}>
              <a href="/login" style={{ textDecoration: "none" }}>
                <button className="btn-hover" style={{ background: "transparent", border: "1.5px solid rgba(255,255,255,.45)", color: "#fff", padding: "6px 16px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Login</button>
              </a>
              <a href="/signup" style={{ textDecoration: "none" }}>
                <button className="btn-hover" style={{ background: "#fff", border: "none", color: R, padding: "6px 16px", borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Sign Up</button>
              </a>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
