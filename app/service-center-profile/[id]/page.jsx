"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getMe } from "@/lib/api/usersService";
import {
  serviceCentersService,
  getServiceCenterItems,
  mapServiceCenterListItem,
} from "@/lib/api/serviceCentersService";
import Navbar from "@/components/Navbar";
import { reportsService } from "@/lib/api/reportsService";
import { premiumService } from "@/lib/api/premiumService";



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

  // Inline Report States
  const [reportDropdownOpen, setReportDropdownOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const triggerToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      triggerToast("You must be logged in to report this center", "error");
      return;
    }
    if (!reason) {
      triggerToast("Please select a reason for reporting", "error");
      return;
    }

    setSubmittingReport(true);
    try {
      await reportsService.createReport({
        targetType: "ServiceCenter",
        targetId: center.id,
        reason: reason,
        details: details || "Submitted from inline report dropdown"
      });

      triggerToast("Report submitted successfully!", "success");
      setReportDropdownOpen(false);
      setReason("");
      setDetails("");
    } catch (err) {
      triggerToast(err.message || "Failed to submit report", "error");
    } finally {
      setSubmittingReport(false);
    }
  };

  // ── Silent profile view tracking (fires once per visit) ────────────────
  const viewTracked = useRef(false);
  useEffect(() => {
    if (params.id && !viewTracked.current) {
      viewTracked.current = true;
      premiumService.trackView(params.id).catch(() => {});
    }
  }, [params.id]);

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
            
            {/* Book Now Button */}
            <Link href={`/book-service?serviceCenterId=${center.id}`} style={{ textDecoration: "none" }}>
              <button
                className="btn-hover"
                style={{
                  width: "100%",
                  background: R,
                  color: "#fff",
                  border: "none",
                  padding: "14px 20px",
                  borderRadius: "12px",
                  fontWeight: 800,
                  fontSize: "15px",
                  cursor: "pointer",
                  marginBottom: "24px",
                  boxShadow: "0 4px 14px rgba(232, 39, 42, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >
                <i className="fa-solid fa-calendar-check"></i> Book Service
              </button>
            </Link>

            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Contact Information</h3>
            <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 20 }}>This is how customers see your profile.</p>

            {/* Phone */}
            <div style={{ marginBottom: 16, padding: "14px 16px", background: "#f9fafb", borderRadius: 12, border: "1px solid #f3f4f6" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Phone Number</div>
              <div style={{ ...row(8) }}>
                <span style={{ color: R, fontSize: 16 }}>📞</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: R }}>{center.phone || "Not provided"}</span>
              </div>
            </div>

            {/* Location */}
            <div style={{ marginBottom: 16, padding: "14px 16px", background: "#f9fafb", borderRadius: 12, border: "1px solid #f3f4f6" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Location</div>
              <div style={{ ...row(8), marginBottom: 10 }}>
                <span style={{ fontSize: 16 }}>📍</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{center.district}, {center.governorate}</span>
              </div>
              
              {/* Map Preview iframe connected to API coordinates or address fallback */}
              <div style={{ overflow: "hidden", borderRadius: 8, border: "1px solid #e5e7eb", marginTop: 10 }}>
                <iframe
                  title="Center Location Map"
                  width="100%"
                  height="140"
                  style={{ border: 0, display: "block" }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    center.latitude && center.longitude
                      ? `${center.latitude},${center.longitude}`
                      : `${center.name}, ${center.district}, ${center.governorate}`
                  )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                ></iframe>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    center.latitude && center.longitude
                      ? `${center.latitude},${center.longitude}`
                      : `${center.name}, ${center.district}, ${center.governorate}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    padding: "8px",
                    background: "#ffffff",
                    borderTop: "1px solid #e5e7eb",
                    color: R,
                    fontSize: "11px",
                    fontWeight: 700,
                    textDecoration: "none",
                    transition: "all 0.2s"
                  }}
                  className="btn-hover"
                >
                  <span>🗺️</span> View on Google Maps
                </a>
              </div>
            </div>

            {/* Rating */}
            <div style={{ marginBottom: 20, padding: "14px 16px", background: "#f9fafb", borderRadius: 12, border: "1px solid #f3f4f6" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Rating</div>
              <div style={{ ...row(8) }}>
                <span style={{ color: "#f59e0b", fontSize: 16 }}>★</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#374151" }}>4.8</span>
                <span style={{ fontSize: 13, color: "#9ca3af" }}>(120 reviews)</span>
              </div>
            </div>

            {/* Info note */}
            <div style={{ padding: "12px 14px", background: "#fff7f7", borderRadius: 10, border: "1px solid #fecaca", ...row(10) }}>
              <span style={{ fontSize: 18 }}>👁️</span>
              <p style={{ fontSize: 12, color: "#991b1b", fontWeight: 600, lineHeight: 1.5 }}>
                Live preview — this is exactly how customers see your profile page.
              </p>
            </div>

            {/* Report Button */}
            <div style={{ marginTop: 16 }}>
              <button 
                onClick={() => setReportDropdownOpen(true)}
                style={{
                  width: "100%",
                  background: R,
                  color: "#fff",
                  border: "none",
                  padding: "12px",
                  borderRadius: "12px",
                  fontWeight: 800,
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                className="btn-hover"
              >
                Report
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Floating Toast Alert */}
      <div style={{
        position: "fixed", top: 80, right: 24, zIndex: 99999, display: "flex", alignItems: "center", gap: 10,
        padding: "16px 24px", borderRadius: 12, background: "#fff", border: `1.5px solid ${toast.type === "success" ? "#C3E6CB" : "#F5C6CB"}`,
        boxShadow: "0 10px 25px rgba(0,0,0,0.08)", transform: toast.show ? "translateX(0)" : "translateX(120%)",
        transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)", pointerEvents: "none"
      }}>
        <span style={{ fontSize: 18 }}>{toast.type === "success" ? "✅" : "❌"}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: toast.type === "success" ? "#155724" : "#721C24" }}>{toast.message}</span>
      </div>

      {/* Inline Dropdown Popup */}
      {reportDropdownOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999, backdropFilter: "blur(4px)"
        }}>
          <div style={{
            background: "#fff", borderRadius: "20px", padding: "30px", width: "420px",
            boxShadow: "0 10px 35px rgba(0,0,0,0.15)", border: "1px solid #e5e7eb",
            color: "#111"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <span>⚠️</span> Report Workshop
              </h3>
              <button 
                onClick={() => setReportDropdownOpen(false)}
                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#9ca3af" }}
              >
                ✕
              </button>
            </div>

            {!user ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <span style={{ fontSize: 32 }}>🔒</span>
                <h4 style={{ fontSize: 16, fontWeight: 700, marginTop: 12, marginBottom: 8 }}>Login Required</h4>
                <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5, marginBottom: 20 }}>
                  You must be logged in to submit reports or complaints about workshop centers.
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <Link href="/login" style={{ flex: 1, textDecoration: "none", background: R, color: "#fff", padding: "10px", borderRadius: 8, fontWeight: 700, fontSize: 13, display: "inline-block", textAlign: "center" }}>Log In</Link>
                  <button onClick={() => setReportDropdownOpen(false)} style={{ flex: 1, background: "#fff", color: "#111", border: "1px solid #e5e7eb", padding: "10px", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Cancel</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <p style={{ fontSize: 13, color: "#6b7280", margin: 0, lineHeight: 1.5 }}>
                  Reporting <strong>{center.name}</strong>. Please select the issue you faced:
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 800, color: "#374151", textTransform: "uppercase", letterSpacing: 0.5 }}>Select Reason</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13.5, outline: "none", background: "#fff" }}
                  >
                    <option value="">-- Choose Reason --</option>
                    <option value="Spam">Spam / Misleading content</option>
                    <option value="Inappropriate">Inappropriate behavior / Language</option>
                    <option value="Fake">Fake profile / Misleading info</option>
                    <option value="Offensive">Offensive or abusive content</option>
                    <option value="Other">Other issue</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 800, color: "#374151", textTransform: "uppercase", letterSpacing: 0.5 }}>Explain Details (Optional)</label>
                  <textarea
                    placeholder="Provide additional details to help our moderators review..."
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    rows={4}
                    maxLength={300}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", fontFamily: "inherit", resize: "none" }}
                  />
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <button 
                    type="button" 
                    onClick={() => setReportDropdownOpen(false)}
                    style={{ flex: 1, background: "#f3f4f6", border: "none", padding: "11px", borderRadius: 8, fontWeight: 700, fontSize: 13, color: "#6b7280", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={submittingReport}
                    style={{
                      flex: 1, background: submittingReport ? RD : R, color: "#fff",
                      border: "none", padding: "11px", borderRadius: 8, fontWeight: 800,
                      fontSize: 13, cursor: submittingReport ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                    }}
                  >
                    {submittingReport ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
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
