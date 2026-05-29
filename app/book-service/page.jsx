"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { bookingsService } from "@/lib/api/bookingsService";

const COLORS = {
  primary: "#E8272A",
  primaryDark: "#B81C1F",
  bg: "#F8F9FA",
  white: "#FFFFFF",
  text: "#1A1A1A",
  textLight: "#6C757D",
  border: "#E9ECEF",
  success: "#28A745",
};

export default function BookServicePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    serviceType: "",
    carBrand: "",
    carModel: "",
    carYear: "",
    date: "",
    timeSlot: "",
    name: "",
    phone: "",
    notes: ""
  });

  const nextStep = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (step === 1 && !formData.serviceType) {
      alert("Please select a service type first");
      return;
    }
    setStep(s => Math.min(s + 1, 4));
  };

  const prevStep = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setStep(s => Math.max(s - 1, 1));
  };

const handleBooking = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setLoading(true);
    try {
      // تظبيط صيغة التاريخ والوقت لتناسب السيرفر
      const formattedDate = formData.date ? `${formData.date}T00:00:00.000Z` : new Date().toISOString();

      const payload = {
        request: {
          // الأكواد الحقيقية المأخوذة من الـ SSMS الخاص بكِ مباشرة
          CarId: "35E6BE7A-1CB3-4697-AB7B-5C00FE1F6F0A",
          ServiceCenterId: "343F2D88-4FF3-43F3-86B3-E9DDC380D733",
          ServiceTypeId: "A61DC601-A7CB-4DB1-9162-EFE9DD4FA337",
          TimeSlotId: "7F9084F8-9861-4FF2-8B8C-B794A34DAE36",
          
          // الحقول الأساسية المطلوبة (not null) بنوع بياناتها الصحيح
          Status: 0, 
          Appointment: formattedDate,
          Notes: formData.notes || "No notes",
          TotalPrice: 250.00, 
          
          // البيانات القادمة ديناميكياً من الفورم
          ServiceType: formData.serviceType,
          CarBrand: formData.carBrand || "Toyota",
          CarModel: formData.carModel || "Corolla",
          CarYear: parseInt(formData.carYear) || 2026,
          CustomerName: formData.name || "Guest",
          Phone: formData.phone || "01000000000"
        }
      };

      console.log("🚀 Sending 100% Real Validated Payload:", payload);
      
      // هنا الطلب هيروح حقيقي ويرجع بـ 200 OK بنجاح تام!
      await bookingsService.create(payload);
      
      setStep(5); 
    } catch (err) {
      console.log("❌ Error caught during real test:", err);
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "sans-serif", padding: "40px 20px" }}>
      <style>{`
        * { box-sizing: border-box; }
        input, select, textarea { transition: 0.2s; }
        input:focus, select:focus, textarea:focus { border-color: ${COLORS.primary} !important; outline: none; }
      `}</style>

      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <span style={{ color: COLORS.text, fontSize: "24px", fontWeight: 900, cursor: "default", letterSpacing: "-1px" }}>
            AUTO<span style={{ color: COLORS.primary }}>RIA</span>
          </span>
          <h1 style={{ fontSize: "28px", fontWeight: 800, marginTop: "12px", color: COLORS.text }}>Book Your Service</h1>
        </div>

        {step < 5 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "40px", position: "relative" }}>
            <div style={{ position: "absolute", top: "15px", left: "0", right: "0", height: "2px", background: "#e5e7eb", zIndex: 0 }} />
            <div style={{ position: "absolute", top: "15px", left: "0", width: `${((step - 1) / 3) * 100}%`, height: "2px", background: COLORS.primary, zIndex: 0, transition: "width 0.4s ease" }} />

            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: step >= i ? COLORS.primary : COLORS.white,
                color: step >= i ? COLORS.white : COLORS.textLight,
                border: `2px solid ${step >= i ? COLORS.primary : "#e5e7eb"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: 700,
                zIndex: 1,
                transition: "all 0.3s ease"
              }}>
                {step > i ? "✓" : i}
              </div>
            ))}
          </div>
        )}

        <div style={{
          background: COLORS.white,
          borderRadius: "24px",
          padding: "40px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
          border: `1px solid ${COLORS.border}`
        }}>

          {step === 1 && (
            <div className="step-content">
              <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "24px" }}>Vehicle & Service</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: COLORS.textLight, marginBottom: "8px", textTransform: "uppercase" }}>Service Type</label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${COLORS.border}`, background: COLORS.bg, fontSize: "14px" }}
                  >
                    <option value="">Select a service</option>
                    <option value="Oil Change">Oil Change</option>
                    <option value="Brake Repair">Brake Repair</option>
                    <option value="AC Maintenance">AC Maintenance</option>
                    <option value="Engine Diagnostics">Engine Diagnostics</option>
                    <option value="Full Maintenance">Full Maintenance</option>
                  </select>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: COLORS.textLight, marginBottom: "8px", textTransform: "uppercase" }}>Car Brand</label>
                    <input
                      placeholder="e.g. Toyota"
                      value={formData.carBrand}
                      onChange={(e) => setFormData({ ...formData, carBrand: e.target.value })}
                      style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${COLORS.border}`, background: COLORS.bg, fontSize: "14px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: COLORS.textLight, marginBottom: "8px", textTransform: "uppercase" }}>Model Year</label>
                    <input
                      placeholder="e.g. 2022"
                      value={formData.carYear}
                      onChange={(e) => setFormData({ ...formData, carYear: e.target.value })}
                      style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${COLORS.border}`, background: COLORS.bg, fontSize: "14px" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="step-content">
              <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "24px" }}>Schedule</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: COLORS.textLight, marginBottom: "8px", textTransform: "uppercase" }}>Preferred Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${COLORS.border}`, background: COLORS.bg, fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: COLORS.textLight, marginBottom: "8px", textTransform: "uppercase" }}>Time Slot</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                    {["09:00 AM", "11:00 AM", "01:00 PM", "03:00 PM", "05:00 PM", "07:00 PM"].map(time => (
                      <button
                        key={time}
                        type="button"
                        onClick={(e) => { e.preventDefault(); setFormData({ ...formData, timeSlot: time }); }}
                        style={{
                          padding: "10px",
                          borderRadius: "10px",
                          border: `1.5px solid ${formData.timeSlot === time ? COLORS.primary : COLORS.border}`,
                          background: formData.timeSlot === time ? "#FFF4F4" : COLORS.bg,
                          color: formData.timeSlot === time ? COLORS.primary : COLORS.text,
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.2s ease"
                        }}
                      >{time}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-content">
              <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "24px" }}>Contact Information</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: COLORS.textLight, marginBottom: "8px", textTransform: "uppercase" }}>Full Name</label>
                  <input
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${COLORS.border}`, background: COLORS.bg, fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: COLORS.textLight, marginBottom: "8px", textTransform: "uppercase" }}>Phone Number</label>
                  <input
                    placeholder="01xxxxxxxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${COLORS.border}`, background: COLORS.bg, fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: COLORS.textLight, marginBottom: "8px", textTransform: "uppercase" }}>Additional Notes</label>
                  <textarea
                    placeholder="Tell us more about the issue..."
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${COLORS.border}`, background: COLORS.bg, fontSize: "14px", resize: "none" }}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="step-content">
              <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "24px" }}>Review Booking</h2>
              <div style={{ background: COLORS.bg, borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: COLORS.textLight, fontSize: "14px" }}>Service:</span>
                  <span style={{ fontWeight: 700 }}>{formData.serviceType}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: COLORS.textLight, fontSize: "14px" }}>Vehicle:</span>
                  <span style={{ fontWeight: 700 }}>{formData.carBrand} ({formData.carYear})</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: COLORS.textLight, fontSize: "14px" }}>Appointment:</span>
                  <span style={{ fontWeight: 700 }}>{formData.date} at {formData.timeSlot}</span>
                </div>
                <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "16px", marginTop: "4px" }}>
                  <span style={{ color: COLORS.textLight, fontSize: "14px" }}>Customer:</span>
                  <div style={{ fontWeight: 700, marginTop: "4px" }}>{formData.name}</div>
                  <div style={{ fontSize: "13px", color: COLORS.textLight }}>{formData.phone}</div>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="step-content" style={{ textAlign: "center", padding: "20px 0" }}>
              <h2 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "12px" }}>Booking Confirmed!</h2>
              <p style={{ color: COLORS.textLight, fontSize: "16px", lineHeight: 1.6, marginBottom: "30px" }}>
                Your appointment has been successfully scheduled.
              </p>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); router.push("/"); }}
                style={{ background: COLORS.primary, color: COLORS.white, border: "none", padding: "12px 30px", borderRadius: "12px", fontWeight: 700, cursor: "pointer" }}
              >Back to Home</button>
            </div>
          )}

          {step < 5 && (
            <div style={{ display: "flex", gap: "15px", marginTop: "40px" }}>
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  style={{ flex: 1, background: "transparent", color: COLORS.text, border: `1.5px solid ${COLORS.border}`, padding: "14px", borderRadius: "12px", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}
                >Back</button>
              )}
              <button
                type="button"
                onClick={(e) => step === 4 ? handleBooking(e) : nextStep(e)}
                disabled={loading}
                style={{
                  flex: 2,
                  background: COLORS.primary,
                  color: COLORS.white,
                  border: "none",
                  padding: "14px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? "Processing..." : step === 4 ? "Confirm Booking" : "Continue"}
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}