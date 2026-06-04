"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useRoleGuard } from "@/lib/hooks/useRoleGuard";

export default function BookingSuccessPage() {
  const { authorized, checking } = useRoleGuard();
  const router = useRouter();

  const COLORS = {
    primary: "#E8272A",
    success: "#28A745",
    dark: "#1A1A1A",
    textLight: "#6C757D",
    bg: "#F8F9FA",
    white: "#FFFFFF",
  };

  if (checking) return null;
  if (!authorized) return null;

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "sans-serif" }}>
      <Navbar />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      
      <div style={{ 
        background: COLORS.white, 
        maxWidth: "480px", 
        width: "100%", 
        borderRadius: "20px", 
        padding: "40px", 
        textAlign: "center",
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
        border: "1px solid #eee"
      }}>
        

        <div style={{ 
          width: "80px", 
          height: "80px", 
          background: "#E6F4EA", 
          borderRadius: "50%", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          margin: "0 auto 24px"
        }}>
          <span style={{ color: COLORS.success, fontSize: "40px", fontWeight: "bold" }}>✓</span>
        </div>

        <h1 style={{ fontSize: "28px", fontWeight: "800", color: COLORS.dark, marginBottom: "10px" }}>
          Booking Confirmed!
        </h1>
        <p style={{ color: COLORS.textLight, fontSize: "15px", lineHeight: "1.6", marginBottom: "30px" }}>
          Your service has been successfully scheduled. We've sent a confirmation message to your phone.
        </p>


        <div style={{ background: COLORS.bg, borderRadius: "12px", padding: "15px", marginBottom: "30px", textAlign: "left" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", color: COLORS.textLight }}>Booking ID:</span>
            <span style={{ fontSize: "13px", fontWeight: "700" }}>#AUT-88291</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "13px", color: COLORS.textLight }}>Status:</span>
            <span style={{ fontSize: "13px", fontWeight: "700", color: COLORS.success }}>Confirmed</span>
          </div>
        </div>


        <button 
          onClick={() => router.push("/user-dashboard")}
          style={{ 
            width: "100%",
            background: COLORS.primary, 
            color: COLORS.white, 
            border: "none", 
            padding: "14px", 
            borderRadius: "10px", 
            fontSize: "15px", 
            fontWeight: "700", 
            cursor: "pointer",
            marginBottom: "12px"
          }}
        >
          Go to Dashboard
        </button>
        
        <button 
          onClick={() => window.print()}
          style={{ 
            width: "100%",
            background: "transparent", 
            color: COLORS.dark, 
            border: "1px solid #ddd", 
            padding: "14px", 
            borderRadius: "10px", 
            fontSize: "15px", 
            fontWeight: "700", 
            cursor: "pointer"
          }}
        >
          Print Receipt
        </button>

        <p style={{ marginTop: "24px", fontSize: "12px", color: COLORS.textLight }}>
          Need help? <a href="#" style={{ color: COLORS.primary, textDecoration: "none" }}>Contact Support</a>
        </p>

      </div>
      </div>
    </div>
  );
}

