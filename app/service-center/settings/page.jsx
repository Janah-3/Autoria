"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ServiceCenterSettings() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  return (
    <div className="sc-settings-layout">
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .sc-settings-layout {
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
          max-width: 800px;
          margin: 40px auto;
          padding: 0 24px;
        }

        .page-header { margin-bottom: 32px; }
        .page-title { font-size: 28px; font-weight: 800; color: #111827; margin-bottom: 8px; }
        .page-subtitle { font-size: 15px; color: #6B7280; }

        .settings-card {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
          border: 1px solid #F3F4F6;
          padding: 32px;
          margin-bottom: 24px;
        }

        .section-title { font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 24px; border-bottom: 1px solid #E5E7EB; padding-bottom: 12px; }

        .setting-row { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid #F3F4F6; }
        .setting-row:last-child { border-bottom: none; }
        
        .setting-info h4 { font-size: 15px; font-weight: 600; color: #111827; margin-bottom: 4px; }
        .setting-info p { font-size: 13px; color: #6B7280; }

        /* Toggle Switch */
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: #D1D5DB;
          transition: .4s;
          border-radius: 24px;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        input:checked + .slider { background-color: #10B981; }
        input:checked + .slider:before { transform: translateX(20px); }

        .btn-link { background: none; border: none; color: #10B981; font-weight: 600; font-size: 14px; cursor: pointer; text-decoration: underline; }
        
        /* Danger Zone */
        .danger-zone {
          border: 1px solid #FECACA;
          background: #FEF2F2;
        }
        .danger-zone .section-title { color: #DC2626; border-color: #FECACA; }
        .btn-danger { background: white; border: 1px solid #DC2626; color: #DC2626; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
        .btn-danger:hover { background: #DC2626; color: white; }

      `}</style>

      <nav className="top-nav">
        <Link href="/service-center" className="logo" style={{color: '#111827'}}>Autoria</Link>
        <div className="nav-right">
          <Link href="/service-center" className="back-btn"><i className="fa-solid fa-eye"></i> View Profile</Link>
        </div>
      </nav>

      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Account Settings</h1>
          <p className="page-subtitle">Manage your service center&apos;s preferences, security, and notifications.</p>
        </div>

        <div className="settings-card">
          <h2 className="section-title">Notifications</h2>
          
          <div className="setting-row">
            <div className="setting-info">
              <h4>Email Notifications</h4>
              <p>Receive emails for new bookings, reviews, and updates.</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={emailNotif} onChange={(e) => setEmailNotif(e.target.checked)} />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <h4>SMS Notifications</h4>
              <p>Receive text messages for urgent bookings.</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={smsNotif} onChange={(e) => setSmsNotif(e.target.checked)} />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-card">
          <h2 className="section-title">Security & Access</h2>
          
          <div className="setting-row">
            <div className="setting-info">
              <h4>Password</h4>
              <p>Last changed 3 months ago.</p>
            </div>
            <button className="btn-link">Change Password</button>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <h4>Two-Factor Authentication</h4>
              <p>Add an extra layer of security to your account.</p>
            </div>
            <button className="btn-link">Enable 2FA</button>
          </div>
        </div>

        <div className="settings-card">
          <h2 className="section-title">Business Status</h2>
          
          <div className="setting-row">
            <div className="setting-info">
              <h4>Temporarily Closed</h4>
              <p>Pause all new bookings. Your profile will show as temporarily closed.</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={isClosed} onChange={(e) => setIsClosed(e.target.checked)} />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-card danger-zone">
          <h2 className="section-title">Danger Zone</h2>
          
          <div className="setting-row">
            <div className="setting-info">
              <h4 style={{color: '#DC2626'}}>Deactivate Account</h4>
              <p>Permanently remove your service center from Autoria.</p>
            </div>
            <button className="btn-danger">Deactivate</button>
          </div>
        </div>

      </div>
    </div>
  );
}
