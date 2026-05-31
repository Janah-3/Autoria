"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { sparePartsService } from "../../../lib/sparePartsService";

const COLORS = {
  primary: "#E8272A",
  primaryDark: "#B81C1F",
  bg: "#F8F9FA",
  white: "#FFFFFF",
  border: "#E9ECEF",
  text: "#111111",
  textLight: "#6C757D",
  success: "#28A745",
};

export default function SparePartDetailsPage() {
  const params = useParams();
  const router = useRouter();
  
  const [part, setPart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    if (!params?.id) return;
    
    const fetchPartDetails = async () => {
      try {
        setLoading(true);
        const data = await sparePartsService.getSparePartById(params.id);
        setPart(data);
        const imgs = data?.images ?? data?.Images;
        if (imgs?.length > 0) {
          setActiveImage(imgs[0]);
        }
      } catch (err) {
        console.error("Error loading spare part details:", err);
        setError("Unable to find the requested spare part.");
      } finally {
        setLoading(false);
      }
    };

    fetchPartDetails();
  }, [params?.id]);

  if (loading) {
    return (
      <div style={{ background: COLORS.bg, minHeight: "100vh", color: COLORS.text, fontFamily: "sans-serif" }}>
        <Navbar />
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", fontSize: "16px", color: COLORS.textLight }}>
          Loading spare part details...
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !part) {
    return (
      <div style={{ background: COLORS.bg, minHeight: "100vh", color: COLORS.text, fontFamily: "sans-serif" }}>
        <Navbar />
        <div style={{ textAlign: "center", padding: "100px 20px" }}>
          <h2 style={{ color: COLORS.primary, marginBottom: "10px" }}>Error</h2>
          <p style={{ color: COLORS.textLight, marginBottom: "20px" }}>{error || "Spare part not found."}</p>
          <button 
            onClick={() => router.push("/spare-parts-search")}
            style={{ background: COLORS.primary, color: "#fff", border: "none", padding: "12px 24px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
          >
            Back to Search
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const category = part.category ?? part.Category ?? "";
  const name = part.name ?? part.Name ?? "";
  const partNumber = part.partNumber ?? part.PartNumber ?? "";
  const brand = part.brand ?? part.Brand ?? "";
  const model = part.model ?? part.Model ?? "";
  const countryOfOrigin = part.countryOfOrigin ?? part.CountryOfOrigin ?? "";
  const manufacturer = part.manufacturer ?? part.Manufacturer ?? "";
  const productionDate = part.productionDate ?? part.ProductionDate ?? "";
  const images = part.images ?? part.Images ?? [];
  const description = part.description ?? part.Description ?? "";
  const availability = part.availability ?? part.Availability ?? [];

  const specs = [
    { label: "Category", value: category },
    { label: "Brand", value: brand },
    { label: "Model Code", value: model },
    { label: "Part Number / SKU", value: partNumber || "N/A" },
    { label: "Country of Origin", value: countryOfOrigin || "N/A" },
    { label: "Manufacturer", value: manufacturer || "N/A" },
    { label: "Production Date", value: productionDate ? new Date(productionDate).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : "N/A" }
  ];

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", color: COLORS.text, fontFamily: "sans-serif" }}>
      <Navbar />

      <div style={{ background: COLORS.white, borderBottom: `1px solid ${COLORS.border}`, padding: "40px 6%" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ fontSize: "12px", color: COLORS.textLight, marginBottom: "15px" }}>
            Spare Parts / {category} / {name}
          </div>
          <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "10px" }}>{name}</h1>
          <p style={{ color: COLORS.textLight, fontSize: "14px" }}>
            Part Number: {partNumber || "N/A"} • Brand: {brand}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "30px auto", padding: "0 6%", display: "grid", gridTemplateColumns: "1fr 350px", gap: "30px" }}>
        
        <div>
          <div style={{ background: "#fff", borderRadius: "15px", border: `1px solid ${COLORS.border}`, padding: "20px", marginBottom: "30px" }}>
            <div style={{ height: "400px", background: "#f1f3f5", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              {activeImage ? (
                <img 
                  src={activeImage} 
                  alt={name} 
                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                />
              ) : (
                <span style={{ fontSize: "100px" }}>📦</span>
              )}
            </div>

            {images?.length > 1 && (
              <div style={{ display: "flex", gap: "10px", marginTop: "15px", overflowX: "auto", paddingBottom: "5px" }}>
                {images.map((img, index) => (
                  <div 
                    key={index} 
                    onClick={() => setActiveImage(img)}
                    style={{ 
                      width: "70px", 
                      height: "70px", 
                      borderRadius: "8px", 
                      border: `2px solid ${activeImage === img ? COLORS.primary : COLORS.border}`, 
                      overflow: "hidden", 
                      cursor: "pointer", 
                      flexShrink: 0 
                    }}
                  >
                    <img src={img} alt={`${name} view ${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background: "#fff", padding: "25px", borderRadius: "15px", border: `1px solid ${COLORS.border}`, marginBottom: "30px" }}>
            <h3 style={{ marginBottom: "15px" }}>Description</h3>
            <p style={{ lineHeight: 1.7, color: COLORS.textLight }}>{description || "No description provided for this spare part."}</p>
          </div>

          <div style={{ background: "#fff", padding: "25px", borderRadius: "15px", border: `1px solid ${COLORS.border}`, marginBottom: "30px" }}>
            <h3 style={{ marginBottom: "15px" }}>Technical Specifications</h3>
            {specs.map(s => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                <span style={{ color: COLORS.textLight }}>{s.label}</span>
                <span style={{ fontWeight: "bold" }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
          <div style={{ background: "#fff", padding: "25px", borderRadius: "15px", border: `2px solid ${COLORS.primary}`, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: "14px", color: COLORS.textLight, marginBottom: "5px" }}>Price Starting From</div>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: COLORS.primary, marginBottom: "15px" }}>
              <span style={{ fontSize: "16px" }}>EGP</span> {availability?.length > 0 ? Math.min(...availability.map(a => a.price || Infinity)) : "N/A"}
            </div>
            
            <button style={{ width: "100%", background: COLORS.primary, color: "#fff", border: "none", padding: "15px", borderRadius: "10px", fontWeight: "bold", fontSize: "16px", cursor: "pointer", marginBottom: "10px" }}>
              Reserve Now
            </button>
          
          </div>

          <div style={{ background: "#fff", padding: "20px", borderRadius: "15px", border: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: "12px", color: COLORS.textLight, marginBottom: "12px", fontWeight: "bold", letterSpacing: "0.5px" }}>AVAILABLE AT SERVICE CENTERS</div>
            
            {availability?.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {availability.map((av, index) => (
                  <div key={index} style={{ borderBottom: index < availability.length - 1 ? `1px solid ${COLORS.border}` : "none", paddingBottom: "12px" }}>
                    <div style={{ fontWeight: "bold", fontSize: "14px", color: COLORS.text }}>{av.serviceCenterName || "Verified Service Center"}</div>
                    <div style={{ fontSize: "12px", color: COLORS.textLight, marginTop: "2px" }}>Price: <span style={{ color: COLORS.primary, fontWeight: "bold" }}>EGP {av.price}</span></div>
                    <div style={{ fontSize: "11px", color: COLORS.success, marginTop: "4px" }}>✓ In Stock ({av.quantity || "Available"})</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: "13px", color: COLORS.textLight, textAlign: "center", padding: "10px 0" }}>
                Available on request. Contact our verified centers to order.
              </div>
            )}
          </div>
        </aside>

      </div>

      <Footer />
    </div>
  );
}
