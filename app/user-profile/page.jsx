"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usersService } from "@/lib/api/usersService";

const R = "#E8272A";
const RD = "#B81C1F";

export default function UserProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    role: "",
  });

  const triggerToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  // GET /Users/me
  useEffect(() => {
    usersService
      .getMe()
      .then((res) => {
        const d = res?.data;
        if (d) {
          setForm({
            fullName: d.fullName || "",
            phoneNumber: d.phoneNumber || "",
            email: d.email || "",
            role: d.role || "",
          });
        }
      })
      .catch(() => triggerToast("Could not load your profile", "warning"))
      .finally(() => setLoading(false));
  }, []);

  // PUT /Users/me — only fullName and phoneNumber are editable per API spec
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await usersService.updateMe({
        fullName: form.fullName,
        phoneNumber: form.phoneNumber,
      });
      // Update cached name
      localStorage.setItem("userName", form.fullName);
      triggerToast("Profile updated successfully", "success");
    } catch (err) {
      triggerToast(err?.message || "Failed to save changes", "warning");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* Toast */
        .toast {
          position: fixed; top: 24px; right: 24px;
          background: #fff;
          border-left: 5px solid #10B981;
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
          padding: 16px 24px; border-radius: 12px; z-index: 1000;
          display: flex; align-items: center; gap: 12px;
          transform: translateY(-20px); opacity: 0; visibility: hidden;
          transition: all 0.3s cubic-bezier(0.68, -0.6, 0.32, 1.6);
        }
        .toast.show { transform: translateY(0); opacity: 1; visibility: visible; }
        .toast.success { border-left-color: #10B981; }
        .toast.warning { border-left-color: #F59E0B; }
        .toast.error { border-left-color: ${R}; }

        /* Top Nav */
        .top-nav {
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #E2E8F0;
          height: 68px; padding: 0 5%;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 50;
        }
        .logo { font-size: 22px; font-weight: 900; color: ${R}; text-decoration: none; letter-spacing: -0.5px; }
        .logo span { color: #1E293B; font-weight: 300; }
        .back-link {
          font-size: 13px; font-weight: 700; color: #475569;
          text-decoration: none; border: 1px solid #CBD5E1;
          padding: 8px 16px; border-radius: 9px;
          display: flex; align-items: center; gap: 7px;
          transition: all 0.2s;
        }
        .back-link:hover { background: #F1F5F9; transform: translateY(-1px); }

        /* Hero */
        .hero {
          background: linear-gradient(135deg, #460203 0%, #920406 50%, ${RD} 100%);
          padding: 48px 5%; color: white;
        }
        .hero h1 { font-size: 30px; font-weight: 900; letter-spacing: -0.8px; margin-bottom: 6px; }
        .hero p { font-size: 14px; color: rgba(255,255,255,0.7); }

        /* Card */
        .profile-card {
          max-width: 700px; margin: -28px auto 60px;
          padding: 0 24px; position: relative; z-index: 10;
        }
        .card-inner {
          background: #fff; border-radius: 20px;
          box-shadow: 0 20px 40px rgba(15,23,42,0.07);
          border: 1px solid #E2E8F0; overflow: hidden;
        }

        /* Avatar section */
        .avatar-section {
          padding: 36px 40px 28px;
          border-bottom: 1px solid #F1F5F9;
          display: flex; align-items: center; gap: 24px;
        }
        .avatar-circle {
          width: 80px; height: 80px; border-radius: 50%;
          background: #FEF2F2; border: 3px solid ${R};
          display: flex; align-items: center; justify-content: center;
          font-size: 28px; font-weight: 900; color: ${R};
          flex-shrink: 0;
        }
        .avatar-info h2 { font-size: 20px; font-weight: 800; color: #0F172A; margin-bottom: 4px; }
        .role-badge {
          display: inline-block; padding: 3px 12px;
          background: #FEF2F2; color: ${R};
          border: 1px solid #FCA5A5; border-radius: 20px;
          font-size: 12px; font-weight: 700;
        }

        /* Form */
        .form-section { padding: 36px 40px; }
        .form-section h3 { font-size: 16px; font-weight: 800; color: #0F172A; margin-bottom: 24px; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .form-group { display: flex; flex-direction: column; gap: 7px; }
        .form-group.full { grid-column: span 2; }
        .form-label { font-size: 13px; font-weight: 700; color: #334155; }
        .form-input {
          padding: 12px 15px; border: 1.5px solid #CBD5E1; border-radius: 11px;
          font-size: 14px; font-family: inherit; color: #1E293B; background: #fff;
          outline: none; transition: all 0.2s;
        }
        .form-input:focus { border-color: ${R}; box-shadow: 0 0 0 4px rgba(232,39,42,0.08); }
        .form-input:disabled { background: #F8FAFC; color: #94A3B8; cursor: not-allowed; }
        .read-only-note { font-size: 11px; color: #94A3B8; margin-top: 2px; }

        /* Footer */
        .form-footer {
          padding: 24px 40px; border-top: 1px solid #F1F5F9;
          display: flex; gap: 12px; align-items: center; justify-content: flex-end;
        }
        .btn-save {
          background: ${R}; color: #fff; border: none;
          padding: 12px 32px; border-radius: 11px;
          font-size: 14px; font-weight: 800; cursor: pointer;
          display: flex; align-items: center; gap: 8px;
          transition: all 0.2s; box-shadow: 0 4px 12px rgba(232,39,42,0.25);
        }
        .btn-save:hover { background: ${RD}; transform: translateY(-1px); }
        .btn-save:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .btn-cancel {
          background: #F1F5F9; color: #475569; border: none;
          padding: 12px 24px; border-radius: 11px;
          font-size: 14px; font-weight: 700; cursor: pointer;
          transition: all 0.2s; text-decoration: none;
          display: flex; align-items: center;
        }
        .btn-cancel:hover { background: #E2E8F0; }

        /* Skeleton loader */
        .skeleton {
          background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
        }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        @media (max-width: 600px) {
          .form-grid { grid-template-columns: 1fr; }
          .form-group.full { grid-column: span 1; }
          .avatar-section { flex-direction: column; text-align: center; }
          .form-section, .form-footer { padding: 24px 20px; }
        }
      `}</style>

      {/* Toast */}
      <div className={`toast ${showToast ? "show" : ""} ${toastType}`}>
        <i className={`fa-solid ${toastType === "success" ? "fa-circle-check" : toastType === "warning" ? "fa-triangle-exclamation" : "fa-circle-xmark"}`}
           style={{ color: toastType === "success" ? "#10B981" : toastType === "warning" ? "#F59E0B" : R, fontSize: 18 }} />
        <span style={{ fontSize: 14, fontWeight: 700 }}>{toastMessage}</span>
      </div>

      {/* Nav */}
      <nav className="top-nav">
        <Link href="/" className="logo">AUTO<span>RIA</span></Link>
        <Link href="/" className="back-link">
          <i className="fa-solid fa-arrow-left" /> Home
        </Link>
      </nav>

      {/* Hero */}
      <section className="hero">
        <h1>My Profile</h1>
        <p>Manage your personal information and account settings.</p>
      </section>

      {/* Profile Card */}
      <div className="profile-card">
        <div className="card-inner">

          {/* Avatar */}
          <div className="avatar-section">
            {loading ? (
              <>
                <div className="skeleton" style={{ width: 80, height: 80, borderRadius: "50%" }} />
                <div>
                  <div className="skeleton" style={{ width: 180, height: 22, marginBottom: 10 }} />
                  <div className="skeleton" style={{ width: 80, height: 18, borderRadius: 20 }} />
                </div>
              </>
            ) : (
              <>
                <div className="avatar-circle">
                  {form.fullName ? form.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U"}
                </div>
                <div className="avatar-info">
                  <h2>{form.fullName || "User"}</h2>
                  <span className="role-badge">{form.role || "User"}</span>
                </div>
              </>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSave}>
            <div className="form-section">
              <h3>Edit Personal Information</h3>

              {loading ? (
                <div className="form-grid">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="form-group">
                      <div className="skeleton" style={{ height: 14, width: 80, marginBottom: 4 }} />
                      <div className="skeleton" style={{ height: 44 }} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="form-grid">
                  <div className="form-group full">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={form.phoneNumber}
                      onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                      placeholder="e.g. 01012345678"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      value={form.email}
                      disabled
                    />
                    <span className="read-only-note">Email cannot be changed here.</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Account Role</label>
                    <input
                      type="text"
                      className="form-input"
                      value={form.role}
                      disabled
                    />
                    <span className="read-only-note">Role is managed by the system.</span>
                  </div>
                </div>
              )}
            </div>

            <div className="form-footer">
              <Link href="/" className="btn-cancel">Cancel</Link>
              <button type="submit" className="btn-save" disabled={saving || loading}>
                {saving ? (
                  <><i className="fa-solid fa-spinner fa-spin" /> Saving...</>
                ) : (
                  <><i className="fa-solid fa-floppy-disk" /> Save Changes</>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
