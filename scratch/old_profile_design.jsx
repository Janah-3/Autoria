// Archive of the first design of CenterProfilePage before the wireframe update
// This is saved for quick restoration if the user requests it.

/*
Features:
- Large Hero Header (320px height)
- Centered title and location at the bottom of the hero
- Simple 2-column layout (2fr 1fr)
- Red vertical bar on the left of section titles
- "Request Booking" button in a sticky right card
*/

// "use client";

// import { useState, useEffect } from "react";
// import { useParams } from "next/navigation";
// import { API_BASE_URL } from "@/lib/apiConfig";
// import Navbar from "@/components/Navbar";

// const R  = "#E8272A";
// const RD = "#B81C1F";
// const row  = (gap = 0) => ({ display: "flex", alignItems: "center", gap });

// export default function CenterProfilePage() {
//   const params = useParams();
//   const [center, setCenter] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Manual fallback seed
//     const SEED = [
//       {
//         id: "1",
//         name: "ProCare Auto Center",
//         governorate: "Cairo",
//         district: "Nasr City",
//         type: "Maintenance",
//         phone: "01012345678",
//         coverPhoto: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=1200",
//         serviceTypes: ["Oil Change", "Brakes", "AC Service", "Diagnostics"],
//         carBrands: ["Toyota", "Hyundai", "Nissan"]
//       }
//     ];
//     const s = SEED.find(i => i.id === params.id) || SEED[0];
//     setCenter(s);
//     setLoading(false);
//   }, [params.id]);

//   if (loading || !center) return <div>Loading...</div>;

//   return (
//     <div>
//       <Navbar />
//       <div style={{ height: 320, background: `url(${center.coverPhoto}) center/cover` }}>
//          {/* Hero Content */}
//       </div>
//       <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr" }}>
//          {/* Main Content */}
//       </div>
//     </div>
//   );
// }
