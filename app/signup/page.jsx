"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signup } from "../../src/API/authService";
import { usersService } from "@/lib/api/usersService";
import Link from "next/link";
import dynamic from "next/dynamic";
const MapPicker = dynamic(() => import("@/components/MapPicker"), {
  ssr: false,
});

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

  // ── Location (OpenStreetMap)
  const [locationOpen, setLocationOpen] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  const [location, setLocation] = useState({
    latitude: 30.0626,
    longitude: 31.3397,
    address: "",
    city: "",
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

      if (location.pinned) {
        try {
          await usersService.setMyLocation(
            location.latitude,
            location.longitude
          );
        } catch (_) { }

        localStorage.setItem(
          "userLocation",
          JSON.stringify({
            lat: location.latitude,
            lng: location.longitude,
            city: location.city,
            address: location.address,
          })
        );
      }

      router.push("/signup-success");
    } catch (err) {
      setErrorMsg(err.message || "Signup failed. Please try again.");
    }
  };

  // ── Browser location (بديل Google)
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.");
      return;
    }

    setGeoLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        setLocation((prev) => ({
          ...prev,
          latitude,
          longitude,
          pinned: true,
        }));

        setGeoLoading(false);
      },
      () => {
        setGeoLoading(false);
        setErrorMsg("Could not retrieve your location. Please allow location access.");
      }
    );
  };

  const clearLocation = () => {
    setLocation({
      latitude: 30.0626,
      longitude: 31.3397,
      address: "",
      city: "",
      pinned: false,
    });
  };

  return (
    <div className="main-wrapper">
      <style>{`
        * { box-sizing: border-box; }

        .main-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #1a0000, #3a0000);
          padding: 24px;
        }

        .container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 90%;
  max-width: 1000px;
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
}

/* LEFT SIDE */
.left {
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: linear-gradient(135deg, rgba(212, 43, 43, 0.8), rgba(58, 0, 0, 0.95)),
              url("/signup-car-bg.png");
  background-size: cover;
  background-position: center;
  color: white;
}

/* RIGHT SIDE */
.right {
  padding: 40px;
}
        .form { display: flex; flex-direction: column; gap: 12px; }

        input {
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 10px;
        }

        .btn {
          padding: 14px;
          background: #d42b2b;
          color: #fff;
          border: none;
          border-radius: 10px;
          cursor: pointer;
        }

        .loc-box {
          border: 1px dashed #d42b2b;
          padding: 12px;
          border-radius: 10px;
          cursor: pointer;
          margin-top: 10px;
        }

        .map-box {
          margin-top: 10px;
          border-radius: 12px;
          overflow: hidden;
        }
      `}</style>

<div className="container">

  {/* LEFT SIDE */}
  <div className="left">
    <h1 className="logo-title" style={{ fontSize: "3.5rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-1.5px", margin: 0, lineHeight: 1 }}>Autoria</h1>
    <p style={{ fontSize: "1.15rem", fontWeight: 300, opacity: 0.9, marginTop: "12px", letterSpacing: "0.5px" }}>Expert Car Care, Simplified.</p>
  </div>

  {/* RIGHT SIDE */}
  <div className="right">

    <h2>Create Account</h2>

    <form className="form" onSubmit={handleSubmit}>
      
      <input name="name" placeholder="Full Name" onChange={handleChange} />
      {errors.name && <p>{errors.name}</p>}

      <input name="email" placeholder="Email" onChange={handleChange} />
      {errors.email && <p>{errors.email}</p>}

      <input name="phone" placeholder="Phone" onChange={handleChange} />
      {errors.phone && <p>{errors.phone}</p>}

      <input
        name="password"
        type={showPw ? "text" : "password"}
        placeholder="Password"
        onChange={handleChange}
      />
      {errors.password && <p>{errors.password}</p>}

      <input
        name="confirmPassword"
        type="password"
        placeholder="Confirm Password"
        onChange={handleChange}
      />
      {errors.confirmPassword && <p>{errors.confirmPassword}</p>}

      {/* Location Toggle */}
      <div
        className="loc-box"
        onClick={() => setLocationOpen(!locationOpen)}
      >
        📍 Add My Location (Optional)
      </div>

      {/* MAP */}
      {locationOpen && (
        <div className="map-box">
          <button type="button" onClick={handleUseMyLocation}>
            {geoLoading ? "Locating..." : "Use My Location"}
          </button>

          <MapPicker location={location} setLocation={setLocation} />

          <p>
            Lat: {location.latitude.toFixed(5)} | Lng: {location.longitude.toFixed(5)}
          </p>

          {location.pinned && (
            <button type="button" onClick={clearLocation}>
              Clear
            </button>
          )}
        </div>
      )}

      {errorMsg && (
        <div style={{
          background: "#FEF2F2",
          border: "1px solid #FCA5A5",
          borderRadius: "8px",
          padding: "12px 16px",
          color: "#DC2626",
          fontSize: "14px",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
          ⚠️ {errorMsg}
        </div>
      )}

      <button className="btn" type="submit">
        Sign Up
      </button>

      <Link href="/login">Already have account?</Link>

    </form>

  </div>
</div>
</div>
  );
}
  
