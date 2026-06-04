"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { inventoryService } from "@/lib/api/inventoryService";
import { sparePartsService } from "@/lib/api/sparePartsService";
import { serviceCentersService } from "@/lib/api/serviceCentersService";
import { useRoleGuard } from "@/lib/hooks/useRoleGuard";

export default function SparePartsInventory() {
  const { authorized, checking } = useRoleGuard();

  /* ──────────────────── State ──────────────────── */
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, totalCount: 0, totalPages: 0 });

  // Filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("All"); // All, Available, Unavailable
  const [currentPage, setCurrentPage] = useState(1);

  // Add/Update Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [spareParts, setSpareParts] = useState([]); // catalog list to pick from
  const [addForm, setAddForm] = useState({
    sparePartId: "",
    quantity: "",
    price: "",
    isAvailable: true,
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Edit inline
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ quantity: "", price: "", isAvailable: true, reason: "" });

  // Toast
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [centerId, setCenterId] = useState(null);

  const triggerToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  /* ──────────────────── Fetch inventory ──────────────────── */
  const fetchInventory = useCallback(async () => {
    if (!centerId) return;
    try {
      setLoading(true);
      const params = { 
        serviceCenterId: centerId,
        page: currentPage,
        pageSize: 20
      };
      if (availabilityFilter === "Available") params.isAvailable = "true";
      if (availabilityFilter === "Unavailable") params.isAvailable = "false";

      const res = await inventoryService.getStock(params);
      const data = res?.data ?? res;
      const list = data?.items ?? [];
      setItems(list);
      setPagination({
        page: data?.page ?? 1,
        pageSize: data?.pageSize ?? 20,
        totalCount: data?.totalCount ?? list.length,
        totalPages: data?.totalPages ?? 1,
      });
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
      setItems([]);
      triggerToast(err.message || "Failed to load inventory", "warning");
    } finally {
      setLoading(false);
    }
  }, [availabilityFilter, centerId, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [availabilityFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInventory();
  }, [fetchInventory]);

  // Fetch spare parts catalog for the add form dropdown
  useEffect(() => {
    sparePartsService
      .getSpareParts()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setSpareParts(list);
      })
      .catch(() => setSpareParts([]));

    serviceCentersService.getMy()
      .then((res) => {
        const d = res?.data ?? res;
        if (d && (d.id || d.Id)) {
          setCenterId(d.id || d.Id);
        }
      })
      .catch((err) => {
        console.error("Failed to load service center profile:", err);
      });
  }, []);

  /* ──────────────────── Derived KPI ──────────────────── */
  const totalItems = items.length;
  const totalValue = items.reduce((acc, p) => acc + ((p.price ?? 0) * (p.quantity ?? 0)), 0);
  const lowStockCount = items.filter((p) => p.quantity > 0 && p.quantity < 5).length;
  const unavailableCount = items.filter((p) => !p.isAvailable).length;

  /* ──────────────────── Search filter (client-side on fetched page) ──────────────────── */
  const filteredItems = items.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.partName ?? "").toLowerCase().includes(q) ||
      (p.partNumber ?? "").toLowerCase().includes(q) ||
      (p.category ?? "").toLowerCase().includes(q) ||
      (p.brand ?? "").toLowerCase().includes(q)
    );
  });

  /* ──────────────────── Handlers ──────────────────── */

  // Add / Update item
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!addForm.sparePartId || !addForm.quantity || !addForm.price) {
      triggerToast("Please select a spare part, enter quantity and price", "warning");
      return;
    }

    setSubmitting(true);
    try {
      await inventoryService.addOrUpdateItem({
        serviceCenterId: centerId,
        sparePartId: addForm.sparePartId,
        quantity: parseInt(addForm.quantity, 10),
        price: parseFloat(addForm.price),
        isAvailable: addForm.isAvailable,
        reason: addForm.reason || "Added to inventory",
      });
      triggerToast("Spare part added/updated in inventory! 📦", "success");
      setAddForm({ sparePartId: "", quantity: "", price: "", isAvailable: true, reason: "" });
      setShowAddForm(false);
      fetchInventory();
    } catch (err) {
      triggerToast(err.message || "Failed to add item", "warning");
    } finally {
      setSubmitting(false);
    }
  };

  // Start inline edit
  const startEdit = (item) => {
    setEditingId(item.inventoryId);
    setEditForm({
      quantity: item.quantity,
      price: item.price,
      isAvailable: item.isAvailable,
      reason: "",
    });
  };

  // Save inline edit (PUT to same endpoint)
  const handleSaveEdit = async (item) => {
    try {
      await inventoryService.addOrUpdateItem({
        serviceCenterId: centerId,
        sparePartId: item.sparePartId,
        quantity: parseInt(editForm.quantity, 10),
        price: parseFloat(editForm.price),
        isAvailable: editForm.isAvailable,
        reason: editForm.reason || "Updated from inventory page",
      });
      triggerToast(`Updated ${item.partName} successfully! ✅`, "success");
      setEditingId(null);
      fetchInventory();
    } catch (err) {
      triggerToast(err.message || "Failed to update item", "warning");
    }
  };

  // Toggle availability
  const handleToggleAvailability = async (item) => {
    try {
      await inventoryService.addOrUpdateItem({
        serviceCenterId: centerId,
        sparePartId: item.sparePartId,
        quantity: item.quantity,
        price: item.price,
        isAvailable: !item.isAvailable,
        reason: !item.isAvailable ? "Marked as available" : "Marked as unavailable",
      });
      triggerToast(
        !item.isAvailable
          ? `${item.partName} is now available ✅`
          : `${item.partName} marked as unavailable ⚠️`,
        !item.isAvailable ? "success" : "warning"
      );
      fetchInventory();
    } catch (err) {
      triggerToast(err.message || "Failed to toggle availability", "warning");
    }
  };

  if (checking) return null;
  if (!authorized) return null;

  /* ──────────────────── UI ──────────────────── */
  return (
    <div className="inventory-dashboard">
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .inventory-dashboard {
          min-height: 100vh;
          background: #F8FAFC;
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #1E293B;
          position: relative;
        }

        /* Toast */
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
        .toast.info { border-left-color: #E8272A; }

        /* Top Bar */
        .top-nav {
          background: #FFFFFF;
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
        .back-btn:hover { background: #F1F5F9; transform: translateY(-1px); }

        /* Banner */
        .banner {
          background: linear-gradient(135deg, #460203 0%, #920406 50%, #B81C1F 100%);
          padding: 44px 5%;
          color: white;
        }
        .banner-header { display: flex; justify-content: space-between; align-items: center; }
        .banner-title h1 { font-size: 28px; font-weight: 900; letter-spacing: -0.8px; margin-bottom: 6px; }
        .banner-title p { font-size: 14.5px; color: #94A3B8; }
        .btn-add-spare {
          background: #E8272A;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 15px rgba(232,39,42,0.3);
          transition: all 0.2s;
        }
        .btn-add-spare:hover { background: #B81C1F; transform: translateY(-1px); }

        /* Main Container */
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px 24px 60px;
        }

        /* KPI Blocks */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-top: -64px;
          margin-bottom: 32px;
        }
        .kpi-card {
          background: #FFFFFF;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 10px 25px rgba(15, 23, 42, 0.03);
          border: 1px solid #E2E8F0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.2s;
        }
        .kpi-card:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(15, 23, 42, 0.06); }
        .kpi-info h4 { font-size: 13px; color: #64748B; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
        .kpi-info h2 { font-size: 26px; font-weight: 900; color: #0F172A; }
        .kpi-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }
        .icon-blue { background: #FEF2F2; color: #E8272A; }
        .icon-green { background: #ECFDF5; color: #10B981; }
        .icon-amber { background: #FFFBEB; color: #F59E0B; }
        .icon-red { background: #FEF2F2; color: #EF4444; }

        /* Collapsible Form */
        .form-card {
          background: #FFFFFF;
          border-radius: 20px;
          padding: 32px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 10px 25px rgba(0,0,0,0.02);
          margin-bottom: 32px;
          animation: slideDown 0.3s ease-out;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .form-title { font-size: 18px; font-weight: 800; color: #0F172A; margin-bottom: 20px; border-bottom: 1.5px solid #F1F5F9; padding-bottom: 10px; }
        .form-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; align-items: flex-end; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-size: 12.5px; font-weight: 700; color: #475569; }
        .form-input {
          padding: 11px 14px;
          border: 1.5px solid #CBD5E1;
          border-radius: 10px;
          font-size: 13.5px;
          color: #1E293B;
          outline: none;
          background: white;
          font-family: inherit;
        }
        .form-input:focus { border-color: #E8272A; box-shadow: 0 0 0 3px rgba(232,39,42,0.06); }
        .form-textarea {
          padding: 11px 14px;
          border: 1.5px solid #CBD5E1;
          border-radius: 10px;
          font-size: 13.5px;
          color: #1E293B;
          outline: none;
          background: white;
          font-family: inherit;
          resize: vertical;
          min-height: 44px;
        }
        .form-textarea:focus { border-color: #E8272A; box-shadow: 0 0 0 3px rgba(232,39,42,0.06); }
        .btn-submit {
          background: #10B981;
          color: white;
          border: none;
          padding: 12px;
          border-radius: 10px;
          font-weight: 800;
          font-size: 13.5px;
          cursor: pointer;
          transition: all 0.2s;
          height: 43px;
        }
        .btn-submit:hover { background: #059669; }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .toggle-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 8px;
        }
        .toggle-switch {
          position: relative;
          width: 44px;
          height: 24px;
          cursor: pointer;
        }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .toggle-slider {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: #CBD5E1;
          border-radius: 24px;
          transition: 0.3s;
        }
        .toggle-slider::before {
          content: '';
          position: absolute;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: white;
          top: 3px; left: 3px;
          transition: 0.3s;
        }
        .toggle-switch input:checked + .toggle-slider { background: #10B981; }
        .toggle-switch input:checked + .toggle-slider::before { transform: translateX(20px); }

        /* Filter Controls */
        .controls-card {
          background: #FFFFFF;
          border-radius: 16px;
          padding: 20px 24px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.01);
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }
        .search-group { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 280px; }
        .search-input {
          width: 100%;
          padding: 10px 14px;
          border: 1.5px solid #E2E8F0;
          border-radius: 10px;
          font-size: 13.5px;
          outline: none;
          font-family: inherit;
          color: #1E293B;
        }
        .search-input:focus { border-color: #E8272A; }
        
        .filter-group { display: flex; align-items: center; gap: 12px; }
        .filter-select {
          padding: 9px 14px;
          border: 1.5px solid #E2E8F0;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          outline: none;
          background: white;
          color: #475569;
          cursor: pointer;
        }

        /* Stock Table Card */
        .table-card {
          background: #FFFFFF;
          border-radius: 20px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 10px 25px rgba(0,0,0,0.01);
          overflow: hidden;
        }
        table { width: 100%; border-collapse: collapse; text-align: left; }
        thead { background: #F8FAFC; border-bottom: 1px solid #E2E8F0; }
        th { padding: 16px 24px; font-size: 12px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; }
        tbody tr { border-bottom: 1px solid #F1F5F9; transition: background 0.2s; }
        tbody tr:last-child { border-bottom: none; }
        tbody tr:hover { background: #F8FAFC; }
        td { padding: 18px 24px; font-size: 14px; color: #334155; vertical-align: middle; }

        .part-name-block { display: flex; align-items: center; gap: 12px; }
        .part-thumb {
          width: 40px; height: 40px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid #E2E8F0;
          background: #F8FAFC;
        }
        .part-info h4 { font-weight: 800; color: #0F172A; margin-bottom: 3px; font-size: 14.5px; }
        .part-info span { font-size: 12px; color: #94A3B8; font-weight: 600; font-family: monospace; }
        
        .cat-badge {
          background: #F1F5F9;
          color: #475569;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11.5px;
          font-weight: 700;
        }

        .brand-badge {
          background: #FEF2F2;
          color: #E8272A;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11.5px;
          font-weight: 700;
        }

        .price-text { font-weight: 800; color: #0F172A; }

        /* Quantity display */
        .qty-val { font-weight: 800; font-size: 15px; min-width: 24px; text-align: center; }

        /* Status badge */
        .status-badge {
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          font-family: inherit;
        }
        .status-badge:hover { transform: scale(1.05); }
        .status-badge.available { background: #ECFDF5; color: #047857; }
        .status-badge.unavailable { background: #FEF2F2; color: #B91C1C; }
        .status-badge.low { background: #FFFBEB; color: #B45309; }

        /* Action buttons */
        .action-btns { display: flex; gap: 8px; }
        .btn-edit {
          width: 36px; height: 36px;
          border-radius: 8px;
          background: #FEF2F2;
          border: none;
          color: #E8272A;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px;
          transition: all 0.2s;
        }
        .btn-edit:hover { background: #E8272A; color: white; }
        .btn-save {
          width: 36px; height: 36px;
          border-radius: 8px;
          background: #ECFDF5;
          border: none;
          color: #10B981;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px;
          transition: all 0.2s;
        }
        .btn-save:hover { background: #10B981; color: white; }
        .btn-cancel {
          width: 36px; height: 36px;
          border-radius: 8px;
          background: #FEF2F2;
          border: none;
          color: #EF4444;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px;
          transition: all 0.2s;
        }
        .btn-cancel:hover { background: #EF4444; color: white; }

        /* Inline edit inputs */
        .inline-input {
          padding: 6px 10px;
          border: 1.5px solid #CBD5E1;
          border-radius: 8px;
          font-size: 13px;
          width: 80px;
          outline: none;
          font-family: inherit;
        }
        .inline-input:focus { border-color: #E8272A; }

        .empty-state { text-align: center; padding: 60px 24px; color: #94A3B8; }
        .empty-state i { font-size: 40px; color: #CBD5E1; margin-bottom: 16px; }

        /* Loading skeleton */
        .skeleton-row td {
          height: 56px;
        }
        .skeleton-pulse {
          background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
          background-size: 200% 100%;
          animation: pulse 1.5s infinite;
          border-radius: 6px;
          height: 16px;
          width: 80%;
        }
        @keyframes pulse {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Updated at timestamp */
        .updated-text { font-size: 11.5px; color: #94A3B8; font-weight: 600; }

        /* Responsive */
        @media (max-width: 900px) {
          .kpi-grid { grid-template-columns: 1fr 1fr; margin-top: -32px; }
          .controls-card { flex-direction: column; align-items: stretch; }
          .form-grid { grid-template-columns: 1fr; }
          td, th { padding: 12px 14px; }
        }
      `}</style>

      {/* Toast Alert */}
      <div className={`toast ${toast.show ? "show" : ""} ${toast.type}`}>
        <i className={`fa-solid ${
          toast.type === "success" ? "fa-circle-check" :
          toast.type === "info" ? "fa-circle-info" : "fa-triangle-exclamation"
        }`} style={{
          color: 
            toast.type === "success" ? "#10B981" :
            toast.type === "info" ? "#E8272A" : "#F59E0B",
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
            <i className="fa-solid fa-arrow-left"></i> Back to Dashboard
          </Link>
        </div>
      </nav>

      <section className="banner">
        <div className="banner-header">
          <div className="banner-title">
            <h1>Spare Parts Inventory Control</h1>
            <p>Keep track of workshop stocks, update part pricing, and manage healthy supply levels.</p>
          </div>
          <button className="btn-add-spare" onClick={() => setShowAddForm(!showAddForm)}>
            <i className={`fa-solid ${showAddForm ? "fa-xmark" : "fa-plus"}`}></i>
            {showAddForm ? "Close Form" : "Add Spare Part"}
          </button>
        </div>
      </section>

      <div className="container">
        
        {/* KPI Blocks */}
        <section className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-info">
              <h4>Total Parts Listed</h4>
              <h2>{totalItems} Items</h2>
            </div>
            <div className="kpi-icon icon-blue">
              <i className="fa-solid fa-box"></i>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-info">
              <h4>Inventory Value</h4>
              <h2>{totalValue.toLocaleString()} EGP</h2>
            </div>
            <div className="kpi-icon icon-green">
              <i className="fa-solid fa-money-bill-wave"></i>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-info">
              <h4>Low Stock Alerts</h4>
              <h2>{lowStockCount} Parts</h2>
            </div>
            <div className="kpi-icon icon-amber">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-info">
              <h4>Unavailable</h4>
              <h2 style={{ color: unavailableCount > 0 ? "#EF4444" : "#0F172A" }}>{unavailableCount} Items</h2>
            </div>
            <div className="kpi-icon icon-red">
              <i className="fa-solid fa-circle-xmark"></i>
            </div>
          </div>
        </section>

        {/* Collapsible Add Form */}
        {showAddForm && (
          <form className="form-card" onSubmit={handleAddItem}>
            <h3 className="form-title"><i className="fa-solid fa-box-open" style={{ color: '#E8272A', marginRight: '8px' }}></i> Add Spare Part to Inventory</h3>
            <div className="form-grid">
              
              <div className="form-group" style={{ gridColumn: 'span 3' }}>
                <label className="form-label">Select Spare Part from Catalog</label>
                <select 
                  className="form-input"
                  style={{ cursor: 'pointer' }}
                  value={addForm.sparePartId}
                  onChange={(e) => setAddForm({ ...addForm, sparePartId: e.target.value })}
                  required
                >
                  <option value="">— Choose a spare part —</option>
                  {spareParts.map(sp => (
                    <option key={sp.id} value={sp.id}>
                      {sp.name} {sp.partNumber ? `(${sp.partNumber})` : ""} {sp.brand ? `– ${sp.brand}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="e.g. 10"
                  min="0"
                  value={addForm.quantity}
                  onChange={(e) => setAddForm({ ...addForm, quantity: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Price (EGP)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="e.g. 450"
                  min="0"
                  step="0.01"
                  value={addForm.price}
                  onChange={(e) => setAddForm({ ...addForm, price: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Available?</label>
                <div className="toggle-row">
                  <label className="toggle-switch">
                    <input 
                      type="checkbox"
                      checked={addForm.isAvailable}
                      onChange={(e) => setAddForm({ ...addForm, isAvailable: e.target.checked })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: addForm.isAvailable ? '#10B981' : '#94A3B8' }}>
                    {addForm.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Reason / Note (optional)</label>
                <textarea 
                  className="form-textarea" 
                  placeholder="e.g. Spare part is in stock and ready for installation"
                  value={addForm.reason}
                  onChange={(e) => setAddForm({ ...addForm, reason: e.target.value })}
                />
              </div>

              <div className="form-group">
                <button type="submit" className="btn-submit" style={{ width: '100%' }} disabled={submitting}>
                  {submitting ? "Saving..." : "Add to Inventory"} <i className="fa-solid fa-circle-check"></i>
                </button>
              </div>

            </div>
          </form>
        )}

        {/* Filter Controls Card */}
        <section className="controls-card">
          <div className="search-group">
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search by part name, part number, category or brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <div>
              <select className="filter-select" value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value)}>
                <option value="All">All Items</option>
                <option value="Available">Available Only</option>
                <option value="Unavailable">Unavailable Only</option>
              </select>
            </div>
          </div>
        </section>

        {/* Table Listing */}
        <section className="table-card">
          <table>
            <thead>
              <tr>
                <th>Part Details</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Price (EGP)</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <>
                  {[1,2,3,4,5].map(i => (
                    <tr key={`sk-${i}`} className="skeleton-row">
                      <td><div className="skeleton-pulse" style={{ width: '140px' }}></div></td>
                      <td><div className="skeleton-pulse" style={{ width: '60px' }}></div></td>
                      <td><div className="skeleton-pulse" style={{ width: '60px' }}></div></td>
                      <td><div className="skeleton-pulse" style={{ width: '60px' }}></div></td>
                      <td><div className="skeleton-pulse" style={{ width: '40px' }}></div></td>
                      <td><div className="skeleton-pulse" style={{ width: '70px' }}></div></td>
                      <td><div className="skeleton-pulse" style={{ width: '70px' }}></div></td>
                      <td><div className="skeleton-pulse" style={{ width: '60px' }}></div></td>
                    </tr>
                  ))}
                </>
              )}

              {!loading && filteredItems.map(item => {
                const isEditing = editingId === item.inventoryId;
                const isLowStock = item.quantity > 0 && item.quantity < 5;

                // Status badge
                let statusEl;
                if (!item.isAvailable) {
                  statusEl = (
                    <button type="button" className="status-badge unavailable" onClick={() => handleToggleAvailability(item)} title="Click to mark available">
                      <i className="fa-solid fa-circle-xmark"></i> Unavailable
                    </button>
                  );
                } else if (isLowStock) {
                  statusEl = (
                    <button type="button" className="status-badge low" onClick={() => handleToggleAvailability(item)} title="Click to toggle availability">
                      <i className="fa-solid fa-triangle-exclamation"></i> Low Stock
                    </button>
                  );
                } else {
                  statusEl = (
                    <button type="button" className="status-badge available" onClick={() => handleToggleAvailability(item)} title="Click to mark unavailable">
                      <i className="fa-solid fa-circle-check"></i> Available
                    </button>
                  );
                }

                // Format date
                const updatedDate = item.updatedAt
                  ? new Date(item.updatedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                  : "—";

                return (
                  <tr key={item.inventoryId}>
                    <td>
                      <div className="part-name-block">
                        {item.thumbnailUrl && (
                          <img src={item.thumbnailUrl} alt={item.partName} className="part-thumb" />
                        )}
                        <div className="part-info">
                          <h4>{item.partName ?? "Unnamed Part"}</h4>
                          <span>{item.partNumber ?? "—"}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="cat-badge">{item.category ?? "—"}</span>
                    </td>
                    <td>
                      <span className="brand-badge">{item.brand ?? "—"}</span>
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="number"
                          className="inline-input"
                          value={editForm.price}
                          min="0"
                          step="0.01"
                          onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                        />
                      ) : (
                        <span className="price-text">{(item.price ?? 0).toLocaleString()} EGP</span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="number"
                          className="inline-input"
                          value={editForm.quantity}
                          min="0"
                          style={{ width: '60px' }}
                          onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                        />
                      ) : (
                        <span className="qty-val">{item.quantity ?? 0}</span>
                      )}
                    </td>
                    <td>{statusEl}</td>
                    <td>
                      <span className="updated-text">{updatedDate}</span>
                    </td>
                    <td>
                      <div className="action-btns">
                        {isEditing ? (
                          <>
                            <button type="button" className="btn-save" onClick={() => handleSaveEdit(item)} title="Save">
                              <i className="fa-solid fa-check"></i>
                            </button>
                            <button type="button" className="btn-cancel" onClick={() => setEditingId(null)} title="Cancel">
                              <i className="fa-solid fa-xmark"></i>
                            </button>
                          </>
                        ) : (
                          <button type="button" className="btn-edit" onClick={() => startEdit(item)} title="Edit quantity & price">
                            <i className="fa-solid fa-pen"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && filteredItems.length === 0 && (
                <tr>
                  <td colSpan="8">
                    <div className="empty-state">
                      <i className="fa-solid fa-boxes-packing"></i>
                      <p style={{ fontWeight: 700, color: '#64748B', fontSize: '15px' }}>
                        {items.length === 0
                          ? "Your inventory is empty. Add spare parts to get started!"
                          : "No spare parts match your search."}
                      </p>
                      <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '6px' }}>
                        {items.length === 0
                          ? "Click \"Add Spare Part\" above to add items from the spare parts catalog."
                          : "Try adjusting your search text or resetting the filter."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* Pagination info */}
        {!loading && pagination.totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px',
            marginTop: '24px',
            fontSize: '14px',
            color: '#64748B',
            fontWeight: 700,
          }}>
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage <= 1 ? 0.5 : 1,
                fontWeight: 750,
                color: '#1E293B'
              }}
            >
              Previous
            </button>
            <span>
              Page {pagination.page} of {pagination.totalPages} · {pagination.totalCount} total items
            </span>
            <button
              type="button"
              disabled={currentPage >= pagination.totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
              style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: currentPage >= pagination.totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage >= pagination.totalPages ? 0.5 : 1,
                fontWeight: 750,
                color: '#1E293B'
              }}
            >
              Next
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
