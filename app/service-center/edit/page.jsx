"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { serviceCentersService } from "@/lib/api/serviceCentersService";

// Static lookups (match backend seed data)
const ALL_SERVICE_TYPES = [
  { id: "779E6B5C-FC46-4207-940F-3C79DA96BECA", name: "Oil Change" },
  { id: "0D78B545-DBE7-4C47-9557-61677308178D", name: "Brakes Repair" },
  { id: "f218b908-d6e5-4eef-925b-12cf5873af8f", name: "Suspension" },
  { id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", name: "AC Maintenance" },
  { id: "b2c3d4e5-f6a7-8901-bcde-f12345678901", name: "Engine Diagnostics" },
  { id: "c3d4e5f6-a7b8-9012-cdef-123456789012", name: "Tire Services" },
  { id: "d4e5f6a7-b8c9-0123-defa-234567890123", name: "Electrical Systems" },
  { id: "e5f6a7b8-c9d0-1234-efab-345678901234", name: "Body Work" },
];

const ALL_CAR_BRANDS = [
  { id: "2DD8709F-DDFA-452C-A23B-1BCECD6CCFAE", name: "Toyota" },
  { id: "3AA77C79-B11C-4455-9BC9-36B206BA5D0F", name: "Hyundai" },
  { id: "4BB88D80-CC22-5566-AAD0-47C317CB6E1F", name: "Kia" },
  { id: "5CC99E91-DD33-6677-BBE1-58D428DC7F2G", name: "Nissan" },
  { id: "6DD00F02-EE44-7788-CCF2-69E539ED8030", name: "Honda" },
  { id: "7EE11013-FF55-8899-DD03-70F64AFE9141", name: "BMW" },
  { id: "8FF22124-0066-99AA-EE14-81077BFF0252", name: "Mercedes-Benz" },
  { id: "9AA33235-1177-AABB-FF25-92188C001363", name: "Chevrolet" },
  { id: "ABB44346-2288-BBCC-0036-A3299D112474", name: "Ford" },
  { id: "BCC55457-3399-CCDD-1147-B430AE223585", name: "Mitsubishi" },
  { id: "CDD66568-44AA-DDEE-2258-C541BF334696", name: "Suzuki" },
  { id: "DEE77679-55BB-EEFF-3369-D652C0445707", name: "Volkswagen" },
];

export default function EditServiceCenterProfile() {
  const [activeTab, setActiveTab] = useState("general");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  // Form State
  const [generalInfo, setGeneralInfo] = useState({
    name: "",
    established: "",
    bays: "",
    description: "",
  });

  const [contactInfo, setContactInfo] = useState({
    phone: "",
    whatsapp: "",
    address: "",
    hours: "",
    closedDays: "",
  });

  // Selected IDs (sets for O(1) toggle)
  const [selectedServiceIds, setSelectedServiceIds] = useState(new Set());
  const [selectedBrandIds, setSelectedBrandIds] = useState(new Set());

  const [pricing, setPricing] = useState({
    min: "",
    max: "",
    sellsParts: true,
  });

  const [parts, setParts] = useState([]);
  const [newPartName, setNewPartName] = useState("");
  const [newPartPrice, setNewPartPrice] = useState("");
  const [newPartStock, setNewPartStock] = useState("");

  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  // Trigger Toast Notification
  const triggerToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  useEffect(() => {
    serviceCentersService
      .getMy()
      .then((res) => {
        const d = res.data;
        if (!d) return;
        setGeneralInfo({
          name: d.name || "",
          established: String(d.yearEstablished || ""),
          bays: String(d.numServiceBays || ""),
          description: d.description || "",
        });
        setContactInfo({
          phone: d.phone || "",
          whatsapp: d.phone || "",
          address: d.streetAddress || [d.district, d.governorate].filter(Boolean).join(", "),
          hours: (d.operatingHours || [])
            .filter((h) => !h.isClosed)
            .map((h) => `${h.day} ${h.openTime}-${h.closeTime}`)
            .join(" • "),
          closedDays: (d.operatingHours || []).filter((h) => h.isClosed).map((h) => h.day).join(", "),
        });
        // serviceTypes / carBrands from API come as name strings — match against our static list to get IDs
        const apiServiceNames = (d.serviceTypes || []).map(s => typeof s === 'string' ? s.toLowerCase() : (s.name || '').toLowerCase());
        const apiServiceIds = ALL_SERVICE_TYPES.filter(st => apiServiceNames.includes(st.name.toLowerCase())).map(st => st.id);
        setSelectedServiceIds(new Set(apiServiceIds));

        const apiBrandNames = (d.carBrands || []).map(b => typeof b === 'string' ? b.toLowerCase() : (b.name || '').toLowerCase());
        const apiBrandIds = ALL_CAR_BRANDS.filter(cb => apiBrandNames.includes(cb.name.toLowerCase())).map(cb => cb.id);
        setSelectedBrandIds(new Set(apiBrandIds));
        if (d.photos?.length) {
          setPhotos(
            d.photos.map((url, i) => ({
              id: i,
              src: url,
              label: `Workshop photo ${i + 1}`,
            }))
          );
        }
      })
      .catch(() => triggerToast("Could not load your service center profile", "warning"))
      .finally(() => setProfileLoading(false));
  }, []);

  // Handlers
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await serviceCentersService.updateMy({
        name: generalInfo.name,
        phone: contactInfo.phone,
        description: generalInfo.description,
        numServiceBays: parseInt(generalInfo.bays, 10) || undefined,
      });
      // Persist service types and car brands
      await serviceCentersService.updateServiceTypes([...selectedServiceIds]);
      await serviceCentersService.updateCarBrands([...selectedBrandIds]);
      triggerToast("Business profile saved successfully", "success");
    } catch (err) {
      triggerToast(err.message || "Failed to save", "warning");
    }
  };

  const toggleServiceId = (id) => {
    setSelectedServiceIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleBrandId = (id) => {
    setSelectedBrandIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // (service / brand management is now handled via toggleServiceId / toggleBrandId)

  // Add Part Simple
  const handleAddPart = () => {
    if (newPartName.trim() && newPartPrice && newPartStock) {
      const newPart = {
        id: Date.now(),
        name: newPartName.trim(),
        price: parseFloat(newPartPrice),
        stock: parseInt(newPartStock)
      };
      setParts([...parts, newPart]);
      setNewPartName("");
      setNewPartPrice("");
      setNewPartStock("");
      triggerToast(`Added ${newPart.name} to spare parts list!`, "success");
    } else {
      triggerToast("Please fill in all part details", "warning");
    }
  };

  const handleRemovePart = (id, name) => {
    setParts(parts.filter(p => p.id !== id));
    triggerToast(`Removed ${name}`, "info");
  };

  const handlePhotoUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((file) => fd.append("Photos", file));
      await serviceCentersService.uploadPhotos(fd);
      const res = await serviceCentersService.getMy();
      if (res.data?.photos?.length) {
        setPhotos(
          res.data.photos.map((url, i) => ({
            id: i,
            src: url,
            label: `Workshop photo ${i + 1}`,
          }))
        );
      }
      triggerToast("Photos uploaded successfully", "success");
    } catch (err) {
      triggerToast(err.message || "Upload failed", "warning");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="sc-edit-layout">
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .sc-edit-layout {
          min-height: 100vh;
          background: #F8FAFC;
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #1E293B;
          position: relative;
        }

        /* Toast Styles */
        .toast-notification {
          position: fixed;
          top: 24px;
          right: 24px;
          background: #fff;
          border-left: 5px solid #10B981;
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
          padding: 16px 24px;
          border-radius: 12px;
          z-index: 1000;
          display: flex;
          align-items: center;
          gap: 12px;
          transform: translateY(-20px);
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s cubic-bezier(0.68, -0.6, 0.32, 1.6);
        }
        .toast-notification.show {
          transform: translateY(0);
          opacity: 1;
          visibility: visible;
        }
        .toast-notification.info { border-left-color: #3B82F6; }
        .toast-notification.success { border-left-color: #10B981; }
        .toast-notification.warning { border-left-color: #F59E0B; }

        /* Premium Top Nav */
        .top-nav {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #E2E8F0;
          height: 72px;
          padding: 0 5%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .logo { 
          font-size: 24px; 
          font-weight: 900; 
          color: #E8272A; 
          text-decoration: none; 
          letter-spacing: -0.5px;
        }
        .logo span { color: #1E293B; font-weight: 300; }
        
        .nav-right { display: flex; align-items: center; gap: 16px; }
        .back-btn { 
          font-size: 13.5px; 
          font-weight: 700; 
          color: #475569; 
          text-decoration: none; 
          border: 1px solid #CBD5E1; 
          padding: 9px 18px; 
          border-radius: 10px; 
          display: flex; 
          align-items: center; 
          gap: 8px;
          transition: all 0.2s;
        }
        .back-btn:hover {
          background: #F1F5F9;
          border-color: #94A3B8;
          transform: translateY(-1px);
        }

        /* Banner Hero */
        .edit-hero {
          background: linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #B81C1F 100%);
          padding: 56px 5%;
          color: white;
          position: relative;
          overflow: hidden;
        }
        .edit-hero::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: radial-gradient(circle at 80% 20%, rgba(232, 39, 42, 0.15) 0%, transparent 50%);
          pointer-events: none;
        }
        .hero-title { font-size: 32px; font-weight: 900; letter-spacing: -0.8px; margin-bottom: 8px; }
        .hero-subtitle { font-size: 15px; color: #94A3B8; font-weight: 400; max-width: 600px; line-height: 1.5; }

        /* Main Container Layout */
        .container {
          max-width: 1200px;
          margin: -32px auto 60px;
          padding: 0 24px;
          position: relative;
          z-index: 10;
        }

        .editor-card {
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.05);
          border: 1px solid #E2E8F0;
          display: flex;
          min-height: 650px;
          overflow: hidden;
        }

        /* Sidebar Styling */
        .sidebar {
          width: 280px;
          background: #F8FAFC;
          border-right: 1px solid #E2E8F0;
          padding: 32px 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .tab-btn {
          width: calc(100% - 24px);
          margin: 0 12px;
          text-align: left;
          padding: 14px 20px;
          background: none;
          border: none;
          font-size: 14.5px;
          font-weight: 700;
          color: #64748B;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 14px;
          border-radius: 12px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .tab-btn i { font-size: 16px; width: 20px; text-align: center; color: #94A3B8; transition: inherit; }
        .tab-btn:hover { 
          background: #F1F5F9; 
          color: #0F172A; 
        }
        .tab-btn:hover i { color: #0F172A; }
        .tab-btn.active { 
          background: #FEF2F2; 
          color: #E8272A; 
        }
        .tab-btn.active i { color: #E8272A; }

        /* Form Content Area */
        .form-area {
          flex: 1;
          padding: 44px;
          background: #ffffff;
        }

        .section-title { 
          font-size: 20px; 
          font-weight: 800; 
          color: #0F172A; 
          margin-bottom: 28px; 
          border-bottom: 2px solid #F1F5F9; 
          padding-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .section-title i { color: #E8272A; font-size: 18px; }

        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group.full { grid-column: span 2; }
        
        .form-label { font-size: 13.5px; font-weight: 700; color: #334155; }
        .form-input { 
          padding: 13px 16px; 
          border: 1.5px solid #CBD5E1; 
          border-radius: 12px; 
          font-size: 14.5px; 
          outline: none; 
          color: #1E293B;
          background: #ffffff;
          transition: all 0.2s; 
          font-family: inherit;
        }
        .form-input::placeholder { color: #94A3B8; }
        .form-input:focus { 
          border-color: #E8272A; 
          box-shadow: 0 0 0 4px rgba(232, 39, 42, 0.08); 
          background: #ffffff;
        }
        
        textarea.form-input { resize: vertical; line-height: 1.6; }

        /* Tags and Pills */
        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 16px;
          min-height: 40px;
          padding: 12px;
          border: 1.5px dashed #E2E8F0;
          border-radius: 14px;
          background: #F8FAFC;
        }
        .pill-tag {
          background: #ffffff;
          border: 1.5px solid #E2E8F0;
          color: #334155;
          padding: 6px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
          transition: all 0.2s;
        }
        .pill-tag:hover {
          border-color: #E8272A;
          color: #E8272A;
          transform: translateY(-1px);
        }
        .pill-tag.brand {
          background: #EFF6FF;
          border-color: #BFDBFE;
          color: #1E40AF;
        }
        .pill-tag.brand:hover {
          border-color: #EF4444;
          color: #EF4444;
        }
        .pill-tag button {
          background: none;
          border: none;
          color: #94A3B8;
          cursor: pointer;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.15s;
        }
        .pill-tag button:hover { color: #EF4444; }

        .add-tag-wrapper {
          display: flex;
          gap: 10px;
        }
        .btn-add-tag {
          padding: 0 20px;
          background: #0F172A;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 13.5px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .btn-add-tag:hover {
          background: #1E293B;
          transform: translateY(-1px);
        }

        /* Checkbox switch */
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          user-select: none;
          font-size: 14.5px;
          font-weight: 700;
          color: #334155;
          margin-top: 10px;
        }
        .custom-switch {
          width: 48px;
          height: 26px;
          background: #CBD5E1;
          border-radius: 100px;
          position: relative;
          transition: background 0.3s;
        }
        .custom-switch::after {
          content: "";
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 3px;
          left: 3px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.15);
          transition: transform 0.3s;
        }
        input[type="checkbox"] { display: none; }
        input[type="checkbox"]:checked + .custom-switch { background: #10B981; }
        input[type="checkbox"]:checked + .custom-switch::after { transform: translateX(22px); }

        /* Media Upload */
        .photo-upload-box {
          border: 2px dashed #CBD5E1;
          border-radius: 16px;
          padding: 40px;
          text-align: center;
          cursor: pointer;
          background: #F8FAFC;
          margin-bottom: 24px;
          transition: all 0.2s;
        }
        .photo-upload-box:hover { border-color: #E8272A; background: #FEF2F2; }

        .photo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 16px; }
        .photo-card {
          border-radius: 14px;
          height: 120px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          color: #475569;
          font-weight: 700;
          font-size: 11.5px;
          border: 1px solid #E2E8F0;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
          transition: all 0.2s;
          text-align: center;
          padding: 8px;
        }
        .photo-card i { font-size: 28px; margin-bottom: 8px; opacity: 0.8; }
        .photo-card:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
        .photo-card .delete-btn {
          position: absolute;
          top: 6px; right: 6px;
          background: rgba(239, 68, 68, 0.9);
          color: white;
          border: none;
          border-radius: 50%;
          width: 22px;
          height: 22px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          transition: background 0.15s;
        }
        .photo-card .delete-btn:hover { background: #DC2626; }

        /* Spare parts list simple */
        .part-row { 
          display: grid; 
          grid-template-columns: 2fr 1fr 1fr auto; 
          gap: 16px; 
          align-items: flex-end; 
          margin-bottom: 16px; 
        }
        .btn-remove { 
          padding: 13px; 
          background: #FEE2E2; 
          color: #EF4444; 
          border: none; 
          border-radius: 12px; 
          cursor: pointer; 
          font-size: 14px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 48px;
        }
        .btn-remove:hover { background: #FCA5A5; color: #991B1B; }
        
        .inventory-hint-card {
          background: #EFF6FF;
          border: 1px solid #BFDBFE;
          border-radius: 14px;
          padding: 20px;
          margin-bottom: 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .inventory-hint-card p {
          font-size: 13.5px;
          color: #1E40AF;
          font-weight: 500;
          line-height: 1.5;
        }
        .inventory-hint-card p i { margin-right: 8px; font-size: 16px; }
        .btn-manage-inv {
          background: #1E40AF;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
          transition: all 0.2s;
          box-shadow: 0 4px 6px rgba(30, 64, 175, 0.1);
        }
        .btn-manage-inv:hover {
          background: #1D4ED8;
          transform: translateY(-1px);
        }

        /* Actions Bar */
        .actions-bar {
          display: flex;
          justify-content: flex-end;
          gap: 14px;
          margin-top: 40px;
          padding-top: 24px;
          border-top: 2px solid #F1F5F9;
        }
        .btn-cancel { 
          padding: 12px 28px; 
          border-radius: 12px; 
          font-size: 14.5px; 
          font-weight: 700; 
          background: white; 
          border: 1.5px solid #CBD5E1; 
          color: #475569; 
          cursor: pointer; 
          transition: all 0.2s;
        }
        .btn-cancel:hover { background: #F8FAFC; border-color: #94A3B8; }
        
        .btn-save { 
          padding: 12px 32px; 
          border-radius: 12px; 
          font-size: 14.5px; 
          font-weight: 800; 
          background: #E8272A; 
          border: none; 
          color: white; 
          cursor: pointer; 
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(232, 39, 42, 0.15);
        }
        .btn-save:hover { background: #B81C1F; transform: translateY(-1px); }

        /* Responsive */
        @media (max-width: 900px) {
          .editor-card { flex-direction: column; }
          .sidebar { width: 100%; padding: 20px 0; border-right: none; border-bottom: 1px solid #E2E8F0; }
          .tab-btn { width: calc(100% - 32px); margin: 0 16px; }
          .form-area { padding: 32px 24px; }
          .form-grid { grid-template-columns: 1fr; }
          .part-row { grid-template-columns: 1fr; gap: 10px; }
          .btn-remove { height: auto; padding: 12px; }
        }
      `}</style>

      {/* Toast Alert */}
      <div className={`toast-notification ${showToast ? "show" : ""} ${toastType}`}>
        <i className={`fa-solid ${
          toastType === "success" ? "fa-circle-check" :
          toastType === "info" ? "fa-circle-info" : "fa-triangle-exclamation"
        }`} style={{
          color: 
            toastType === "success" ? "#10B981" :
            toastType === "info" ? "#3B82F6" : "#F59E0B",
          fontSize: "18px"
        }}></i>
        <span style={{ fontSize: "14px", fontWeight: 700 }}>{toastMessage}</span>
      </div>

      <nav className="top-nav">
        <Link href="/" className="logo">
          AUTO<span>RIA</span>
        </Link>
        <div className="nav-right">
          <Link href="/service-center" className="back-btn">
            <i className="fa-solid fa-eye"></i> Live View Profile
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="edit-hero">
        <div className="hero-content">
          <h1 className="hero-title">Business Profile Editor</h1>
          <p className="hero-subtitle">
            Craft your workshop identity. Update your service offerings, operating schedules, support brands, and showcase photos to attract verified car owners across Egypt.
          </p>
        </div>
      </section>

      <div className="container">
        <div className="editor-card">
          {/* Sidebar */}
          <div className="sidebar">
            <button className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>
              <i className="fa-solid fa-building"></i> General Info
            </button>
            <button className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`} onClick={() => setActiveTab('contact')}>
              <i className="fa-solid fa-address-book"></i> Contact & Hours
            </button>
            <button className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>
              <i className="fa-solid fa-wrench"></i> Services & Brands
            </button>
            <button className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>
              <i className="fa-solid fa-boxes-stacked"></i> Simple Inventory
            </button>
            <button className={`tab-btn ${activeTab === 'media' ? 'active' : ''}`} onClick={() => setActiveTab('media')}>
              <i className="fa-solid fa-camera"></i> Workshop Gallery
            </button>
          </div>

          {/* Form Content Area */}
          <form className="form-area" onSubmit={handleSave}>
            
            {/* General Tab */}
            {activeTab === 'general' && (
              <div>
                <h2 className="section-title">
                  <i className="fa-solid fa-building-circle-gear"></i> General Information
                </h2>
                <div className="form-grid">
                  <div className="form-group full">
                    <label className="form-label">Service Center Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={generalInfo.name} 
                      onChange={(e) => setGeneralInfo({ ...generalInfo, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Established Year</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={generalInfo.established} 
                      onChange={(e) => setGeneralInfo({ ...generalInfo, established: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Number of Active Service Bays</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={generalInfo.bays} 
                      onChange={(e) => setGeneralInfo({ ...generalInfo, bays: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group full">
                    <label className="form-label">Public Business Description</label>
                    <textarea 
                      className="form-input" 
                      rows="4" 
                      value={generalInfo.description}
                      onChange={(e) => setGeneralInfo({ ...generalInfo, description: e.target.value })}
                      required
                    ></textarea>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <div>
                <h2 className="section-title">
                  <i className="fa-solid fa-address-book"></i> Contact & Working Hours
                </h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Customer Support Hotline</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={contactInfo.phone} 
                      onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Official WhatsApp Number</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={contactInfo.whatsapp} 
                      onChange={(e) => setContactInfo({ ...contactInfo, whatsapp: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group full">
                    <label className="form-label">Detailed Street Address (Cairo / Egypt)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={contactInfo.address} 
                      onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group full">
                    <label className="form-label">Operating Schedule Text</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={contactInfo.hours} 
                      onChange={(e) => setContactInfo({ ...contactInfo, hours: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group full">
                    <label className="form-label">Closed Weekly Holidays</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={contactInfo.closedDays} 
                      onChange={(e) => setContactInfo({ ...contactInfo, closedDays: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Services & Brands */}
            {activeTab === 'services' && (
              <div>
                <h2 className="section-title">
                  <i className="fa-solid fa-wrench"></i> Services Offered
                </h2>
                <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>
                  Select all service types your workshop provides. Changes are saved when you click "Save Business Profile".
                </p>
                <div className="tags-container" style={{ gap: 10 }}>
                  {ALL_SERVICE_TYPES.map(st => (
                    <label key={st.id} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 14px', borderRadius: 10, cursor: 'pointer',
                      border: `1.5px solid ${selectedServiceIds.has(st.id) ? '#E8272A' : '#E2E8F0'}`,
                      background: selectedServiceIds.has(st.id) ? '#FEF2F2' : '#fff',
                      fontWeight: 700, fontSize: 13,
                      color: selectedServiceIds.has(st.id) ? '#E8272A' : '#334155',
                      transition: 'all 0.15s',
                      userSelect: 'none',
                    }}>
                      <input
                        type="checkbox"
                        style={{ display: 'none' }}
                        checked={selectedServiceIds.has(st.id)}
                        onChange={() => toggleServiceId(st.id)}
                      />
                      {selectedServiceIds.has(st.id) ? '✓ ' : ''}{st.name}
                    </label>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 8 }}>
                  {selectedServiceIds.size} service{selectedServiceIds.size !== 1 ? 's' : ''} selected
                </p>

                <h2 className="section-title" style={{ marginTop: '40px' }}>
                  <i className="fa-solid fa-car"></i> Car Brands Serviced
                </h2>
                <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>
                  Select the car brands your mechanics are certified to work on.
                </p>
                <div className="tags-container" style={{ gap: 10 }}>
                  {ALL_CAR_BRANDS.map(cb => (
                    <label key={cb.id} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 14px', borderRadius: 10, cursor: 'pointer',
                      border: `1.5px solid ${selectedBrandIds.has(cb.id) ? '#1E40AF' : '#E2E8F0'}`,
                      background: selectedBrandIds.has(cb.id) ? '#EFF6FF' : '#fff',
                      fontWeight: 700, fontSize: 13,
                      color: selectedBrandIds.has(cb.id) ? '#1E40AF' : '#334155',
                      transition: 'all 0.15s',
                      userSelect: 'none',
                    }}>
                      <input
                        type="checkbox"
                        style={{ display: 'none' }}
                        checked={selectedBrandIds.has(cb.id)}
                        onChange={() => toggleBrandId(cb.id)}
                      />
                      {selectedBrandIds.has(cb.id) ? '✓ ' : ''}{cb.name}
                    </label>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 8, marginBottom: 32 }}>
                  {selectedBrandIds.size} brand{selectedBrandIds.size !== 1 ? 's' : ''} selected
                </p>

                <h2 className="section-title" style={{ marginTop: '40px' }}>
                  <i className="fa-solid fa-tags"></i> Pricing & Spare Parts
                </h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Base Service Estimate (EGP)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={pricing.min}
                      onChange={(e) => setPricing({ ...pricing, min: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Complex Service Estimate (EGP)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={pricing.max}
                      onChange={(e) => setPricing({ ...pricing, max: e.target.value })}
                    />
                  </div>
                  <div className="form-group full">
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={pricing.sellsParts}
                        onChange={(e) => setPricing({ ...pricing, sellsParts: e.target.checked })}
                      />
                      <div className="custom-switch"></div>
                      <span>Yes, we sell genuine spare parts directly from our workshop inventory</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Simple Inventory Tab */}
            {activeTab === 'inventory' && (
              <div>
                <h2 className="section-title">
                  <i className="fa-solid fa-boxes-stacked"></i> Simple Workshop Inventory
                </h2>

                <div className="inventory-hint-card">
                  <p>
                    <i className="fa-solid fa-triangle-exclamation"></i>
                    <strong>Advanced Stock Control Available:</strong> You can manage categories, view real-time KPIs, configure low stock thresholds, and access full details through our dedicated inventory panel.
                  </p>
                  <Link href="/spare-parts-inventory" className="btn-manage-inv">
                    Go to Spare Parts Inventory →
                  </Link>
                </div>

                <label className="form-label" style={{ marginBottom: '16px', display: 'block' }}>
                  Active Stock Listings
                </label>

                {parts.map(p => (
                  <div className="part-row" key={p.id}>
                    <div className="form-group">
                      <label className="form-label">Part Name</label>
                      <input type="text" className="form-input" defaultValue={p.name} disabled />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Price (EGP)</label>
                      <input type="number" className="form-input" defaultValue={p.price} disabled />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Current Stock</label>
                      <input type="number" className="form-input" defaultValue={p.stock} disabled />
                    </div>
                    <button type="button" className="btn-remove" onClick={() => handleRemovePart(p.id, p.name)}>
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                ))}

                {parts.length === 0 && (
                  <div style={{textAlign: 'center', padding: '32px', color: '#94A3B8', fontSize: '14px'}}>
                    No spare parts listed. Use the form below to add.
                  </div>
                )}

                <h3 className="section-title" style={{ marginTop: '36px', fontSize: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>
                  Quick Add Spare Part
                </h3>
                <div className="part-row" style={{ background: '#F8FAFC', padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                  <div className="form-group">
                    <label className="form-label">Part Name / Model No.</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Engine Spark Plug (NGK)" 
                      value={newPartName}
                      onChange={(e) => setNewPartName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price (EGP)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="e.g. 180" 
                      value={newPartPrice}
                      onChange={(e) => setNewPartPrice(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock Quantity</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="e.g. 50" 
                      value={newPartStock}
                      onChange={(e) => setNewPartStock(e.target.value)}
                    />
                  </div>
                  <button type="button" className="btn-add-tag" style={{ height: '48px', width: '100%' }} onClick={handleAddPart}>
                    <i className="fa-solid fa-plus"></i> Add Part
                  </button>
                </div>
              </div>
            )}

            {/* Media Gallery Tab */}
            {activeTab === 'media' && (
              <div>
                <h2 className="section-title">
                  <i className="fa-solid fa-camera"></i> Workshop Photos Gallery
                </h2>
                
                <label className="photo-upload-box" style={{ cursor: uploading ? "wait" : "pointer", display: "block" }}>
                  <input type="file" accept="image/*" multiple hidden disabled={uploading} onChange={handlePhotoUpload} />
                  {uploading ? (
                    <div>
                      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '36px', color: '#E8272A', marginBottom: '12px' }}></i>
                      <p style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B' }}>Uploading photos…</p>
                    </div>
                  ) : (
                    <div>
                      <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '36px', color: '#94A3B8', marginBottom: '12px' }}></i>
                      <p style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B' }}>Upload workshop photos</p>
                      <p style={{ fontSize: '12.5px', color: '#64748B', marginTop: '6px' }}>Supports PNG, JPG — up to 10MB per file</p>
                    </div>
                  )}
                </label>
                {profileLoading && <p style={{ color: '#64748B', marginBottom: 12 }}>Loading profile…</p>}

                <label className="form-label" style={{ marginBottom: '12px', display: 'block' }}>
                  Uploaded Gallery Images ({photos.length})
                </label>
                <div className="photo-grid">
                  {photos.map(p => (
                    <div key={p.id} className="photo-card" style={{ background: p.src ? `url(${p.src}) center/cover` : p.bg }}>
                      <button 
                        type="button" 
                        className="delete-btn" 
                        onClick={(e) => { e.stopPropagation(); setPhotos(photos.filter(x => x.id !== p.id)); }}
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                      <i className={`fa-solid ${p.icon}`}></i>
                      <span>{p.label}</span>
                    </div>
                  ))}
                  {photos.length === 0 && (
                    <div style={{ gridColumn: 'span 4', textAlign: 'center', color: '#94A3B8', padding: '24px', fontSize: '13px' }}>
                      No photos uploaded yet. Show potential customers what your workshop looks like.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="actions-bar">
              <Link href="/service-center" style={{ textDecoration: 'none' }}>
                <button type="button" className="btn-cancel">Discard Changes</button>
              </Link>
              <button type="submit" className="btn-save">Save Business Profile</button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
