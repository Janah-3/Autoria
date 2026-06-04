"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addCar } from "../../../src/API/carsService";
import { useRoleGuard } from "@/lib/hooks/useRoleGuard";

const BRANDS = [
  "Toyota", "BMW", "Mercedes", "Hyundai", "Kia", "Honda", 
  "Audi", "Nissan", "Ford", "Chevrolet", "Volkswagen", 
  "Mazda", "Mitsubishi", "Peugeot", "Renault"
];
const FUELS = ["Petrol", "Diesel", "Hybrid", "Electric", "LPG"];
const TRANSMISSIONS = ["Manual", "Automatic"];
const COLORS = [
  "#E8192C", "#212121", "#FFFFFF", "#9E9E9E", "#1565C0", 
  "#2E7D32", "#F9A825", "#5D4037", "#FF7043"
];

const CarSVG = ({ color = "#E8192C", size = 180 }) => (
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

export default function AddCarPage() {
  const { authorized, checking } = useRoleGuard();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: "",
    color: "#E8192C",
    plate: "",
      vin: "",
    km: "",
    fuel: 0,
    transmission: 1,
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (checking) return null;
  if (!authorized) return null;

  const handleInputChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value
    }));
    

    if (validationErrors[field]) {
      setValidationErrors((prevErrors) => ({
        ...prevErrors,
        [field]: ""
      }));
    }
  };

  const validateStep1 = () => {
    const errors = {};
    if (!formData.brand) errors.brand = "Brand is required";
    if (!formData.model) errors.model = "Model is required";
    
    const yearNumber = parseInt(formData.year, 10);
    if (!formData.year || isNaN(yearNumber) || yearNumber < 1990 || yearNumber > 2026) {
      errors.year = "Please enter a valid year";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const validateStep2 = () => {
    const errors = {};
    if (!formData.plate) errors.plate = "License plate is required";
    if (!formData.km) errors.km = "Mileage is required";
    
      if (!formData.vin) errors.vin = "VIN is required";

      if (formData.vin && formData.vin.length !== 17) {
         errors.vin = "VIN must be 17 characters";
        }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const goToNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const goToPreviousStep = () => {
    setCurrentStep((prevStep) => prevStep - 1);
  };

  const handleFormSubmit = async () => {
    if (!validateStep2()) return;
    
    setIsLoading(true);
    
    try {
      const payload = {
        make: formData.brand,
        model: formData.model,
        year: parseInt(formData.year, 10),
         vin: formData.vin || "UNKNOWN_VIN",
        licensePlate: formData.plate,
        mileage: parseInt(formData.km, 10),
        color: formData.color,
        transmission: parseInt(formData.transmission, 10),
        fuelType: parseInt(formData.fuel, 10),
        isPrimary: true 
      };
      
      await addCar(payload);
      
      setIsSubmitted(true);
      setTimeout(() => {
        router.push("/cars");
      }, 2000);
      
    } catch (error) {
      alert(`Failed to add car: ${error.message}`);
      setIsLoading(false);
    }
  };

  const inputStyles = { 
    width: "100%", 
    padding: "11px 14px", 
    borderRadius: "10px", 
    borderWidth: "1.5px", 
    borderStyle: "solid", 
    borderColor: "#E0E0E0", 
    fontSize: "14px", 
    outline: "none", 
    boxSizing: "border-box", 
    fontFamily: "inherit", 
    transition: "all 0.2s ease-in-out" 
  };
  
  const errorInputStyles = { 
    ...inputStyles, 
    borderColor: "#E8192C", 
    background: "#FFF8F8" 
  };
  
  const labelStyles = { 
    fontSize: "13px", 
    fontWeight: "700", 
    color: "#424242", 
    display: "block", 
    marginBottom: "6px" 
  };
  
  const errorTextStyles = { 
    fontSize: "11px", 
    color: "#E8192C", 
    fontWeight: "600", 
    marginTop: "4px" 
  };


  if (isSubmitted) {
    return (
      <div style={{ minHeight: "100vh", background: "#F7F8FA", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cairo', sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "80px", height: "80px", background: "#E8F5E9", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "36px" }}>
            ✓
          </div>
          <div style={{ fontSize: "22px", fontWeight: "900", marginBottom: "8px" }}>
            Car Added Successfully!
          </div>
          <div style={{ fontSize: "14px", color: "#9E9E9E" }}>
            Redirecting to your cars...
          </div>
        </div>
      </div>
    );
  }


  return (
    <div style={{ minHeight: "100vh", background: "#F7F8FA", fontFamily: "'Cairo', sans-serif" }}>
      

      <nav style={{ background: "#fff", borderBottom: "2px solid #E8192C", padding: "0 32px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(232,25,44,.08)" }}>
        <span style={{ fontSize: "20px", fontWeight: "900", color: "#E8192C" }}>
          Autoria
        </span>
        <Link href="/cars" style={{ fontSize: "13px", fontWeight: "600", color: "#616161", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
          ← Back to My Cars
        </Link>
      </nav>

      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "40px 24px" }}>
        

        <div style={{ display: "flex", alignItems: "center", marginBottom: "36px", gap: 0 }}>
          {["Car Info", "Details"].map((stepName, index) => {
            const stepNumber = index + 1;
            const isActive = currentStep === stepNumber;
            const isCompleted = currentStep > stepNumber;
            
            return (
              <div key={stepName} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                  <div style={{ 
                    width: "32px", height: "32px", borderRadius: "50%", 
                    background: isCompleted ? "#2E7D32" : isActive ? "#E8192C" : "#E0E0E0", 
                    color: (isCompleted || isActive) ? "#fff" : "#9E9E9E", 
                    display: "flex", alignItems: "center", justifyContent: "center", 
                    fontWeight: "700", fontSize: "13px", transition: "all .3s" 
                  }}>
                    {isCompleted ? "✓" : stepNumber}
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: "600", color: isActive ? "#E8192C" : isCompleted ? "#2E7D32" : "#9E9E9E" }}>
                    {stepName}
                  </span>
                </div>
                {index < 1 && (
                  <div style={{ flex: 1, height: "2px", background: isCompleted ? "#2E7D32" : "#E0E0E0", margin: "0 8px", marginTop: "-14px", transition: "background .3s" }} />
                )}
              </div>
            );
          })}
        </div>


        <div style={{ background: "linear-gradient(135deg,#FFF0F1,#FFF8F8)", borderRadius: "16px", padding: "24px", textAlign: "center", marginBottom: "24px", border: "1.5px solid #FFCDD0" }}>
          <CarSVG color={formData.color} size={180} />
          <div style={{ fontSize: "16px", fontWeight: "700", marginTop: "8px", color: "#212121" }}>
            {formData.brand || "Brand"} {formData.model || "Model"} {formData.year || ""}
          </div>
          <div style={{ fontSize: "13px", color: "#9E9E9E" }}>
            {FUELS[formData.fuel]} · {formData.plate || "Plate"}
          </div>
        </div>

        {currentStep === 1 && (
          <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 16px rgba(0,0,0,.06)", border: "1.5px solid #f0f0f0" }}>
            <div style={{ fontSize: "18px", fontWeight: "800", marginBottom: "20px" }}>
              🚗 Car Information
            </div>
            
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyles}>Brand</label>
              <select 
                style={validationErrors.brand ? errorInputStyles : inputStyles} 
                value={formData.brand} 
                onChange={(e) => handleInputChange("brand", e.target.value)}
              >
                <option value="">Select brand...</option>
                {BRANDS.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
              {validationErrors.brand && <div style={errorTextStyles}>⚠ {validationErrors.brand}</div>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
              <div>
                <label style={labelStyles}>Model</label>
                <input 
                  style={validationErrors.model ? errorInputStyles : inputStyles} 
                  placeholder="e.g. Camry" 
                  value={formData.model} 
                  onChange={(e) => handleInputChange("model", e.target.value)} 
                />
                {validationErrors.model && <div style={errorTextStyles}>⚠ {validationErrors.model}</div>}
              </div>
              <div>
                <label style={labelStyles}>Year</label>
                <input 
                  style={validationErrors.year ? errorInputStyles : inputStyles} 
                  type="number" 
                  placeholder="e.g. 2022" 
                  value={formData.year} 
                  onChange={(e) => handleInputChange("year", e.target.value)} 
                />
                {validationErrors.year && <div style={errorTextStyles}>⚠ {validationErrors.year}</div>}
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyles}>Car Color</label>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {COLORS.map(colorCode => (
                  <div 
                    key={colorCode} 
                    onClick={() => handleInputChange("color", colorCode)} 
                    style={{ 
                      width: "34px", height: "34px", borderRadius: "50%", 
                      background: colorCode, 
                      border: formData.color === colorCode ? "3px solid #E8192C" : "2px solid #E0E0E0", 
                      cursor: "pointer" 
                    }}
                  />
                ))}
              </div>
            </div>

            <button 
              onClick={goToNextStep} 
              style={{ width: "100%", padding: "13px", background: "#E8192C", color: "#fff", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 16px rgba(232,25,44,.25)" }}
            >
              Continue →
            </button>
          </div>
        )}


        {currentStep === 2 && (
          <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 16px rgba(0,0,0,.06)", border: "1.5px solid #f0f0f0" }}>
            <div style={{ fontSize: "18px", fontWeight: "800", marginBottom: "20px" }}>
              📋 Car Details
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
              <div>
                <label style={labelStyles}>License Plate</label>
                <input 
                  style={validationErrors.plate ? errorInputStyles : inputStyles} 
                  placeholder="e.g. ABC 1234" 
                  value={formData.plate} 
                  onChange={(e) => handleInputChange("plate", e.target.value.toUpperCase())} 
                />
                {validationErrors.plate && <div style={errorTextStyles}>⚠ {validationErrors.plate}</div>}
              </div>
              <div>
                <label style={labelStyles}>Current Mileage (km)</label>
                <input 
                  style={validationErrors.km ? errorInputStyles : inputStyles} 
                  type="number" 
                  placeholder="e.g. 45000" 
                  value={formData.km} 
                  onChange={(e) => handleInputChange("km", e.target.value)} 
                />
                {validationErrors.km && <div style={errorTextStyles}>⚠ {validationErrors.km}</div>}
              </div>
              <div style={{ marginBottom: "16px" }}>
  <label style={labelStyles}>VIN Number</label>
  <input
    style={validationErrors.vin ? errorInputStyles : inputStyles}
    placeholder="e.g. 1HGCM82633A004352"
    value={formData.vin}
    onChange={(e) => handleInputChange("vin", e.target.value.toUpperCase())}
  />
  {validationErrors.vin && (
    <div style={errorTextStyles}>⚠ {validationErrors.vin}</div>
  )}
</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "24px" }}>
              <div>
                <label style={labelStyles}>Fuel Type</label>
                <select 
                  style={inputStyles} 
                  value={formData.fuel} 
                  onChange={(e) => handleInputChange("fuel", Number(e.target.value))}
                >
                  {FUELS.map((fuelOption, index) => (
                    <option key={index} value={index}>{fuelOption}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyles}>Transmission</label>
                <select 
                  style={inputStyles} 
                  value={formData.transmission} 
                  onChange={(e) => handleInputChange("transmission", Number(e.target.value))}
                >
                  {TRANSMISSIONS.map((transmissionOption, index) => (
                    <option key={index} value={index}>{transmissionOption}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button 
                onClick={goToPreviousStep} 
                disabled={isLoading} 
                style={{ flex: 1, padding: "13px", background: "#F0F0F0", color: "#424242", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}
              >
                ← Back
              </button>
              
              <button 
                onClick={handleFormSubmit} 
                disabled={isLoading} 
                style={{ flex: 2, padding: "13px", background: "#E8192C", color: "#fff", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: isLoading ? "wait" : "pointer", opacity: isLoading ? 0.7 : 1 }}
              >
                {isLoading ? "Adding..." : "✓ Add Car"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}