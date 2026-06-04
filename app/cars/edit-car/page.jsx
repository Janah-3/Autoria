"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getCarById, updateCar } from "../../../src/API/carsService";
import { useRoleGuard } from "@/lib/hooks/useRoleGuard";


const COLORS = [
  "#E8192C", "#212121", "#FFFFFF", "#9E9E9E", "#1565C0",
  "#2E7D32", "#F9A825", "#5D4037", "#FF7043"
];
const FUELS = ["Petrol", "Diesel", "Hybrid", "Electric", "LPG"];
const TRANSMISSIONS = ["Manual", "Automatic"];


const CarSVG = ({ color = "#E8192C", size = 160 }) => (
  <svg viewBox="0 0 200 90" fill="none" width={size}>
    <ellipse cx="100" cy="86" rx="88" ry="4.5" fill="rgba(0,0,0,0.07)" />
    <rect x="15" y="42" width="170" height="38" rx="8" fill={color === "#FFFFFF" ? "#E8E8E8" : color} />
    <path d="M38 42 L70 18 H130 L162 42Z" fill={color === "#FFFFFF" ? "#D0D0D0" : color} opacity=".85" />
    <rect x="73" y="21" width="24" height="21" rx="3" fill="rgba(173,216,230,.65)" />
    <rect x="103" y="21" width="24" height="21" rx="3" fill="rgba(173,216,230,.65)" />
    <rect x="12" y="52" width="12" height="8" rx="2" fill="#FFD700" opacity=".9" />
    <rect x="176" y="52" width="12" height="8" rx="2" fill="#FF5555" opacity=".8" />
    <circle cx="52" cy="78" r="11" fill="#2a2a2a" />
    <circle cx="52" cy="78" r="6.5" fill="#555" />
    <circle cx="52" cy="78" r="3" fill="#888" />
    <circle cx="148" cy="78" r="11" fill="#2a2a2a" />
    <circle cx="148" cy="78" r="6.5" fill="#555" />
    <circle cx="148" cy="78" r="3" fill="#888" />
    <rect x="80" y="44" width="40" height="2" rx="1" fill="rgba(255,255,255,.18)" />
  </svg>
);

export default function EditCarPage() {
  const { authorized, checking } = useRoleGuard();
  const router = useRouter();
  const searchParams = useSearchParams();
  const carId = searchParams.get("id");


  const [formData, setFormData] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  if (carId) {
    getCarById(carId)
      .then((response) => {
        setFormData(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching car:", error);
        alert("Car not found");
        router.push("/cars");
      });
  }
}, [carId, router]);

  if (checking) return null;
  if (!authorized) return null;


  const handleInputChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
    try {

      const payload = {
        licensePlate: formData.licensePlate,
        mileage: parseInt(formData.mileage, 10),
        color: formData.color,
        isPrimary: formData.isPrimary
      };

      await updateCar(carId, payload);

      setIsSaved(true);
      setTimeout(() => {
        router.push("/cars");
      }, 1800);

    } catch (error) {
      alert(`Failed to update car: ${error.message}`);
    }
  };


  const inputStyles = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: "10px",
    border: "1.5px solid #E0E0E0",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "border-color .18s"
  };

  const readOnlyInputStyles = {
    ...inputStyles,
    background: "#f9f9f9",
    color: "#888",
    cursor: "not-allowed"
  };

  const labelStyles = {
    fontSize: "13px",
    fontWeight: "700",
    color: "#424242",
    display: "block",
    marginBottom: "6px"
  };


  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#F7F8FA", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Loading car details...
      </div>
    );
  }
  if (!formData) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#F7F8FA",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        No car data found
      </div>
    );
  }

  if (isSaved) {
    return (
      <div style={{ minHeight: "100vh", background: "#F7F8FA", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "80px", height: "80px", background: "#E8F5E9", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "36px" }}>
            ✓
          </div>
          <div style={{ fontSize: "22px", fontWeight: "900", marginBottom: "8px" }}>
            Changes Saved!
          </div>
          <div style={{ fontSize: "14px", color: "#9E9E9E" }}>
            Redirecting to your cars...
          </div>
        </div>
      </div>
    );
  }


  return (
    <div style={{ minHeight: "100vh", background: "#F7F8FA", fontFamily: "'Segoe UI', sans-serif" }}>


      <nav style={{ background: "#fff", borderBottom: "2px solid #E8192C", padding: "0 32px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(232,25,44,.08)" }}>
        <span style={{ fontSize: "20px", fontWeight: "900", color: "#E8192C" }}>
          Autoria
        </span>
        <Link href="/cars" style={{ fontSize: "13px", fontWeight: "600", color: "#616161", textDecoration: "none" }}>
          ← Back to My Cars
        </Link>
      </nav>

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "36px 24px" }}>
        <div style={{ fontSize: "24px", fontWeight: "900", marginBottom: "4px" }}>
          Edit Car
        </div>
        <div style={{ fontSize: "14px", color: "#9E9E9E", marginBottom: "28px" }}>
          Update your vehicle information
        </div>


        <div style={{ background: "linear-gradient(135deg,#FFF0F1,#FFF8F8)", borderRadius: "16px", padding: "24px", textAlign: "center", marginBottom: "24px", border: "1.5px solid #FFCDD0" }}>
          <CarSVG color={formData.color} size={160} />
          <div style={{ fontSize: "18px", fontWeight: "800", marginTop: "8px", color: "#212121" }}>
            {formData.make} {formData.model} {formData.year}
          </div>
          <div style={{ fontSize: "13px", color: "#9E9E9E", marginTop: "4px" }}>
            {typeof formData.fuelType === "string" ? formData.fuelType : (FUELS[formData.fuelType] || "N/A")} · {formData.licensePlate}
          </div>
          {hasUnsavedChanges && (
            <div style={{ fontSize: "12px", color: "#E8192C", marginTop: "8px", fontWeight: "600" }}>
              ● Unsaved changes
            </div>
          )}
        </div>


        <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 16px rgba(0,0,0,.06)", border: "1.5px solid #f0f0f0", marginBottom: "16px" }}>

          <div style={{ fontSize: "16px", fontWeight: "800", marginBottom: "18px", color: "#212121", borderBottom: "1px solid #F0F0F0", paddingBottom: "12px" }}>
            Editable Info
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
            <div>
              <label style={labelStyles}>License Plate</label>
              <input
                style={inputStyles}
                value={formData.licensePlate}
                onChange={(e) => handleInputChange("licensePlate", e.target.value.toUpperCase())}
              />
            </div>
            <div>
              <label style={labelStyles}>Mileage (km)</label>
              <input
                style={inputStyles}
                type="number"
                value={formData.mileage}
                onChange={(e) => handleInputChange("mileage", e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={labelStyles}>Car Color</label>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {COLORS.map((colorCode) => (
                <div
                  key={colorCode}
                  onClick={() => handleInputChange("color", colorCode)}
                  style={{
                    width: "34px", height: "34px", borderRadius: "50%",
                    background: colorCode,
                    border: formData.color === colorCode ? "3px solid #E8192C" : "2px solid #E0E0E0",
                    cursor: "pointer",
                    boxShadow: formData.color === colorCode ? "0 0 0 3px rgba(232,25,44,.2)" : "none",
                    transition: "all .18s"
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ fontSize: "16px", fontWeight: "800", marginBottom: "18px", color: "#212121", borderBottom: "1px solid #F0F0F0", paddingBottom: "12px", marginTop: "30px" }}>
            Read-Only Specs
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
            <div>
              <label style={labelStyles}>Make</label>
              <input style={readOnlyInputStyles} value={formData.make} readOnly />
            </div>
            <div>
              <label style={labelStyles}>Model</label>
              <input style={readOnlyInputStyles} value={formData.model} readOnly />
            </div>
            <div>
              <label style={labelStyles}>Year</label>
              <input style={readOnlyInputStyles} value={formData.year} readOnly />
            </div>
            <div>
              <label style={labelStyles}>VIN</label>
              <input style={readOnlyInputStyles} value={formData.vin || "N/A"} readOnly />
            </div>
            <div>
              <label style={labelStyles}>Fuel Type</label>
              <input style={readOnlyInputStyles} value={typeof formData.fuelType === "string" ? formData.fuelType : (FUELS[formData.fuelType] || "N/A")} readOnly />
            </div>
            <div>
              <label style={labelStyles}>Transmission</label>
              <input style={readOnlyInputStyles} value={typeof formData.transmission === "string" ? formData.transmission : (TRANSMISSIONS[formData.transmission] || "N/A")} readOnly />
            </div>
          </div>
        </div>


        <div style={{ display: "flex", gap: "12px" }}>
          <Link
            href="/cars"
            style={{ flex: 1, padding: "13px", background: "#F0F0F0", color: "#424242", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: "pointer", textAlign: "center", textDecoration: "none", display: "block" }}
          >
            Cancel
          </Link>
          <button
            onClick={handleSaveChanges}
            disabled={!hasUnsavedChanges}
            style={{ flex: 2, padding: "13px", background: "#E8192C", color: "#fff", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 16px rgba(232,25,44,.25)", opacity: hasUnsavedChanges ? 1 : 0.5 }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}