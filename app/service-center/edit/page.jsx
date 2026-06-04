"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { serviceCentersService } from "@/lib/api/serviceCentersService";
import { lookupsService } from "@/lib/api/lookupsService";
import { useRoleGuard } from "@/lib/hooks/useRoleGuard";

export default function EditServiceCenterProfile() {
  const { authorized, checking } = useRoleGuard();
  const router = useRouter();
  
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState("general");
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [centerId, setCenterId] = useState("");
  const [approvalStatus, setApprovalStatus] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  // Toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  // Lookup data from API
  const [availableServices, setAvailableServices] = useState([]);
  const [availableBrands, setAvailableBrands] = useState([]);

  // Form State variables
  const [generalInfo, setGeneralInfo] = useState({
    name: "",
    phone: "",
    businessEmail: "",
    yearEstablished: "",
    description: "",
    numServiceBays: "",
    type: 0, // 0 = Maintenance, 1 = PartsStore, 2 = Both
    ownerFullName: "",
    ownerNationalId: "",
    taxCardNo: "",
    commercialRegNo: "",
  });

  const [locationInfo, setLocationInfo] = useState({
    governorate: "",
    district: "",
    address: "",
  });

  const [scLat, setScLat] = useState("");
  const [scLng, setScLng] = useState("");
  const [scLocStatus, setScLocStatus] = useState(""); // "" | "capturing" | "captured" | "error"

  const [operatingHours, setOperatingHours] = useState({
    Monday: { openTime: "09:00", closeTime: "17:00", isClosed: false },
    Tuesday: { openTime: "09:00", closeTime: "17:00", isClosed: false },
    Wednesday: { openTime: "09:00", closeTime: "17:00", isClosed: false },
    Thursday: { openTime: "09:00", closeTime: "17:00", isClosed: false },
    Friday: { openTime: "09:00", closeTime: "17:00", isClosed: false },
    Saturday: { openTime: "09:00", closeTime: "14:00", isClosed: false },
    Sunday: { openTime: "00:00", closeTime: "00:00", isClosed: true },
  });

  // Selected Service IDs and Brand IDs (using Sets for O(1) lookups)
  const [selectedServiceIds, setSelectedServiceIds] = useState(new Set());
  const [selectedBrandIds, setSelectedBrandIds] = useState(new Set());

  // Photos state
  const [photos, setPhotos] = useState([]); // URLs from backend
  const [pendingPhotos, setPendingPhotos] = useState([]); // File objects
  const [pendingPhotoPreviews, setPendingPhotoPreviews] = useState([]); // Base64 or object URLs for previews
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  // Documents state
  const [docFiles, setDocFiles] = useState({
    commercialReg: null,
    taxCard: null,
    nationalId: null,
  });
  const [existingDocs, setExistingDocs] = useState({
    commercialReg: null,
    taxCard: null,
    nationalId: null,
  });
  const [uploadingDocs, setUploadingDocs] = useState(false);

  // Static fallback lists
  const STATIC_SERVICE_TYPES = [
    { id: "8E4EC0D1-4940-43D7-B809-D4F38111375E", name: "Oil Change" },
    { id: "1CE0FE70-1308-4FB2-B1CD-8B0E326ECBBD", name: "Brakes" },
    { id: "5E7AE718-406E-4040-A99B-79975A468B04", name: "Suspension" },
    { id: "C0E62C6E-3BC1-4BF8-A6A4-7AC7CBF2E00D", name: "AC Repair" },
    { id: "09014C26-42D5-4742-8119-F33BB2B94D2D", name: "Engine Diagnostics" },
    { id: "2F85B94E-C7A6-4FE3-8C62-C464EBC021B6", name: "Tires" },
    { id: "07109B5A-5EFA-4234-A84B-EB5EFB32A877", name: "Electrical" },
    { id: "ED392799-AC48-4DF4-A43B-4067838C5782", name: "Body Work" },
  ];

  const STATIC_CAR_BRANDS = [
    { id: "2DD8709F-DDFA-452C-A23B-1BCECD6CCFAE", name: "Toyota" },
    { id: "3AA77C79-B11C-4455-9BC9-36B206BA5D0F", name: "Hyundai" },
    { id: "4BB88D80-CC22-5566-AAD0-47C317CB6E1F", name: "Kia" },
    { id: "5CC99E91-DD33-6677-BBE1-58D428DC7F20", name: "Nissan" },
    { id: "6DD00F02-EE44-7788-CCF2-69E539ED8030", name: "Honda" },
    { id: "7EE11013-FF55-8899-DD03-70F64AFE9141", name: "BMW" },
    { id: "8FF22124-0066-99AA-EE14-81077BFF0252", name: "Mercedes-Benz" },
    { id: "9AA33235-1177-AABB-FF25-92188C001363", name: "Chevrolet" },
    { id: "ABB44346-2288-BBCC-0036-A3299D112474", name: "Ford" },
    { id: "BCC55457-3399-CCDD-1147-B430AE223585", name: "Mitsubishi" },
    { id: "CDD66568-44AA-DDEE-2258-C541BF334696", name: "Suzuki" },
    { id: "DEE77679-55BB-EEFF-3369-D652C0445707", name: "Volkswagen" },
  ];

  // Helper to show toasts
  const triggerToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4500);
  };

  // 1. Initial Load of Lookup and Profile Data
  useEffect(() => {
    const loadData = async () => {
      // Step 1.1: Fetch dynamic lookups
      let services = STATIC_SERVICE_TYPES;
      let brands = STATIC_CAR_BRANDS;

      try {
        const sRes = await lookupsService.getServiceTypes();
        if (sRes?.data) services = sRes.data;
        else if (Array.isArray(sRes)) services = sRes;
      } catch (err) {
        console.warn("Could not fetch service type lookups, using fallback:", err);
      }

      try {
        const bRes = await lookupsService.getCarBrands();
        if (bRes?.data) brands = bRes.data;
        else if (Array.isArray(bRes)) brands = bRes;
      } catch (err) {
        console.warn("Could not fetch car brand lookups, using fallback:", err);
      }

      setAvailableServices(services);
      setAvailableBrands(brands);

      // Step 1.2: Fetch center profile
      try {
        const res = await serviceCentersService.getMy();
        const d = res?.data ?? res;
        if (!d) return;

        setCenterId(d.id || d.Id || "");
        setApprovalStatus(d.approvalStatus || "");
        setRejectionReason(d.rejectionReason || "");

        // Map type string/number
        let typeVal = 0;
        if (d.type === "PartsStore" || d.type === 1 || String(d.type).toLowerCase() === "partsstore") typeVal = 1;
        else if (d.type === "Both" || d.type === 2 || String(d.type).toLowerCase() === "both") typeVal = 2;

        setGeneralInfo({
          name: d.name || "",
          phone: d.phone || "",
          businessEmail: d.businessEmail || "",
          yearEstablished: String(d.yearEstablished || ""),
          description: d.description || "",
          numServiceBays: String(d.numServiceBays || "1"), // default fallback if missing
          type: typeVal,
          ownerFullName: d.ownerFullName || "",
          ownerNationalId: d.ownerNationalId || "",
          taxCardNo: d.taxCardNo || "",
          commercialRegNo: d.commercialRegNo || "",
        });

        setLocationInfo({
          governorate: d.governorate || "",
          district: d.district || "",
          address: d.streetAddress || "",
        });

        if (d.latitude !== undefined && d.longitude !== undefined) {
          setScLat(String(d.latitude));
          setScLng(String(d.longitude));
        }

        // Map services matching lookups
        const apiServiceNames = (d.serviceTypes || []).map(s => 
          typeof s === "string" ? s.toLowerCase() : (s.name || s.id || "").toLowerCase()
        );
        const mappedServiceIds = services
          .filter(st => apiServiceNames.includes(st.name.toLowerCase()) || apiServiceNames.includes(st.id.toLowerCase()))
          .map(st => st.id);
        setSelectedServiceIds(new Set(mappedServiceIds));

        // Map brands matching lookups
        const apiBrandNames = (d.carBrands || []).map(b => 
          typeof b === "string" ? b.toLowerCase() : (b.name || b.id || "").toLowerCase()
        );
        const mappedBrandIds = brands
          .filter(cb => apiBrandNames.includes(cb.name.toLowerCase()) || apiBrandNames.includes(cb.id.toLowerCase()))
          .map(cb => cb.id);
        setSelectedBrandIds(new Set(mappedBrandIds));

        // Operating hours mapping
        const defaultHours = {
          Monday: { openTime: "09:00", closeTime: "17:00", isClosed: false },
          Tuesday: { openTime: "09:00", closeTime: "17:00", isClosed: false },
          Wednesday: { openTime: "09:00", closeTime: "17:00", isClosed: false },
          Thursday: { openTime: "09:00", closeTime: "17:00", isClosed: false },
          Friday: { openTime: "09:00", closeTime: "17:00", isClosed: false },
          Saturday: { openTime: "09:00", closeTime: "14:00", isClosed: false },
          Sunday: { openTime: "00:00", closeTime: "00:00", isClosed: true },
        };

        if (d.operatingHours && d.operatingHours.length > 0) {
          const loadedHours = { ...defaultHours };
          d.operatingHours.forEach(h => {
            if (h.day) {
              loadedHours[h.day] = {
                openTime: h.openTime ? h.openTime.slice(0, 5) : "09:00",
                closeTime: h.closeTime ? h.closeTime.slice(0, 5) : "17:00",
                isClosed: !!h.isClosed,
              };
            }
          });
          setOperatingHours(loadedHours);
        }

        // Photos mapping
        setPhotos(d.photos || []);

        // Documents mapping
        const docsObj = { commercialReg: null, taxCard: null, nationalId: null };
        if (d.documents && d.documents.length > 0) {
          d.documents.forEach(doc => {
            if (doc.documentType === "CommercialReg" || doc.documentType === "CommercialRegistry") {
              docsObj.commercialReg = doc.fileUrl;
            } else if (doc.documentType === "TaxCard") {
              docsObj.taxCard = doc.fileUrl;
            } else if (doc.documentType === "NationalId" || doc.documentType === "OwnerNationalId") {
              docsObj.nationalId = doc.fileUrl;
            }
          });
        }
        setExistingDocs(docsObj);

      } catch (err) {
        console.error("Profile load error:", err);
        triggerToast("Could not load your service center profile", "warning");
      } finally {
        setProfileLoading(false);
      }
    };

    loadData();
  }, []);

  if (checking) return null;
  if (!authorized) return null;

  // Geolocation detector
  const handleDetectLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      triggerToast("Geolocation is not supported by your browser.", "warning");
      return;
    }

    setScLocStatus("capturing");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setScLat(position.coords.latitude.toFixed(6));
        setScLng(position.coords.longitude.toFixed(6));
        setScLocStatus("captured");
        triggerToast("GPS Coordinates detected successfully!", "success");
        setTimeout(() => setScLocStatus(""), 3000);
      },
      (error) => {
        console.warn("Capture failed:", error);
        setScLocStatus("error");
        triggerToast(error?.message || "GPS permission denied.", "warning");
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  // Toggle handlers for services & brands
  const handleToggleService = (id) => {
    setSelectedServiceIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleToggleBrand = (id) => {
    setSelectedBrandIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Photo handlers
  const handleAddPhotos = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setPendingPhotos(prev => [...prev, ...files]);
    
    // Create local object URLs for instant display
    const previews = files.map(file => URL.createObjectURL(file));
    setPendingPhotoPreviews(prev => [...prev, ...previews]);
    triggerToast(`Added ${files.length} photo(s) to pending gallery queue`, "info");
  };

  const handleRemovePendingPhoto = (index) => {
    setPendingPhotos(prev => prev.filter((_, i) => i !== index));
    setPendingPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Save handler
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    const warnings = [];

    try {
      // Step 1: Basic profile (numServiceBays remains in payload but hidden in UI)
      try {
        await serviceCentersService.updateMy({
          name: generalInfo.name.trim(),
          phone: generalInfo.phone.trim(),
          businessEmail: generalInfo.businessEmail.trim(),
          yearEstablished: Number(generalInfo.yearEstablished),
          description: generalInfo.description.trim() || "Auto Maintenance Services",
          numServiceBays: Number(generalInfo.numServiceBays) || 1,
          type: Number(generalInfo.type),
          ownerFullName: generalInfo.ownerFullName.trim(),
        });
      } catch (err) {
        throw new Error(`Failed to update basic profile: ${err.message}`);
      }

      // Step 2: Location — always save if required fields are present
      const addrTrimmed = locationInfo.address.trim();
      const govTrimmed = locationInfo.governorate.trim();
      const distTrimmed = locationInfo.district.trim();
      if (addrTrimmed && govTrimmed && distTrimmed) {
        try {
          await serviceCentersService.setMyLocation({
            latitude: scLat ? parseFloat(scLat) : 0,
            longitude: scLng ? parseFloat(scLng) : 0,
            governorate: govTrimmed,
            district: distTrimmed,
            address: addrTrimmed,
          });
        } catch (err) {
          console.warn("Location save failed:", err);
          warnings.push("Location");
        }
      }
      // else: location fields incomplete — skip silently, no error

      // Step 3: Service Types (draft-only)
      const isDraft = approvalStatus === "Draft" || approvalStatus === "" || !approvalStatus;
      if (isDraft) {
        try {
          await serviceCentersService.updateServiceTypes([...selectedServiceIds]);
        } catch (err) {
          console.warn("Service types save failed:", err);
          warnings.push("Services Offered");
        }

        // Step 4: Car Brands (draft-only)
        try {
          await serviceCentersService.updateCarBrands([...selectedBrandIds]);
        } catch (err) {
          console.warn("Car brands save failed:", err);
          warnings.push("Car Brands");
        }

        // Step 5: Operating Hours (draft-only)
        try {
          const hoursPayload = {
            operatingHours: Object.keys(operatingHours).map(day => ({
              day: day,
              openTime: operatingHours[day].isClosed ? "00:00" : operatingHours[day].openTime.slice(0, 5),
              closeTime: operatingHours[day].isClosed ? "00:00" : operatingHours[day].closeTime.slice(0, 5),
              isClosed: operatingHours[day].isClosed
            }))
          };
          await serviceCentersService.updateOperatingHours(hoursPayload);
        } catch (err) {
          console.warn("Operating hours save failed:", err);
          warnings.push("Operating Hours");
        }
      } else {
        // Already submitted/approved — silently skip draft-only fields
        console.info("Skipping draft-only fields (service types, brands, hours) — status:", approvalStatus);
      }

      // Step 6: Documents
      if (docFiles.commercialReg || docFiles.taxCard || docFiles.nationalId) {
        try {
          setUploadingDocs(true);
          const docsFormData = new FormData();
          if (docFiles.commercialReg) docsFormData.append("CommercialRegFile", docFiles.commercialReg);
          if (docFiles.taxCard) docsFormData.append("TaxCardFile", docFiles.taxCard);
          if (docFiles.nationalId) docsFormData.append("OwnerNationalIdFile", docFiles.nationalId);
          
          await serviceCentersService.uploadDocuments(docsFormData);
          setDocFiles({ commercialReg: null, taxCard: null, nationalId: null });
        } catch (err) {
          console.warn("Documents upload failed:", err);
          warnings.push("Legal Documents");
        } finally {
          setUploadingDocs(false);
        }
      }

      // Step 7: Gallery Photos
      if (pendingPhotos.length > 0) {
        try {
          setUploadingPhotos(true);
          const photosFormData = new FormData();
          pendingPhotos.forEach(file => photosFormData.append("Photos", file));
          
          await serviceCentersService.uploadPhotos(photosFormData);
          setPendingPhotos([]);
          setPendingPhotoPreviews([]);
        } catch (err) {
          console.warn("Photos upload failed:", err);
          warnings.push("Gallery Photos");
        } finally {
          setUploadingPhotos(false);
        }
      }

      // Sync backend state back to UI
      const refreshRes = await serviceCentersService.getMy();
      const updatedD = refreshRes?.data ?? refreshRes;
      if (updatedD) {
        setPhotos(updatedD.photos || []);
        const docsObj = { commercialReg: null, taxCard: null, nationalId: null };
        (updatedD.documents || []).forEach(doc => {
          if (doc.documentType === "CommercialReg" || doc.documentType === "CommercialRegistry") docsObj.commercialReg = doc.fileUrl;
          else if (doc.documentType === "TaxCard") docsObj.taxCard = doc.fileUrl;
          else if (doc.documentType === "NationalId" || doc.documentType === "OwnerNationalId") docsObj.nationalId = doc.fileUrl;
        });
        setExistingDocs(docsObj);
      }

      if (warnings.length > 0) {
        triggerToast(
          `Profile saved! (Note: ${warnings.join(", ")} skipped. Some properties require Draft status to modify).`,
          "warning"
        );
      } else {
        triggerToast("Business profile updated successfully!", "success");
      }

    } catch (err) {
      console.error("Global save error:", err);
      triggerToast(err.message || "Failed to update profile details", "warning");
    } finally {
      setSaving(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="loading-container">
        <style>{`
          .loading-container {
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #F8FAFC;
            font-family: 'Outfit', sans-serif;
            color: #1E293B;
          }
          .spinner {
            border: 4px solid rgba(232, 39, 42, 0.1);
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border-left-color: #E8272A;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .load-wrapper { text-align: center; }
        `}</style>
        <div className="load-wrapper">
          <div className="spinner"></div>
          <p style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "0.5px" }}>Loading Workshop Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-edit-container">
      {/* Light Theme Dynamic Styling System */}
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        .profile-edit-container {
          min-height: 100vh;
          background: #F8FAFC;
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #1E293B;
          padding-bottom: 80px;
        }

        /* Premium Top Nav */
        .top-nav {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          height: 80px;
          padding: 0 5%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        
        .logo {
          font-size: 26px;
          font-weight: 900;
          color: #1E293B;
          text-decoration: none;
          letter-spacing: -0.5px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .logo span { color: #E8272A; }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .action-btn {
          font-size: 14px;
          font-weight: 700;
          color: #475569;
          text-decoration: none;
          background: rgba(0, 0, 0, 0.02);
          border: 1px solid rgba(0, 0, 0, 0.08);
          padding: 10px 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .action-btn:hover {
          background: rgba(0, 0, 0, 0.05);
          border-color: rgba(0, 0, 0, 0.12);
          color: #0F172A;
          transform: translateY(-1px);
        }
        .action-btn.primary {
          background: #E8272A;
          border: none;
          color: #FFF;
          box-shadow: 0 8px 20px rgba(232, 39, 42, 0.15);
        }
        .action-btn.primary:hover {
          background: #C61B1E;
          box-shadow: 0 10px 24px rgba(232, 39, 42, 0.25);
        }

        /* Toast Component styling */
        .toast {
          position: fixed;
          top: 24px;
          right: 24px;
          background: #FFFFFF;
          border-left: 4px solid #10B981;
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
          padding: 16px 24px;
          z-index: 1000;
          display: flex;
          align-items: center;
          gap: 12px;
          transform: translateY(-20px);
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s cubic-bezier(0.68, -0.6, 0.32, 1.6);
        }
        .toast.show {
          transform: translateY(0);
          opacity: 1;
          visibility: visible;
        }
        .toast.warning { border-left-color: #EF4444; }
        .toast.info { border-left-color: #3B82F6; }

        /* Main Grid layout */
        .layout-wrapper {
          max-width: 1300px;
          margin: 40px auto 0;
          padding: 0 24px;
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 40px;
        }

        /* Sidebar Tabs Navigation */
        .navigation-panel {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tab-nav-item {
          width: 100%;
          text-align: left;
          background: transparent;
          border: 1px solid transparent;
          padding: 16px 20px;
          border-radius: 16px;
          color: #64748B;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: all 0.2s ease;
        }
        .tab-nav-item i { font-size: 18px; width: 22px; text-align: center; opacity: 0.7; }
        .tab-nav-item:hover {
          color: #0F172A;
          background: rgba(0,0,0,0.02);
          border-color: rgba(0,0,0,0.04);
        }
        .tab-nav-item.active {
          color: #E8272A;
          background: #FEF2F2;
          border-color: rgba(232, 39, 42, 0.2);
        }
        .tab-nav-item.active i { color: #E8272A; opacity: 1; }

        /* Status Banner */
        .status-banner {
          background: #FFFFFF;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 24px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
        }
        .status-badge {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .status-badge.approved { background: rgba(16, 185, 129, 0.15); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.2); }
        .status-badge.pending { background: rgba(245, 158, 11, 0.15); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.2); }
        .status-badge.rejected { background: rgba(239, 68, 68, 0.15); color: #EF4444; border: 1px solid rgba(239, 68, 68, 0.2); }
        .status-badge.draft { background: rgba(148, 163, 184, 0.15); color: #94A3B8; border: 1px solid rgba(148, 163, 184, 0.2); }

        /* Forms Card */
        .form-glass-card {
          background: #FFFFFF;
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
        }

        .panel-heading {
          font-size: 22px;
          font-weight: 800;
          color: #0F172A;
          margin-bottom: 30px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid rgba(0,0,0,0.06);
          padding-bottom: 16px;
        }
        .panel-heading i { color: #E8272A; }

        .fields-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 24px;
        }
        .span-2 { grid-column: span 2; }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .field-label {
          font-size: 13.5px;
          font-weight: 700;
          color: #64748B;
        }
        
        .styled-input {
          background: #FFFFFF;
          border: 1.5px solid #E2E8F0;
          border-radius: 12px;
          padding: 14px 18px;
          font-size: 15px;
          color: #1E293B;
          outline: none;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .styled-input:focus {
          border-color: #E8272A;
          box-shadow: 0 0 0 4px rgba(232, 39, 42, 0.08);
        }
        .styled-input::placeholder { color: #94A3B8; }
        .styled-input:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Custom Dropdowns */
        .styled-select {
          appearance: none;
          background: #FFFFFF url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E") no-repeat right 16px center/16px;
          padding-right: 48px;
        }

        /* Checkbox selectors grid */
        .lookups-wrapper {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
          gap: 14px;
          margin-bottom: 24px;
        }
        
        .lookup-card {
          background: #FFFFFF;
          border: 1.5px solid #E2E8F0;
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          user-select: none;
          transition: all 0.2s ease;
        }
        .lookup-card:hover {
          border-color: #94A3B8;
        }
        .lookup-card.selected {
          background: #FEF2F2;
          border-color: #FCA5A5;
        }
        
        .checkbox-indicator {
          width: 20px;
          height: 20px;
          border-radius: 6px;
          border: 1.5px solid #CBD5E1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          color: #FFF;
          transition: all 0.15s ease;
        }
        .lookup-card.selected .checkbox-indicator {
          background: #E8272A;
          border-color: #E8272A;
        }

        /* Operating hours row editor */
        .hours-day-row {
          display: grid;
          grid-template-columns: 140px 100px 1fr;
          align-items: center;
          gap: 20px;
          padding: 16px;
          border-bottom: 1px solid #E2E8F0;
        }
        .hours-day-row:last-child { border-bottom: none; }
        
        .day-title { font-weight: 700; color: #1E293B; }
        
        .hours-inputs {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .hours-inputs span { color: #64748B; font-weight: 700; }
        
        /* Switch button */
        .switch-lbl {
          display: flex;
          align-items: center;
          cursor: pointer;
          user-select: none;
        }
        .switch-box {
          width: 44px;
          height: 22px;
          background: #E2E8F0;
          border-radius: 100px;
          position: relative;
          transition: all 0.2s ease;
        }
        .switch-box::after {
          content: "";
          position: absolute;
          width: 16px;
          height: 16px;
          background: #FFF;
          border-radius: 50%;
          top: 3px; left: 3px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: all 0.2s ease;
        }
        .switch-lbl input { display: none; }
        .switch-lbl input:checked + .switch-box {
          background: #10B981;
        }
        .switch-lbl input:checked + .switch-box::after {
          transform: translateX(22px);
        }

        /* Photos Gallery grid & uploader */
        .upload-drag-box {
          border: 2px dashed #E2E8F0;
          border-radius: 20px;
          padding: 40px;
          text-align: center;
          cursor: pointer;
          background: #F8FAFC;
          transition: all 0.2s ease;
          margin-bottom: 30px;
        }
        .upload-drag-box:hover {
          border-color: #E8272A;
          background: #FEF2F2;
        }
        .upload-drag-box i { font-size: 40px; color: #94A3B8; margin-bottom: 12px; }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 16px;
        }
        
        .gallery-photo-card {
          border-radius: 16px;
          aspect-ratio: 4/3;
          position: relative;
          background-position: center;
          background-size: cover;
          border: 1px solid #E2E8F0;
          overflow: hidden;
        }
        .gallery-photo-card.pending {
          border-color: rgba(245, 158, 11, 0.4);
        }
        .gallery-photo-card.pending::after {
          content: "Pending Upload";
          position: absolute;
          bottom: 0; left: 0; right: 0;
          background: rgba(245, 158, 11, 0.85);
          color: #FFF;
          font-size: 11px;
          font-weight: 800;
          text-align: center;
          padding: 4px 0;
        }
        
        .photo-delete-overlay {
          position: absolute;
          top: 8px; right: 8px;
          background: rgba(239, 68, 68, 0.95);
          color: #FFF;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          transition: transform 0.2s ease;
        }
        .photo-delete-overlay:hover {
          transform: scale(1.1);
          background: #DC2626;
        }

        /* Document cards list */
        .doc-item-card {
          background: #F8FAFC;
          border: 1.5px solid #E2E8F0;
          border-radius: 20px;
          padding: 24px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 20px;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .doc-meta { display: flex; flex-direction: column; gap: 4px; }
        .doc-title { font-weight: 700; color: #1E293B; font-size: 16px; }
        .doc-status-text { font-size: 13px; color: #64748B; display: flex; align-items: center; gap: 6px; }
        
        .file-upload-trigger {
          background: #FFFFFF;
          border: 1.5px solid #CBD5E1;
          border-radius: 12px;
          padding: 10px 18px;
          font-size: 13px;
          font-weight: 700;
          color: #475569;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }
        .file-upload-trigger:hover {
          background: #F1F5F9;
          border-color: #94A3B8;
        }
        .file-upload-trigger.has-file {
          border-color: #A7F3D0;
          background: #ECFDF5;
          color: #065F46;
        }

        /* Bottom Submit Panel */
        .submit-section {
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          margin-top: 40px;
          border-top: 1px solid #E2E8F0;
          padding-top: 24px;
        }

        /* Responsiveness */
        @media (max-width: 900px) {
          .layout-wrapper { grid-template-columns: 1fr; gap: 30px; }
          .fields-grid { grid-template-columns: 1fr; }
          .span-2 { grid-column: span 1; }
          .hours-day-row { grid-template-columns: 1fr; gap: 12px; justify-items: start; }
        }
      `}</style>

      {/* Global Action Toast Notification */}
      <div className={`toast ${showToast ? "show" : ""} ${toastType}`}>
        <i className={`fa-solid ${
          toastType === "success" ? "fa-circle-check" : 
          toastType === "info" ? "fa-circle-info" : "fa-triangle-exclamation"
        }`} style={{
          color: toastType === "success" ? "#10B981" : toastType === "info" ? "#3B82F6" : "#EF4444",
          fontSize: "18px"
        }}></i>
        <span style={{ fontSize: "14.5px", fontWeight: 700, color: "#1E293B" }}>{toastMessage}</span>
      </div>

      {/* Top Header Controls */}
      <nav className="top-nav">
        <Link href="/service-center" className="logo">
          AUTO<span>RIA</span>
        </Link>
        <div className="nav-actions">
          <Link href="/service-center" className="action-btn">
            <i className="fa-solid fa-arrow-left"></i> Dashboard
          </Link>
          {centerId && (
            <Link href={`/service-center-profile/${centerId}`} className="action-btn primary">
              <i className="fa-solid fa-eye"></i> Live Profile View
            </Link>
          )}
        </div>
      </nav>

      {/* Main Grid Wrapper */}
      <div className="layout-wrapper">
        
        {/* Left Hand Navigation Menu */}
        <div className="navigation-panel">
          
          {/* Status Display Card */}
          <div className="status-banner">
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
                Approval Status
              </div>
              <span className={`status-badge ${approvalStatus.toLowerCase() || "draft"}`}>
                {approvalStatus || "Draft"}
              </span>
              {rejectionReason && (
                <div style={{ marginTop: "12px", fontSize: "13px", color: "#EF4444", lineHeight: 1.4 }}>
                  <strong>Reason:</strong> {rejectionReason}
                </div>
              )}
            </div>
          </div>

          <button className={`tab-nav-item ${activeTab === "general" ? "active" : ""}`} onClick={() => setActiveTab("general")}>
            <i className="fa-solid fa-building"></i> General Information
          </button>
          
          <button className={`tab-nav-item ${activeTab === "location" ? "active" : ""}`} onClick={() => setActiveTab("location")}>
            <i className="fa-solid fa-map-location-dot"></i> Location & GPS
          </button>
          
          <button className={`tab-nav-item ${activeTab === "hours" ? "active" : ""}`} onClick={() => setActiveTab("hours")}>
            <i className="fa-solid fa-clock"></i> Working Schedule
          </button>
          
          <button className={`tab-nav-item ${activeTab === "services" ? "active" : ""}`} onClick={() => setActiveTab("services")}>
            <i className="fa-solid fa-screwdriver-wrench"></i> Services & Brands
          </button>
          
          <button className={`tab-nav-item ${activeTab === "gallery" ? "active" : ""}`} onClick={() => setActiveTab("gallery")}>
            <i className="fa-solid fa-images"></i> Photos Gallery
          </button>
          
          <button className={`tab-nav-item ${activeTab === "documents" ? "active" : ""}`} onClick={() => setActiveTab("documents")}>
            <i className="fa-solid fa-file-shield"></i> Legal Documents
          </button>
        </div>

        {/* Right Hand Form Content Area */}
        <form className="form-glass-card" onSubmit={handleSaveProfile}>

          {/* 1. General Tab */}
          {activeTab === "general" && (
            <div>
              <h2 className="panel-heading">
                <i className="fa-solid fa-building"></i> General Information
              </h2>
              
              <div className="fields-grid">
                <div className="input-group span-2">
                  <label className="field-label">Service Center Name</label>
                  <input
                    type="text"
                    className="styled-input"
                    value={generalInfo.name}
                    onChange={(e) => setGeneralInfo({ ...generalInfo, name: e.target.value })}
                    required
                    placeholder="e.g. Al Nour Auto Center"
                  />
                </div>

                <div className="input-group">
                  <label className="field-label">Customer Hotline / Phone</label>
                  <input
                    type="tel"
                    className="styled-input"
                    value={generalInfo.phone}
                    onChange={(e) => setGeneralInfo({ ...generalInfo, phone: e.target.value })}
                    required
                    placeholder="e.g. 01012345678"
                  />
                </div>

                <div className="input-group">
                  <label className="field-label">Business Email</label>
                  <input
                    type="email"
                    className="styled-input"
                    value={generalInfo.businessEmail}
                    onChange={(e) => setGeneralInfo({ ...generalInfo, businessEmail: e.target.value })}
                    required
                    placeholder="e.g. contact@autocenter.com"
                  />
                </div>

                <div className="input-group">
                  <label className="field-label">Established Year</label>
                  <input
                    type="number"
                    className="styled-input"
                    value={generalInfo.yearEstablished}
                    onChange={(e) => setGeneralInfo({ ...generalInfo, yearEstablished: e.target.value })}
                    required
                    placeholder="e.g. 2018"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>

                <div className="input-group">
                  <label className="field-label">Owner Full Name</label>
                  <input
                    type="text"
                    className="styled-input"
                    value={generalInfo.ownerFullName}
                    onChange={(e) => setGeneralInfo({ ...generalInfo, ownerFullName: e.target.value })}
                    required
                    placeholder="e.g. Ahmed Hassan Mohamed"
                  />
                </div>

                <div className="input-group span-2">
                  <label className="field-label">Service Center Type</label>
                  <select
                    className="styled-input styled-select"
                    value={generalInfo.type}
                    onChange={(e) => setGeneralInfo({ ...generalInfo, type: Number(e.target.value) })}
                  >
                    <option value={0}>Maintenance & Mechanical Work</option>
                    <option value={1}>Spare Parts Store Only</option>
                    <option value={2}>Both Maintenance & Spare Parts</option>
                  </select>
                </div>

                <div className="input-group span-2">
                  <label className="field-label">Public Description</label>
                  <textarea
                    className="styled-input"
                    rows={4}
                    value={generalInfo.description}
                    onChange={(e) => setGeneralInfo({ ...generalInfo, description: e.target.value })}
                    required
                    placeholder="Describe your specialties, mechanical services, and customer guarantees..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. Location Tab */}
          {activeTab === "location" && (
            <div>
              <h2 className="panel-heading">
                <i className="fa-solid fa-map-location-dot"></i> Location & GPS Coordinates
              </h2>
              
              <div className="fields-grid">
                <div className="input-group">
                  <label className="field-label">Governorate</label>
                  <input
                    type="text"
                    className="styled-input"
                    value={locationInfo.governorate}
                    onChange={(e) => setLocationInfo({ ...locationInfo, governorate: e.target.value })}
                    required
                    placeholder="e.g. Cairo"
                  />
                </div>

                <div className="input-group">
                  <label className="field-label">District</label>
                  <input
                    type="text"
                    className="styled-input"
                    value={locationInfo.district}
                    onChange={(e) => setLocationInfo({ ...locationInfo, district: e.target.value })}
                    required
                    placeholder="e.g. Nasr City"
                  />
                </div>

                <div className="input-group span-2">
                  <label className="field-label">Detailed Street Address</label>
                  <input
                    type="text"
                    className="styled-input"
                    value={locationInfo.address}
                    onChange={(e) => setLocationInfo({ ...locationInfo, address: e.target.value })}
                    required
                    placeholder="e.g. 15 Abbas El Akkad St, Nasr City, Cairo"
                  />
                </div>

                <div className="input-group span-2" style={{ marginTop: "16px", background: "#F8FAFC", padding: "24px", borderRadius: "16px", border: "1px solid #E2E8F0" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#1E293B", marginBottom: "8px" }}>
                    Precise GPS Coordinates
                  </h3>
                  <p style={{ fontSize: "13px", color: "#64748B", marginBottom: "20px", lineHeight: 1.5 }}>
                    Providing precise physical Latitude and Longitude coordinates allows customers to find you on the map and matches your center for emergency roadside support.
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "16px", alignItems: "end" }}>
                    <div className="input-group">
                      <label className="field-label">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        className="styled-input"
                        value={scLat}
                        onChange={(e) => setScLat(e.target.value)}
                        placeholder="e.g. 30.0626"
                        required
                      />
                    </div>
                    <div className="input-group">
                      <label className="field-label">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        className="styled-input"
                        value={scLng}
                        onChange={(e) => setScLng(e.target.value)}
                        placeholder="e.g. 31.3397"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={scLocStatus === "capturing"}
                      className="file-upload-trigger"
                      style={{ height: "48px", background: "#FFFFFF", padding: "0 20px" }}
                    >
                      {scLocStatus === "capturing" ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin" style={{ color: "#E8272A" }}></i> Detecting...
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-crosshairs" style={{ color: "#E8272A" }}></i> Detect GPS Position
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. Hours Tab */}
          {activeTab === "hours" && (
            <div>
              <h2 className="panel-heading">
                <i className="fa-solid fa-clock"></i> Working Schedule
              </h2>
              
              <div style={{ background: "#FFFFFF", borderRadius: "16px", border: "1px solid #E2E8F0", overflow: "hidden" }}>
                {Object.keys(operatingHours).map(day => {
                  const item = operatingHours[day];
                  return (
                    <div className="hours-day-row" key={day}>
                      <div className="day-title">{day}</div>
                      
                      <div>
                        <label className="switch-lbl">
                          <input
                            type="checkbox"
                            checked={!item.isClosed}
                            onChange={(e) => {
                              const open = e.target.checked;
                              setOperatingHours(prev => ({
                                ...prev,
                                [day]: { ...prev[day], isClosed: !open }
                              }));
                            }}
                          />
                          <div className="switch-box"></div>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: item.isClosed ? "#64748B" : "#10B981", marginLeft: "10px" }}>
                            {item.isClosed ? "Closed" : "Open"}
                          </span>
                        </label>
                      </div>

                      <div className="hours-inputs" style={{ opacity: item.isClosed ? 0.3 : 1, pointerEvents: item.isClosed ? "none" : "auto" }}>
                        <input
                          type="time"
                          className="styled-input"
                          style={{ padding: "8px 12px", fontSize: "14px" }}
                          value={item.openTime}
                          onChange={(e) => setOperatingHours(prev => ({
                            ...prev,
                            [day]: { ...prev[day], openTime: e.target.value }
                          }))}
                          required={!item.isClosed}
                        />
                        <span>to</span>
                        <input
                          type="time"
                          className="styled-input"
                          style={{ padding: "8px 12px", fontSize: "14px" }}
                          value={item.closeTime}
                          onChange={(e) => setOperatingHours(prev => ({
                            ...prev,
                            [day]: { ...prev[day], closeTime: e.target.value }
                          }))}
                          required={!item.isClosed}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Services & Brands Tab */}
          {activeTab === "services" && (
            <div>
              <h2 className="panel-heading">
                <i className="fa-solid fa-screwdriver-wrench"></i> Services Offered
              </h2>
              <p style={{ fontSize: "13.5px", color: "#64748B", marginBottom: "20px" }}>
                Select all automotive repair services provided at your location.
              </p>
              
              <div className="lookups-wrapper">
                {availableServices.map(st => (
                  <div
                    key={st.id}
                    className={`lookup-card ${selectedServiceIds.has(st.id) ? "selected" : ""}`}
                    onClick={() => handleToggleService(st.id)}
                  >
                    <div className="checkbox-indicator">
                      {selectedServiceIds.has(st.id) && "✓"}
                    </div>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "#1E293B" }}>{st.name}</span>
                  </div>
                ))}
              </div>

              <h2 className="panel-heading" style={{ marginTop: "40px" }}>
                <i className="fa-solid fa-car"></i> Brands Supported
              </h2>
              <p style={{ fontSize: "13.5px", color: "#64748B", marginBottom: "20px" }}>
                Select the auto brands your mechanics are equipped to service.
              </p>

              <div className="lookups-wrapper">
                {availableBrands.map(cb => (
                  <div
                    key={cb.id}
                    className={`lookup-card ${selectedBrandIds.has(cb.id) ? "selected" : ""}`}
                    onClick={() => handleToggleBrand(cb.id)}
                  >
                    <div className="checkbox-indicator">
                      {selectedBrandIds.has(cb.id) && "✓"}
                    </div>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "#1E293B" }}>{cb.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Photos Gallery Tab */}
          {activeTab === "gallery" && (
            <div>
              <h2 className="panel-heading">
                <i className="fa-solid fa-images"></i> Workshop Photos Gallery
              </h2>
              
              {/* Uploader Box */}
              <label className="upload-drag-box">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handleAddPhotos}
                  disabled={uploadingPhotos}
                />
                <i className="fa-solid fa-cloud-arrow-up"></i>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#1E293B", marginBottom: "4px" }}>
                  {uploadingPhotos ? "Uploading photos..." : "Add workshop photos"}
                </h3>
                <p style={{ fontSize: "13px", color: "#64748B" }}>
                  Select PNG, JPG, or JPEG images. You can select multiple files.
                </p>
              </label>

              {/* Photos Grid */}
              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#1E293B", marginBottom: "16px" }}>
                  Current Gallery Images ({photos.length + pendingPhotos.length})
                </h3>

                <div className="gallery-grid">
                  
                  {/* Previews for pending uploads */}
                  {pendingPhotoPreviews.map((src, index) => (
                    <div
                      key={`pending-${index}`}
                      className="gallery-photo-card pending"
                      style={{ backgroundImage: `url(${src})` }}
                    >
                      <button
                        type="button"
                        className="photo-delete-overlay"
                        onClick={() => handleRemovePendingPhoto(index)}
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    </div>
                  ))}

                  {/* Uploaded images */}
                  {photos.map((url, index) => (
                    <div
                      key={`uploaded-${index}`}
                      className="gallery-photo-card"
                      style={{ backgroundImage: `url(${url})` }}
                    >
                      <button
                        type="button"
                        className="photo-delete-overlay"
                        onClick={() => {
                          setPhotos(prev => prev.filter((_, i) => i !== index));
                          triggerToast("Photo removed from gallery local status", "info");
                        }}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  ))}

                  {photos.length === 0 && pendingPhotos.length === 0 && (
                    <div style={{ gridColumn: "span 4", textAlign: "center", padding: "40px 0", color: "#64748B", fontSize: "14px" }}>
                      No photos uploaded. Share images of your bay, storefront, and waiting lounge.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 6. Documents Tab */}
          {activeTab === "documents" && (
            <div>
              <h2 className="panel-heading">
                <i className="fa-solid fa-file-shield"></i> Legal Documents
              </h2>
              <p style={{ fontSize: "13.5px", color: "#64748B", marginBottom: "24px" }}>
                Keep your legal documentation updated. These are vetted by platform administrators.
              </p>

              {/* 1. Commercial Registry Card */}
              <div className="doc-item-card">
                <div className="doc-meta">
                  <span className="doc-title">Commercial Registry Certificate</span>
                  <div className="doc-status-text">
                    {existingDocs.commercialReg ? (
                      <>
                        <i className="fa-solid fa-circle-check" style={{ color: "#10B981" }}></i>
                        <a href={existingDocs.commercialReg} target="_blank" rel="noreferrer" style={{ color: "#10B981", textDecoration: "underline" }}>
                          View Current Uploaded PDF/Image
                        </a>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-circle-exclamation" style={{ color: "#EF4444" }}></i>
                        <span style={{ color: "#EF4444" }}>Missing document file</span>
                      </>
                    )}
                  </div>
                </div>
                
                <label className={`file-upload-trigger ${docFiles.commercialReg ? "has-file" : ""}`}>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    hidden
                    onChange={(e) => setDocFiles({ ...docFiles, commercialReg: e.target.files[0] })}
                  />
                  <i className="fa-solid fa-file-arrow-up"></i>
                  {docFiles.commercialReg ? docFiles.commercialReg.name.slice(0, 15) + "..." : "Upload / Replace"}
                </label>
              </div>

              {/* 2. Tax Card */}
              <div className="doc-item-card">
                <div className="doc-meta">
                  <span className="doc-title">Tax Card Document</span>
                  <div className="doc-status-text">
                    {existingDocs.taxCard ? (
                      <>
                        <i className="fa-solid fa-circle-check" style={{ color: "#10B981" }}></i>
                        <a href={existingDocs.taxCard} target="_blank" rel="noreferrer" style={{ color: "#10B981", textDecoration: "underline" }}>
                          View Current Uploaded PDF/Image
                        </a>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-circle-exclamation" style={{ color: "#EF4444" }}></i>
                        <span style={{ color: "#EF4444" }}>Missing document file</span>
                      </>
                    )}
                  </div>
                </div>
                
                <label className={`file-upload-trigger ${docFiles.taxCard ? "has-file" : ""}`}>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    hidden
                    onChange={(e) => setDocFiles({ ...docFiles, taxCard: e.target.files[0] })}
                  />
                  <i className="fa-solid fa-file-arrow-up"></i>
                  {docFiles.taxCard ? docFiles.taxCard.name.slice(0, 15) + "..." : "Upload / Replace"}
                </label>
              </div>

              {/* 3. National ID Card */}
              <div className="doc-item-card">
                <div className="doc-meta">
                  <span className="doc-title">Owner National ID Copy</span>
                  <div className="doc-status-text">
                    {existingDocs.nationalId ? (
                      <>
                        <i className="fa-solid fa-circle-check" style={{ color: "#10B981" }}></i>
                        <a href={existingDocs.nationalId} target="_blank" rel="noreferrer" style={{ color: "#10B981", textDecoration: "underline" }}>
                          View Current Uploaded PDF/Image
                        </a>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-circle-exclamation" style={{ color: "#EF4444" }}></i>
                        <span style={{ color: "#EF4444" }}>Missing document file</span>
                      </>
                    )}
                  </div>
                </div>
                
                <label className={`file-upload-trigger ${docFiles.nationalId ? "has-file" : ""}`}>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    hidden
                    onChange={(e) => setDocFiles({ ...docFiles, nationalId: e.target.files[0] })}
                  />
                  <i className="fa-solid fa-file-arrow-up"></i>
                  {docFiles.nationalId ? docFiles.nationalId.name.slice(0, 15) + "..." : "Upload / Replace"}
                </label>
              </div>
            </div>
          )}

          {/* Bottom Actions Row */}
          <div className="submit-section">
            <Link href="/service-center" style={{ textDecoration: "none" }}>
              <button type="button" className="action-btn" disabled={saving}>
                Discard
              </button>
            </Link>
            <button
              type="submit"
              className="action-btn primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Saving Profile...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-floppy-disk"></i> Save Business Profile
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
