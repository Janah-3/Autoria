"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signup } from "../../src/API/authService";
import { usersService } from "@/lib/api/usersService";
import Link from "next/link";

const R = "#E8272A";
const RD = "#B81C1F";

const validatePasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*()]/.test(password)) score++;
  return score;
};

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [strength, setStrength] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [showVerifyPopup, setShowVerifyPopup] = useState(false);

  // ── AI Support Style Location Selection
  const [geoLoading, setGeoLoading] = useState(false);
  const [location, setLocation] = useState({
    latitude: "",
    longitude: "",
    pinned: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "password") setStrength(validatePasswordStrength(value));
  };

  const validate = () => {
    const err = {};
    if (!formData.name) err.name = "Full Name is required";
    if (!formData.email) err.email = "Email is required";
    if (!formData.phone) err.phone = "Phone number is required";
    if (strength < 3) err.password = "Password is too weak";
    if (formData.password !== formData.confirmPassword)
      err.confirmPassword = "Passwords do not match";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await signup(formData);

      if (location.pinned && location.latitude && location.longitude) {
        try {
          await usersService.setMyLocation(
            parseFloat(location.latitude),
            parseFloat(location.longitude)
          );
        } catch (_) { }

        localStorage.setItem(
          "userLocation",
          JSON.stringify({
            lat: parseFloat(location.latitude),
            lng: parseFloat(location.longitude),
            city: "",
            address: "",
          })
        );
      }

      // Show the verification email instruction popup
      setShowVerifyPopup(true);
    } catch (err) {
      setErrorMsg(err.message || "Signup failed. Please try again.");
    }
  };

  const handleGetLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.");
      return;
    }

    setGeoLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);

        setLocation({
          latitude: lat,
          longitude: lng,
          pinned: true,
        });
        setGeoLoading(false);
      },
      (error) => {
        setGeoLoading(false);
        setErrorMsg("Could not retrieve your location. Please check permissions.");
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  return (
    <div className="main-wrapper">
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .main-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: #ffffff;
          padding: 24px;
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .container {
          display: grid;
          grid-template-columns: 1.1fr 1.2fr;
          width: 95%;
          max-width: 1000px;
          background: #fff;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.06);
          border: 1px solid #E2E8F0;
        }

        /* LEFT SIDE */
        .left {
          padding: 48px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: linear-gradient(135deg, rgba(212, 43, 43, 0.85), rgba(58, 0, 0, 0.96)),
                      url("/signup-car-bg.png");
          background-size: cover;
          background-position: center;
          color: white;
        }

        /* RIGHT SIDE */
        .right {
          padding: 48px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: #ffffff;
        }

        .form-title {
          font-size: 28px;
          font-weight: 800;
          color: #0F172A;
          margin-bottom: 24px;
          letter-spacing: -0.5px;
        }

        .form { display: flex; flex-direction: column; gap: 16px; }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label {
          font-size: 13px;
          font-weight: 700;
          color: #334155;
        }

        .form-input {
          padding: 12px 15px;
          border: 1.5px solid #CBD5E1;
          border-radius: 11px;
          font-size: 14px;
          color: #1E293B;
          background: #fff;
          outline: none;
          transition: all 0.2s;
        }

        .form-input:focus {
          border-color: ${R};
          box-shadow: 0 0 0 4px rgba(232,39,42,0.08);
        }

        .error-text {
          font-size: 11px;
          color: ${R};
          font-weight: 600;
          margin-top: 2px;
        }

        .btn-submit {
          padding: 14px;
          background: ${R};
          color: #fff;
          border: none;
          border-radius: 11px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(232,39,42,0.2);
          margin-top: 10px;
        }

        .btn-submit:hover {
          background: ${RD};
          transform: translateY(-1px);
        }

        .login-link {
          text-align: center;
          margin-top: 16px;
          font-size: 13px;
          color: #64748B;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s;
        }

        .login-link span {
          color: ${R};
        }

        .login-link:hover span {
          text-decoration: underline;
        }

        /* Location Layout - AI Support style */
        .ai-loc-wrapper {
          display: flex;
          gap: 12px;
          align-items: flex-end;
          margin-top: 6px;
        }

        .ai-loc-field {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .ai-loc-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 45px;
          padding: 0 16px;
          background: #F1F5F9;
          color: #475569;
          border: 1.5px solid #CBD5E1;
          border-radius: 11px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .ai-loc-btn:hover {
          background: #E2E8F0;
        }

        .ai-loc-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .geo-spin {
          width: 13px;
          height: 13px;
          border: 2px solid #475569;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @media (max-width: 768px) {
          .container { grid-template-columns: 1fr; }
          .left { display: none; }
          .right { padding: 32px 24px; }
          .ai-loc-wrapper { flex-direction: column; align-items: stretch; }
          .ai-loc-btn { height: 42px; }
        }
      `}</style>

      <div className="container">
        {/* LEFT SIDE */}
        <div className="left">
          <h1 style={{ fontSize: "3.5rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-1.5px", margin: 0, lineHeight: 1 }}>Autoria</h1>
          <p style={{ fontSize: "1.15rem", fontWeight: 300, opacity: 0.9, marginTop: "12px", letterSpacing: "0.5px" }}>Expert Car Care, Simplified.</p>
        </div>

        {/* RIGHT SIDE */}
        <div className="right">
          <h2 className="form-title">Create Account</h2>

          <form className="form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                name="name"
                type="text"
                className="form-input"
                placeholder="Ahmed Ali"
                onChange={handleChange}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                name="email"
                type="email"
                className="form-input"
                placeholder="ahmed@example.com"
                onChange={handleChange}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                name="phone"
                type="tel"
                className="form-input"
                placeholder="01012345678"
                onChange={handleChange}
              />
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                name="password"
                type={showPw ? "text" : "password"}
                className="form-input"
                placeholder="Min 8 characters"
                onChange={handleChange}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                className="form-input"
                placeholder="Repeat password"
                onChange={handleChange}
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>

            {/* Location Section - AI Support Style */}
            <div className="form-group" style={{ marginTop: 4 }}>
              <label className="form-label">📍 Pin Location (Optional)</label>
              <div className="ai-loc-wrapper">
                <div className="ai-loc-field">
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", marginBottom: 2 }}>Latitude</span>
                  <input
                    type="text"
                    className="form-input"
                    style={{ padding: "10px 12px", fontSize: "13px" }}
                    placeholder="e.g. 30.0626"
                    value={location.latitude}
                    onChange={(e) => setLocation({ ...location, latitude: e.target.value, pinned: true })}
                  />
                </div>
                <div className="ai-loc-field">
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", marginBottom: 2 }}>Longitude</span>
                  <input
                    type="text"
                    className="form-input"
                    style={{ padding: "10px 12px", fontSize: "13px" }}
                    placeholder="e.g. 31.3397"
                    value={location.longitude}
                    onChange={(e) => setLocation({ ...location, longitude: e.target.value, pinned: true })}
                  />
                </div>
                <button
                  type="button"
                  className="ai-loc-btn"
                  onClick={handleGetLocation}
                  disabled={geoLoading}
                >
                  {geoLoading ? (
                    <><div className="geo-spin" /> Locating...</>
                  ) : (
                    <><i className="fa-solid fa-location-crosshairs" style={{ color: R }}></i> Get Location</>
                  )}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div style={{
                background: "#FEF2F2",
                border: "1.5px solid #FCA5A5",
                borderRadius: "11px",
                padding: "12px 16px",
                color: "#DC2626",
                fontSize: "13px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: 8,
              }}>
                ⚠️ {errorMsg}
              </div>
            )}

            <button className="btn-submit" type="submit">
              Sign Up
            </button>

            <Link href="/login" className="login-link">
              Already have an account? <span>Login</span>
            </Link>
          </form>
        </div>
      </div>

      {/* Verification Dialog Popup */}
      {showVerifyPopup && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999, padding: "24px"
        }}>
          <div style={{
            background: "#fff", borderRadius: "24px", width: "100%", maxWidth: "440px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)", padding: "40px 32px", textAlign: "center"
          }}>
            <div style={{
              width: "80px", height: "80px", borderRadius: "50%", background: "#FEF2F2",
              border: `2px solid ${R}`, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "36px", color: R, margin: "0 auto 24px"
            }}>
              ✉️
            </div>
            <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#0F172A", marginBottom: "12px" }}>
              Verify Your Email!
            </h3>
            <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.6, marginBottom: "32px" }}>
              We have sent a verification link to your email address. Please check your email (and spam folder) to verify your account and complete your signup.
            </p>
            <button
              onClick={() => {
                setShowVerifyPopup(false);
                router.push("/login");
              }}
              style={{
                width: "100%", padding: "14px", background: R, color: "#fff", border: "none",
                borderRadius: "11px", fontSize: "14px", fontWeight: 800, cursor: "pointer",
                boxShadow: `0 4px 12px rgba(232,39,42,0.2)`
              }}
            >
              Got it, Go to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
