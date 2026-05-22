"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function EditServiceCenterProfile() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="sc-edit-layout">
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .sc-edit-layout {
          min-height: 100vh;
          background: #F4F7F6;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        .top-nav {
          background: #fff;
          border-bottom: 1px solid #E5E7EB;
          height: 70px;
          padding: 0 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .logo { font-size: 24px; font-weight: 900; color: #E8192C; text-decoration: none; }
        .nav-right { display: flex; align-items: center; gap: 16px; }
        .back-btn { font-size: 14px; font-weight: 600; color: #4B5563; text-decoration: none; border: 1px solid #D1D5DB; padding: 8px 16px; border-radius: 6px; }

        .container {
          max-width: 1000px;
          margin: 40px auto;
          padding: 0 24px;
        }

        .page-header { margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end; }
        .page-title { font-size: 28px; font-weight: 800; color: #111827; margin-bottom: 8px; }
        .page-subtitle { font-size: 15px; color: #6B7280; }

        .editor-container {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
          border: 1px solid #F3F4F6;
          display: flex;
          min-height: 600px;
        }

        /* Sidebar Tabs */
        .sidebar {
          width: 250px;
          border-right: 1px solid #F3F4F6;
          padding: 24px 0;
        }

        .tab-btn {
          width: 100%;
          text-align: left;
          padding: 12px 24px;
          background: none;
          border: none;
          font-size: 14px;
          font-weight: 600;
          color: #4B5563;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: 0.2s;
        }
        .tab-btn:hover { background: #F9FAFB; color: #10B981; }
        .tab-btn.active { background: #ECFDF5; color: #10B981; border-right: 3px solid #10B981; }

        /* Form Area */
        .form-area {
          flex: 1;
          padding: 32px;
        }

        .section-title { font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 24px; border-bottom: 1px solid #E5E7EB; padding-bottom: 12px; }

        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group.full { grid-column: span 2; }
        
        .form-label { font-size: 13px; font-weight: 600; color: #374151; }
        .form-input { padding: 12px; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 14px; outline: none; transition: 0.2s; }
        .form-input:focus { border-color: #10B981; box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1); }

        .photo-upload-box {
          border: 2px dashed #D1D5DB;
          border-radius: 8px;
          padding: 32px;
          text-align: center;
          cursor: pointer;
          background: #F9FAFB;
          margin-bottom: 16px;
        }
        .photo-upload-box:hover { border-color: #10B981; background: #F0FDF4; }

        .actions-bar {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #E5E7EB;
        }
        
        .btn-cancel { padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; background: white; border: 1px solid #D1D5DB; color: #374151; cursor: pointer; }
        .btn-save { padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; background: #10B981; border: none; color: white; cursor: pointer; }
        .btn-save:hover { background: #059669; }

        /* Spare parts list */
        .part-row { display: flex; gap: 12px; margin-bottom: 12px; align-items: flex-end; }
        .btn-remove { padding: 12px; background: #FEE2E2; color: #EF4444; border: none; border-radius: 8px; cursor: pointer; }
        .btn-add-part { padding: 8px 16px; background: white; border: 1px dashed #10B981; color: #10B981; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 13px; }
      `}</style>

      <nav className="top-nav">
        <Link href="/user-dashboard" className="logo" style={{color: '#111827'}}>Autoria</Link>
        <div className="nav-right">
          <Link href="/service-center" className="back-btn"><i className="fa-solid fa-eye"></i> View Profile</Link>
        </div>
      </nav>

      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Edit Business Profile</h1>
            <p className="page-subtitle">Update your service center information, services, and inventory.</p>
          </div>
        </div>

        <div className="editor-container">
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
              <i className="fa-solid fa-box"></i> Spare Parts
            </button>
            <button className={`tab-btn ${activeTab === 'media' ? 'active' : ''}`} onClick={() => setActiveTab('media')}>
              <i className="fa-solid fa-image"></i> Photos
            </button>
          </div>

          <div className="form-area">
            {activeTab === 'general' && (
              <div>
                <h2 className="section-title">General Information</h2>
                <div className="form-grid">
                  <div className="form-group full">
                    <label className="form-label">Service Center Name</label>
                    <input type="text" className="form-input" defaultValue="AutoCare Nasr City" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Established Year</label>
                    <input type="number" className="form-input" defaultValue="2015" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Number of Service Bays</label>
                    <input type="number" className="form-input" defaultValue="6" />
                  </div>
                  <div className="form-group full">
                    <label className="form-label">Short Description</label>
                    <textarea className="form-input" rows="3" defaultValue="Professional auto care center specialized in Toyota and other major brands."></textarea>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div>
                <h2 className="section-title">Contact & Working Hours</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input type="text" className="form-input" defaultValue="+20 1012 345 678" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">WhatsApp Number</label>
                    <input type="text" className="form-input" defaultValue="+20 1012 345 678" />
                  </div>
                  <div className="form-group full">
                    <label className="form-label">Address</label>
                    <input type="text" className="form-input" defaultValue="14 Omar Ibn El-Khattab St, Nasr City" />
                  </div>
                  <div className="form-group full">
                    <label className="form-label">Working Hours Text</label>
                    <input type="text" className="form-input" defaultValue="Sun-Thu 09:00-18:00 • Sat 10:00-15:00" />
                  </div>
                  <div className="form-group full">
                    <label className="form-label">Closed Days</label>
                    <input type="text" className="form-input" defaultValue="Friday" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div>
                <h2 className="section-title">Services & Brands</h2>
                <div className="form-grid">
                  <div className="form-group full">
                    <label className="form-label">Services Offered (comma separated)</label>
                    <input type="text" className="form-input" defaultValue="Oil change, Brake service, AC repair, Electrical, Engine repair, Full inspection, Diagnostics" />
                  </div>
                  <div className="form-group full">
                    <label className="form-label">Car Brands Serviced (comma separated)</label>
                    <input type="text" className="form-input" defaultValue="Toyota, BMW, Mercedes, Kia, Hyundai, Honda" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price Range Start (EGP)</label>
                    <input type="number" className="form-input" defaultValue="150" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price Range End (EGP)</label>
                    <input type="number" className="form-input" defaultValue="3500" />
                  </div>
                  <div className="form-group full" style={{flexDirection: 'row', alignItems: 'center'}}>
                    <input type="checkbox" id="spare" defaultChecked style={{width: '16px', height: '16px'}} />
                    <label htmlFor="spare" className="form-label">We sell spare parts</label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'inventory' && (
              <div>
                <h2 className="section-title">Available Spare Parts</h2>
                
                <div className="part-row">
                  <div className="form-group" style={{flex: 2}}>
                    <label className="form-label">Part Name</label>
                    <input type="text" className="form-input" defaultValue="Air filter (AF-1042)" />
                  </div>
                  <div className="form-group" style={{flex: 1}}>
                    <label className="form-label">Price (EGP)</label>
                    <input type="number" className="form-input" defaultValue="350" />
                  </div>
                  <div className="form-group" style={{flex: 1}}>
                    <label className="form-label">Stock</label>
                    <input type="number" className="form-input" defaultValue="24" />
                  </div>
                  <button className="btn-remove"><i className="fa-solid fa-trash"></i></button>
                </div>

                <div className="part-row">
                  <div className="form-group" style={{flex: 2}}>
                    <label className="form-label">Part Name</label>
                    <input type="text" className="form-input" defaultValue="Brake pads (BP-2231)" />
                  </div>
                  <div className="form-group" style={{flex: 1}}>
                    <label className="form-label">Price (EGP)</label>
                    <input type="number" className="form-input" defaultValue="1200" />
                  </div>
                  <div className="form-group" style={{flex: 1}}>
                    <label className="form-label">Stock</label>
                    <input type="number" className="form-input" defaultValue="3" />
                  </div>
                  <button className="btn-remove"><i className="fa-solid fa-trash"></i></button>
                </div>

                <button className="btn-add-part"><i className="fa-solid fa-plus"></i> Add Another Part</button>
              </div>
            )}

            {activeTab === 'media' && (
              <div>
                <h2 className="section-title">Workshop Photos</h2>
                <div className="photo-upload-box">
                  <i className="fa-solid fa-cloud-arrow-up" style={{fontSize: '32px', color: '#9CA3AF', marginBottom: '12px'}}></i>
                  <p style={{fontSize: '14px', fontWeight: 600, color: '#4B5563'}}>Click to upload photos</p>
                  <p style={{fontSize: '12px', color: '#6B7280'}}>JPG, PNG up to 5MB</p>
                </div>
                
                <div style={{display: 'flex', gap: '12px'}}>
                  <div style={{width: '80px', height: '80px', background: '#D1FAE5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
                    <i className="fa-solid fa-car-side" style={{color: 'rgba(0,0,0,0.2)', fontSize: '24px'}}></i>
                    <button style={{position: 'absolute', top: '-5px', right: '-5px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '10px'}}><i className="fa-solid fa-xmark"></i></button>
                  </div>
                  <div style={{width: '80px', height: '80px', background: '#FEF3C7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
                    <i className="fa-solid fa-screwdriver" style={{color: 'rgba(0,0,0,0.2)', fontSize: '24px'}}></i>
                    <button style={{position: 'absolute', top: '-5px', right: '-5px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '10px'}}><i className="fa-solid fa-xmark"></i></button>
                  </div>
                </div>
              </div>
            )}

            <div className="actions-bar">
              <button className="btn-cancel">Discard Changes</button>
              <button className="btn-save">Save Profile</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
