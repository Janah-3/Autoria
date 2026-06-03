"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { changePassword } from '../../src/API/authService';
import { useLanguage } from "@/context/LanguageContext";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) { setMessage({ type: 'error', text: t("changePassword.mismatch") }); return; }
    if (passwords.newPassword.length < 6) { setMessage({ type: 'error', text: t("changePassword.tooShort") }); return; }
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await changePassword(passwords.oldPassword, passwords.newPassword, passwords.confirmPassword);
      setMessage({ type: 'success', text: t("changePassword.success") });
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => router.push('/cars'), 2000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Something went wrong. Please check your current password.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <nav className="auth-nav">
        <span className="logo">Autoria</span>
        <Link href="/cars" className="back-link">{t("changePassword.backDashboard")}</Link>
      </nav>

      <div className="auth-content">
        <div className="auth-card">
          <div className="header-icon">🔒</div>
          <h2 className="title">{t("changePassword.title")}</h2>
          <p className="subtitle">{t("changePassword.subtitle")}</p>

          <form onSubmit={handleSubmit} className="password-form">
            {[
              { name: "oldPassword", label: t("changePassword.currentPassword"), placeholder: t("changePassword.currentPlaceholder") },
              { name: "newPassword", label: t("changePassword.newPassword"), placeholder: t("changePassword.newPlaceholder") },
              { name: "confirmPassword", label: t("changePassword.confirmPassword"), placeholder: t("changePassword.confirmPlaceholder") },
            ].map(({ name, label, placeholder }) => (
              <div className="input-group" key={name}>
                <label>{label}</label>
                <input type="password" name={name} required value={passwords[name]} onChange={handleInputChange} placeholder={placeholder} />
              </div>
            ))}

            {message.text && <div className={`status-msg ${message.type}`}>{message.text}</div>}

            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? t("changePassword.updating") : t("changePassword.submit")}
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .auth-container { min-height: 100vh; background: #F7F8FA; font-family: 'Cairo', sans-serif; display: flex; flex-direction: column; }
        .auth-nav { background: #fff; border-bottom: 2px solid #E8192C; padding: 0 32px; height: 60px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 8px rgba(232,25,44,0.08); }
        .logo { font-size: 20px; font-weight: 900; color: #E8192C; }
        .back-link { font-size: 13px; font-weight: 600; color: #616161; text-decoration: none; }
        .back-link:hover { color: #E8192C; }
        .auth-content { flex: 1; display: flex; justify-content: center; align-items: center; padding: 40px 20px; }
        .auth-card { background: #fff; padding: 40px; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.06); width: 100%; max-width: 440px; text-align: center; }
        .header-icon { font-size: 40px; margin-bottom: 16px; }
        .title { font-size: 26px; font-weight: 900; color: #212121; margin-bottom: 8px; }
        .subtitle { color: #757575; font-size: 14px; margin-bottom: 32px; }
        .password-form { text-align: left; }
        .input-group { margin-bottom: 20px; }
        .input-group label { display: block; margin-bottom: 8px; font-weight: 700; font-size: 13px; color: #424242; }
        .input-group input { width: 100%; padding: 14px; border: 1.5px solid #E0E0E0; border-radius: 12px; font-size: 15px; outline: none; transition: all 0.2s; }
        .input-group input:focus { border-color: #E8192C; }
        .btn-submit { width: 100%; padding: 16px; background: #E8192C; color: #fff; border: none; border-radius: 12px; font-weight: 700; font-size: 16px; cursor: pointer; margin-top: 10px; transition: all 0.2s; box-shadow: 0 4px 12px rgba(232,25,44,0.2); }
        .btn-submit:disabled { background: #FF8A96; cursor: wait; box-shadow: none; }
        .status-msg { margin-bottom: 20px; padding: 12px; border-radius: 8px; font-size: 14px; font-weight: 600; text-align: left; }
        .success { background: #E8F5E9; color: #2E7D32; border: 1px solid #C8E6C9; }
        .error { background: #FFF0F1; color: #E8192C; border: 1px solid #FFCDD0; }
      `}</style>
    </div>
  );
}
