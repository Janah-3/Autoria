"use client";

import { useState } from "react";
import { API_BASE_URL } from "@/lib/apiConfig";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValid = email.includes("@");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/Auth/forgetPass`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Email: email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSent(true);
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch (err) {
      setError("Server error");
    }

    setLoading(false);
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
      <div className="bg-[#ffffff] border border-[#E0E0E0] p-8 rounded-2xl shadow-lg w-[380px]">

        {!sent ? (
          <>
            <h2 className="text-xl font-bold mb-2 text-[#2D2D2D]">
              Forgot Password?
            </h2>
            <p className="text-sm text-[#7A7A7A] mb-6">
              No worries! Enter your email and we'll send a reset link.
            </p>

            <input
              type="email"
              placeholder="Enter your email"
              className="w-full mb-4 p-3 rounded-lg border"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {email && !isValid && (
              <p className="text-red-500 text-sm mb-3">
                Please enter a valid email
              </p>
            )}

            <button
              disabled={!isValid || loading}
              onClick={handleSubmit}
              className={`w-full p-3 rounded-lg text-white font-medium transition ${
                isValid
                  ? "bg-[#E53E3E] hover:bg-[#C53030]"
                  : "bg-[#E53E3E]"
              }`}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            {error && (
              <p className="text-red-500 text-sm mt-3">{error}</p>
            )}

          </>
        ) : (
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2 text-[#2D2D2D]">
              Check Your Email
            </h2>
            <p className="text-sm text-[#7A7A7A] mb-6">
              We sent a password reset link to your email.
            </p>

            <button
              className="w-full p-3 rounded-lg text-white font-medium bg-[#E53E3E] hover:bg-[#C53030]"
            >
              Back to Login
            </button>
          </div>
        )}

      </div>
    </div>
  );
}