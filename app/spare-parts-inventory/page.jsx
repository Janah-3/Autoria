"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { sparePartsService } from "@/lib/sparePartsService";

export default function SparePartsInventory() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sparePartsService
      .getSpareParts()
      .then((data) => {
        const items = Array.isArray(data) ? data : [];
        setParts(
          items.map((p, i) => ({
            id: p.id || i,
            name: p.name || p.partName,
            partNo: p.partNo || p.partNumber || p.sku || "—",
            category: p.category || "General",
            price: p.price ?? 0,
            stock: p.stock ?? 0,
          }))
        );
      })
      .catch(() => setParts([]))
      .finally(() => setLoading(false));
  }, []);

  // Filtering States
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // New Part Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPart, setNewPart] = useState({
    name: "",
    partNo: "",
    category: "Filters",
    price: "",
    stock: ""
  });

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const triggerToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  // KPI Calculations
  const totalItems = parts.length;
  const totalValue = parts.reduce((acc, p) => acc + (p.price * p.stock), 0);
  const lowStockCount = parts.filter(p => p.stock > 0 && p.stock < 5).length;
  const outOfStockCount = parts.filter(p => p.stock === 0).length;

  // Categories
  const CATEGORIES = ["Filters", "Braking", "Electrical", "Engine", "Suspension"];

  // Handlers
  const handleQuantityChange = (id, delta) => {
    setParts(prevParts => prevParts.map(p => {
      if (p.id === id) {
        const newStock = Math.max(0, p.stock + delta);
        if (newStock === 0) {
          triggerToast(`Warning: ${p.name} is now OUT OF STOCK! ⚠️`, "warning");
        } else if (newStock < 5 && p.stock >= 5) {
          triggerToast(`Warning: ${p.name} has dropped to low stock! 📉`, "warning");
        }
        return { ...p, stock: newStock };
      }
      return p;
    }));
  };

  const handleDeletePart = (id, name) => {
    if (confirm(`Are you sure you want to remove ${name} from inventory?`)) {
      setParts(prev => prev.filter(p => p.id !== id));
      triggerToast(`Removed ${name} from listings`, "info");
    }
  };

  const handleAddPart = (e) => {
    e.preventDefault();
    if (!newPart.name || !newPart.partNo || !newPart.price || newPart.stock === "") {
      triggerToast("Please fill all fields to list the spare part", "warning");
      return;
    }

    const item = {
      id: Date.now(),
      name: newPart.name,
      partNo: newPart.partNo,
      category: newPart.category,
      price: parseFloat(newPart.price),
      stock: parseInt(newPart.stock)
    };

    setParts([item, ...parts]);
    setNewPart({ name: "", partNo: "", category: "Filters", price: "", stock: "" });
    setShowAddForm(false);
    triggerToast(`Listed ${item.name} successfully! 📦`, "success");
  };

  // Filter Parts List
  const filteredParts = parts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.partNo.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
    
    let matchesStatus = true;
    if (statusFilter === "Low Stock") {
      matchesStatus = p.stock > 0 && p.stock < 5;
    } else if (statusFilter === "Out of Stock") {
      matchesStatus = p.stock === 0;
    } else if (statusFilter === "Healthy") {
      matchesStatus = p.stock >= 5;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

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
        .toast.info { border-left-color: #3B82F6; }

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
          background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
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
        .icon-blue { background: #EFF6FF; color: #3B82F6; }
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
        .form-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; align-items: flex-end; }
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

        .part-name-block h4 { font-weight: 800; color: #0F172A; margin-bottom: 3px; font-size: 14.5px; }
        .part-name-block span { font-size: 12px; color: #94A3B8; font-weight: 600; font-family: monospace; }
        
        .cat-badge {
          background: #F1F5F9;
          color: #475569;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11.5px;
          font-weight: 700;
        }

        .price-text { font-weight: 800; color: #0F172A; }

        /* Quantity controls */
        .qty-controls { display: flex; align-items: center; gap: 10px; }
        .qty-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1.5px solid #CBD5E1;
          background: white;
          color: #475569;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }
        .qty-btn:hover { border-color: #E8272A; color: #E8272A; background: #FEF2F2; }
        .qty-val { font-weight: 800; font-size: 15px; min-width: 24px; text-align: center; }

        /* Stock Status tags */
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
        }
        .status-badge.healthy { background: #ECFDF5; color: #047857; }
        .status-badge.low { background: #FFFBEB; color: #B45309; }
        .status-badge.out { background: #FEF2F2; color: #B91C1C; }

        .btn-trash {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: #FEE2E2;
          border: none;
          color: #EF4444;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          transition: all 0.2s;
        }
        .btn-trash:hover { background: #EF4444; color: white; }

        .empty-state { text-align: center; padding: 60px 24px; color: #94A3B8; }
        .empty-state i { font-size: 40px; color: #CBD5E1; margin-bottom: 16px; }

        /* Category progress chart widget */
        .chart-card {
          background: white;
          border-radius: 20px;
          padding: 24px;
          border: 1px solid #E2E8F0;
          margin-top: 32px;
        }
        .chart-header { font-size: 16px; font-weight: 800; color: #0F172A; margin-bottom: 20px; }
        .chart-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
        .chart-item { display: flex; flex-direction: column; gap: 8px; }
        .chart-label { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: #475569; }
        .progress-track { height: 8px; background: #F1F5F9; border-radius: 4px; overflow: hidden; }
        .progress-fill { height: 100%; background: #E8272A; border-radius: 4px; }

        /* Responsive */
        @media (max-width: 900px) {
          .kpi-grid { grid-template-columns: 1fr 1fr; margin-top: -32px; }
          .controls-card { flex-direction: column; align-items: stretch; }
          .form-grid { grid-template-columns: 1fr; }
          td, th { padding: 12px 14px; }
          .chart-grid { grid-template-columns: 1fr; }
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
            toast.type === "info" ? "#3B82F6" : "#F59E0B",
          fontSize: "18px"
        }}></i>
        <span style={{ fontSize: "14px", fontWeight: 700 }}>{toast.message}</span>
      </div>

      <nav className="top-nav">
        <Link href="/" className="logo">
          AUTO<span>RIA</span>
        </Link>
        <div className="nav-right">
          <Link href="/service-center/edit" className="back-btn">
            <i className="fa-solid fa-arrow-left"></i> Back to Editor
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
              <h4>Out of Stock</h4>
              <h2 style={{ color: outOfStockCount > 0 ? "#EF4444" : "#0F172A" }}>{outOfStockCount} Items</h2>
            </div>
            <div className="kpi-icon icon-red">
              <i className="fa-solid fa-circle-xmark"></i>
            </div>
          </div>
        </section>

        {/* Collapsible Add Form */}
        {showAddForm && (
          <form className="form-card" onSubmit={handleAddPart}>
            <h3 className="form-title"><i className="fa-solid fa-box-open" style={{ color: '#E8272A', marginRight: '8px' }}></i> Add New Spare Part</h3>
            <div className="form-grid">
              
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Part Name / Model</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Bosch Brake Pad Set Front"
                  value={newPart.name}
                  onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Part Serial / SKU No.</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. BP-8832"
                  value={newPart.partNo}
                  onChange={(e) => setNewPart({ ...newPart, partNo: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select 
                  className="form-input"
                  style={{ cursor: 'pointer' }}
                  value={newPart.category}
                  onChange={(e) => setNewPart({ ...newPart, category: e.target.value })}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Price (EGP)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="Price EGP"
                  value={newPart.price}
                  onChange={(e) => setNewPart({ ...newPart, price: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Initial Stock</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="Initial Stock"
                  value={newPart.stock}
                  onChange={(e) => setNewPart({ ...newPart, stock: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <button type="submit" className="btn-submit" style={{ width: '100%' }}>
                  List Spare Part inside Inventory <i className="fa-solid fa-circle-check"></i>
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
              placeholder="Search by part name, SKU serial or manufacturer number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <div>
              <select className="filter-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="All">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <div>
              <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="Healthy">Healthy Stock (&ge;5)</option>
                <option value="Low Stock">Low Stock (&lt;5)</option>
                <option value="Out of Stock">Out of Stock (0)</option>
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
                <th>Unit Price (EGP)</th>
                <th>Stock Quantity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredParts.map(p => {
                let statusBadge = <span className="status-badge healthy"><i className="fa-solid fa-circle-check"></i> In Stock</span>;
                if (p.stock === 0) {
                  statusBadge = <span className="status-badge out"><i className="fa-solid fa-circle-xmark"></i> Out of Stock</span>;
                } else if (p.stock < 5) {
                  statusBadge = <span className="status-badge low"><i className="fa-solid fa-triangle-exclamation"></i> Low Stock</span>;
                }

                return (
                  <tr key={p.id}>
                    <td>
                      <div className="part-name-block">
                        <h4>{p.name}</h4>
                        <span>SKU: {p.partNo}</span>
                      </div>
                    </td>
                    <td>
                      <span className="cat-badge">{p.category}</span>
                    </td>
                    <td>
                      <span className="price-text">{p.price.toLocaleString()} EGP</span>
                    </td>
                    <td>
                      <div className="qty-controls">
                        <button type="button" className="qty-btn" onClick={() => handleQuantityChange(p.id, -1)}>-</button>
                        <span className="qty-val">{p.stock}</span>
                        <button type="button" className="qty-btn" onClick={() => handleQuantityChange(p.id, 1)}>+</button>
                      </div>
                    </td>
                    <td>{statusBadge}</td>
                    <td>
                      <button type="button" className="btn-trash" onClick={() => handleDeletePart(p.id, p.name)}>
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredParts.length === 0 && (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state">
                      <i className="fa-solid fa-boxes-packing"></i>
                      <p style={{ fontWeight: 700, color: '#64748B', fontSize: '15px' }}>No spare parts match your active filters.</p>
                      <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '6px' }}>Try adjusting search text or resetting the category dropdowns.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* Analytics Distribution Widget */}
        <section className="chart-card">
          <h3 className="chart-header"><i className="fa-solid fa-chart-pie" style={{ color: '#E8272A', marginRight: '8px' }}></i> Inventory Share by Category</h3>
          <div className="chart-grid">
            {CATEGORIES.map(cat => {
              const catParts = parts.filter(p => p.category === cat);
              const totalCatStock = catParts.reduce((acc, x) => acc + x.stock, 0);
              const overallStock = parts.reduce((acc, x) => acc + x.stock, 0);
              const percentage = overallStock > 0 ? Math.round((totalCatStock / overallStock) * 100) : 0;

              return (
                <div className="chart-item" key={cat}>
                  <div className="chart-label">
                    <span>{cat}</span>
                    <span>{percentage}% ({totalCatStock} units)</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ 
                      width: `${percentage}%`, 
                      background: 
                        cat === "Braking" ? "#E8272A" :
                        cat === "Filters" ? "#3B82F6" :
                        cat === "Electrical" ? "#10B981" :
                        cat === "Engine" ? "#F59E0B" : "#8B5CF6"
                    }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
