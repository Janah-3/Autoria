"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/apiConfig";




const COLORS = {
  primary: "#E8272A",
  dark: "#111111",
  white: "#FFFFFF",
  gray: "#F8F9FA",
  text: "#1A1A1A",
  textLight: "#6C757D",
  overlay: "rgba(0, 0, 0, 0.9)",
};

const TRANSITION = "all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)";


const GALLERY_ITEMS = [
  { id: 1, category: "Workshop", title: "Modern Service Bay", src: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=1200" },
  { id: 2, category: "Engine", title: "V8 Engine Rebuild", src: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200" },
  { id: 3, category: "Detallng", title: "Ceramic Coating", src: "https://images.unsplash.com/photo-1507133359945-3ae8d2a8a14c?auto=format&fit=crop&q=80&w=1200" },
  { id: 4, category: "Workshop", title: "Diagnostic Center", src: "https://images.unsplash.com/photo-1517524008410-b4a165d47812?auto=format&fit=crop&q=80&w=1200" },
  { id: 5, category: "Body", title: "Paint Restoration", src: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=1200" },
  { id: 6, category: "Engine", title: "Turbo Tuning", src: "https://images.unsplash.com/photo-1621905252507-b35482cd34b4?auto=format&fit=crop&q=80&w=1200" },
  { id: 7, category: "Workshop", title: "Alignment System", src: "https://images.unsplash.com/photo-1562621371-d4191d29d363?auto=format&fit=crop&q=80&w=1200" },
  { id: 8, category: "Detallng", title: "Interior Cleaning", src: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=80&w=1200" },
];

const CATEGORIES = ["All", "Workshop", "Engine", "Body", "Detallng"];

export default function PhotoGalleryPage() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("All");
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    

    const fetchGallery = async () => {
      try {
        // Fallback to mock data for now
        setItems(GALLERY_ITEMS);
        

        
      } catch (err) {
        console.error("Gallery fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  const filteredItems = filter === "All" 
    ? items 
    : items.filter(item => item.category === filter);


  if (!mounted) return null;

  return (
    <div style={{ background: COLORS.white, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; overflow-x: hidden; }
        .gallery-item:hover .overlay { opacity: 1; }
        .gallery-item:hover img { transform: scale(1.1); }
      `}</style>


      <nav style={{ padding: "30px 6%", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eee" }}>
        <a href="/" style={{ color: COLORS.dark, fontSize: "24px", fontWeight: 900, textDecoration: "none", letterSpacing: "-1px" }}>
          AUTO<span style={{ color: COLORS.primary }}>RIA</span> GALLERY
        </a>
        <a href="/" style={{ fontSize: "14px", fontWeight: 700, color: COLORS.textLight, textDecoration: "none" }}>Back to Home →</a>
      </nav>


      <section style={{ padding: "80px 6% 40px", textAlign: "center" }}>
        <h1 style={{ fontSize: "52px", fontWeight: 900, letterSpacing: "-2px", marginBottom: "20px", color: COLORS.dark }}>
          Our Visual <span style={{ color: COLORS.primary }}>Portfolio</span>
        </h1>
        <p style={{ color: COLORS.textLight, fontSize: "18px", maxWidth: "600px", margin: "0 auto 40px", lineHeight: 1.6 }}>
          Explore the quality of our work through a lens. From engine rebuilds to premium detailing.
        </p>


        <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap", marginBottom: "60px" }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                background: filter === cat ? COLORS.primary : "transparent",
                color: filter === cat ? COLORS.white : COLORS.dark,
                border: filter === cat ? `2px solid ${COLORS.primary}` : "2px solid #eee",
                padding: "10px 24px",
                borderRadius: "30px",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>


      <div style={{ padding: "0 6% 100px", maxWidth: "1600px", margin: "0 auto" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "30px" }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ height: "400px", borderRadius: "20px", background: "#f0f0f0", animation: "pulse 1.5s infinite ease-in-out" }} />
            ))}
            <style>{`@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }`}</style>
          </div>
        ) : filteredItems.length > 0 ? (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", 
            gap: "30px"
          }}>
            {filteredItems.map((item) => (
              <div 
                key={item.id}
                className="gallery-item"
                onClick={() => setSelectedImage(item)}
                style={{ 
                  position: "relative", 
                  height: "400px", 
                  borderRadius: "20px", 
                  overflow: "hidden", 
                  cursor: "zoom-in",
                  background: "#f0f0f0"
                }}
              >
                <img 
                  src={item.src} 
                  alt={item.title} 
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: TRANSITION }}
                />
                <div 
                  className="overlay"
                  style={{ 
                    position: "absolute", 
                    inset: 0, 
                    background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)", 
                    display: "flex", 
                    flexDirection: "column", 
                    justifyContent: "flex-end", 
                    padding: "30px", 
                    opacity: 0, 
                    transition: "opacity 0.3s ease" 
                  }}
                >
                  <span style={{ color: COLORS.primary, fontSize: "12px", fontWeight: 800, textTransform: "uppercase", marginBottom: "8px" }}>{item.category}</span>
                  <h3 style={{ color: COLORS.white, fontSize: "20px", fontWeight: 800, margin: 0 }}>{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "100px 0" }}>
            <h3>No photos found in this category.</h3>
          </div>
        )}
      </div>



      {selectedImage && (
        <div 
          onClick={() => setSelectedImage(null)}
          style={{ 
            position: "fixed", 
            inset: 0, 
            background: COLORS.overlay, 
            zIndex: 2000, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            padding: "40px",
            backdropFilter: "blur(10px)",
            cursor: "zoom-out",
            animation: "fadeIn 0.4s ease"
          }}
        >
          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes zoomIn { from { transform: scale(0.9); } to { transform: scale(1); } }
          `}</style>
          
          <button 
            onClick={() => setSelectedImage(null)}
            style={{ position: "absolute", top: "30px", right: "30px", background: "none", border: "none", color: "#fff", fontSize: "40px", cursor: "pointer" }}
          >
            ×
          </button>

          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "1200px", width: "100%", position: "relative", animation: "zoomIn 0.4s ease" }}
          >
            <img 
              src={selectedImage.src} 
              alt={selectedImage.title} 
              style={{ width: "100%", borderRadius: "20px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}
            />
            <div style={{ marginTop: "20px", textAlign: "center", color: "#fff" }}>
              <h2 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 5px 0" }}>{selectedImage.title}</h2>
              <p style={{ opacity: 0.6 }}>{selectedImage.category}</p>
            </div>
          </div>
        </div>
      )}


      <footer style={{ padding: "60px 6%", background: "#000", color: "#fff", textAlign: "center" }}>
        <p style={{ opacity: 0.5, fontSize: "14px" }}>© 2026 AUTORIA. All service photos are genuine representations of our work.</p>
      </footer>
    </div>
  );
}
