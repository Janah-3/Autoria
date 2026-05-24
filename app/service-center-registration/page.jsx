"use client";

import React, { useState } from "react";
import Link from "next/link";
import { serviceCentersService } from "@/lib/api/serviceCentersService";

export default function ServiceCenterRegistration() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadedDocFiles, setUploadedDocFiles] = useState([]);

  // Form states
  const [form, setForm] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    whatsapp: "",
    governorate: "Cairo",
    district: "",
    address: "",
    services: ["Oil change", "Diagnostics"],
    brands: ["Toyota", "Hyundai"],
    pricingMin: 150,
    pricingMax: 2000,
    bays: 4,
    registerNumber: "",
    taxNumber: ""
  });

  const [serviceInput, setServiceInput] = useState("");
  const [brandInput, setBrandInput] = useState("");
  const [errors, setErrors] = useState({});

  // Egyptian Governorates and districts autocomplete lists
  const EGYPT_GOVERNORATES = [
    "Cairo", "Giza", "Alexandria", "Qalyubia", "Dakahlia", 
    "Gharbia", "Suez", "Port Said", "Sharqia", "Beheira", "Asyut", "Sohag"
  ];

  const handleNextStep = () => {
    // Basic validation per step
    let stepErrors = {};
    if (currentStep === 1) {
      if (!form.businessName) stepErrors.businessName = "Business name is required";
      if (!form.ownerName) stepErrors.ownerName = "Owner's full name is required";
      if (!form.email) stepErrors.email = "Email is required";
      if (!form.phone) stepErrors.phone = "Phone hotline is required";
    } else if (currentStep === 2) {
      if (!form.district) stepErrors.district = "District (e.g. Nasr City, Mohandessin) is required";
      if (!form.address) stepErrors.address = "Detailed street address is required";
    } else if (currentStep === 3) {
      if (form.services.length === 0) stepErrors.services = "Please list at least one service offered";
      if (form.brands.length === 0) stepErrors.brands = "Please list at least one supported brand";
    }

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setErrors({});
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setErrors({});
    setCurrentStep(prev => prev - 1);
  };

  const handleAddService = () => {
    if (serviceInput.trim() && !form.services.includes(serviceInput.trim())) {
      setForm({ ...form, services: [...form.services, serviceInput.trim()] });
      setServiceInput("");
    }
  };

  const handleRemoveService = (srv) => {
    setForm({ ...form, services: form.services.filter(s => s !== srv) });
  };

  const handleAddBrand = () => {
    if (brandInput.trim() && !form.brands.includes(brandInput.trim())) {
      setForm({ ...form, brands: [...form.brands, brandInput.trim()] });
      setBrandInput("");
    }
  };

  const handleRemoveBrand = (brd) => {
    setForm({ ...form, brands: form.brands.filter(b => b !== brd) });
  };

  // Simulated Document Upload Process
  const handleUploadDocument = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingDoc(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadingDoc(false);
          setUploadedFiles((prevFiles) => [...prevFiles, file.name]);
          setUploadedDocFiles((prev) => [...prev, file]);
          return 100;
        }
        return prev + 20;
      });
    }, 150);
  };

  // Submit Final Registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploadedDocFiles.length === 0) {
      setErrors({ documents: "Please upload at least one verification document (Sajil Tijari / Tax Card)" });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await serviceCentersService.create({
        name: form.businessName,
        phone: form.phone,
        businessEmail: form.email,
        yearEstablished: new Date().getFullYear(),
        description: form.services.join(", "),
        commercialRegNo: form.registerNumber,
        taxCardNo: form.taxNumber,
        ownerNationalId: form.registerNumber.padEnd(14, "0").slice(0, 14),
        ownerFullName: form.ownerName,
        numServiceBays: form.bays,
        type: 0,
      });

      const fd = new FormData();
      const f0 = uploadedDocFiles[0];
      const f1 = uploadedDocFiles[1] || f0;
      const f2 = uploadedDocFiles[2] || f0;
      if (f0) fd.append("CommercialRegFile", f0);
      if (f1) fd.append("TaxCardFile", f1);
      if (f2) fd.append("OwnerNationalIdFile", f2);
      await serviceCentersService.uploadDocuments(fd);

      await serviceCentersService.submitRegistration();
      setCurrentStep(5);
    } catch (err) {
      setErrors({ submit: err.message || "Registration failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-wrapper">
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .registration-wrapper {
          min-height: 100vh;
          background: radial-gradient(circle at 10% 20%, rgba(26, 26, 46, 0.98) 0%, rgba(15, 12, 12, 1) 100%);
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #E2E8F0;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow-x: hidden;
        }

        /* Ambient glowing backgrounds */
        .glowing-blob {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(232, 39, 42, 0.12) 0%, transparent 70%);
          z-index: 1;
          pointer-events: none;
        }
        .blob-1 { top: -100px; left: -100px; }
        .blob-2 { bottom: -200px; right: -100px; }

        /* Main Nav Header */
        .header {
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 5%;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          position: relative;
          z-index: 10;
        }
        .logo {
          font-size: 24px;
          font-weight: 900;
          color: #E8272A;
          text-decoration: none;
          letter-spacing: -0.5px;
        }
        .logo span { color: #FFFFFF; font-weight: 300; }
        .nav-link {
          color: #94A3B8;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          transition: color 0.2s;
        }
        .nav-link:hover { color: #FFFFFF; }

        /* Container & Stepper */
        .container {
          max-width: 800px;
          width: 90%;
          margin: 40px auto 80px;
          position: relative;
          z-index: 10;
        }

        .stepper-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
          position: relative;
        }
        .stepper-header::before {
          content: "";
          position: absolute;
          top: 25px;
          left: 5%;
          right: 5%;
          height: 3px;
          background: rgba(255, 255, 255, 0.08);
          z-index: 1;
        }
        .step-progress-bar {
          position: absolute;
          top: 25px;
          left: 5%;
          height: 3px;
          background: #E8272A;
          z-index: 2;
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .step-node {
          position: relative;
          z-index: 3;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          flex: 1;
        }
        .step-circle {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: #1E293B;
          border: 2px solid rgba(255, 255, 255, 0.1);
          color: #94A3B8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 16px;
          transition: all 0.3s;
        }
        .step-node.active .step-circle {
          background: #E8272A;
          border-color: #E8272A;
          color: #FFFFFF;
          box-shadow: 0 0 20px rgba(232, 39, 42, 0.4);
        }
        .step-node.completed .step-circle {
          background: #10B981;
          border-color: #10B981;
          color: #FFFFFF;
        }
        .step-label {
          font-size: 12px;
          font-weight: 700;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: color 0.3s;
        }
        .step-node.active .step-label { color: #FFFFFF; }
        .step-node.completed .step-label { color: #10B981; }

        /* Registration Form Card */
        .glass-card {
          background: rgba(30, 41, 59, 0.45);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 48px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
          transition: all 0.3s;
        }

        .step-title { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; margin-bottom: 12px; color: #FFFFFF; }
        .step-desc { font-size: 14.5px; color: #94A3B8; margin-bottom: 36px; line-height: 1.6; }

        /* Form Controls */
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group.full { grid-column: span 2; }
        
        .form-label { font-size: 13.5px; font-weight: 700; color: #CBD5E1; }
        .form-input {
          padding: 14px 18px;
          background: rgba(15, 23, 42, 0.6);
          border: 1.5px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          font-size: 14.5px;
          color: #FFFFFF;
          outline: none;
          transition: all 0.25s;
          font-family: inherit;
        }
        .form-input::placeholder { color: #475569; }
        .form-input:focus {
          border-color: #E8272A;
          background: rgba(15, 23, 42, 0.85);
          box-shadow: 0 0 0 4px rgba(232, 39, 42, 0.15);
        }

        .error-hint { font-size: 12px; color: #EF4444; font-weight: 700; margin-top: 4px; }

        /* Interactive tags */
        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 12px;
          background: rgba(15, 23, 42, 0.4);
          border: 1.5px dashed rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          min-height: 50px;
          align-items: center;
          margin-bottom: 12px;
        }
        .pill-tag {
          background: rgba(232, 39, 42, 0.15);
          border: 1px solid rgba(232, 39, 42, 0.3);
          color: #FF8A8A;
          padding: 6px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .pill-tag button {
          background: none;
          border: none;
          color: #FF8A8A;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
        }
        .pill-tag.brand {
          background: rgba(59, 130, 246, 0.15);
          border-color: rgba(59, 130, 246, 0.3);
          color: #93C5FD;
        }
        .pill-tag.brand button { color: #93C5FD; }

        .add-tag-box { display: flex; gap: 10px; }

        /* Sliders */
        .slider-wrapper { display: flex; flex-direction: column; gap: 12px; margin-top: 10px; }
        .slider-header { display: flex; justify-content: space-between; font-weight: 700; font-size: 14px; }
        .slider-control {
          -webkit-appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 5px;
          background: rgba(255, 255, 255, 0.1);
          outline: none;
        }
        .slider-control::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #E8272A;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(232, 39, 42, 0.5);
          transition: scale 0.15s;
        }
        .slider-control::-webkit-slider-thumb:hover { scale: 1.25; }

        /* File Upload */
        .dropzone {
          border: 2px dashed rgba(255, 255, 255, 0.15);
          border-radius: 16px;
          padding: 40px;
          text-align: center;
          background: rgba(15, 23, 42, 0.3);
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }
        .dropzone:hover { border-color: #E8272A; background: rgba(232, 39, 42, 0.03); }
        .dropzone i { font-size: 40px; color: #64748B; margin-bottom: 12px; }
        .dropzone p { font-size: 14.5px; font-weight: 700; color: #CBD5E1; }
        
        .progress-bar-container {
          width: 100%;
          height: 5px;
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
          overflow: hidden;
          margin-top: 16px;
        }
        .progress-bar-fill {
          height: 100%;
          background: #E8272A;
          width: 0%;
          transition: width 0.15s;
        }

        .uploaded-list { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }
        .uploaded-file-item {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 10px;
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 700;
          color: #A7F3D0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* Action Buttons */
        .actions {
          display: flex;
          justify-content: space-between;
          margin-top: 48px;
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .btn-back {
          padding: 14px 28px;
          border-radius: 14px;
          background: transparent;
          border: 1.5px solid rgba(255, 255, 255, 0.2);
          color: #E2E8F0;
          font-size: 14.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-back:hover { background: rgba(255, 255, 255, 0.05); border-color: rgba(255, 255, 255, 0.4); }

        .btn-next {
          padding: 14px 36px;
          border-radius: 14px;
          background: #E8272A;
          border: none;
          color: #FFFFFF;
          font-size: 14.5px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(232, 39, 42, 0.25);
        }
        .btn-next:hover { background: #B81C1F; transform: translateY(-1px); }
        .btn-next:disabled { background: #475569; color: #94A3B8; cursor: not-allowed; box-shadow: none; }

        /* Success screen styling */
        .success-wrapper {
          text-align: center;
          padding: 20px 0;
        }
        .success-icon {
          width: 80px;
          height: 80px;
          background: rgba(16, 185, 129, 0.1);
          border: 2px solid #10B981;
          color: #10B981;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          margin: 0 auto 24px;
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.3);
        }
        .success-summary {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          padding: 24px;
          margin: 32px 0;
          text-align: left;
        }
        .summary-item {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          font-size: 14px;
        }
        .summary-item:last-child { border-bottom: none; }
        .summary-label { color: #64748B; font-weight: 600; }
        .summary-val { color: #E2E8F0; font-weight: 700; }

        .btn-dashboard {
          background: #10B981;
          color: white;
          text-decoration: none;
          padding: 14px 32px;
          border-radius: 14px;
          font-weight: 800;
          font-size: 14.5px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.2);
        }
        .btn-dashboard:hover {
          background: #059669;
          transform: translateY(-1px);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .glass-card { padding: 32px 20px; }
          .form-grid { grid-template-columns: 1fr; }
          .stepper-header { margin-bottom: 24px; }
          .step-circle { width: 40px; height: 40px; font-size: 14px; }
          .step-label { font-size: 10px; }
        }
      `}</style>

      {/* Blobs */}
      <div className="glowing-blob blob-1"></div>
      <div className="glowing-blob blob-2"></div>

      <header className="header">
        <Link href="/" className="logo">
          AUTO<span>RIA</span>
        </Link>
        <Link href="/login" className="nav-link">
          Existing Partner? Login
        </Link>
      </header>

      <div className="container">
        {/* Stepper Progress bar */}
        {currentStep <= 4 && (
          <div className="stepper-header">
            <div className="step-progress-bar" style={{ width: `${((currentStep - 1) / 3) * 90}%` }}></div>
            {[
              { n: 1, label: "Profile" },
              { n: 2, label: "Location" },
              { n: 3, label: "Services" },
              { n: 4, label: "Legal" }
            ].map(step => (
              <div 
                key={step.n} 
                className={`step-node ${
                  currentStep === step.n ? "active" :
                  currentStep > step.n ? "completed" : ""
                }`}
              >
                <div className="step-circle">
                  {currentStep > step.n ? <i className="fa-solid fa-check"></i> : step.n}
                </div>
                <span className="step-label">{step.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Wizard Card */}
        <div className="glass-card">
          
          {/* Step 1: Business Basics */}
          {currentStep === 1 && (
            <div>
              <h2 className="step-title">Register Your Service Center</h2>
              <p className="step-desc">Establish your workshop on Autoria's network and start receiving digital repair requests from car owners across Egypt.</p>
              
              <div className="form-grid">
                <div className="form-group full">
                  <label className="form-label">Service Center / Workshop Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. ProCare Auto Diagnostics" 
                    value={form.businessName}
                    onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  />
                  {errors.businessName && <span className="error-hint">{errors.businessName}</span>}
                </div>

                <div className="form-group full">
                  <label className="form-label">Owner's Full Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Mahmoud Ahmed Ali" 
                    value={form.ownerName}
                    onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                  />
                  {errors.ownerName && <span className="error-hint">{errors.ownerName}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Business Email Address</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="e.g. care@procare-eg.com" 
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                  {errors.email && <span className="error-hint">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Main Business Phone Hotline</label>
                  <input 
                    type="tel" 
                    className="form-input" 
                    placeholder="e.g. +20 100 123 4567" 
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                  {errors.phone && <span className="error-hint">{errors.phone}</span>}
                </div>
              </div>

              <div className="actions" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn-next" onClick={handleNextStep}>
                  Next: Location & Contact <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div>
              <h2 className="step-title">Workshop Location Details</h2>
              <p className="step-desc">Specify exactly where your shop is located so nearby car owners can find you with GPS coordination.</p>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Governorate (Egypt)</label>
                  <select 
                    className="form-input"
                    style={{ background: '#1E293B' }}
                    value={form.governorate}
                    onChange={(e) => setForm({ ...form, governorate: e.target.value })}
                  >
                    {EGYPT_GOVERNORATES.map(gov => (
                      <option key={gov} value={gov} style={{ background: '#1E293B' }}>{gov}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">District / Area</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Heliopolis, Nasr City, Smouha" 
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                  />
                  {errors.district && <span className="error-hint">{errors.district}</span>}
                </div>

                <div className="form-group full">
                  <label className="form-label">Detailed Street Address</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. 24 Abbas El-Akkad St, Floor 1 (Next to Enppi)" 
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                  {errors.address && <span className="error-hint">{errors.address}</span>}
                </div>

                <div className="form-group full">
                  <label className="form-label">Official WhatsApp Number (For Booking Notifications)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. +20 100 123 4567" 
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  />
                </div>
              </div>

              <div className="actions">
                <button type="button" className="btn-back" onClick={handlePrevStep}>
                  <i className="fa-solid fa-arrow-left"></i> Back
                </button>
                <button type="button" className="btn-next" onClick={handleNextStep}>
                  Next: Services & Capacity <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Services & Capacity */}
          {currentStep === 3 && (
            <div>
              <h2 className="step-title">Services & Operational Capacity</h2>
              <p className="step-desc">List what services you specialize in, which brands you service, and your average capacity.</p>
              
              <div className="form-grid">
                
                {/* Services Tags */}
                <div className="form-group full">
                  <label className="form-label">Services Offered</label>
                  <div className="tags-container">
                    {form.services.map(s => (
                      <span className="pill-tag" key={s}>
                        {s} <button type="button" onClick={() => handleRemoveService(s)}>×</button>
                      </span>
                    ))}
                    {form.services.length === 0 && <span style={{color: '#64748B', fontSize: '13px'}}>No services added.</span>}
                  </div>
                  
                  <div className="add-tag-box">
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ flex: 1 }}
                      placeholder="e.g. Oil change, Brake Repair, Suspension repair" 
                      value={serviceInput}
                      onChange={(e) => setServiceInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddService())}
                    />
                    <button type="button" className="btn-next" style={{ padding: '0 20px', fontSize: '13.5px' }} onClick={handleAddService}>
                      Add
                    </button>
                  </div>
                  {errors.services && <span className="error-hint">{errors.services}</span>}
                </div>

                {/* Supported Brands Tags */}
                <div className="form-group full">
                  <label className="form-label">Car Brands Serviced</label>
                  <div className="tags-container">
                    {form.brands.map(b => (
                      <span className="pill-tag brand" key={b}>
                        {b} <button type="button" onClick={() => handleRemoveBrand(b)}>×</button>
                      </span>
                    ))}
                    {form.brands.length === 0 && <span style={{color: '#64748B', fontSize: '13px'}}>No brands added.</span>}
                  </div>
                  
                  <div className="add-tag-box">
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ flex: 1 }}
                      placeholder="e.g. Toyota, BMW, Hyundai, Chevrolet" 
                      value={brandInput}
                      onChange={(e) => setBrandInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddBrand())}
                    />
                    <button type="button" className="btn-next" style={{ padding: '0 20px', fontSize: '13.5px' }} onClick={handleAddBrand}>
                      Add
                    </button>
                  </div>
                  {errors.brands && <span className="error-hint">{errors.brands}</span>}
                </div>

                {/* Active bays */}
                <div className="form-group full slider-wrapper">
                  <div className="slider-header">
                    <span className="form-label">Number of Active Service Bays (Lifts)</span>
                    <span style={{ color: '#E8272A' }}>{form.bays} Bays</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="20" 
                    className="slider-control" 
                    value={form.bays}
                    onChange={(e) => setForm({ ...form, bays: parseInt(e.target.value) })}
                  />
                </div>

                {/* Estimate */}
                <div className="form-group">
                  <label className="form-label">Minimum Service Rate (EGP)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={form.pricingMin}
                    onChange={(e) => setForm({ ...form, pricingMin: parseInt(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Maximum Service Rate (EGP)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={form.pricingMax}
                    onChange={(e) => setForm({ ...form, pricingMax: parseInt(e.target.value) })}
                  />
                </div>

              </div>

              <div className="actions">
                <button type="button" className="btn-back" onClick={handlePrevStep}>
                  <i className="fa-solid fa-arrow-left"></i> Back
                </button>
                <button type="button" className="btn-next" onClick={handleNextStep}>
                  Next: Verification Documents <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Verification / Docs */}
          {currentStep === 4 && (
            <form onSubmit={handleSubmit}>
              <h2 className="step-title">Legal & Security Verification</h2>
              <p className="step-desc">To ensure high standards on Autoria, please upload copy of your Commercial Registry (Sajil Tijari) or Workshop Tax Card.</p>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Commercial Registry Number (السجل التجاري)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. 104523" 
                    value={form.registerNumber}
                    onChange={(e) => setForm({ ...form, registerNumber: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tax Card ID (البطاقة الضريبية)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. 293-841-329" 
                    value={form.taxNumber}
                    onChange={(e) => setForm({ ...form, taxNumber: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group full">
                  <label className="form-label">Upload Documents (PDF or Images)</label>
                  <div className="dropzone">
                    <input 
                      type="file" 
                      id="doc-upload" 
                      style={{ display: 'none' }} 
                      onChange={handleUploadDocument}
                      disabled={uploadingDoc}
                    />
                    <label htmlFor="doc-upload" style={{ cursor: 'pointer', display: 'block' }}>
                      <i className="fa-solid fa-folder-open"></i>
                      <p>Click here to choose file for upload</p>
                      <span style={{ fontSize: '12px', color: '#64748B', display: 'block', marginTop: '6px' }}>
                        Upload Commercial Registry Certificate or Tax Card (PNG, JPG, PDF up to 10MB)
                      </span>
                    </label>

                    {uploadingDoc && (
                      <div style={{ marginTop: '16px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#E8272A' }}>Uploading File... {uploadProgress}%</span>
                        <div className="progress-bar-container">
                          <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.documents && <span className="error-hint" style={{ marginTop: '8px', display: 'block' }}>{errors.documents}</span>}

                  {uploadedFiles.length > 0 && (
                    <div className="uploaded-list">
                      {uploadedFiles.map(name => (
                        <div className="uploaded-file-item" key={name}>
                          <span><i className="fa-solid fa-file-shield" style={{ marginRight: '8px' }}></i> {name}</span>
                          <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#34D399' }}><i className="fa-solid fa-circle-check"></i> Uploaded</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="actions">
                <button type="button" className="btn-back" onClick={handlePrevStep} disabled={loading}>
                  <i className="fa-solid fa-arrow-left"></i> Back
                </button>
                <button type="submit" className="btn-next" style={{ background: '#10B981' }} disabled={loading}>
                  {loading ? (
                    <>
                      <i className="fa-solid fa-circle-notch fa-spin"></i> Submitting Request...
                    </>
                  ) : (
                    <>
                      Submit Application <i className="fa-solid fa-circle-check"></i>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Step 5: Success Splash Screen */}
          {currentStep === 5 && (
            <div className="success-wrapper">
              <div className="success-icon">
                <i className="fa-solid fa-paper-plane"></i>
              </div>
              <h2 className="step-title" style={{ fontSize: '32px' }}>Registration Submitted!</h2>
              <p className="step-desc" style={{ maxWidth: '580px', margin: '12px auto 0' }}>
                Thank you for applying to join the Autoria network! Our audit team is currently verifying your commercial credentials and tax logs. This usually takes between **24 to 48 hours**.
              </p>

              <div className="success-summary">
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', marginBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '8px' }}>
                  Application Outline
                </h3>
                
                <div className="summary-item">
                  <span className="summary-label">Workshop Name</span>
                  <span className="summary-val">{form.businessName}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Owner Name</span>
                  <span className="summary-val">{form.ownerName}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Main Support Area</span>
                  <span className="summary-val">{form.district}, {form.governorate}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Services Registered</span>
                  <span className="summary-val">{form.services.join(", ")}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Service Capacity</span>
                  <span className="summary-val">{form.bays} Lifts (Active)</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Audit Status</span>
                  <span className="summary-val" style={{ color: '#F59E0B' }}><i className="fa-solid fa-hourglass-half"></i> Pending Review</span>
                </div>
              </div>

              <p style={{ fontSize: '13.5px', color: '#64748B', marginBottom: '32px' }}>
                An account confirmation link and verification credentials has been dispatched to **{form.email}**.
              </p>

              <Link href="/" className="btn-dashboard">
                <i className="fa-solid fa-house"></i> Return to Homepage
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
