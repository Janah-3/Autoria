"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { serviceCentersService } from "@/lib/api/serviceCentersService";
import { getMe } from "@/lib/api/usersService";

const COLORS = {
  primary: "#E8272A",
  bg: "#F8FAFC",
  surface: "#FFFFFF",
  border: "#E2E8F0",
  text: "#0F172A",
  textLight: "#64748B",
  activeBg: "#FEF2F2",
  success: "#10B981",
  successBg: "#ECFDF5",
};

const Sidebar = ({ active }) => (
  <aside style={{ width: "260px", background: COLORS.surface, borderRight: `1px solid ${COLORS.border}`, padding: "30px 0", height: "100vh", position: "sticky", top: 0, flexShrink: 0 }}>
    <div style={{ padding: "0 25px", marginBottom: "40px" }}>
      <div style={{ fontSize: "11px", fontWeight: 800, color: COLORS.textLight, letterSpacing: "1.5px", marginBottom: "20px" }}>MANAGE</div>
      {[
        { id: "Dashboard", icon: "📊", path: "/booking-requests" },
        { id: "Booking requests", icon: "📬", path: "/booking-requests" },
        { id: "Availability", icon: "📅", path: "/availability" },
        { id: "Services & pricing", icon: "🏷️", path: "/service-center/services-pricing" },
        { id: "Spare parts", icon: "⚙️", path: "/spare-parts-inventory" },
        { id: "Reviews", icon: "⭐", path: "#" },
        { id: "Business profile", icon: "🏢", path: "/service-center/edit" }
      ].map(item => (
        <Link href={item.path} key={item.id} style={{ textDecoration: "none" }}>
          <div style={{ 
            display: "flex", alignItems: "center", gap: "12px", padding: "12px 25px", margin: "4px 15px", borderRadius: "12px",
            fontSize: "14.5px", fontWeight: active === item.id ? 700 : 500, cursor: "pointer",
            background: active === item.id ? COLORS.activeBg : "transparent",
            color: active === item.id ? COLORS.primary : COLORS.textLight,
            borderLeft: active === item.id ? `4px solid ${COLORS.primary}` : "none",
            transition: "all 0.2s"
          }}>
            <span>{item.icon}</span> {item.id}
          </div>
        </Link>
      ))}
    </div>
  </aside>
);

export default function ServicesPricingPage() {
  const [center, setCenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [userName, setUserName] = useState("MH");
  
  // Lists
  const [services, setServices] = useState([]);
  const [brands, setBrands] = useState([]);
  
  // Custom Inputs
  const [newService, setNewService] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sellsParts, setSellsParts] = useState(true);
  
  // Toast Alert
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const triggerToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  useEffect(() => {
    // Fetch logged-in user profile
    getMe()
      .then(res => {
        if (res?.data?.fullName) {
          setUserName(res.data.fullName);
        }
      })
      .catch(() => {});

    // Fetch dynamic center operating hours and services
    serviceCentersService.getMy()
      .then(res => {
        const d = res.data ?? res;
        if (d) {
          setCenter(d);
          setServices(d.serviceTypes || []);
          setBrands(d.carBrands || []);
          setMinPrice(d.minServicePrice ? String(d.minServicePrice) : "");
          setMaxPrice(d.maxServicePrice ? String(d.maxServicePrice) : "");
          setSellsParts(d.sellsSpareParts !== false);
        }
      })
      .catch(err => {
        console.error("Failed to load service center:", err);
        triggerToast("Failed to load profile details", "warning");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleAddService = (serviceToAdd = newService) => {
    const term = typeof serviceToAdd === "string" ? serviceToAdd.trim() : "";
    if (term && !services.includes(term)) {
      setServices([...services, term]);
      setNewService("");
      triggerToast(`Added service: ${term}`, "success");
    }
  };

  const handleRemoveService = (serviceToRemove) => {
    setServices(services.filter(s => s !== serviceToRemove));
    triggerToast(`Removed service: ${serviceToRemove}`, "info");
  };

  const handleAddBrand = (brandToAdd = newBrand) => {
    const term = typeof brandToAdd === "string" ? brandToAdd.trim() : "";
    if (term && !brands.includes(term)) {
      setBrands([...brands, term]);
      setNewBrand("");
      triggerToast(`Added brand: ${term}`, "success");
    }
  };

  const handleRemoveBrand = (brandToRemove) => {
    setBrands(brands.filter(b => b !== brandToRemove));
    triggerToast(`Removed brand: ${brandToRemove}`, "info");
  };

  const handleSaveAll = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      // 1. Save general pricing details
      await serviceCentersService.updateMy({
        minServicePrice: parseFloat(minPrice) || undefined,
        maxServicePrice: parseFloat(maxPrice) || undefined,
        sellsSpareParts: sellsParts,
      });

      // 2. Save services
      if (services.length > 0) {
        await serviceCentersService.updateServiceTypes(services);
      }

      // 3. Save car brands
      if (brands.length > 0) {
        await serviceCentersService.updateCarBrands(brands);
      }

      triggerToast("Services, brands and pricing saved successfully! 🎉", "success");
    } catch (err) {
      console.error(err);
      triggerToast(err.message || "Failed to save settings", "warning");
    } finally {
      setSaveLoading(false);
    }
  };

  const PRESET_SERVICES = ["Oil change", "Brake service", "AC repair", "Electrical diagnostics", "Engine rebuild", "Wheel alignment", "Suspension repair", "Car detailing"];
  const PRESET_BRANDS = ["Toyota", "Mercedes-Benz", "BMW", "Audi", "Kia", "Hyundai", "Honda", "Nissan"];

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.bg }}>
        <div style={{ color: COLORS.primary, fontSize: "18px", fontWeight: "bold" }}>Loading Services & Pricing Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="sc-pricing-dashboard">
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .sc-pricing-dashboard {
          min-height: 100vh;
          background: #F8FAFC;
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #1E293B;
          position: relative;
        }

        /* Toast Alert */
        .toast {
          position: fixed;
          top: 24px;
          right: 24px;
          background: #FFFFFF;
          border-left: 5px solid #10B981;
          box-shadow: 0 10px 30px rgba(0,0,0,0.06);
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
        .toast.show {
          transform: translateY(0);
          opacity: 1;
          visibility: visible;
        }
        .toast.warning { border-left-color: #F59E0B; }
        .toast.info { border-left-color: #3B82F6; }

        /* Top Nav */
        .top-nav {
          background: #FFFFFF;
          border-bottom: 1px solid #E2E8F0;
          height: 72px;
          padding: 0 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .logo { font-size: 24px; font-weight: 900; color: #E8272A; text-decoration: none; }
        .logo span { color: #1E293B; font-weight: 300; }
        .nav-right { display: flex; align-items: center; gap: 20px; }
        .back-btn { font-size: 13.5px; font-weight: 700; color: #475569; text-decoration: none; border: 1px solid #CBD5E1; padding: 9px 18px; border-radius: 10px; }

        /* Banner Hero */
        .banner {
          background: linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #B81C1F 100%);
          padding: 56px 40px;
          color: white;
        }
        .banner-title h1 { font-size: 28px; font-weight: 900; letter-spacing: -0.8px; margin-bottom: 6px; }
        .banner-title p { font-size: 14.5px; color: #94A3B8; }

        /* Flex Layout Grid */
        .split-layout { display: flex; flex: 1; min-height: calc(100vh - 72px); }
        .main-content { flex: 1; padding: 40px; max-width: 1000px; }

        /* Panel Card */
        .card { background: white; border-radius: 20px; border: 1px solid #E2E8F0; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.02); margin-bottom: 30px; }
        .card-title { font-size: 18px; font-weight: 800; color: #0F172A; margin-bottom: 24px; border-bottom: 1.5px solid #F1F5F9; padding-bottom: 12px; display: flex; align-items: center; gap: 8px; }
        .card-title i { color: #E8272A; }

        /* Forms */
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group.full { grid-column: span 2; }
        .form-label { font-size: 13.5px; font-weight: 700; color: #475569; }
        .form-input { padding: 12px 16px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-size: 14px; outline: none; background: white; font-family: inherit; }
        .form-input:focus { border-color: #E8272A; box-shadow: 0 0 0 3px rgba(232,39,42,0.06); }

        /* Tags Container */
        .tags-container { display: flex; flex-wrap: wrap; gap: 8px; padding: 12px; border: 1.5px dashed #E2E8F0; border-radius: 12px; background: #F8FAFC; margin-bottom: 16px; min-height: 50px; }
        .pill-tag { background: white; border: 1.5px solid #E2E8F0; color: #334155; padding: 6px 12px; border-radius: 8px; font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
        .pill-tag:hover { border-color: #E8272A; color: #E8272A; transform: translateY(-1px); }
        .pill-tag button { background: none; border: none; color: #94A3B8; cursor: pointer; font-size: 13px; font-weight: bold; }
        .pill-tag button:hover { color: #E8272A; }

        .preset-container { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
        .preset-chip { padding: 5px 12px; background: #E2E8F0; border-radius: 20px; font-size: 12px; fontWeight: 700; color: #475569; cursor: pointer; border: none; transition: 0.2s; }
        .preset-chip:hover { background: #CBD5E1; color: #0F172A; }

        /* Actions block */
        .actions-block { display: flex; gap: 16px; margin-top: 40px; justify-content: flex-end; }
        .btn-cancel { background: transparent; color: #64748B; border: 1px solid #CBD5E1; padding: 14px 28px; border-radius: 10px; font-weight: 700; cursor: pointer; }
        .btn-cancel:hover { background: #F1F5F9; }
        .btn-save { background: #E8272A; color: white; border: none; padding: 14px 36px; border-radius: 10px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(232,39,42,0.3); }
        .btn-save:hover { background: #B81C1F; }

        /* Switch checkbox */
        .checkbox-label { display: flex; align-items: center; gap: 12px; cursor: pointer; user-select: none; font-size: 14.5px; font-weight: 700; color: #334155; }
        .custom-switch { width: 48px; height: 26px; background: #CBD5E1; border-radius: 100px; position: relative; transition: background 0.3s; }
        .custom-switch::after { content: ""; width: 20px; height: 20px; background: white; border-radius: 50%; position: absolute; top: 3px; left: 3px; transition: transform 0.3s; }
        input[type="checkbox"] { display: none; }
        input[type="checkbox"]:checked + .custom-switch { background: #10B981; }
        input[type="checkbox"]:checked + .custom-switch::after { transform: translateX(22px); }

      `}</style>

      {/* Toast Alert */}
      <div className={`toast ${toast.show ? "show" : ""} ${toast.type}`}>
        <i className={`fa-solid ${
          toast.type === "success" ? "fa-circle-check" : "fa-circle-info"
        }`} style={{
          color: toast.type === "success" ? "#10B981" : "#3B82F6",
          fontSize: "18px"
        }}></i>
        <span style={{ fontSize: "14px", fontWeight: 700 }}>{toast.message}</span>
      </div>

      <nav className="top-nav">
        <Link href="/" className="logo">
          AUTO<span>RIA</span>
        </Link>
        <div className="nav-right">
          <Link href="/service-center" className="back-btn">
            ← Business Profile
          </Link>
        </div>
      </nav>

      <section className="banner">
        <div className="banner-title">
          <h1>Services & Pricing Manager</h1>
          <p>Configure your repair specials, select vehicle brand specializations, and configure baseline labor rates.</p>
        </div>
      </section>

      <div className="split-layout">
        <Sidebar active="Services & pricing" />

        <main className="main-content">
          <form onSubmit={handleSaveAll}>
            
            {/* Services Offered Card */}
            <div className="card">
              <h3 className="card-title">
                <i className="fa-solid fa-wrench"></i> Services Offered
              </h3>
              <div className="form-group full" style={{ marginBottom: "20px" }}>
                <label className="form-label">Active Workshop Services</label>
                <div className="tags-container">
                  {services.map(s => (
                    <span className="pill-tag" key={s}>
                      {s}
                      <button type="button" onClick={() => handleRemoveService(s)}>×</button>
                    </span>
                  ))}
                  {services.length === 0 && <span style={{ fontSize: "13px", color: "#94A3B8" }}>No active services added. Use the presets below or custom add.</span>}
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ flex: 1 }}
                  placeholder="e.g. Steering diagnostics, Battery charge, Wheel painting" 
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddService())}
                />
                <button type="button" style={{ background: COLORS.text, color: "white", border: "none", padding: "0 24px", borderRadius: "10px", fontWeight: 700, cursor: "pointer" }} onClick={() => handleAddService()}>
                  Add Service
                </button>
              </div>

              <label className="form-label" style={{ display: "block", marginBottom: "8px" }}>Or Select Popular Services</label>
              <div className="preset-container">
                {PRESET_SERVICES.map(p => (
                  <button type="button" key={p} className="preset-chip" onClick={() => handleAddService(p)}>
                    + {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Car Brands Serviced Card */}
            <div className="card">
              <h3 className="card-title">
                <i className="fa-solid fa-car"></i> Car Brands Serviced
              </h3>
              <div className="form-group full" style={{ marginBottom: "20px" }}>
                <label className="form-label">Supported Car Manufacturers</label>
                <div className="tags-container">
                  {brands.map(b => (
                    <span className="pill-tag" style={{ background: "#EFF6FF", borderColor: "#BFDBFE", color: "#1E40AF" }} key={b}>
                      {b}
                      <button type="button" style={{ color: "#1E40AF" }} onClick={() => handleRemoveBrand(b)}>×</button>
                    </span>
                  ))}
                  {brands.length === 0 && <span style={{ fontSize: "13px", color: "#94A3B8" }}>No car brands selected. Click presets or add customized below.</span>}
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ flex: 1 }}
                  placeholder="e.g. Nissan, Chevrolet, Chevrolet" 
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddBrand())}
                />
                <button type="button" style={{ background: COLORS.text, color: "white", border: "none", padding: "0 24px", borderRadius: "10px", fontWeight: 700, cursor: "pointer" }} onClick={() => handleAddBrand()}>
                  Add Brand
                </button>
              </div>

              <label className="form-label" style={{ display: "block", marginBottom: "8px" }}>Or Select Popular Brands</label>
              <div className="preset-container">
                {PRESET_BRANDS.map(p => (
                  <button type="button" key={p} className="preset-chip" onClick={() => handleAddBrand(p)}>
                    + {p}
                  </button>
                ))}
              </div>
            </div>

            {/* General Estimations & Pricing Card */}
            <div className="card">
              <h3 className="card-title">
                <i className="fa-solid fa-tags"></i> Labor Pricing & Direct Spares
              </h3>
              
              <div className="form-grid" style={{ marginBottom: "24px" }}>
                <div className="form-group">
                  <label className="form-label">Min Base Service Price (EGP)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="e.g. 150" 
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Complex Service Price (EGP)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="e.g. 3500" 
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ background: "#F8FAFC", padding: "20px", borderRadius: "14px", border: `1px solid ${COLORS.border}` }}>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={sellsParts}
                    onChange={(e) => setSellsParts(e.target.checked)}
                  />
                  <div className="custom-switch"></div>
                  <span style={{ fontSize: "14px" }}>Allow customers to reserve genuine spare parts directly from our workshop inventory listings</span>
                </label>
              </div>
            </div>

            {/* Save Buttons Bar */}
            <div className="actions-block">
              <Link href="/service-center">
                <button type="button" className="btn-cancel">Discard Changes</button>
              </Link>
              <button type="submit" className="btn-save" disabled={saveLoading}>
                {saveLoading ? (
                  <>Saving...</>
                ) : (
                  <>Save All Settings <i className="fa-solid fa-circle-check"></i></>
                )}
              </button>
            </div>

          </form>
        </main>
      </div>

    </div>
  );
}
