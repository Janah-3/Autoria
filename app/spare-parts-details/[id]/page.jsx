"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { sparePartsService } from "@/lib/api/sparePartsService";
import { mapSparePartItem } from "@/lib/api/mappers";

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

  useEffect(() => {
    if (!params.id) return;
    setLoading(true);
    sparePartsService.getSparePartById(params.id)
      .then(res => {
        const item = res.data ?? res;
        if (item && item.id) {
          const mapped = mapSparePartItem(item);
          setPart({
            id: mapped.id,
            name: mapped.name,
            sku: mapped.sku || `SKU-${mapped.id}`,
            brand: mapped.brand || "—",
            price: mapped.price ? String(mapped.price) : "Contact Seller",
            availability: mapped.availability || "In Stock",
            condition: mapped.type || "New",
            description: mapped.description || "",
            seller: {
              name: mapped.centerName || mapped.sellerName || "—",
              location: mapped.location || "—",
              rating: mapped.rating || 0
            },
            specs: [
              { label: "Brand", value: mapped.brand || "—" },
              { label: "Condition", value: mapped.type || "New" },
              { label: "SKU", value: mapped.sku || `SKU-${mapped.id}` }
            ]
          });
        } else {
          setPart(null);
        }
      })
      .catch(err => {
        console.error("Failed to fetch spare part:", err.message);
        setPart(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div style={{ background: COLORS.bg, minHeight: "100vh", color: COLORS.text, fontFamily: "sans-serif" }}>
        <Navbar />
        <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: "18px", fontWeight: "bold", color: COLORS.primary }}>Loading part details...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!part) {
    return (
      <div style={{ background: COLORS.bg, minHeight: "100vh", color: COLORS.text, fontFamily: "sans-serif" }}>
        <Navbar />
        <div style={{ height: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <h2 style={{ marginBottom: "12px" }}>Part not found</h2>
          <button onClick={() => router.push("/spare-parts-search")} style={{ background: COLORS.primary, color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer" }}>Back to Search</button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", color: COLORS.text, fontFamily: "sans-serif" }}>
      <Navbar />

      <div style={{ background: COLORS.white, borderBottom: `1px solid ${COLORS.border}`, padding: "40px 6%" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ fontSize: "12px", color: COLORS.textLight, marginBottom: "15px" }}>
            Spare Parts / {part.brand} / {part.name}
          </div>
          <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "10px" }}>{part.name}</h1>
          <p style={{ color: COLORS.textLight, fontSize: "14px" }}>SKU: {part.sku} • {part.brand}</p>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "30px auto", padding: "0 6%", display: "grid", gridTemplateColumns: "1fr 350px", gap: "30px" }}>
        
        <div>
          <div style={{ background: "#fff", borderRadius: "15px", border: `1px solid ${COLORS.border}`, padding: "20px", marginBottom: "30px" }}>
            <div style={{ height: "400px", background: "#f1f3f5", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "100px" }}>
              📦
            </div>
          </div>

          <div style={{ background: "#fff", padding: "25px", borderRadius: "15px", border: `1px solid ${COLORS.border}`, marginBottom: "30px" }}>
            <h3 style={{ marginBottom: "15px" }}>Description</h3>
            <p style={{ lineHeight: 1.7, color: COLORS.textLight }}>{part.description}</p>
          </div>

          <div style={{ background: "#fff", padding: "25px", borderRadius: "15px", border: `1px solid ${COLORS.border}` }}>
            <h3 style={{ marginBottom: "15px" }}>Technical Specifications</h3>
            {part.specs.map(s => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                <span style={{ color: COLORS.textLight }}>{s.label}</span>
                <span style={{ fontWeight: "bold" }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
          <div style={{ background: "#fff", padding: "25px", borderRadius: "15px", border: `2px solid ${COLORS.primary}`, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: COLORS.primary, marginBottom: "5px" }}>
              <span style={{ fontSize: "16px" }}>EGP</span> {part.price}
            </div>
            <div style={{ color: COLORS.success, fontWeight: "bold", fontSize: "14px", marginBottom: "20px" }}>✓ {part.availability}</div>
            
            <button style={{ width: "100%", background: COLORS.primary, color: "#fff", border: "none", padding: "15px", borderRadius: "10px", fontWeight: "bold", fontSize: "16px", cursor: "pointer", marginBottom: "10px" }}>
              Reserve Now
            </button>
            <button style={{ width: "100%", background: "transparent", color: COLORS.text, border: `1px solid ${COLORS.border}`, padding: "12px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }}>
              ♡ Save to Wishlist
            </button>
          </div>

          <div style={{ background: "#fff", padding: "20px", borderRadius: "15px", border: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: "12px", color: COLORS.textLight, marginBottom: "10px" }}>SOLD BY</div>
            <div style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "5px" }}>{part.seller.name}</div>
            <div style={{ fontSize: "13px", color: COLORS.textLight }}>📍 {part.seller.location}</div>
            {part.seller.rating > 0 && (
              <div style={{ marginTop: "15px", color: "#F59E0B" }}>★ {part.seller.rating} Rating</div>
            )}
          </div>
        </aside>

      </div>

      <Footer />
    </div>
  );
}
