"use client";

import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const isValid = email.includes("@");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
      <div className="bg-[#FFFFFF] border border-[#E0E0E0] p-8 rounded-2xl shadow-lg w-[380px]">

        {!sent ? (
          <>
            <h2 className="text-xl font-bold mb-2 text-[#2D2D2D]">
              Forgot Password
            </h2>
            <p className="text-sm text-[#7A7A7A] mb-6">
              Enter your email to reset your password
            </p>

            {/* Email */}
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full mb-4 p-3 rounded-lg border border-[#D1D1D1] focus:outline-none focus:border-[#9CA3AF] focus:ring-2 focus:ring-[#D1D5DB]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* Error */}
            {email && !isValid && (
              <p className="text-[#E53E3E] text-sm mb-3">
                Please enter a valid email
              </p>
            )}

            {/* Button */}
            <button
              disabled={!isValid}
              onClick={() => setSent(true)}
              className={`w-full p-3 rounded-lg text-white font-medium transition ${
                isValid
                  ? "bg-[#E53E3E] hover:bg-[#C53030]"
                  : "bg-[#E53E3E]"
              }`}
            >
              Send Reset Link
            </button>

            <p className="text-center text-sm text-[#7A7A7A] mt-5">
              Back to login
            </p>
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
              className="w-full p-3 rounded-lg text-white font-medium bg-[#E53E3E] hover:bg-[#C53030] transition"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
