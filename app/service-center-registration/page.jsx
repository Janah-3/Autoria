"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { serviceCentersService } from "@/lib/api/serviceCentersService";
import { lookupsService } from "@/lib/api/lookupsService";
import { getMe } from "@/lib/api/usersService";
import { clearAuthTokens } from "@/lib/api/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ─── Constants ───────────────────────────────────────────────────────────────

const EGYPT_GOVERNORATES = [
  "Cairo","Giza","Alexandria","Qalyubia","Dakahlia","Gharbia",
  "Suez","Port Said","Sharqia","Beheira","Asyut","Sohag",
  "Luxor","Aswan","Minya","Beni Suef","Fayoum","Ismailia",
  "Kafr El Sheikh","Monufia","New Valley","North Sinai","South Sinai",
  "Matruh","Red Sea","Damietta",
];

const DAY_MAP = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

// DayOfWeek enum matches C# DayOfWeek: Sunday=0 … Saturday=6
const WEEK_DAYS = [
  { label: "Sunday", value: 0 },
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
];

const DEFAULT_OPERATING_HOURS = WEEK_DAYS.map(({ label, value }) => ({
  dayLabel: label,
  day: value,
  openTime: "09:00:00",
  closeTime: "17:00:00",
  isClosed: value === 0,
}));

const digitsOnly = (v, max) => v.replace(/\D/g, "").slice(0, max);

const GOOGLE_MAPS_API_KEY = "AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8";

const STEPS = [
  { n: 1, label: "Business Info" },
  { n: 2, label: "Location"      },
  { n: 3, label: "Documents"     },
  { n: 4, label: "Services"      },
  { n: 5, label: "Hours"         },
  { n: 6, label: "Photos"        },
];

const STATUS_INFO = {
  Pending:     { icon: "⏳", title: "Application submitted",   desc: "Your registration is under review by our audit team. This usually takes 24–48 hours.", color: "#F59E0B" },
  UnderReview: { icon: "🔍", title: "Application under review", desc: "Our team is actively reviewing your credentials and documents.",                        color: "#3B82F6" },
  Approved:    { icon: "✅", title: "Service center approved!", desc: "Congratulations! Your service center is now live on Autoria.",                            color: "#10B981" },
  Rejected:    { icon: "❌", title: "Application rejected",    desc: "Unfortunately your application was rejected. Please contact support for more details.",    color: "#EF4444" },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function ServiceCenterRegistration() {
  const router = useRouter();

  const [currentStep,    setCurrentStep]    = useState(1);
  const [loading,        setLoading]        = useState(false);
  const [authChecked,    setAuthChecked]    = useState(false);
  const [user,           setUser]           = useState(null);
  const [existingStatus, setExistingStatus] = useState(null);
  const [isDraft,        setIsDraft]        = useState(false);
  const [errors,         setErrors]         = useState({});

  // Lookups
  const [availableServices, setAvailableServices] = useState([]);
  const [availableBrands,   setAvailableBrands]   = useState([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [selectedBrandIds,   setSelectedBrandIds]   = useState([]);

  // Operating hours state
  const [operatingHours, setOperatingHours] = useState(DEFAULT_OPERATING_HOURS);

  // Google Maps
  const mapRef         = useRef(null);
  const markerRef      = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Step 1 — Business Info (no location fields here)
  const [basicInfo, setBasicInfo] = useState({
    name:            "",
    ownerFullName:   "",
    businessEmail:   "",
    phone:           "",
    yearEstablished: new Date().getFullYear(),
    description:     "",
    numServiceBays:  4,
    type:            0,
    commercialRegNo: "",
    taxCardNo:       "",
    ownerNationalId: "",
  });

  // Step 2 — Location (separate API call)
  const [location, setLocation] = useState({
    latitude:    30.0626,
    longitude:   31.3397,
    governorate: "Cairo",
    district:    "",
    address:     "",
  });

  // Step 3 — Documents
  const [docFiles, setDocFiles] = useState({
    commercialReg: null,
    taxCard:       null,
    nationalId:    null,
  });

  // Step 6 — Photos
  const [photos, setPhotos] = useState([]);

  // ─── Auth & Lookups ─────────────────────────────────────────────────────────
 useEffect(() => {
  async function init() {
    if (typeof window === "undefined" || !localStorage.getItem("token")) {
      router.push("/login");
      return;
    }

    // Auth check
    try {
      const res = await getMe();
      if (res?.data?.fullName) setUser({ name: res.data.fullName });
      setAuthChecked(true);
    } catch {
      clearAuthTokens();
      router.push("/login");
      return;
    }

    // Existing service center check
    try {
      const myScRes = await serviceCentersService.getMyIfExists();
      if (myScRes?.data) {
        const status = myScRes.data.approvalStatus;
        const statusName =
          typeof status === "number"
            ? (["Draft","Pending","UnderReview","Approved","Rejected"][status] ?? String(status))
            : String(status);
        setExistingStatus(statusName);
        if (statusName === "Draft") setIsDraft(true);
      }
    } catch {
      // No existing SC — fine
    }

    // Lookups — completely independent, never block or throw
    lookupsService.getServiceTypes()
  .then(res => {
    console.log("service types from API:", res);
    if (res?.data) setAvailableServices(res.data);
  })
  .catch(e => console.warn("Could not load service types:", e.message));
    lookupsService.getCarBrands()
      .then(res => { if (res?.data) setAvailableBrands(res.data); })
      .catch(e => console.warn("Could not load car brands:", e.message));
  }

  init();
}, [router]);
  // ─── Google Maps Loader ─────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined" || currentStep !== 2) return;
    if (window.google?.maps) { setMapLoaded(true); return; }

    window.__initGoogleMaps = () => setMapLoaded(true);
    let s = document.getElementById("gmap-script");
    if (!s) {
      s = document.createElement("script");
      s.id = "gmap-script";
      s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=__initGoogleMaps`;
      s.async = true;
      s.defer = true;
      document.head.appendChild(s);
    }

    const handleLoad = () => setMapLoaded(true);
    s.addEventListener("load", handleLoad);
    return () => {
      s.removeEventListener("load", handleLoad);
    };
  }, [currentStep]);

  const initMap = useCallback(() => {
    if (!mapRef.current || !window.google?.maps || mapInstanceRef.current) return;
    const center = { lat: location.latitude, lng: location.longitude };
    const map = new window.google.maps.Map(mapRef.current, {
      center, zoom: 13,
      mapTypeControl: false, streetViewControl: false, fullscreenControl: false,
    });
    const marker = new window.google.maps.Marker({
      position: center, map, draggable: true,
      icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 12, fillColor: "#E8272A", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 3 },
    });
    const update = (pos) => setLocation(prev => ({
      ...prev,
      latitude:  parseFloat(pos.lat().toFixed(6)),
      longitude: parseFloat(pos.lng().toFixed(6)),
    }));
    marker.addListener("dragend", () => update(marker.getPosition()));
    map.addListener("click", (e) => { marker.setPosition(e.latLng); update(e.latLng); });
    mapInstanceRef.current = map;
    markerRef.current = marker;
  }, [location.latitude, location.longitude]);

  useEffect(() => {
    if (mapLoaded && currentStep === 2) setTimeout(initMap, 100);
  }, [mapLoaded, currentStep, initMap]);

  useEffect(() => {
    if (currentStep !== 2) { mapInstanceRef.current = null; markerRef.current = null; }
  }, [currentStep]);

  // ─── Validation ─────────────────────────────────────────────────────────────
  const validate = (step) => {
    const e = {};
    if (step === 1) {
      if (!basicInfo.name.trim())          e.name          = "Business name is required";
      if (!basicInfo.ownerFullName.trim()) e.ownerFullName = "Owner full name is required";
      if (!basicInfo.businessEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(basicInfo.businessEmail))
                                           e.businessEmail = "Valid email is required";
      const ph = basicInfo.phone.replace(/[\s-]/g, "");
      if (!ph || !/^01[0125][0-9]{8}$/.test(ph))
                                           e.phone         = "Must be a valid Egyptian mobile number";
      if (basicInfo.commercialRegNo.length !== 7)  e.commercialRegNo = "Must be exactly 7 digits";
      if (basicInfo.taxCardNo.length !== 9)        e.taxCardNo       = "Must be exactly 9 digits";
      if (basicInfo.ownerNationalId.length !== 14) e.ownerNationalId = "Must be exactly 14 digits";
    }
    if (step === 2) {
      if (!location.district.trim()) e.district = "District is required";
      if (!location.address.trim())  e.address  = "Street address is required";
    }
    if (step === 3) {
      if (selectedServiceIds.size === 0)
        errs.services = "Please select at least one service type";
      if (selectedBrandIds.size === 0)
        errs.brands = "Please select at least one car brand";
    }
    if (step === 4) {
      if (!docFiles.commercialReg || !docFiles.taxCard || !docFiles.nationalId)
        e.documents = "All three documents are required";
    }
    if (step === 4) {
      if (selectedServiceIds.length === 0) e.serviceTypes = "Select at least one service type";
      if (selectedBrandIds.length === 0)   e.carBrands    = "Select at least one car brand";
    }
    if (step === 6) {
      if (photos.length < 3) e.photos = "At least 3 photos are required";
    }
    return e;
  };

  const handleNext = () => {
    const errs = validate(currentStep);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setCurrentStep(s => s + 1);
  };

  const handleBack = () => { setErrors({}); setCurrentStep(s => s - 1); };

  // ─── Submit — calls all backend steps in sequence ────────────────────────────
  const handleSubmit = async () => {
    const errs = validate(6);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setErrors({});

    try {
      // ── Step 1: Create service center (basic info only, no location) ──────────
      if (!isDraft) {
        await serviceCentersService.create({
          name:            basicInfo.name.trim(),
          phone:           basicInfo.phone.replace(/[\s-]/g, ""),
          businessEmail:   basicInfo.businessEmail.trim(),
          yearEstablished: Number(basicInfo.yearEstablished),
          description:     basicInfo.description.trim() || "General auto service",
          commercialRegNo: basicInfo.commercialRegNo,
          taxCardNo:       basicInfo.taxCardNo,
          ownerNationalId: basicInfo.ownerNationalId,
          ownerFullName:   basicInfo.ownerFullName.trim(),
          numServiceBays:  Number(basicInfo.numServiceBays),
          type:            Number(basicInfo.type),
        });
      }

      // ── Step 2: Set location ──────────────────────────────────────────────────
      await serviceCentersService.setMyLocation({
       latitude:    location.latitude,
    longitude:   location.longitude,
    governorate: location.governorate,
    district:    location.district,
    address:     location.address,
      });

      // ── Step 3: Upload documents ──────────────────────────────────────────────
      const docsFormData = new FormData();
      docsFormData.append("CommercialRegFile", docFiles.commercialReg);
      docsFormData.append("TaxCardFile",       docFiles.taxCard);
      docsFormData.append("OwnerNationalIdFile", docFiles.nationalId);
      await serviceCentersService.uploadDocuments(docsFormData);

      // ── Step 4: Service types & car brands ────────────────────────────────────
     await serviceCentersService.updateServiceTypes(selectedServiceIds);
     await serviceCentersService.updateCarBrands(selectedBrandIds);

    // ── Step 5: Operating hours ───────────────────────────────────────────────

const payload = {
  operatingHours: operatingHours.map(h => ({
    day: DAY_MAP[h.day],
    openTime: h.isClosed ? "00:00" : h.openTime.slice(0, 5),
    closeTime: h.isClosed ? "00:00" : h.closeTime.slice(0, 5),
    isClosed: h.isClosed,
  })),
};

await serviceCentersService.updateOperatingHours(payload);

console.log("OPERATING HOURS PAYLOAD =>", payload);

await serviceCentersService.updateOperatingHours(payload);
      // ── Step 6: Upload photos ─────────────────────────────────────────────────
      const photosFormData = new FormData();
      photos.forEach(p => photosFormData.append("Photos", p));
      await serviceCentersService.uploadPhotos(photosFormData);

      // ── Step 7: Submit (no body) ──────────────────────────────────────────────
      await serviceCentersService.submitRegistration();

      setCurrentStep(7); // success screen

    } catch (err) {
      const apiErrors = err?.errors;
      const message = Array.isArray(apiErrors) && apiErrors.length
        ? apiErrors.join(" • ")
        : err?.message || "Registration failed. Please try again.";
      setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  };

  // ─── Hours helpers ───────────────────────────────────────────────────────────
  const updateHour = (idx, field, value) => {
    setOperatingHours(prev => prev.map((h, i) => i === idx ? { ...h, [field]: value } : h));
  };

  // ─── Early returns ───────────────────────────────────────────────────────────
  if (!authChecked) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC", color: "#64748B", fontFamily: "inherit" }}>
      Loading...
    </div>
  );

  if (existingStatus && existingStatus !== "Draft") {
    const info = STATUS_INFO[existingStatus] ?? STATUS_INFO.Pending;
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Outfit', sans-serif" }}>
        <Navbar user={user} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
          <div style={{ background: "#fff", borderRadius: 24, padding: 48, maxWidth: 560, width: "100%", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.04)", border: "1px solid #E2E8F0" }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>{info.icon}</div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", marginBottom: 12 }}>{info.title}</h2>
            <p style={{ fontSize: 14.5, color: "#64748B", lineHeight: 1.6, marginBottom: 32 }}>{info.desc}</p>
            <div style={{ display: "inline-block", padding: "8px 20px", borderRadius: 10, background: `${info.color}18`, color: info.color, fontWeight: 700, fontSize: 13, marginBottom: 32 }}>
              Status: {existingStatus}
            </div>
            <br />
            <button onClick={() => router.push("/")} style={{ background: "#E8272A", color: "#fff", border: "none", borderRadius: 14, padding: "14px 32px", fontWeight: 800, fontSize: 14.5, cursor: "pointer", fontFamily: "inherit" }}>
              🏠 Return to homepage
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#0F172A" }}>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .form-input {
          padding: 13px 16px; background: #fff;
          border: 1.5px solid #CBD5E1; border-radius: 12px;
          font-size: 14px; color: #0F172A; outline: none;
          transition: border-color .2s, box-shadow .2s;
          font-family: inherit; width: 100%;
        }
        .form-input:focus { border-color: #E8272A; box-shadow: 0 0 0 3px rgba(232,39,42,0.08); }
        .form-input.err   { border-color: #EF4444; }
        .form-label { font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px; display: block; }
        .err-hint   { font-size: 11.5px; color: #EF4444; font-weight: 700; margin-top: 4px; display: block; }
        .err-banner { background: #FEF2F2; border: 1px solid #FECACA; border-radius: 10px; color: #B91C1C; font-size: 13px; font-weight: 600; padding: 10px 14px; margin-bottom: 16px; }
        .btn-back { padding: 13px 26px; border-radius: 12px; background: transparent; border: 1.5px solid #CBD5E1; color: #475569; font-size: 14px; font-weight: 700; cursor: pointer; transition: all .2s; font-family: inherit; }
        .btn-back:hover { background: #F1F5F9; }
        .btn-next { padding: 13px 32px; border-radius: 12px; background: #E8272A; border: none; color: #fff; font-size: 14px; font-weight: 800; cursor: pointer; transition: all .2s; box-shadow: 0 4px 16px rgba(232,39,42,0.22); font-family: inherit; }
        .btn-next:hover:not(:disabled) { background: #C41F22; transform: translateY(-1px); }
        .btn-next:disabled { background: #E2E8F0; color: #94A3B8; cursor: not-allowed; box-shadow: none; transform: none; }
        .tag-chip { padding: 8px 16px; border-radius: 10px; border: 1.5px solid #CBD5E1; background: #fff; color: #475569; font-size: 13.5px; font-weight: 500; cursor: pointer; transition: all .15s; user-select: none; display: inline-flex; align-items: center; gap: 5px; }
        .tag-chip.selected { border-color: #E8272A; background: #FEF2F2; color: #E8272A; font-weight: 700; }
        .hours-row { display: grid; grid-template-columns: 110px 1fr 1fr 90px; gap: 10px; align-items: center; padding: 10px 0; border-bottom: 1px solid #F1F5F9; }
        .hours-row:last-child { border-bottom: none; }
        .day-label { font-size: 13px; font-weight: 700; color: #334155; }
        .closed-badge { font-size: 11px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: .5px; }
        .toggle-btn { padding: 8px 14px; border-radius: 8px; border: 1.5px solid #CBD5E1; background: #fff; font-size: 12px; font-weight: 700; cursor: pointer; font-family: inherit; transition: all .15s; color: #475569; }
        .toggle-btn.open  { border-color: #10B981; background: #ECFDF5; color: #059669; }
        .toggle-btn.closed { border-color: #F59E0B; background: #FFFBEB; color: #D97706; }
        @media (max-width: 640px) {
          .form-grid-2 { grid-template-columns: 1fr !important; }
          .hours-row { grid-template-columns: 1fr 1fr; gap: 8px; }
          .day-label { grid-column: span 2; }
          .toggle-btn { grid-column: span 2; }
        }
      `}</style>

      <Navbar user={user} />

      <div style={{ flex: 1, maxWidth: 760, width: "100%", margin: "0 auto", padding: "40px 16px 80px" }}>

        {/* ── Stepper ── */}
        {currentStep <= 6 && (
          <div style={{ marginBottom: 40 }}>
            {/* Progress bar */}
            <div style={{ height: 4, background: "#E2E8F0", borderRadius: 2, marginBottom: 24, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${((currentStep - 1) / 5) * 100}%`, background: "#E8272A", borderRadius: 2, transition: "width .4s ease" }} />
            </div>
            {/* Step nodes */}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {STEPS.map(s => {
                const done   = currentStep > s.n;
                const active = currentStep === s.n;
                return (
                  <div key={s.n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, background: done ? "#10B981" : active ? "#E8272A" : "#E2E8F0", color: (done || active) ? "#fff" : "#64748B", border: `2px solid ${done ? "#10B981" : active ? "#E8272A" : "#CBD5E1"}`, boxShadow: active ? "0 0 16px rgba(232,39,42,0.2)" : "none", transition: "all .3s" }}>
                      {done ? "✓" : s.n}
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: active ? "#0F172A" : done ? "#10B981" : "#94A3B8", textTransform: "uppercase", letterSpacing: .5, textAlign: "center" }}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Card ── */}
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 24, padding: "44px 48px", boxShadow: "0 16px 40px rgba(0,0,0,0.04)" }}>

          {/* ══════════════════════════════════════════════════════════
              STEP 1 — Business Info
          ══════════════════════════════════════════════════════════ */}
          {currentStep === 1 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Register your service center</h2>
              <p style={{ fontSize: 14, color: "#64748B", marginBottom: 32, lineHeight: 1.6 }}>Fill in your business and legal details to get started on Autoria&apos;s network.</p>

              <div className="form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

                <div style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Service center / workshop name</label>
                  <input className={`form-input${errors.name ? " err" : ""}`} placeholder="e.g. ProCare Auto Diagnostics" value={basicInfo.name} onChange={e => setBasicInfo(p => ({ ...p, name: e.target.value }))} />
                  {errors.name && <span className="err-hint">{errors.name}</span>}
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Owner&apos;s full name</label>
                  <input className={`form-input${errors.ownerFullName ? " err" : ""}`} placeholder="e.g. Ahmed Hassan" value={basicInfo.ownerFullName} onChange={e => setBasicInfo(p => ({ ...p, ownerFullName: e.target.value }))} />
                  {errors.ownerFullName && <span className="err-hint">{errors.ownerFullName}</span>}
                </div>

                <div>
                  <label className="form-label">Business email</label>
                  <input className={`form-input${errors.businessEmail ? " err" : ""}`} type="email" placeholder="info@autofix.com" value={basicInfo.businessEmail} onChange={e => setBasicInfo(p => ({ ...p, businessEmail: e.target.value }))} />
                  {errors.businessEmail && <span className="err-hint">{errors.businessEmail}</span>}
                </div>

                <div>
                  <label className="form-label">Phone number</label>
                  <input className={`form-input${errors.phone ? " err" : ""}`} type="tel" placeholder="01012345678" value={basicInfo.phone} onChange={e => setBasicInfo(p => ({ ...p, phone: e.target.value }))} />
                  {errors.phone && <span className="err-hint">{errors.phone}</span>}
                </div>

                <div>
                  <label className="form-label">Year established</label>
                  <input className="form-input" type="number" min="1900" max={new Date().getFullYear()} value={basicInfo.yearEstablished} onChange={e => setBasicInfo(p => ({ ...p, yearEstablished: parseInt(e.target.value) }))} />
                </div>

                <div>
                  <label className="form-label">Number of service bays</label>
                  <input className="form-input" type="number" min="1" placeholder="e.g. 5" value={basicInfo.numServiceBays} onChange={e => setBasicInfo(p => ({ ...p, numServiceBays: parseInt(e.target.value) }))} />
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Center type</label>
                  <select className="form-input" value={basicInfo.type} onChange={e => setBasicInfo(p => ({ ...p, type: parseInt(e.target.value) }))}>
                    <option value={0}>Maintenance</option>
                    <option value={1}>Parts Store</option>
                    <option value={2}>Both</option>
                  </select>
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Description</label>
                  <textarea className="form-input" style={{ minHeight: 88, resize: "vertical" }} placeholder="Describe your center's services and specializations…" value={basicInfo.description} onChange={e => setBasicInfo(p => ({ ...p, description: e.target.value }))} />
                </div>

                <div>
                  <label className="form-label">Commercial registry no. <span style={{ color: "#94A3B8", fontWeight: 400 }}>(7 digits)</span></label>
                  <input className={`form-input${errors.commercialRegNo ? " err" : ""}`} inputMode="numeric" maxLength={7} placeholder="1234567" value={basicInfo.commercialRegNo} onChange={e => setBasicInfo(p => ({ ...p, commercialRegNo: digitsOnly(e.target.value, 7) }))} />
                  {errors.commercialRegNo && <span className="err-hint">{errors.commercialRegNo}</span>}
                </div>

                <div>
                  <label className="form-label">Tax card ID <span style={{ color: "#94A3B8", fontWeight: 400 }}>(9 digits)</span></label>
                  <input className={`form-input${errors.taxCardNo ? " err" : ""}`} inputMode="numeric" maxLength={9} placeholder="123456789" value={basicInfo.taxCardNo} onChange={e => setBasicInfo(p => ({ ...p, taxCardNo: digitsOnly(e.target.value, 9) }))} />
                  {errors.taxCardNo && <span className="err-hint">{errors.taxCardNo}</span>}
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Owner national ID <span style={{ color: "#94A3B8", fontWeight: 400 }}>(14 digits)</span></label>
                  <input className={`form-input${errors.ownerNationalId ? " err" : ""}`} inputMode="numeric" maxLength={14} placeholder="29801011234567" value={basicInfo.ownerNationalId} onChange={e => setBasicInfo(p => ({ ...p, ownerNationalId: digitsOnly(e.target.value, 14) }))} />
                  {errors.ownerNationalId && <span className="err-hint">{errors.ownerNationalId}</span>}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 40, paddingTop: 24, borderTop: "1px solid #F1F5F9" }}>
                <button className="btn-next" onClick={handleNext}>Next: Location →</button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              STEP 2 — Location
          ══════════════════════════════════════════════════════════ */}
          {currentStep === 2 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Workshop location</h2>
              <p style={{ fontSize: 14, color: "#64748B", marginBottom: 32, lineHeight: 1.6 }}>Pin your exact location on the map so nearby car owners can find you.</p>

              <div className="form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                  <label className="form-label">Governorate</label>
                  <select className="form-input" value={location.governorate} onChange={e => setLocation(p => ({ ...p, governorate: e.target.value }))}>
                    {EGYPT_GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                <div>
                  <label className="form-label">District / area</label>
                  <input className={`form-input${errors.district ? " err" : ""}`} placeholder="e.g. Nasr City, Heliopolis" value={location.district} onChange={e => setLocation(p => ({ ...p, district: e.target.value }))} />
                  {errors.district && <span className="err-hint">{errors.district}</span>}
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Pin your location on the map</label>
                  <div style={{ width: "100%", height: 340, borderRadius: 14, overflow: "hidden", border: "1.5px solid #CBD5E1", background: "#F1F5F9", position: "relative" }}>
                    {!mapLoaded && (
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#64748B", fontSize: 14, background: "#F1F5F9", zIndex: 10 }}>
                        Loading Google Maps…
                      </div>
                    )}
                    <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "rgba(232,39,42,0.05)", borderRadius: 8, fontSize: 12, color: "#B91C1C", fontWeight: 600, marginTop: 8 }}>
                    📍 Click anywhere or drag the red pin to set your exact location
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12, color: "#94A3B8" }}>
                    lat: {location.latitude.toFixed(6)} &nbsp;|&nbsp; lng: {location.longitude.toFixed(6)}
                  </div>
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Detailed street address</label>
                  <input className={`form-input${errors.address ? " err" : ""}`} placeholder="e.g. 15 Abbas El Akkad St, Nasr City, Cairo" value={location.address} onChange={e => setLocation(p => ({ ...p, address: e.target.value }))} />
                  {errors.address && <span className="err-hint">{errors.address}</span>}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40, paddingTop: 24, borderTop: "1px solid #F1F5F9" }}>
                <button className="btn-back" onClick={handleBack}>← Back</button>
                <button className="btn-next" onClick={handleNext}>Next: Documents →</button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              STEP 3 — Documents
          ══════════════════════════════════════════════════════════ */}
          {currentStep === 3 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Legal verification documents</h2>
              <p style={{ fontSize: 14, color: "#64748B", marginBottom: 32, lineHeight: 1.6 }}>Upload your Commercial Registry, Tax Card, and National ID. Accepted formats: PDF, JPG, PNG (max 5MB each).</p>

              {[
                { key: "commercialReg", label: "Commercial registry (السجل التجاري)" },
                { key: "taxCard",       label: "Tax card (البطاقة الضريبية)"          },
                { key: "nationalId",    label: "Owner national ID (بطاقة الرقم القومي)" },
              ].map(({ key, label }) => (
                <div key={key} style={{ marginBottom: 20 }}>
                  <label className="form-label">{label}</label>
                  <input className="form-input" type="file" accept="image/*,.pdf" style={{ padding: "10px 14px" }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) setDocFiles(p => ({ ...p, [key]: f })); }} />
                  {docFiles[key] && (
                    <span style={{ fontSize: 12, color: "#10B981", fontWeight: 700, marginTop: 4, display: "block" }}>✓ {docFiles[key].name}</span>
                  )}
                </div>
              ))}

              {errors.documents && <span className="err-hint" style={{ marginBottom: 12, display: "block" }}>{errors.documents}</span>}

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40, paddingTop: 24, borderTop: "1px solid #F1F5F9" }}>
                <button className="btn-back" onClick={handleBack}>← Back</button>
                <button className="btn-next" onClick={handleNext}>Next: Services →</button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              STEP 4 — Services & Brands
          ══════════════════════════════════════════════════════════ */}
          {currentStep === 4 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Services &amp; supported brands</h2>
              <p style={{ fontSize: 14, color: "#64748B", marginBottom: 32, lineHeight: 1.6 }}>Select the services you offer and the car brands you specialise in.</p>

              {/* Service Types */}
              <div style={{ marginBottom: 36 }}>
                <label className="form-label" style={{ marginBottom: 12 }}>
                  Service types
                  <span style={{ color: "#9CA3AF", fontWeight: 400, marginLeft: 8, fontSize: 12 }}>({selectedServiceIds.length} selected)</span>
                </label>
                {availableServices.length === 0
                  ? <p style={{ fontSize: 13, color: "#9CA3AF" }}>Loading…</p>
                  : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {availableServices.map(s => {
                        const on = selectedServiceIds.includes(s.id);
                        return (
                          <div key={s.id} className={`tag-chip${on ? " selected" : ""}`}
                            onClick={() => setSelectedServiceIds(p => on ? p.filter(x => x !== s.id) : [...p, s.id])}>
                            {on && <span style={{ fontSize: 10 }}>✓</span>}{s.name}
                          </div>
                        );
                      })}
                    </div>
                  )
                }
                {errors.serviceTypes && <span className="err-hint" style={{ marginTop: 8 }}>{errors.serviceTypes}</span>}
              </div>

              {/* Car Brands */}
              <div style={{ marginBottom: 16 }}>
                <label className="form-label" style={{ marginBottom: 12 }}>
                  Supported car brands
                  <span style={{ color: "#9CA3AF", fontWeight: 400, marginLeft: 8, fontSize: 12 }}>({selectedBrandIds.length} selected)</span>
                </label>
                {availableBrands.length === 0
                  ? <p style={{ fontSize: 13, color: "#9CA3AF" }}>Loading…</p>
                  : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {availableBrands.map(b => {
                        const on = selectedBrandIds.includes(b.id);
                        return (
                          <div key={b.id} className={`tag-chip${on ? " selected" : ""}`}
                            onClick={() => setSelectedBrandIds(p => on ? p.filter(x => x !== b.id) : [...p, b.id])}>
                            {on && <span style={{ fontSize: 10 }}>✓</span>}{b.name}
                          </div>
                        );
                      })}
                    </div>
                  )
                }
                {errors.carBrands && <span className="err-hint" style={{ marginTop: 8 }}>{errors.carBrands}</span>}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40, paddingTop: 24, borderTop: "1px solid #F1F5F9" }}>
                <button className="btn-back" onClick={handleBack}>← Back</button>
                <button className="btn-next" onClick={handleNext}>Next: Hours →</button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              STEP 5 — Operating Hours
          ══════════════════════════════════════════════════════════ */}
          {currentStep === 5 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Operating hours</h2>
              <p style={{ fontSize: 14, color: "#64748B", marginBottom: 32, lineHeight: 1.6 }}>Set your weekly schedule. All 7 days are required.</p>

              <div>
                {operatingHours.map((h, i) => (
                  <div key={h.day} className="hours-row">
                    <span className="day-label">{h.dayLabel}</span>
                    {h.isClosed ? (
                      <span className="closed-badge" style={{ gridColumn: "span 2" }}>Closed</span>
                    ) : (
                      <>
                        <div>
                          <label style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, display: "block", marginBottom: 3 }}>Open</label>
                          <input type="time" className="form-input" style={{ padding: "8px 10px", fontSize: 13 }} value={h.openTime} onChange={e => updateHour(i, "openTime", e.target.value)} />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, display: "block", marginBottom: 3 }}>Close</label>
                          <input type="time" className="form-input" style={{ padding: "8px 10px", fontSize: 13 }} value={h.closeTime} onChange={e => updateHour(i, "closeTime", e.target.value)} />
                        </div>
                      </>
                    )}
                    <button className={`toggle-btn${h.isClosed ? " closed" : " open"}`} onClick={() => updateHour(i, "isClosed", !h.isClosed)}>
                      {h.isClosed ? "Closed" : "Open"}
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40, paddingTop: 24, borderTop: "1px solid #F1F5F9" }}>
                <button className="btn-back" onClick={handleBack}>← Back</button>
                <button className="btn-next" onClick={handleNext}>Next: Photos →</button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              STEP 6 — Photos + Submit
          ══════════════════════════════════════════════════════════ */}
          {currentStep === 6 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Workshop photos</h2>
              <p style={{ fontSize: 14, color: "#64748B", marginBottom: 32, lineHeight: 1.6 }}>Upload at least 3 photos of your workshop. Max 10 photos, 5MB each (JPG/PNG only).</p>

              <input className="form-input" type="file" multiple accept="image/*" style={{ padding: "10px 14px" }}
                onChange={e => setPhotos(Array.from(e.target.files || []))} />
              {photos.length > 0 && (
                <span style={{ fontSize: 12, color: "#10B981", fontWeight: 700, marginTop: 6, display: "block" }}>
                  ✓ {photos.length} photo{photos.length !== 1 ? "s" : ""} selected
                </span>
              )}
              {errors.photos && <span className="err-hint" style={{ marginTop: 4 }}>{errors.photos}</span>}

              {errors.submit && <div className="err-banner" style={{ marginTop: 20 }}>{errors.submit}</div>}

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40, paddingTop: 24, borderTop: "1px solid #F1F5F9" }}>
                <button className="btn-back" onClick={handleBack} disabled={loading}>← Back</button>
                <button className="btn-next" onClick={handleSubmit} disabled={loading}
                  style={{ background: "#10B981", boxShadow: "0 4px 16px rgba(16,185,129,0.22)" }}>
                  {loading ? "Submitting…" : "Submit application ✓"}
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              STEP 7 — Success
          ══════════════════════════════════════════════════════════ */}
          {currentStep === 7 && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#ECFDF5", border: "2px solid #10B981", color: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 24px", boxShadow: "0 0 24px rgba(16,185,129,0.12)" }}>
                ✓
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 10 }}>Application submitted!</h2>
              <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.6, maxWidth: 480, margin: "0 auto 32px" }}>
                Our audit team is verifying your credentials. This usually takes 24–48 hours. You&apos;ll receive a confirmation email at <strong>{basicInfo.businessEmail}</strong>.
              </p>

              <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 16, padding: 24, marginBottom: 32, textAlign: "left" }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", marginBottom: 16, paddingBottom: 8, borderBottom: "1px solid #E2E8F0" }}>Application summary</h3>
                {[
                  ["Workshop name",  basicInfo.name],
                  ["Owner",          basicInfo.ownerFullName],
                  ["Location",       `${location.district}, ${location.governorate}`],
                  ["Contact email",  basicInfo.businessEmail],
                  ["Service bays",   basicInfo.numServiceBays],
                  ["Status",         "⏳ Pending review"],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F1F5F9", fontSize: 14 }}>
                    <span style={{ color: "#64748B", fontWeight: 600 }}>{label}</span>
                    <span style={{ color: label === "Status" ? "#F59E0B" : "#0F172A", fontWeight: 700 }}>{value}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => router.push("/")}
                style={{ background: "#10B981", color: "#fff", border: "none", borderRadius: 12, padding: "14px 32px", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(16,185,129,0.2)" }}>
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