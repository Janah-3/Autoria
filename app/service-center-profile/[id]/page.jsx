"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getMe } from "@/lib/api/usersService";
import {
  serviceCentersService,
  getServiceCenterItems,
  mapServiceCenterListItem,
} from "@/lib/api/serviceCentersService";
import Navbar from "@/components/Navbar";



const R  = "#E8272A";
const RD = "#B81C1F";
const row  = (gap = 0) => ({ display: "flex", alignItems: "center", gap });




const MOCK_CENTERS = {
  "1": { id: "1", name: "ProCare Auto Center", district: "Nasr City", governorate: "Cairo", type: "Top Rated", phone: "01012345678", serviceTypes: ["Oil Change", "Brakes", "AC Service"], carBrands: ["Toyota", "Hyundai", "Kia"] },
  "2": { id: "2", name: "SpeedFix Workshop", district: "Heliopolis", governorate: "Cairo", type: "Fast Service", phone: "01187654321", serviceTypes: ["Engine Repair", "Diagnostics"], carBrands: ["BMW", "Mercedes", "Audi"] },
  "3": { id: "3", name: "GreenWheel Service", district: "6th of October", governorate: "Giza", type: "New", phone: "01234567890", serviceTypes: ["Tires", "Alignment", "Wash"], carBrands: ["Nissan", "Chevrolet", "Renault"] }
};

// ── Main Page Component ────────────────────────────────────────────────────
export default function CenterProfilePage() {
  const params = useParams();
  const [center, setCenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    getMe()
      .then((res) => {
        if (res?.data?.fullName) setUser({ name: res.data.fullName });
      })
      .catch(() => {});

    serviceCentersService
      .getById(params.id)
      .then((res) => {
        const d = res?.data ?? res;
        if (d && (d.name || d.Name)) {
          setCenter(mapServiceCenterListItem(d));
        } else {
          if (MOCK_CENTERS[params.id]) {
            setCenter(MOCK_CENTERS[params.id]);
          } else {
            setCenter(null);
          }
        }
      })
      .catch(() => {
        if (MOCK_CENTERS[params.id]) {
          setCenter(MOCK_CENTERS[params.id]);
        } else {
          setCenter(null);
        }
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return (
    <div style={{ height: "100vh", ...row(0), justifyContent: "center", background: "#f7f7f8" }}>
      <div style={{ color: R, fontSize: 18, fontWeight: 700 }}>Loading Center Profile...</div>
    </div>
  );

  if (!center) return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f7f7f8" }}>
      <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>Profile not found</h2>
      <a href="/service-centers" style={{ color: R, fontWeight: 700, textDecoration: "none" }}>← Back to all centers</a>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", background: "#f7f7f8", minHeight: "100vh", color: "#111" }}>
      <style>{`
        .btn-hover { transition: all 0.2s ease; }
        .btn-hover:hover { transform: scale(1.03); filter: brightness(1.1); box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .nav-link { transition: all 0.2s ease; opacity: 0.8; }
        .nav-link:hover { opacity: 1; transform: translateY(-1px); }
      `}</style>
      
      <Navbar user={user} />


      <div style={{ 
        height: 320, 
        background: center.coverPhoto ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url(${center.coverPhoto}) center/cover no-repeat` : `linear-gradient(135deg, #111, ${RD})`,
        display: "flex",
        alignItems: "flex-end",
        padding: "0 5% 40px",
        color: "#fff"
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}>
          <div style={{ background: R, display: "inline-block", padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 800, textTransform: "uppercase", marginBottom: 12, letterSpacing: 1 }}>
            {center.type || "Service Center"}
          </div>
          <h1 style={{ fontSize: 48, fontWeight: 900, letterSpacing: -2, marginBottom: 8 }}>{center.name}</h1>
          <div style={{ ...row(16) }}>
            <span style={{ ...row(4), fontSize: 14 }}>📍 {center.district}, {center.governorate}</span>
            <span style={{ ...row(4), fontSize: 14, color: "#f59e0b" }}>★ 4.8 (120 reviews)</span>
          </div>
        </div>
      </div>


      <div style={{ maxWidth: 1200, margin: "40px auto", padding: "0 5%", display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32 }}>
        

        <div>
          <Section title="Center Profile">
            <p style={{ color: "#6b7280", lineHeight: 1.8, fontSize: 15 }}>
              Welcome to {center.name} profile. We are a professional {center.type} center located in {center.district}. We provide high-quality services for various car brands including {center.carBrands?.join(", ")}. Our certified technicians use state-of-the-art equipment to ensure your vehicle is in top condition.
            </p>
          </Section>

          <Section title="Available Services">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {center.serviceTypes?.map(service => (
                <div key={service} style={{ background: "#fff", padding: "16px", borderRadius: 12, border: "1px solid #e5e7eb", ...row(12) }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#fff0f0", color: R, ...row(0), justifyContent: "center", fontSize: 14 }}>✓</div>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{service}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Supported Brands">
             <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {center.carBrands?.map(brand => (
                  <span key={brand} style={{ background: "#111", color: "#fff", padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{brand}</span>
                ))}
             </div>
          </Section>

          <div style={{ marginTop: 20 }}>
            <a href="/gallery" style={{ textDecoration: "none" }}>
              <button className="btn-hover" style={{ 
                background: "#fff", 
                color: R, 
                border: `2px solid ${R}`, 
                padding: "12px 24px", 
                borderRadius: "12px", 
                fontSize: "14px", 
                fontWeight: 800, 
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>
                <span>📷</span> View Photo Gallery
              </button>
            </a>
          </div>
        </div>



        <div style={{ position: "sticky", top: 100, height: "fit-content" }}>
          <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #e5e7eb", padding: 24, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Book Appointment</h3>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#9ca3af", marginBottom: 8, textTransform: "uppercase" }}>Contact Number</label>
              <div style={{ fontSize: 18, fontWeight: 700, color: R }}>{center.phone || "Not provided"}</div>
            </div>
            
            <a href={`/book-service?serviceCenterId=${center.id}`} style={{ textDecoration: "none" }}>
              <button className="btn-hover" style={{ width: "100%", background: R, color: "#fff", border: "none", padding: "16px", borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: "pointer", marginBottom: 12 }}>
                Request Booking
              </button>
            </a>

            <p style={{ textAlign: "center", fontSize: 12, color: "#9ca3af" }}>No payment required upfront</p>

            <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid #f3f4f6" }}>
               <h4 style={{ fontSize: 13, fontWeight: 800, marginBottom: 12 }}>Map Location</h4>
               <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>{center.district}, {center.governorate}<br/>Egypt</p>
               <div style={{ height: 150, background: "#f3f4f6", borderRadius: 12, marginTop: 12, ...row(0), justifyContent: "center", color: "#9ca3af", fontSize: 12 }}>
                  Map View
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 20, position: "relative", paddingLeft: 16 }}>
        <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: R, borderRadius: 2 }}></span>
        {title}
      </h2>
      {children}
    </div>
  );
}
