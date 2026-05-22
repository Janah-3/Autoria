"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { sparePartsService } from "../../src/API/sparePartsService";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";


const COLORS = {
  primary: "#E8272A", 
  bg: "#F8F9FA",
  surface: "#FFFFFF",
  border: "#E9ECEF",
  text: "#111111",
  muted: "#ADB5BD",
  muted2: "#6C757D",
  accent: "#E8272A",
  success: "#28A745"
};

const PartCard = ({ part }) => {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  
  return (
    <div 
      onClick={() => router.push(`/spare-parts-details/${part.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ 
        background: COLORS.surface, 
        border: `1px solid ${hovered ? COLORS.primary : COLORS.border}`, 
        borderRadius: "12px", 
        overflow: "hidden", 
        transition: "all .2s", 
        cursor: "pointer",
        boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.06)" : "0 2px 8px rgba(0,0,0,0.02)"
      }}
    >
      <div style={{ height: "140px", background: "#F1F3F5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "44px", position: "relative" }}>
        {part.type === "Used" ? "⚙️" : "⭕"}
      </div>
      <div style={{ padding: "18px" }}>
        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "15px", fontWeight: 700, marginBottom: "4px", color: COLORS.text }}>{part.name}</h3>
        <p style={{ fontSize: "12px", color: COLORS.muted2, marginBottom: "10px" }}>{part.car}</p>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "20px", fontWeight: 800, color: COLORS.accent, marginBottom: "4px" }}>
           <span style={{ fontSize: "13px", marginRight: "4px" }}>EGP</span>{part.price}
        </div>
        <div style={{ fontSize: "11px", color: COLORS.success, fontWeight: 700 }}>✓ {part.availability}</div>
        
        <div style={{ display: "flex", gap: "8px", margin: "15px 0 0" }}>
          <button style={{ flex: 1, background: COLORS.primary, color: "#FFF", border: "none", padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: 700 }}>Reserve</button>
          <button style={{ flex: 1, background: "transparent", color: COLORS.text, border: `1px solid ${COLORS.border}`, padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: 600 }}>Details</button>
        </div>
      </div>
    </div>
  );
};

function ResultsContent() {
  const searchParams = useSearchParams();
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParts = async () => {
      setLoading(true);
      try {
        const query = {
          q: searchParams.get("q") || "",
          brand: searchParams.get("brand") || "",
          model: searchParams.get("model") || ""
        };
        const data = await sparePartsService.getSpareParts(query);
        setParts(data);
      } catch (error) {
        console.error("Failed to fetch spare parts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchParts();
  }, [searchParams]);

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", color: COLORS.text, fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      <section style={{ background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}`, padding: "40px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "32px", fontWeight: 800, marginBottom: "6px", color: COLORS.text }}>Find Spare Parts Across Egypt</h1>
          <p style={{ color: COLORS.muted2, fontSize: "14px", marginBottom: "28px" }}>Search by part name, part number, or vehicle — see availability from verified centers</p>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 180px 180px 180px auto", gap: "12px", alignItems: "end", background: "#F8F9FA", padding: "20px", borderRadius: "16px", border: `1px solid ${COLORS.border}` }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
               <label style={{ fontSize: "10px", fontWeight: 700, color: COLORS.muted2, textTransform: "uppercase" }}>Part Name or Number</label>
               <input value="Brake Pads" style={{ background: "#FFF", border: `1px solid ${COLORS.border}`, borderRadius: "8px", padding: "12px", color: COLORS.text, outline: "none" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
               <label style={{ fontSize: "10px", fontWeight: 700, color: COLORS.muted2, textTransform: "uppercase" }}>Brand</label>
               <input value="Toyota" style={{ background: "#FFF", border: `1px solid ${COLORS.border}`, borderRadius: "8px", padding: "12px", color: COLORS.text, outline: "none" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
               <label style={{ fontSize: "10px", fontWeight: 700, color: COLORS.muted2, textTransform: "uppercase" }}>Model</label>
               <input value="Corolla" style={{ background: "#FFF", border: `1px solid ${COLORS.border}`, borderRadius: "8px", padding: "12px", color: COLORS.text, outline: "none" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
               <label style={{ fontSize: "10px", fontWeight: 700, color: COLORS.muted2, textTransform: "uppercase" }}>Year</label>
               <input value="2015" style={{ background: "#FFF", border: `1px solid ${COLORS.border}`, borderRadius: "8px", padding: "12px", color: COLORS.text, outline: "none" }} />
            </div>
            <button style={{ background: COLORS.primary, color: "#FFF", border: "none", padding: "12px 30px", borderRadius: "8px", fontWeight: 800 }}>Find Parts</button>
          </div>
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", maxWidth: "1400px", margin: "0 auto" }}>
        <aside style={{ padding: "30px", borderRight: `1px solid ${COLORS.border}`, background: "#FFF" }}>
          <div style={{ fontSize: "11px", fontWeight: 800, color: COLORS.muted2, letterSpacing: "1px", marginBottom: "30px", textTransform: "uppercase" }}>Refine Results</div>
          
          <div style={{ marginBottom: "35px" }}>
            <div style={{ fontSize: "11px", fontWeight: 900, marginBottom: "15px", color: COLORS.text }}>PART CATEGORY</div>
            {["Brakes & Pads", "Engine Parts", "Filters", "Electrical"].map(cat => (
              <label key={cat} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", fontSize: "13px", color: COLORS.muted2, cursor: "pointer" }}>
                <input type="checkbox" style={{ accentColor: COLORS.primary }} /> {cat}
              </label>
            ))}
          </div>

          <div style={{ marginBottom: "35px" }}>
            <div style={{ fontSize: "11px", fontWeight: 900, marginBottom: "15px", color: COLORS.text }}>LOCATION</div>
            <select style={{ width: "100%", background: "#F8F9FA", border: `1px solid ${COLORS.border}`, padding: "12px", borderRadius: "10px", color: COLORS.text }}>
              <option>All Cairo</option>
            </select>
          </div>

          <button style={{ width: "100%", background: COLORS.primary, color: "#FFF", border: "none", padding: "14px", borderRadius: "12px", fontWeight: 800 }}>Apply Filters</button>
        </aside>

        <div style={{ padding: "30px" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "12px", color: COLORS.muted2, marginBottom: "25px" }}>
            Spare Parts <span style={{ color: COLORS.muted }}>/</span> Toyota Corolla 2015 <span style={{ color: COLORS.muted }}>/</span> <span style={{ color: COLORS.text, fontWeight: 700 }}>Brake Pads</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "25px" }}>
             {loading ? (
               <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "50px", color: COLORS.muted2 }}>Searching for parts...</div>
             ) : parts.length > 0 ? (
               parts.map(part => <PartCard key={part.id} part={part} />)
             ) : (
               <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "50px", color: COLORS.muted2 }}>No parts found. Try a different search.</div>
             )}
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function Page() { return <Suspense><ResultsContent /></Suspense>; }
