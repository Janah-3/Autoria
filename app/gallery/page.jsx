"use client";

import { useState, useEffect } from "react";
import {
  serviceCentersService,
  getServiceCenterItems,
} from "@/lib/api/serviceCentersService";

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

function buildGalleryFromCenters(centers) {
  const gallery = [];
  centers.forEach((sc) => {
    if (sc.cover || sc.coverPhoto) {
      gallery.push({
        id: `${sc.id}-cover`,
        category: sc.type || "Workshop",
        title: sc.name,
        src: sc.cover || sc.coverPhoto,
      });
    }
    (sc.photos || []).forEach((url, i) => {
      gallery.push({
        id: `${sc.id}-photo-${i}`,
        category: sc.type || "Workshop",
        title: `${sc.name} — Photo ${i + 1}`,
        src: url,
      });
    });
  });
  return gallery;
}

export default function PhotoGalleryPage() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("All");
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    serviceCentersService
      .getAll()
      .then((res) => setItems(buildGalleryFromCenters(getServiceCenterItems(res))))
      .catch((err) => console.error("Gallery:", err))
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    "All",
    ...Array.from(new Set(items.map((i) => i.category).filter(Boolean))),
  ];

  const filteredItems =
    filter === "All" ? items : items.filter((item) => item.category === filter);

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

      <header style={{ padding: "60px 40px 30px", textAlign: "center" }}>
        <h1 style={{ fontSize: "42px", fontWeight: 900, color: COLORS.dark, marginBottom: "10px" }}>Workshop Gallery</h1>
        <p style={{ color: COLORS.textLight, fontSize: "16px" }}>Photos from verified service centers on Autoria</p>
      </header>

      <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "40px", flexWrap: "wrap", padding: "0 20px" }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              padding: "10px 20px",
              borderRadius: "30px",
              border: filter === cat ? "none" : `1px solid #E5E7EB`,
              background: filter === cat ? COLORS.primary : COLORS.white,
              color: filter === cat ? COLORS.white : COLORS.text,
              fontWeight: 600,
              cursor: "pointer",
              transition: TRANSITION,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: COLORS.textLight, padding: 60 }}>Loading gallery…</p>
      ) : filteredItems.length === 0 ? (
        <p style={{ textAlign: "center", color: COLORS.textLight, padding: 60 }}>No photos uploaded yet.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px", padding: "0 40px 80px", maxWidth: "1400px", margin: "0 auto" }}>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="gallery-item"
              onClick={() => setSelectedImage(item)}
              style={{ position: "relative", borderRadius: "16px", overflow: "hidden", cursor: "pointer", height: "240px", background: COLORS.gray }}
            >
              <img src={item.src} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: TRANSITION }} />
              <div className="overlay" style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)", opacity: 0, transition: TRANSITION, display: "flex", alignItems: "flex-end", padding: "20px" }}>
                <div>
                  <div style={{ color: COLORS.white, fontWeight: 700, fontSize: "16px" }}>{item.title}</div>
                  <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px" }}>{item.category}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedImage && (
        <div onClick={() => setSelectedImage(null)} style={{ position: "fixed", inset: 0, background: COLORS.overlay, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }}>
          <img src={selectedImage.src} alt={selectedImage.title} style={{ maxWidth: "90%", maxHeight: "90%", borderRadius: "12px" }} />
        </div>
      )}
    </div>
  );
}
