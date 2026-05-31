"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { contactUsService } from "@/lib/api/contactUsService";

const COLORS = {
  primary: "#E8272A",
  primaryDark: "#B81C1F",
  bg: "#F8F9FA",
  text: "#1A1A1A",
  textLight: "#4B5563",
  white: "#FFFFFF",
  border: "#E5E7EB",
  success: "#1B5E20",
  successBg: "#E8F5E9",
  error: "#C62828",
  errorBg: "#FFEBEE"
};

const SHADOW = "0 20px 40px rgba(0, 0, 0, 0.04)";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: ""
  });

  const [loading, setLoading] = useState(false);
  const [alertState, setAlertState] = useState({ show: false, type: "", msg: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.subject || !formData.message) {
      setAlertState({ show: true, type: "error", msg: "Please fill out all fields before submitting." });
      return;
    }

    
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setAlertState({ 
        show: true, 
        type: "error", 
        msg: "You must be logged in to submit a support message. Please log in first." 
      });
      return;
    }

    setLoading(true);
    setAlertState({ show: false, type: "", msg: "" });

    
    const payload = {
      fullName: formData.fullName,
      email: formData.email,
      subject: formData.subject,
      message: formData.message
    };

    try {
      const res = await contactUsService.submitMessage(payload);
      if (res?.success || res?.message) {
        setAlertState({
          show: true,
          type: "success",
          msg: res.message || "Your message has been received! We will get back to you soon."
        });
        setFormData({ fullName: "", email: "", subject: "", message: "" });
      } else {
        setAlertState({
          show: true,
          type: "error",
          msg: "Something went wrong. Please check your credentials and try again."
        });
      }
    } catch (err) {
      console.error(err);
      setAlertState({
        show: true,
        type: "error",
        msg: err.message || "Failed to submit message. Please ensure the backend is running."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "80px 24px" }}>
        
        {/* Header Title */}
        <section style={{ textAlign: "center", marginBottom: "60px" }}>
          <span style={{ color: COLORS.primary, fontWeight: 800, fontSize: "12px", textTransform: "uppercase", letterSpacing: "2px", display: "inline-block", marginBottom: "12px" }}>
            Get In Touch
          </span>
          <h1 style={{ fontSize: "40px", fontWeight: 900, letterSpacing: "-1px", color: COLORS.text, margin: 0 }}>
            We'd Love to Hear From You
          </h1>
          <p style={{ fontSize: "14px", color: COLORS.textLight, marginTop: "12px" }}>
            Have a question, feedback, or need help with a service center booking? Send us a message!
          </p>
        </section>

        {/* Form & Info Section */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "60px", alignItems: "start" }}>
          
          {/* Left Column: Contact info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            <div style={{ background: COLORS.white, borderRadius: "20px", padding: "32px", border: `1px solid ${COLORS.border}`, boxShadow: SHADOW }}>
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: COLORS.text, margin: "0 0 24px 0" }}>Contact Information</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                  <div style={{ fontSize: "24px", width: "48px", height: "48px", background: COLORS.bg, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>📞</div>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: COLORS.textLight, textTransform: "uppercase" }}>Hotline Call</div>
                    <div style={{ fontSize: "14px", fontWeight: 800 }}>01282854743 (Cairo, Egypt)</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                  <div style={{ fontSize: "24px", width: "48px", height: "48px", background: COLORS.bg, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>✉️</div>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: COLORS.textLight, textTransform: "uppercase" }}>Email Support</div>
                    <div style={{ fontSize: "14px", fontWeight: 800 }}>support@autoria.com.eg</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick support notification */}
            <div style={{ background: "#EBF5FF", border: "1px solid #C4E1FF", padding: "20px", borderRadius: "16px", display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ fontSize: "24px" }}></div>
              <p style={{ fontSize: "12.5px", color: "#1E3A8A", margin: 0, lineHeight: 1.5 }}>
                <strong>Average Response Time:</strong> Our customer success moderation team usually responds to all verified user questions within few hours.
              </p>
            </div>
          </div>

          {/* Right Column: Contact form */}
          <div style={{ background: COLORS.white, borderRadius: "24px", padding: "40px", border: `1px solid ${COLORS.border}`, boxShadow: SHADOW }}>
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: COLORS.text, margin: "0 0 8px 0" }}>Send Message</h3>
            <p style={{ fontSize: "13px", color: COLORS.textLight, margin: "0 0 24px 0" }}>Please fill the form below to open a ticket in our support queue.</p>

            {alertState.show && (
              <div style={{ 
                background: alertState.type === "success" ? COLORS.successBg : COLORS.errorBg, 
                color: alertState.type === "success" ? COLORS.success : COLORS.error, 
                padding: "14px 18px", 
                borderRadius: "10px", 
                fontSize: "13.5px", 
                fontWeight: 700, 
                marginBottom: "24px",
                border: `1.5px solid ${alertState.type === "success" ? "#C2E7C4" : "#FFCDD2"}`
              }}>
                {alertState.type === "success" ? "✓" : "⚠️"} {alertState.msg}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: 800, color: COLORS.textLight }}>Full Name</label>
                <input 
                  type="text" 
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Your Name"
                  required
                  style={{ padding: "12px 16px", border: `1.5px solid ${COLORS.border}`, borderRadius: "8px", fontSize: "14px", outline: "none", transition: "0.2s" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: 800, color: COLORS.textLight }}>Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. name@gmail.com"
                  required
                  style={{ padding: "12px 16px", border: `1.5px solid ${COLORS.border}`, borderRadius: "8px", fontSize: "14px", outline: "none", transition: "0.2s" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: 800, color: COLORS.textLight }}>Subject</label>
                <input 
                  type="text" 
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g. Car Mileage Reminder Issue"
                  required
                  style={{ padding: "12px 16px", border: `1.5px solid ${COLORS.border}`, borderRadius: "8px", fontSize: "14px", outline: "none", transition: "0.2s" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: 800, color: COLORS.textLight }}>Your Message</label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Type your message details here..."
                  required
                  rows="5"
                  style={{ padding: "12px 16px", border: `1.5px solid ${COLORS.border}`, borderRadius: "8px", fontSize: "14px", outline: "none", fontFamily: "inherit", resize: "none", transition: "0.2s" }}
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{ 
                  background: COLORS.primary, 
                  color: "#FFFFFF", 
                  border: "none", 
                  padding: "14px", 
                  borderRadius: "8px", 
                  fontSize: "14px", 
                  fontWeight: 800, 
                  cursor: loading ? "not-allowed" : "pointer", 
                  transition: "0.2s",
                  marginTop: "8px",
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? "Sending Message..." : "Submit Support Message"}
              </button>
            </form>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
