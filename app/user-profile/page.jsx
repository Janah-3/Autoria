"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { usersService } from "@/lib/api/usersService";
import { useRoleGuard } from "@/lib/hooks/useRoleGuard";

const R  = "#E8272A";
const RD = "#B81C1F";
const GOOGLE_MAPS_API_KEY = "AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8";

function UserProfileContent() {
  const { authorized, checking } = useRoleGuard();
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetId = searchParams.get("id");
  const readOnly = !!targetId;

  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType,    setToastType]    = useState("success");

  const [form, setForm] = useState({
    fullName: "", phoneNumber: "", email: "", role: "",
  });

  // Location
  const [locationOpen,   setLocationOpen]   = useState(false);
  const [mapLoaded,      setMapLoaded]      = useState(false);
  const [geoLoading,     setGeoLoading]     = useState(false);
  const [locationSaving, setLocationSaving] = useState(false);
  const [location, setLocation] = useState({
    latitude: 30.0626, longitude: 31.3397,
    address: "", city: "", pinned: false,
  });

  const mapRef         = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef      = useRef(null);

  const triggerToast = (message, type = "success") => {
    setToastMessage(message); setToastType(type); setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  // GET /Users/me or GET /Users/{id}
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = readOnly 
          ? await usersService.getById(targetId)
          : await usersService.getMe();
          
        const d = res?.data;
        if (d) {
          setForm({
            fullName: d.fullName || d.FullName || "",
            phoneNumber: d.phoneNumber || d.PhoneNumber || "",
            email: d.email || d.Email || "",
            role: d.role || d.Role || "User",
          });

          // Check if coordinates exist on this user
          const lat = d.latitude ?? d.Latitude;
          const lng = d.longitude ?? d.Longitude;
          if (lat !== undefined && lat !== null && lng !== undefined && lng !== null && parseFloat(lat) !== 0) {
            setLocation({
              latitude: parseFloat(lat),
              longitude: parseFloat(lng),
              address: d.address || d.Address || "",
              city: d.city || d.City || "",
              pinned: true,
            });
            // Open map view by default for viewing clients
            setLocationOpen(true);
          }
        }
      } catch (err) {
        triggerToast(err?.message || "Could not load profile information", "warning");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Load cached location only if not read-only
    if (!readOnly) {
      const cached = localStorage.getItem("userLocation");
      if (cached) {
        try {
          const p = JSON.parse(cached);
          setLocation({ latitude: p.lat, longitude: p.lng, address: p.address || "", city: p.city || "", pinned: true });
        } catch (_) {}
      }
    }
  }, [targetId, readOnly]);

  // PUT /Users/me
  const handleSave = async (e) => {
    e.preventDefault();
    if (readOnly) return;
    setSaving(true);
    try {
      await usersService.updateMe({ fullName: form.fullName, phoneNumber: form.phoneNumber });
      localStorage.setItem("userName", form.fullName);
      triggerToast("Profile updated successfully", "success");
    } catch (err) {
      triggerToast(err?.message || "Failed to save changes", "warning");
    } finally {
      setSaving(false);
    }
  };

  // ── Google Maps (same pattern as service-center-registration) ──────────────
  useEffect(() => {
    if (typeof window === "undefined" || !locationOpen) return;
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
  }, [locationOpen]);

  const reverseGeocode = useCallback((latLng) => {
    if (!window.google?.maps) return;
    new window.google.maps.Geocoder().geocode({ location: latLng }, (results, status) => {
      const addr     = (status === "OK" && results[0]) ? results[0].formatted_address : "";
      const cityComp = (status === "OK" && results[0])
        ? results[0].address_components.find(c => c.types.includes("locality"))
        : null;
      setLocation(prev => ({
        ...prev,
        latitude:  parseFloat(latLng.lat().toFixed(6)),
        longitude: parseFloat(latLng.lng().toFixed(6)),
        address:   addr, city: cityComp?.long_name || "", pinned: true,
      }));
    });
  }, []);

  const initMap = useCallback(() => {
    if (!mapRef.current || !window.google?.maps || mapInstanceRef.current) return;
    const center = { lat: location.latitude, lng: location.longitude };
    
    // Map options for read-only view
    const mapOptions = {
      center, 
      zoom: 13,
      mapTypeControl: false, 
      streetViewControl: false, 
      fullscreenControl: false,
    };
    
    if (readOnly) {
      mapOptions.gestureHandling = "cooperative";
    }

    const map = new window.google.maps.Map(mapRef.current, mapOptions);
    
    const marker = new window.google.maps.Marker({
      position: center, 
      map, 
      draggable: !readOnly,
      icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 12, fillColor: R, fillOpacity: 1, strokeColor: "#fff", strokeWeight: 3 },
    });
    
    if (!readOnly) {
      marker.addListener("dragend", () => reverseGeocode(marker.getPosition()));
      map.addListener("click", (e) => { marker.setPosition(e.latLng); reverseGeocode(e.latLng); });
    }
    
    mapInstanceRef.current = map;
    markerRef.current      = marker;
  }, [location.latitude, location.longitude, reverseGeocode, readOnly]);

  useEffect(() => {
    if (mapLoaded && locationOpen) setTimeout(initMap, 100);
  }, [mapLoaded, locationOpen, initMap]);

  useEffect(() => {
    if (!locationOpen) { mapInstanceRef.current = null; markerRef.current = null; }
  }, [locationOpen]);

  // Reverse geocode if read-only, has coordinates but lacks human-readable address
  useEffect(() => {
    if (mapLoaded && readOnly && location.latitude && location.longitude && !location.address && window.google?.maps) {
      const latlng = new window.google.maps.LatLng(location.latitude, location.longitude);
      new window.google.maps.Geocoder().geocode({ location: latlng }, (results, status) => {
        if (status === "OK" && results[0]) {
          setLocation(prev => ({
            ...prev,
            address: results[0].formatted_address
          }));
        }
      });
    }
  }, [mapLoaded, readOnly, location.latitude, location.longitude, location.address]);

  const handleUseMyLocation = () => {
    if (readOnly) return;
    if (!navigator.geolocation) return alert("Geolocation not supported.");
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current && markerRef.current) {
          const latlng = new window.google.maps.LatLng(latitude, longitude);
          mapInstanceRef.current.setCenter(latlng);
          mapInstanceRef.current.setZoom(15);
          markerRef.current.setPosition(latlng);
          reverseGeocode(latlng);
        } else {
          setLocation(prev => ({ ...prev, latitude, longitude, pinned: true }));
        }
        setGeoLoading(false);
      },
      () => { setGeoLoading(false); alert("Could not get your location."); }
    );
  };

  const handleSaveLocation = async () => {
    if (readOnly || !location.pinned) return;
    setLocationSaving(true);
    try {
      await usersService.setMyLocation(location.latitude, location.longitude);
      localStorage.setItem("userLocation", JSON.stringify({ lat: location.latitude, lng: location.longitude, address: location.address, city: location.city }));
      triggerToast("Location updated successfully", "success");
    } catch (err) {
      triggerToast(err?.message || "Failed to save location", "warning");
    } finally {
      setLocationSaving(false);
    }
  };

  const clearLocation = () => {
    if (readOnly) return;
    setLocation({ latitude: 30.0626, longitude: 31.3397, address: "", city: "", pinned: false });
    localStorage.removeItem("userLocation");
    if (mapInstanceRef.current) mapInstanceRef.current.setCenter({ lat: 30.0626, lng: 31.3397 });
    if (markerRef.current) markerRef.current.setPosition({ lat: 30.0626, lng: 31.3397 });
  };

  if (checking) return null;
  if (!authorized) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        .toast {
          position: fixed; top: 24px; right: 24px; background: #fff;
          border-left: 5px solid #10B981; box-shadow: 0 10px 25px rgba(0,0,0,0.08);
          padding: 16px 24px; border-radius: 12px; z-index: 1000;
          display: flex; align-items: center; gap: 12px;
          transform: translateY(-20px); opacity: 0; visibility: hidden;
          transition: all 0.3s cubic-bezier(0.68, -0.6, 0.32, 1.6);
        }
        .toast.show { transform: translateY(0); opacity: 1; visibility: visible; }
        .toast.success { border-left-color: #10B981; }
        .toast.warning { border-left-color: #F59E0B; }
        .toast.error   { border-left-color: ${R}; }

        .top-nav {
          background: rgba(255,255,255,0.9); backdrop-filter: blur(12px);
          border-bottom: 1px solid #E2E8F0; height: 68px; padding: 0 5%;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 50;
        }
        .logo { font-size: 22px; font-weight: 900; color: #1E293B; text-decoration: none; letter-spacing: -0.5px; }
        .logo span { color: ${R}; }
        .back-link {
          font-size: 13px; font-weight: 700; color: #475569; text-decoration: none;
          border: 1px solid #CBD5E1; padding: 8px 16px; border-radius: 9px;
          display: flex; align-items: center; gap: 7px; transition: all 0.2s;
          background: transparent; cursor: pointer;
        }
        .back-link:hover { background: #F1F5F9; transform: translateY(-1px); }
        .hero { background: linear-gradient(135deg, #460203 0%, #920406 50%, ${RD} 100%); padding: 48px 5%; color: white; }
        .hero h1 { font-size: 30px; font-weight: 900; letter-spacing: -0.8px; margin-bottom: 6px; }
        .hero p  { font-size: 14px; color: rgba(255,255,255,0.7); }
        .profile-card { max-width: 700px; margin: -28px auto 60px; padding: 0 24px; position: relative; z-index: 10; }
        .card-inner { background: #fff; border-radius: 20px; box-shadow: 0 20px 40px rgba(15,23,42,0.07); border: 1px solid #E2E8F0; overflow: hidden; }
        .avatar-section { padding: 36px 40px 28px; border-bottom: 1px solid #F1F5F9; display: flex; align-items: center; gap: 24px; }
        .avatar-circle { width: 80px; height: 80px; border-radius: 50%; background: #FEF2F2; border: 3px solid ${R}; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 900; color: ${R}; flex-shrink: 0; }
        .avatar-info h2 { font-size: 20px; font-weight: 800; color: #0F172A; margin-bottom: 4px; }
        .role-badge { display: inline-block; padding: 3px 12px; background: #FEF2F2; color: ${R}; border: 1px solid #FCA5A5; border-radius: 20px; font-size: 12px; font-weight: 700; }
        .form-section { padding: 36px 40px; }
        .form-section h3 { font-size: 16px; font-weight: 800; color: #0F172A; margin-bottom: 24px; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .form-group { display: flex; flex-direction: column; gap: 7px; }
        .form-group.full { grid-column: span 2; }
        .form-label { font-size: 13px; font-weight: 700; color: #334155; }
        .form-input { padding: 12px 15px; border: 1.5px solid #CBD5E1; border-radius: 11px; font-size: 14px; font-family: inherit; color: #1E293B; background: #fff; outline: none; transition: all 0.2s; }
        .form-input:focus { border-color: ${R}; box-shadow: 0 0 0 4px rgba(232,39,42,0.08); }
        .form-input:disabled { background: #F8FAFC; color: #94A3B8; cursor: not-allowed; }
        .read-only-note { font-size: 11px; color: #94A3B8; margin-top: 2px; }
        .form-footer { padding: 24px 40px; border-top: 1px solid #F1F5F9; display: flex; gap: 12px; align-items: center; justify-content: flex-end; }
        .btn-save { background: ${R}; color: #fff; border: none; padding: 12px 32px; border-radius: 11px; font-size: 14px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; box-shadow: 0 4px 12px rgba(232,39,42,0.25); }
        .btn-save:hover { background: ${RD}; transform: translateY(-1px); }
        .btn-save:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .btn-cancel { background: #F1F5F9; color: #475569; border: none; padding: 12px 24px; border-radius: 11px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; text-decoration: none; display: flex; align-items: center; }
        .btn-cancel:hover { background: #E2E8F0; }
        .skeleton { background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 8px; }

        /* Location section in profile */
        .loc-toggle {
          display: flex; align-items: center; justify-content: space-between;
          padding: 13px 16px; border: 1.5px dashed ${R}; border-radius: 12px;
          cursor: pointer; transition: all 0.2s; background: #fff8f8; user-select: none; margin-top: 20px;
        }
        .loc-toggle:hover { background: #fff0f0; border-style: solid; }
        .loc-toggle.open { border-style: solid; background: #fff0f0; }
        .loc-toggle-left { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 600; color: ${R}; }
        .loc-badge { display: inline-flex; align-items: center; gap: 4px; background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; border-radius: 20px; padding: 2px 10px; font-size: 11px; font-weight: 700; }
        .loc-panel { border: 1.5px solid #e0e0e0; border-radius: 14px; overflow: hidden; margin-top: 8px; }
        .loc-toolbar { display: flex; gap: 8px; padding: 12px; background: #f9f9f9; border-bottom: 1px solid #e8e8e8; }
        .geo-btn { display: flex; align-items: center; gap: 6px; padding: 9px 14px; background: ${R}; color: white; border: none; border-radius: 10px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; white-space: nowrap; flex-shrink: 0; }
        .geo-btn:hover { background: ${RD}; }
        .geo-btn:disabled { background: #ccc; cursor: not-allowed; }
        .geo-spin { width: 13px; height: 13px; border: 2px solid #fff; border-top-color: transparent; border-radius: 50%; animation: spin 0.6s linear infinite; }
        .map-wrap { width: 100%; height: 280px; background: #F1F5F9; position: relative; }
        .map-loading { display: flex; align-items: center; justify-content: center; height: 100%; color: #64748B; font-size: 14px; }
        .map-hint { position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.7); color: #fff; padding: 4px 14px; border-radius: 20px; font-size: 11px; white-space: nowrap; pointer-events: none; z-index: 5; }
        .loc-footer { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #f9f9f9; border-top: 1px solid #e8e8e8; gap: 8px; }
        .loc-coords { font-size: 12px; color: #94A3B8; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .loc-coords.pinned { color: #166534; font-weight: 600; }
        .loc-actions { display: flex; gap: 6px; flex-shrink: 0; }
        .clear-btn { background: none; border: none; color: ${R}; cursor: pointer; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 8px; }
        .clear-btn:hover { background: #fff0f0; }
        .save-loc-btn { background: ${R}; color: #fff; border: none; padding: 6px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; }
        .save-loc-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .save-loc-btn:not(:disabled):hover { background: ${RD}; }

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
        {readOnly ? (
          <button 
            onClick={() => window.history.length > 1 ? router.back() : router.push('/booking-requests')} 
            className="back-link"
          >
            <i className="fa-solid fa-arrow-left" /> Back to Booking Requests
          </button>
        ) : (
          <Link href="/" className="back-link">
            <i className="fa-solid fa-arrow-left" /> Home
          </Link>
        )}
      </nav>

      {/* Hero */}
      <section className="hero">
        <h1>{readOnly ? "Client Profile" : "My Profile"}</h1>
        <p>{readOnly ? "View client's personal and contact details." : "Manage your personal information and account settings."}</p>
      </section>

      {/* Card */}
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
              <h3>{readOnly ? "Personal Information" : "Edit Personal Information"}</h3>

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
                <>
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
                        disabled={readOnly}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input 
                        type="tel" 
                        className="form-input" 
                        value={form.phoneNumber}
                        onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                        placeholder={readOnly ? "No phone number listed" : "e.g. 01012345678"} 
                        disabled={readOnly}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input type="email" className="form-input" value={form.email} disabled />
                      {!readOnly && <span className="read-only-note">Email cannot be changed here.</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Account Role</label>
                      <input type="text" className="form-input" value={form.role} disabled />
                      {!readOnly && <span className="read-only-note">Role is managed by the system.</span>}
                    </div>
                  </div>

                  {/* ── Location Section ── */}
                  {(!readOnly || location.pinned) ? (
                    <>
                      <div
                        className={`loc-toggle${locationOpen ? " open" : ""}`}
                        onClick={() => setLocationOpen(v => !v)}
                        role="button"
                        aria-expanded={locationOpen}
                        style={{ marginTop: 28 }}
                      >
                        <div className="loc-toggle-left">
                          <i className="fa-solid fa-location-dot" style={{ fontSize: 15 }} />
                          <span>{readOnly ? "Client Location" : "My Location"}</span>
                          {location.pinned && (
                            <span className="loc-badge">
                              <i className="fa-solid fa-circle-check" style={{ fontSize: 10 }} /> Set
                            </span>
                          )}
                        </div>
                        <i className={`fa-solid fa-chevron-${locationOpen ? "up" : "down"}`} style={{ color: R, fontSize: 13 }} />
                      </div>

                      {locationOpen && (
                        <div className="loc-panel">
                          {/* Toolbar */}
                          {!readOnly && (
                            <div className="loc-toolbar">
                              <button type="button" className="geo-btn" onClick={handleUseMyLocation} disabled={geoLoading} style={{ flex: 1 }}>
                                {geoLoading
                                  ? <><div className="geo-spin" /> Locating…</>
                                  : <><i className="fa-solid fa-crosshairs" /> Use My Current Location</>
                                }
                              </button>
                            </div>
                          )}

                          {/* Map */}
                          <div className="map-wrap" style={{ position: "relative" }}>
                            {!mapLoaded && (
                              <div className="map-loading" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#F1F5F9", zIndex: 10 }}>Loading Google Maps…</div>
                            )}
                            <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
                            {mapLoaded && !location.pinned && !readOnly && (
                              <div className="map-hint">📍 Click or drag the red pin to set your location</div>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="loc-footer">
                            <span className={`loc-coords${location.pinned ? " pinned" : ""}`}>
                              {location.pinned && location.address
                                ? location.address
                                : `lat: ${location.latitude.toFixed(5)}  |  lng: ${location.longitude.toFixed(5)}`
                              }
                            </span>
                            {!readOnly && (
                              <div className="loc-actions">
                                {location.pinned && (
                                  <button type="button" className="clear-btn" onClick={clearLocation}>
                                    <i className="fa-solid fa-xmark" /> Clear
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="save-loc-btn"
                                  onClick={handleSaveLocation}
                                  disabled={locationSaving || !location.pinned}
                                >
                                  {locationSaving ? "Saving…" : "Save Location"}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ marginTop: 28, padding: "16px", borderRadius: "12px", border: "1.5px dashed #CBD5E1", background: "#F8FAFC", textAlign: "center", fontSize: "14px", color: "#64748B" }}>
                      📍 Client has not pinned their location coordinates.
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="form-footer">
              {readOnly ? (
                <button
                  type="button"
                  onClick={() => window.history.length > 1 ? router.back() : router.push('/booking-requests')}
                  className="btn-save"
                  style={{ background: "#475569", boxShadow: "0 4px 12px rgba(71,85,105,0.2)" }}
                >
                  <i className="fa-solid fa-arrow-left" /> Back to Booking Requests
                </button>
              ) : (
                <>
                  <Link href="/" className="btn-cancel">Cancel</Link>
                  <button type="submit" className="btn-save" disabled={saving || loading}>
                    {saving
                      ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</>
                      : <><i className="fa-solid fa-floppy-disk" /> Save Changes</>
                    }
                  </button>
                </>
              )}
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}

export default function UserProfilePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", background: "#F8FAFC", fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "4px solid #F1F5F9", borderTopColor: "#E8272A", borderRadius: "50%", animation: "spin 1.6s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#64748B", fontWeight: 600 }}>Loading profile...</p>
        </div>
      </div>
    }>
      <UserProfileContent />
    </Suspense>
  );
}
