"use client";

import { useState, useEffect } from "react";
import { resetPassword } from "@/lib/api/authService";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token") || "");
    setEmail(params.get("email") || "");
  }, []);

  const isValid = password.length >= 6 && password === confirm;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    setError("");
    try {
      await resetPassword({
        email,
        token,
        newPassword: password,
        confirmPassword: confirm,
      });
      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
      <div className="bg-[#FFFFFF] p-8 rounded-2xl shadow-lg w-[380px]">
        <h2 className="text-xl font-bold mb-4">Reset Password</h2>
        
        <input 
            type={show ? "text" : "password"} 
            placeholder="New Password"
            className="w-full mb-4 p-3 rounded-lg border"
            onChange={(e) => setPassword(e.target.value)} 
        />
        
        <input 
            type={show ? "text" : "password"} 
            placeholder="Confirm Password"
            className="w-full mb-4 p-3 rounded-lg border"
            onChange={(e) => setConfirm(e.target.value)} 
        />

        <button onClick={handleSubmit} className="w-full p-3 bg-[#E53E3E] text-white rounded-lg">
            {loading ? "Loading..." : "Reset Password"}
        </button>
        
        {error && <p className="text-red-500 mt-2">{error}</p>}
        {success && <p className="text-green-500 mt-2">{success}</p>}
      </div>
    </div>
  );
}