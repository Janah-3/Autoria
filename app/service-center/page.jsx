"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { serviceCentersService } from "@/lib/api/serviceCentersService";
import { getMe } from "@/lib/api/usersService";

export default function ServiceCenterProfile() {
  const [center, setCenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("AK");

  useEffect(() => {
    // Fetch logged-in user info
    getMe()
      .then((res) => {
        if (res?.data?.fullName) {
          setUserName(res.data.fullName);
        }
      })
      .catch(() => {});

    // Fetch own service center profile
    serviceCentersService
      .getMy()
      .then((res) => {
        const d = res?.data ?? res;
        if (d && d.name) {
          setCenter(d);
        } else {
          setCenter(null);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch logged-in service center profile:", err);
        setCenter(null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F4F7F6" }}>
        <div style={{ color: "#10B981", fontSize: "18px", fontWeight: "bold" }}>Loading profile...</div>
      </div>
    );
  }

  if (!center) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#F4F7F6", padding: "20px", fontFamily: "sans-serif" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#111827", marginBottom: "12px" }}>No Business Profile Found</h2>
        <p style={{ color: "#6B7280", marginBottom: "24px", textAlign: "center", maxWidth: "400px" }}>
          You don't have an active service center profile yet, or you are not logged in as a Service Center partner.
        </p>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link href="/service-center-registration">
            <button style={{ background: "#10B981", color: "white", border: "none", padding: "12px 24px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>
              Register Business
            </button>
          </Link>
          <Link href="/login">
            <button style={{ background: "transparent", color: "#374151", border: "1px solid #D1D5DB", padding: "12px 24px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>
              Partner Login
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="sc-profile-layout">
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .sc-profile-layout {
          min-height: 100vh;
          background: #F4F7F6;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          padding-bottom: 100px;
        }
        
        .top-nav {
          background: #fff;
          border-bottom: 1px solid #E5E7EB;
          height: 70px;
          padding: 0 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .logo { font-size: 24px; font-weight: 900; color: #E8192C; text-decoration: none; }
        .nav-right { display: flex; align-items: center; gap: 16px; }
        .back-btn { font-size: 14px; font-weight: 600; color: #4B5563; text-decoration: none; border: 1px solid #D1D5DB; padding: 8px 16px; border-radius: 6px; }
        .user-badge { width: 36px; height: 36px; background: #10B981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; text-transform: uppercase; }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }

        /* Hero Section */
        .sc-hero {
          background: #10B981;
          border-radius: 16px;
          padding: 32px;
          color: white;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-between;
        }

        .hero-left { display: flex; gap: 24px; }
        .sc-logo-box { width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 40px; }
        
        .sc-name { font-size: 28px; font-weight: 800; margin-bottom: 8px; }
        .sc-meta { font-size: 14px; display: flex; align-items: center; gap: 8px; opacity: 0.9; margin-bottom: 12px; }
        
        .sc-tags { display: flex; gap: 8px; margin-bottom: 24px; }
        .tag-verified { background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 4px; }
        
        .hero-stats { display: flex; gap: 32px; }
        .stat-item h3 { font-size: 24px; font-weight: 800; }
        .stat-item p { font-size: 13px; opacity: 0.8; }

        .hero-actions { display: flex; flex-direction: column; gap: 12px; align-items: flex-end; }
        .btn-save { background: transparent; color: white; border: 1px solid rgba(255,255,255,0.4); padding: 8px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
        .btn-save:hover { background: rgba(255,255,255,0.1); }
        .btn-book-top { background: white; color: #10B981; border: none; padding: 12px 32px; border-radius: 8px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }

        /* Main Grid */
        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); border: 1px solid #F3F4F6; margin-bottom: 24px; }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .card-title { font-size: 18px; font-weight: 700; color: #111827; }
        .card-link { color: #10B981; font-size: 14px; text-decoration: none; font-weight: 600; }

        /* Contact & Hours */
        .contact-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
        .contact-item { display: flex; gap: 12px; align-items: flex-start; }
        .contact-icon { width: 32px; height: 32px; background: #F3F4F6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #4B5563; flex-shrink: 0; }
        .contact-text h4 { font-size: 12px; color: #6B7280; font-weight: 500; }
        .contact-text p { font-size: 15px; color: #111827; font-weight: 500; }
        .map-placeholder { background: #F3F4F6; height: 120px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #6B7280; font-weight: 500; }

        /* Services & Brands */
        .tags-wrapper { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 24px; }
        .service-tag { background: #ECFDF5; color: #059669; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 600; border: 1px solid #A7F3D0; }
        .brand-tag { background: #F3F4F6; color: #374151; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 600; border: 1px solid #E5E7EB; }

        .price-range { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #F3F4F6; padding-top: 16px; }
        .price-info h4 { font-size: 12px; color: #6B7280; font-weight: 500; }
        .price-info p { font-size: 16px; font-weight: 700; color: #111827; }
        .spare-parts-toggle { font-size: 13px; color: #059669; font-weight: 600; display: flex; align-items: center; gap: 4px; }

        /* Photos Grid */
        .photos-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .photo-box { height: 100px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 32px; color: rgba(0,0,0,0.1); }
        .photo-box.c1 { background: #D1FAE5; }
        .photo-box.c2 { background: #FEF3C7; }
        .photo-box.c3 { background: #DBEAFE; }
        .photo-box.c4 { background: #FCE7F3; }

        /* Spare Parts */
        .part-item { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid #F3F4F6; }
        .part-item:last-child { border-bottom: none; }
        .part-info h4 { font-size: 15px; font-weight: 600; color: #111827; }
        .part-info p { font-size: 13px; color: #6B7280; }
        .part-action { text-align: right; }
        .part-price { font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 4px; }
        .btn-reserve { background: #10B981; color: white; border: none; padding: 6px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; }

        /* Sticky Footer */
        .sticky-footer { position: fixed; bottom: 0; left: 0; right: 0; background: white; border-top: 1px solid #E5E7EB; padding: 16px 40px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 -4px 6px rgba(0,0,0,0.02); z-index: 40; }
        .footer-info h4 { font-size: 16px; font-weight: 700; color: #111827; }
        .footer-info p { font-size: 13px; color: #6B7280; }
        .btn-book-bottom { background: #10B981; color: white; padding: 12px 32px; border-radius: 8px; font-weight: 700; border: none; cursor: pointer; display: flex; align-items: center; gap: 8px; }

        @media (max-width: 900px) {
          .content-grid { grid-template-columns: 1fr; }
          .sc-hero { flex-direction: column; gap: 24px; }
          .hero-actions { align-items: flex-start; flex-direction: row; }
        }
      `}</style>

      <nav className="top-nav">
        <Link href="/user-dashboard" className="logo" style={{color: '#111827'}}>Autoria</Link>
        <div className="nav-right">
          <Link href="/booking-requests" className="back-btn">📋 Partner Dashboard</Link>
          <div className="user-badge">{userName.split(" ").map(n => n[0]).join("") || "MH"}</div>
        </div>
      </nav>

      <div className="container">
        
        {/* Hero */}
        <div className="sc-hero">
          <div className="hero-left">
            <div className="sc-logo-box"><i className="fa-solid fa-wrench"></i></div>
            <div>
              <h1 className="sc-name">{center.name}</h1>
              <div className="sc-meta">
                <i className="fa-solid fa-location-dot"></i> {center.district}, {center.governorate}
              </div>
              <div className="sc-tags">
                <span className="tag-verified"><i className="fa-solid fa-check"></i> Verified</span>
                <span className="tag-verified">{center.type || "Service Center"}</span>
              </div>
              <div className="hero-stats">
                <div className="stat-item">
                  <h3>4.8</h3>
                  <p>★ Rating</p>
                </div>
                <div className="stat-item">
                  <h3>—</h3>
                  <p>Reviews</p>
                </div>
                <div className="stat-item">
                  <h3>{center.district ? "Yes" : "No"}</h3>
                  <p>Active profile</p>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-actions">
            <Link href="/service-center/edit">
              <button className="btn-save"><i className="fa-regular fa-pen-to-square"></i> Edit Profile</button>
            </Link>
          </div>
        </div>

        <div className="content-grid">
          
          {/* Left Column */}
          <div className="left-col">
            
            {/* Contact & Hours */}
            <div className="card">
              <h2 className="card-title" style={{marginBottom: '20px'}}>Contact & Hours</h2>
              <div className="contact-list">
                <div className="contact-item">
                  <div className="contact-icon"><i className="fa-solid fa-phone"></i></div>
                  <div className="contact-text">
                    <h4>Phone</h4>
                    <p>{center.phone || "Not provided"}</p>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-icon"><i className="fa-solid fa-location-dot"></i></div>
                  <div className="contact-text">
                    <h4>Address</h4>
                    <p>{center.district}, {center.governorate}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Services Offered */}
            <div className="card">
              <h2 className="card-title" style={{marginBottom: '16px'}}>Services Offered</h2>
              <div className="tags-wrapper">
                {center.serviceTypes && center.serviceTypes.length > 0 ? (
                  center.serviceTypes.map(s => (
                    <span className="service-tag" key={s}>{s}</span>
                  ))
                ) : (
                  <span style={{ color: '#6B7280', fontSize: '13px', fontStyle: 'italic' }}>No service types configured</span>
                )}
              </div>
              
              <h2 className="card-title" style={{marginTop: '32px', marginBottom: '16px'}}>Car Brands Serviced</h2>
              <div className="tags-wrapper">
                {center.carBrands && center.carBrands.length > 0 ? (
                  center.carBrands.map(b => (
                    <span className="brand-tag" key={b}>{b}</span>
                  ))
                ) : (
                  <span style={{ color: '#6B7280', fontSize: '13px', fontStyle: 'italic' }}>No brands configured</span>
                )}
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="right-col">
            
            {/* Photos */}
            <div className="card">
              <h2 className="card-title">Workshop Photos</h2>
              <div className="photos-grid" style={{ marginTop: '16px' }}>
                <div className="photo-box c1"><i className="fa-solid fa-car-side"></i></div>
                <div className="photo-box c2"><i className="fa-solid fa-screwdriver"></i></div>
                <div className="photo-box c3"><i className="fa-solid fa-building"></i></div>
                <div className="photo-box c4"><i className="fa-solid fa-wrench"></i></div>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
