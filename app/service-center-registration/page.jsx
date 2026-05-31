"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { serviceCentersService } from "@/lib/api/serviceCentersService";
import { getMe } from "@/lib/api/usersService";
import { clearAuthTokens } from "@/lib/api/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const EGYPT_GOVERNORATES = [
  "Cairo", "Giza", "Alexandria", "Qalyubia", "Dakahlia",
  "Gharbia", "Suez", "Port Said", "Sharqia", "Beheira", "Asyut", "Sohag",
];

const digitsOnly = (value, maxLen) =>
  value.replace(/\D/g, "").slice(0, maxLen);

const WEEK_DAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday",
];

const DEFAULT_OPERATING_HOURS = WEEK_DAYS.map((day) => ({
  day,
  openTime: "09:00",
  closeTime: "22:00",
  isClosed: false,
}));

// Google Maps API key — replace with your own production key
const GOOGLE_MAPS_API_KEY = "AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8";

export default function ServiceCenterRegistration() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  const [existingStatus, setExistingStatus] = useState(null); // null = no SC, "Draft", "Pending", etc.
  const [isDraft, setIsDraft] = useState(false); // true if user already has a Draft SC

  // Lookups
  const [availableServices, setAvailableServices] = useState([]);
  const [availableBrands, setAvailableBrands] = useState([]);

  // Google Maps refs
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const [form, setForm] = useState({
    // Step 1 — Business Profile
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    yearEstablished: new Date().getFullYear(),
    description: "",
    numServiceBays: 4,
    type: 0,
    commercialRegNo: "",
    taxCardNo: "",
    ownerNationalId: "",
    // Step 2 — Location
    latitude: 30.0626,
    longitude: 31.3397,
    governorate: "Cairo",
    district: "",
    address: "",
  });

  const [docFiles, setDocFiles] = useState({
    commercialReg: null,
    taxCard: null,
    nationalId: null,
    workshopPhotos: [],
  });

  const [errors, setErrors] = useState({});

  // ─── Auth & Lookups ──────────────────────────────────────────
  useEffect(() => {
    async function initPage() {
      if (typeof window === "undefined" || !localStorage.getItem("token")) {
        router.push("/login");
        return;
      }
      try {
        const res = await getMe();
        if (res?.data?.fullName) {
          setUser({ name: res.data.fullName });
        }
        setAuthChecked(true);
      } catch {
        clearAuthTokens();
        router.push("/login");
        return;
      }

      // Check if user already has a service center
      try {
        const myScRes = await serviceCentersService.getMyIfExists();
        if (myScRes?.data) {
          const status = myScRes.data.approvalStatus;
          // ApprovalStatus enum: 0=Draft, 1=Pending, 2=UnderReview, 3=Approved, 4=Rejected
          const statusName = ["Draft", "Pending", "UnderReview", "Approved", "Rejected"][status] || String(status);
          setExistingStatus(statusName);
          if (statusName === "Draft") {
            setIsDraft(true);
          }
        }
      } catch (err) {
        // No existing service center — that's fine, user can create one
        console.log("No existing service center found.");
      }

      // Fetch dynamic lookup items from DB
      try {
        const [servicesRes, brandsRes] = await Promise.all([
          serviceCentersService.getServiceTypes(),
          serviceCentersService.getCarBrands(),
        ]);
        if (servicesRes?.data) setAvailableServices(servicesRes.data);
        if (brandsRes?.data) setAvailableBrands(brandsRes.data);
      } catch (err) {
        console.warn("Could not load lookups:", err.message);
      }
    }
    initPage();
  }, [router]);

  // ─── Google Maps Script Loader ───────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined" || currentStep !== 2) return;
    if (window.google?.maps) {
      setMapLoaded(true);
      return;
    }
    if (document.getElementById("google-maps-script")) {
      // script already loading, wait for callback
      return;
    }

    window.__initGoogleMaps = () => setMapLoaded(true);

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=__initGoogleMaps`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, [currentStep]);

  // ─── Initialize Google Map ───────────────────────────────────
  const initMap = useCallback(() => {
    if (!mapRef.current || !window.google?.maps) return;
    if (mapInstanceRef.current) return; // already init'd

    const center = { lat: form.latitude, lng: form.longitude };

    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] },
      ],
    });

    const marker = new window.google.maps.Marker({
      position: center,
      map,
      draggable: true,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: "#E8272A",
        fillOpacity: 1,
        strokeColor: "#fff",
        strokeWeight: 3,
      },
    });

    marker.addListener("dragend", () => {
      const pos = marker.getPosition();
      setForm((prev) => ({
        ...prev,
        latitude: parseFloat(pos.lat().toFixed(6)),
        longitude: parseFloat(pos.lng().toFixed(6)),
      }));
    });

    map.addListener("click", (e) => {
      const pos = e.latLng;
      marker.setPosition(pos);
      setForm((prev) => ({
        ...prev,
        latitude: parseFloat(pos.lat().toFixed(6)),
        longitude: parseFloat(pos.lng().toFixed(6)),
      }));
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;
  }, [form.latitude, form.longitude]);

  useEffect(() => {
    if (mapLoaded && currentStep === 2) {
      // Small delay to ensure the container is rendered
      setTimeout(initMap, 100);
    }
  }, [mapLoaded, currentStep, initMap]);

  // Clean up map when leaving step 2
  useEffect(() => {
    if (currentStep !== 2) {
      mapInstanceRef.current = null;
      markerRef.current = null;
    }
  }, [currentStep]);

  // ─── Validation ──────────────────────────────────────────────
  const validateStep = (step) => {
    const errs = {};
    if (step === 1) {
      if (!form.businessName.trim()) errs.businessName = "Business name is required";
      if (!form.ownerName.trim()) errs.ownerName = "Owner's full name is required";
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        errs.email = "Valid email is required";
      const phone = form.phone.replace(/[\s-]/g, "");
      if (!phone || !/^01[0125][0-9]{8}$/.test(phone))
        errs.phone = "Must be a valid Egyptian mobile number (e.g. 01xxxxxxxxx)";
      if (form.commercialRegNo.length !== 7)
        errs.commercialRegNo = "Commercial registration number must be exactly 7 digits";
      if (form.taxCardNo.length !== 9)
        errs.taxCardNo = "Tax card number must be exactly 9 digits";
      if (form.ownerNationalId.length !== 14)
        errs.ownerNationalId = "Owner national ID must be exactly 14 digits";
    }
    if (step === 2) {
      if (!form.district.trim()) errs.district = "District is required";
      if (!form.address.trim()) errs.address = "Detailed street address is required";
    }
    if (step === 3) {
      if (!docFiles.commercialReg || !docFiles.taxCard || !docFiles.nationalId)
        errs.documents = "Please upload all three official documents";
    }
    return errs;
  };

  const handleNext = () => {
    const errs = validateStep(currentStep);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep((s) => s - 1);
  };

  // ─── Submit ──────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateStep(3);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setErrors({});

    try {
      const createPayload = {
        name: form.businessName.trim(),
        phone: form.phone.replace(/[\s-]/g, ""),
        businessEmail: form.email.trim(),
        yearEstablished: parseInt(form.yearEstablished, 10) || new Date().getFullYear(),
        description: form.description.trim() || "General auto service specialized workshop",
        commercialRegNo: form.commercialRegNo,
        taxCardNo: form.taxCardNo,
        ownerNationalId: form.ownerNationalId,
        ownerFullName: form.ownerName.trim(),
        numServiceBays: Number(form.numServiceBays) || 1,
        type: form.type,
        latitude: Number(form.latitude) || 30.0626,
        longitude: Number(form.longitude) || 31.3397,
        governorate: form.governorate || "Cairo",
        district: form.district.trim() || "N/A",
        streetAddress: form.address.trim() || "N/A",
      };

      // Step 1: Create or skip if already exists as draft
      if (!isDraft) {
        // Fresh creation
        await serviceCentersService.create(createPayload);
        // After creation, the SC is in Draft status and user role becomes ServiceCenterOwner
      }
      // If isDraft, SC already exists in Draft — we skip create and proceed to uploads

      // Step 2: Upload documents (only works in Draft status)
      await serviceCentersService.uploadDocuments({
        commercialReg: docFiles.commercialReg,
        taxCard: docFiles.taxCard,
        nationalId: docFiles.nationalId,
      });

      // Step 3: Update operating hours
      await serviceCentersService.updateOperatingHours(DEFAULT_OPERATING_HOURS);

      // Step 4: Update service types if any available
      if (availableServices.length > 0) {
        const serviceIds = availableServices.map((s) => s.id);
        await serviceCentersService.updateServiceTypes(serviceIds);
      }

      // Step 5: Update car brands if any available
      if (availableBrands.length > 0) {
        const brandIds = availableBrands.map((b) => b.id);
        await serviceCentersService.updateCarBrands(brandIds);
      }

      // Step 6: Upload workshop photos
      if (docFiles.workshopPhotos?.length) {
        const photosFormData = serviceCentersService.buildPhotosFormData(docFiles.workshopPhotos);
        await serviceCentersService.uploadPhotos(photosFormData);
      }

      // Step 7: Submit registration (changes status from Draft → Pending)
      await serviceCentersService.submitRegistration();

      setCurrentStep(4); // success screen
    } catch (err) {
      const apiErrors = err?.errors;
      const message =
        Array.isArray(apiErrors) && apiErrors.length
          ? apiErrors.join(" • ")
          : err.message || "Registration failed. Please try again.";
      setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { n: 1, label: "Profile" },
    { n: 2, label: "Location" },
    { n: 3, label: "Documents" },
  ];

  // ─── Loading state ───────────────────────────────────────────
  if (!authChecked) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC", color: "#64748B" }}>
        Loading...
      </div>
    );
  }

  // ─── Already submitted / not draft ───────────────────────────
  if (existingStatus && existingStatus !== "Draft") {
    const statusMessages = {
      Pending: { icon: "⏳", title: "Application already submitted", desc: "Your service center registration is currently under review by our audit team. This usually takes 24 to 48 hours.", color: "#F59E0B" },
      UnderReview: { icon: "🔍", title: "Application under review", desc: "Our team is actively reviewing your service center credentials and documents.", color: "#3B82F6" },
      Approved: { icon: "✅", title: "Service center approved!", desc: "Congratulations! Your service center has been approved and is now live on Autoria.", color: "#10B981" },
      Rejected: { icon: "❌", title: "Application rejected", desc: "Unfortunately your application was rejected. Please contact support for more details.", color: "#EF4444" },
    };
    const info = statusMessages[existingStatus] || statusMessages.Pending;
    return (
      <div className="registration-wrapper" style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <Navbar user={user} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
          <div style={{ background: "#fff", borderRadius: "24px", padding: "48px", maxWidth: "560px", width: "100%", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.04)", border: "1px solid #E2E8F0" }}>
            <div style={{ fontSize: "56px", marginBottom: "20px" }}>{info.icon}</div>
            <h2 style={{ fontSize: "24px", fontWeight: 900, color: "#0F172A", marginBottom: "12px" }}>{info.title}</h2>
            <p style={{ fontSize: "14.5px", color: "#64748B", lineHeight: 1.6, marginBottom: "32px" }}>{info.desc}</p>
            <div style={{ display: "inline-block", padding: "8px 20px", borderRadius: "10px", background: `${info.color}15`, color: info.color, fontWeight: 700, fontSize: "13px", marginBottom: "32px" }}>
              Status: {existingStatus}
            </div>
            <br />
            <button onClick={() => router.push("/")} style={{ background: "#E8272A", color: "#fff", border: "none", borderRadius: "14px", padding: "14px 32px", fontWeight: 800, fontSize: "14.5px", cursor: "pointer", fontFamily: "inherit" }}>
              🏠 Return to homepage
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="registration-wrapper" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .registration-wrapper {
          min-height: 100vh;
          background: #F8FAFC;
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #0F172A;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow-x: hidden;
        }
        .glowing-blob {
          position: absolute;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(232,39,42,0.08) 0%, transparent 70%);
          z-index: 1; pointer-events: none;
        }
        .blob-1 { top: -100px; left: -100px; }
        .blob-2 { bottom: -200px; right: -100px; }
        .container {
          max-width: 800px; width: 100%;
          margin: 0 auto;
          position: relative; z-index: 10;
          padding: 40px 16px 80px;
          flex: 1;
        }
        .stepper-header {
          display: flex; justify-content: space-between;
          margin-bottom: 40px; position: relative;
        }
        .stepper-header::before {
          content: ""; position: absolute;
          top: 25px; left: 5%; right: 5%;
          height: 3px; background: rgba(15,23,42,0.08); z-index: 1;
        }
        .step-progress-bar {
          position: absolute; top: 25px; left: 5%;
          height: 3px; background: #E8272A; z-index: 2;
          transition: width 0.4s cubic-bezier(0.4,0,0.2,1);
        }
        .step-node {
          position: relative; z-index: 3;
          display: flex; flex-direction: column;
          align-items: center; gap: 10px; flex: 1;
        }
        .step-circle {
          width: 50px; height: 50px; border-radius: 50%;
          background: #E2E8F0; border: 2px solid #CBD5E1;
          color: #64748B; display: flex; align-items: center;
          justify-content: center; font-weight: 800; font-size: 16px;
          transition: all 0.3s;
        }
        .step-node.active .step-circle {
          background: #E8272A; border-color: #E8272A; color: #fff;
          box-shadow: 0 0 20px rgba(232,39,42,0.25);
        }
        .step-node.completed .step-circle {
          background: #10B981; border-color: #10B981; color: #fff;
        }
        .step-label {
          font-size: 12px; font-weight: 700; color: #64748B;
          text-transform: uppercase; letter-spacing: 0.5px; transition: color 0.3s;
        }
        .step-node.active .step-label { color: #0F172A; }
        .step-node.completed .step-label { color: #10B981; }

        .glass-card {
          background: #fff; border: 1px solid #E2E8F0;
          border-radius: 24px; padding: 48px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.04);
        }
        .step-title { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; margin-bottom: 12px; }
        .step-desc { font-size: 14.5px; color: #64748B; margin-bottom: 36px; line-height: 1.6; }

        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group.full { grid-column: span 2; }
        .form-label { font-size: 13.5px; font-weight: 700; color: #334155; }
        .form-input {
          padding: 14px 18px; background: #fff;
          border: 1.5px solid #CBD5E1; border-radius: 14px;
          font-size: 14.5px; color: #0F172A; outline: none;
          transition: all 0.25s; font-family: inherit; width: 100%;
        }
        .form-input::placeholder { color: #94A3B8; }
        .form-input:focus { border-color: #E8272A; box-shadow: 0 0 0 4px rgba(232,39,42,0.08); }
        .form-input.has-error { border-color: #EF4444; }
        .error-hint { font-size: 12px; color: #EF4444; font-weight: 700; }

        .actions {
          display: flex; justify-content: space-between; align-items: center;
          margin-top: 48px; padding-top: 24px; border-top: 1px solid #E2E8F0;
        }
        .btn-back {
          padding: 14px 28px; border-radius: 14px; background: transparent;
          border: 1.5px solid #CBD5E1; color: #475569;
          font-size: 14.5px; font-weight: 700; cursor: pointer;
          transition: all 0.2s; font-family: inherit;
        }
        .btn-back:hover { background: #F1F5F9; border-color: #94A3B8; }
        .btn-next {
          padding: 14px 36px; border-radius: 14px; background: #E8272A;
          border: none; color: #fff; font-size: 14.5px; font-weight: 800;
          cursor: pointer; display: flex; align-items: center; gap: 8px;
          transition: all 0.2s; box-shadow: 0 4px 20px rgba(232,39,42,0.25);
          font-family: inherit;
        }
        .btn-next:hover { background: #B81C1F; transform: translateY(-1px); }
        .btn-next:disabled { background: #E2E8F0; color: #94A3B8; cursor: not-allowed; box-shadow: none; transform: none; }

        .upload-row { margin-bottom: 16px; }
        .upload-name { font-size: 12px; color: #10B981; font-weight: 700; margin-top: 4px; display: block; }

        .err-banner {
          background: #FEF2F2; border: 1px solid #FEE2E2; border-radius: 10px;
          color: #B81C1F; font-size: 13px; font-weight: 700;
          padding: 10px 14px; margin-bottom: 16px;
        }

        .success-wrapper { text-align: center; padding: 20px 0; }
        .success-icon {
          width: 80px; height: 80px; background: #ECFDF5;
          border: 2px solid #10B981; color: #10B981; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 36px; margin: 0 auto 24px;
          box-shadow: 0 0 30px rgba(16,185,129,0.15);
        }
        .success-summary {
          background: #F8FAFC; border: 1px solid #E2E8F0;
          border-radius: 16px; padding: 24px; margin: 32px 0; text-align: left;
        }
        .summary-item {
          display: flex; justify-content: space-between;
          padding: 12px 0; border-bottom: 1px solid #E2E8F0; font-size: 14px;
        }
        .summary-item:last-child { border-bottom: none; }
        .summary-label { color: #64748B; font-weight: 600; }
        .summary-val { color: #0F172A; font-weight: 700; }
        .btn-dashboard {
          background: #10B981; color: white; text-decoration: none;
          padding: 14px 32px; border-radius: 14px; font-weight: 800;
          font-size: 14.5px; display: inline-flex; align-items: center;
          gap: 8px; transition: all 0.2s; cursor: pointer; border: none;
          font-family: inherit; box-shadow: 0 4px 20px rgba(16,185,129,0.2);
        }
        .btn-dashboard:hover { background: #059669; transform: translateY(-1px); }

        .map-container {
          width: 100%; height: 350px;
          border-radius: 16px; overflow: hidden;
          border: 1.5px solid #CBD5E1;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.06);
          background: #F1F5F9;
        }
        .map-hint {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 14px; background: rgba(232,39,42,0.06);
          border-radius: 10px; font-size: 12.5px; color: #B81C1F;
          font-weight: 600; margin-top: 10px;
        }

        @media (max-width: 768px) {
          .glass-card { padding: 32px 20px; }
          .form-grid { grid-template-columns: 1fr; }
          .form-group.full { grid-column: span 1; }
          .step-circle { width: 40px; height: 40px; font-size: 14px; }
          .step-label { font-size: 10px; }
        }
      `}</style>

      <div className="glowing-blob blob-1" />
      <div className="glowing-blob blob-2" />

      <Navbar user={user} />

      <div className="container">
        {/* Stepper */}
        {currentStep <= 3 && (
          <div className="stepper-header">
            <div
              className="step-progress-bar"
              style={{ width: `${((currentStep - 1) / 2) * 90}%` }}
            />
            {steps.map((s) => (
              <div
                key={s.n}
                className={`step-node ${currentStep === s.n
                    ? "active"
                    : currentStep > s.n
                      ? "completed"
                      : ""
                  }`}
              >
                <div className="step-circle">
                  {currentStep > s.n ? "✓" : s.n}
                </div>
                <span className="step-label">{s.label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="glass-card">

          {/* ── Step 1: Business Profile ── */}
          {currentStep === 1 && (
            <div>
              <h2 className="step-title">Register your service center</h2>
              <p className="step-desc">
                Fill in your business info and legal numbers to get started on Autoria&apos;s network.
              </p>
              <div className="form-grid">
                <div className="form-group full">
                  <label className="form-label">Service center / workshop name</label>
                  <input
                    className={`form-input${errors.businessName ? " has-error" : ""}`}
                    type="text"
                    placeholder="e.g. ProCare Auto Diagnostics"
                    value={form.businessName}
                    onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  />
                  {errors.businessName && <span className="error-hint">{errors.businessName}</span>}
                </div>

                <div className="form-group full">
                  <label className="form-label">Owner&apos;s full name</label>
                  <input
                    className={`form-input${errors.ownerName ? " has-error" : ""}`}
                    type="text"
                    placeholder="e.g. Mahmoud Ahmed Ali"
                    value={form.ownerName}
                    onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                  />
                  {errors.ownerName && <span className="error-hint">{errors.ownerName}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Business email address</label>
                  <input
                    className={`form-input${errors.email ? " has-error" : ""}`}
                    type="email"
                    placeholder="e.g. care@procare-eg.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                  {errors.email && <span className="error-hint">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Main business phone hotline</label>
                  <input
                    className={`form-input${errors.phone ? " has-error" : ""}`}
                    type="tel"
                    placeholder="e.g. 01012345678"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                  {errors.phone && <span className="error-hint">{errors.phone}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Year established</label>
                  <input
                    className="form-input"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={form.yearEstablished}
                    onChange={(e) => setForm({ ...form, yearEstablished: parseInt(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Number of service bays</label>
                  <input
                    className="form-input"
                    type="number"
                    min="1"
                    placeholder="e.g. 6"
                    value={form.numServiceBays}
                    onChange={(e) => setForm({ ...form, numServiceBays: parseInt(e.target.value) })}
                  />
                </div>

                <div className="form-group full">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input"
                    style={{ minHeight: 90, resize: "vertical" }}
                    placeholder="Describe your center's services and specializations…"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Commercial registry no. (السجل التجاري)</label>
                  <input
                    className={`form-input${errors.commercialRegNo ? " has-error" : ""}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={7}
                    placeholder="7 digits — e.g. 1234567"
                    value={form.commercialRegNo}
                    onChange={(e) => setForm({ ...form, commercialRegNo: digitsOnly(e.target.value, 7) })}
                  />
                  {errors.commercialRegNo && <span className="error-hint">{errors.commercialRegNo}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Tax card ID (البطاقة الضريبية)</label>
                  <input
                    className={`form-input${errors.taxCardNo ? " has-error" : ""}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={9}
                    placeholder="9 digits — e.g. 123456789"
                    value={form.taxCardNo}
                    onChange={(e) => setForm({ ...form, taxCardNo: digitsOnly(e.target.value, 9) })}
                  />
                  {errors.taxCardNo && <span className="error-hint">{errors.taxCardNo}</span>}
                </div>

                <div className="form-group full">
                  <label className="form-label">Owner national ID (الرقم القومي)</label>
                  <input
                    className={`form-input${errors.ownerNationalId ? " has-error" : ""}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={14}
                    placeholder="14 digits — e.g. 29801011234567"
                    value={form.ownerNationalId}
                    onChange={(e) => setForm({ ...form, ownerNationalId: digitsOnly(e.target.value, 14) })}
                  />
                  {errors.ownerNationalId && <span className="error-hint">{errors.ownerNationalId}</span>}
                </div>
              </div>

              <div className="actions" style={{ justifyContent: "flex-end" }}>
                <button className="btn-next" onClick={handleNext}>
                  Next: Location &amp; contact →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Location (Google Maps) ── */}
          {currentStep === 2 && (
            <div>
              <h2 className="step-title">Workshop location details</h2>
              <p className="step-desc">
                Specify exactly where your shop is located so nearby car owners can find you with GPS coordination.
              </p>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Governorate (Egypt)</label>
                  <select
                    className="form-input"
                    value={form.governorate}
                    onChange={(e) => setForm({ ...form, governorate: e.target.value })}
                  >
                    {EGYPT_GOVERNORATES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">District / area</label>
                  <input
                    className={`form-input${errors.district ? " has-error" : ""}`}
                    type="text"
                    placeholder="e.g. Heliopolis, Nasr City, Smouha"
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                  />
                  {errors.district && <span className="error-hint">{errors.district}</span>}
                </div>

                {/* Google Maps Container — lat/lng are set by map click/drag and sent to backend */}
                <div className="form-group full">
                  <label className="form-label">Pin your location on the map</label>
                  <div className="map-container" ref={mapRef}>
                    {!mapLoaded && (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#64748b", fontSize: "14px" }}>
                        Loading Google Maps...
                      </div>
                    )}
                  </div>
                  <div className="map-hint">
                    📍 Click anywhere on the map or drag the red pin to set your exact location
                  </div>
                </div>

                <div className="form-group full">
                  <label className="form-label">Detailed street address</label>
                  <input
                    className={`form-input${errors.address ? " has-error" : ""}`}
                    type="text"
                    placeholder="e.g. 15 Abbas El Akkad St, Nasr City, Cairo"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                  {errors.address && <span className="error-hint">{errors.address}</span>}
                </div>
              </div>

              <div className="actions">
                <button className="btn-back" onClick={handleBack}>← Back</button>
                <button className="btn-next" onClick={handleNext}>
                  Next: Documents →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Documents & Photos ── */}
          {currentStep === 3 && (
            <form onSubmit={handleSubmit}>
              <h2 className="step-title">Legal &amp; security verification</h2>
              <p className="step-desc">
                Upload your Commercial Registry (السجل التجاري), Tax Card (البطاقة الضريبية), and National ID to verify your business.
              </p>

              <div className="form-grid">
                <div className="form-group full">
                  <label className="form-label">Upload documents (PDF or images)</label>
                  <p style={{ fontSize: 12, color: "#64748B", marginBottom: 16 }}>
                    All three files are required before submission.
                  </p>

                  {[
                    { key: "commercialReg", label: "Commercial registry (السجل التجاري)" },
                    { key: "taxCard", label: "Tax card (البطاقة الضريبية)" },
                    { key: "nationalId", label: "Owner national ID (بطاقة الرقم القومي)" },
                  ].map(({ key, label }) => (
                    <div className="upload-row" key={key}>
                      <label className="form-label" style={{ fontSize: 13, marginBottom: 6, display: "block" }}>
                        {label}
                      </label>
                      <input
                        className="form-input"
                        type="file"
                        accept="image/*,.pdf"
                        disabled={loading}
                        style={{ padding: "10px 14px" }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setDocFiles((prev) => ({ ...prev, [key]: file }));
                        }}
                      />
                      {docFiles[key] && (
                        <span className="upload-name">✓ {docFiles[key].name}</span>
                      )}
                    </div>
                  ))}

                  {errors.documents && (
                    <span className="error-hint">{errors.documents}</span>
                  )}
                </div>

                <div className="form-group full">
                  <label className="form-label">Workshop photos (upload at least 3)</label>
                  <input
                    className="form-input"
                    type="file"
                    multiple
                    accept="image/*"
                    disabled={loading}
                    style={{ padding: "10px 14px" }}
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setDocFiles((prev) => ({ ...prev, workshopPhotos: files }));
                    }}
                  />
                  {docFiles.workshopPhotos.length > 0 && (
                    <span className="upload-name">
                      ✓ {docFiles.workshopPhotos.length} photo{docFiles.workshopPhotos.length > 1 ? "s" : ""} selected
                    </span>
                  )}
                </div>
              </div>

              {errors.submit && (
                <div className="err-banner">{errors.submit}</div>
              )}

              <div className="actions">
                <button type="button" className="btn-back" onClick={handleBack} disabled={loading}>
                  ← Back
                </button>
                <button
                  type="submit"
                  className="btn-next"
                  style={{ background: "#10B981", boxShadow: "0 4px 20px rgba(16,185,129,0.25)" }}
                  disabled={loading}
                >
                  {loading ? "Submitting…" : "Submit application ✓"}
                </button>
              </div>
            </form>
          )}

          {/* ── Step 4: Success ── */}
          {currentStep === 4 && (
            <div className="success-wrapper">
              <div className="success-icon">✈</div>
              <h2 className="step-title" style={{ fontSize: 32 }}>Registration submitted!</h2>
              <p className="step-desc" style={{ maxWidth: 520, margin: "12px auto 0" }}>
                Our audit team is verifying your commercial credentials and tax records. This usually takes 24 to 48 hours.
              </p>

              <div className="success-summary">
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", marginBottom: 16, borderBottom: "1px solid #E2E8F0", paddingBottom: 8 }}>
                  Application outline
                </h3>
                <div className="summary-item">
                  <span className="summary-label">Workshop name</span>
                  <span className="summary-val">{form.businessName}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Owner name</span>
                  <span className="summary-val">{form.ownerName}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Location</span>
                  <span className="summary-val">{form.district}, {form.governorate}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Contact email</span>
                  <span className="summary-val">{form.email}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Service bays</span>
                  <span className="summary-val">{form.numServiceBays} lifts (active)</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Audit status</span>
                  <span className="summary-val" style={{ color: "#F59E0B" }}>⏳ Pending review</span>
                </div>
              </div>

              <p style={{ fontSize: 13.5, color: "#64748B", marginBottom: 32 }}>
                A confirmation link has been dispatched to <strong>{form.email}</strong>.
              </p>

              <button className="btn-dashboard" onClick={() => router.push("/")}>
                🏠 Return to homepage
              </button>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </div>
  );
}
