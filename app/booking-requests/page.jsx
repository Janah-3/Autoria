"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { bookingService } from "../../src/API/bookingService";



const COLORS = {
  primary: "#E8272A",
  bg: "#F8F9FA",
  surface: "#FFFFFF",
  border: "#E9ECEF",
  text: "#111111",
  textLight: "#6C757D",
  success: "#28A745",
  activeBg: "#FEEBEB",
};

const Sidebar = ({ active }) => (
  <aside style={{ width: "240px", background: COLORS.surface, borderRight: `1px solid ${COLORS.border}`, padding: "30px 0", height: "100vh", position: "sticky", top: 0 }}>
    <div style={{ padding: "0 25px", marginBottom: "40px" }}>
      <div style={{ fontSize: "11px", fontWeight: 800, color: COLORS.textLight, letterSpacing: "1.5px", marginBottom: "20px" }}>MANAGE</div>
      {[
        { id: "Dashboard", icon: "📊", path: "/booking-requests" },
        { id: "Booking requests", icon: "📬", path: "/booking-requests" },
        { id: "Availability", icon: "📅", path: "/availability" },
        { id: "Services & pricing", icon: "🏷️", path: "/service-center/services-pricing" },
        { id: "Spare parts", icon: "⚙️", path: "/spare-parts-inventory" },
        { id: "Reviews", icon: "⭐", path: "#" },
        { id: "Business profile", icon: "🏢", path: "/service-center/edit" }
      ].map(item => (
        <Link href={item.path} key={item.id} style={{ textDecoration: "none" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "12px", padding: "12px 25px", margin: "4px 15px", borderRadius: "10px",
            fontSize: "14px", fontWeight: active === item.id ? 700 : 500, cursor: "pointer",
            background: active === item.id ? COLORS.activeBg : "transparent",
            color: active === item.id ? COLORS.primary : COLORS.textLight,
            marginLeft: active === item.id ? "0" : "15px",
            borderLeft: active === item.id ? `4px solid ${COLORS.primary}` : "none"
          }}>
            <span>{item.icon}</span> {item.id}
          </div>
        </Link>
      ))}
    </div>
  </aside>
);

const RequestCard = ({ request, onConfirm, onDecline, onCancel }) => (
  <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: "16px", padding: "25px", marginBottom: "15px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
      <div style={{ display: "flex", gap: "15px" }}>
        <div style={{ width: "45px", height: "45px", borderRadius: "50%", background: "#F1F3F5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: COLORS.textLight }}>
          {request.customerName?.split(" ").map(n => n[0]).join("")}
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h4 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>{request.customerName}</h4>
            <span style={{
              background: request.status === "Pending" ? COLORS.activeBg : (request.status === "Confirmed" ? "#E7F5EA" : "#F1F3F5"),
              color: request.status === "Pending" ? COLORS.primary : (request.status === "Confirmed" ? COLORS.success : COLORS.textLight),
              fontSize: "10px", fontWeight: 800, padding: "2px 10px", borderRadius: "10px"
            }}>{request.status}</span>
          </div>
          <p style={{ fontSize: "13px", color: COLORS.textLight, marginTop: "4px" }}>
            {request.carModel} • {request.serviceType} • Requested: <span style={{ color: COLORS.text, fontWeight: 600 }}>{request.date}, {request.time}</span>
          </p>
        </div>
      </div>
      <div style={{ fontSize: "12px", color: COLORS.textLight }}>{request.timeAgo}</div>
    </div>

    {request.note && (
      <div style={{ background: "#F8F9FA", padding: "12px 20px", borderRadius: "10px", fontSize: "13px", color: COLORS.textLight, marginBottom: "20px" }}>
        Note: "{request.note}"
      </div>
    )}

    <div style={{ display: "flex", gap: "10px" }}>
      {request.status === "Pending" ? (
        <>
          <button onClick={() => onConfirm(request.id)} style={{ background: COLORS.primary, color: "#FFF", border: "none", padding: "10px 25px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>Confirm</button>
          <button onClick={() => onDecline(request.id)} style={{ background: "transparent", color: COLORS.text, border: `1px solid ${COLORS.border}`, padding: "10px 25px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Decline</button>
        </>
      ) : (
        request.status === "Confirmed" && (
          <button onClick={() => onCancel(request.id)} style={{ background: "transparent", color: COLORS.text, border: `1px solid ${COLORS.border}`, padding: "10px 25px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Cancel booking</button>
        )
      )}
      <button style={{ background: "transparent", color: COLORS.text, border: `1px solid ${COLORS.border}`, padding: "10px 25px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>View profile</button>
    </div>
  </div>
);

export default function BookingRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const data = await bookingService.getServiceCenterBookings();
        // Assuming data is an array of bookings
        setRequests(data);
      } catch (error) {
        console.error("Failed to load bookings:", error);

      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);


  const handleConfirm = async (id) => {
    try {
      await bookingService.updateBookingStatus(id, "Confirmed");
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "Confirmed" } : r));
    } catch (error) {
      alert("Failed to confirm booking: " + error.message);
    }
  };

  const handleDecline = async (id) => {
    try {
      await bookingService.updateBookingStatus(id, "Declined");
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "Declined" } : r));
    } catch (error) {
      alert("Failed to decline booking: " + error.message);
    }
  };


  const filteredRequests = requests.filter(r => filter === "All" || r.status === filter);

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "'Inter', sans-serif" }}>
      <header style={{ height: "70px", background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ fontSize: "18px", fontWeight: 800 }}>AutoCare Nasr City</div>
        <div style={{ display: "flex", alignItems: "center", gap: "25px" }}>
          <Link href="/" style={{
            textDecoration: "none", color: COLORS.text, fontSize: "13px", fontWeight: 700,
            display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "8px", border: `1px solid ${COLORS.border}`
          }}>
            ← Back to Website
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "14px", fontWeight: 600 }}>Mohamed Hassan</span>
            <div style={{ width: "35px", height: "35px", borderRadius: "50%", background: COLORS.primary, color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700 }}>MH</div>
          </div>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar active="Booking requests" />

        <main style={{ flex: 1, padding: "40px" }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
              <div style={{ display: "flex", gap: "10px" }}>
                {["All", "Pending", "Confirmed", "Declined"].map(tab => (
                  <div key={tab}
                    onClick={() => setFilter(tab)}
                    style={{
                      padding: "8px 20px", borderRadius: "20px", cursor: "pointer", fontSize: "13px", fontWeight: 600,
                      background: filter === tab ? COLORS.activeBg : "#FFF",
                      border: `1px solid ${filter === tab ? COLORS.primary : COLORS.border}`,
                      color: filter === tab ? COLORS.primary : COLORS.textLight,
                    }}>
                    {tab} {tab === "Pending" && <span style={{ opacity: 0.6 }}>{requests.filter(r => r.status === "Pending").length}</span>}
                  </div>
                ))}
              </div>
              <input placeholder="Search customer" style={{ padding: "10px 20px", borderRadius: "10px", border: `1px solid ${COLORS.border}`, fontSize: "13px", outline: "none", width: "250px" }} />
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "50px", color: COLORS.textLight }}>Loading requests...</div>
            ) : (
              filteredRequests.map(req => (
                <RequestCard
                  key={req.id}
                  request={req}
                  onConfirm={handleConfirm}
                  onDecline={handleDecline}
                  onCancel={handleDecline}
                />
              ))
            )}

            {!loading && filteredRequests.length === 0 && (
              <div style={{ textAlign: "center", padding: "100px", color: COLORS.textLight, background: "#FFF", borderRadius: "20px" }}>
                No booking requests found in this category.
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
