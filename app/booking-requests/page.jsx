"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { bookingService, getBookingItems } from "@/lib/api/bookingsService";
import { serviceCentersService } from "@/lib/api/serviceCentersService";
import { getMe } from "@/lib/api/usersService";



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
        { id: "Reviews", icon: "⭐", path: "/reviews" },
        { id: "Business profile", icon: "🏢", path: "/service-center" }
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

const RequestCard = ({ request, onConfirm, onDecline, onCancel }) => {
  const customerName = request.customerName ?? request.CustomerName ?? "";
  const status = request.status ?? request.Status ?? "Pending";
  const carModel = request.carModel ?? request.CarModel ?? "";
  const serviceType = request.serviceType ?? request.ServiceType ?? "";
  const date = request.date ?? request.Date ?? "";
  const time = request.time ?? request.Time ?? "";
  const timeAgo = request.timeAgo ?? request.TimeAgo ?? "";
  const note = request.note ?? request.Note ?? "";
  const id = request.id ?? request.Id;

  return (
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: "16px", padding: "25px", marginBottom: "15px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "15px" }}>
          <div style={{ width: "45px", height: "45px", borderRadius: "50%", background: "#F1F3F5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: COLORS.textLight }}>
            {customerName?.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h4 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>{customerName}</h4>
              <span style={{
                background: status === "Pending" ? COLORS.activeBg : (status === "Confirmed" ? "#E7F5EA" : "#F1F3F5"),
                color: status === "Pending" ? COLORS.primary : (status === "Confirmed" ? COLORS.success : COLORS.textLight),
                fontSize: "10px", fontWeight: 800, padding: "2px 10px", borderRadius: "10px"
              }}>{status}</span>
            </div>
            <p style={{ fontSize: "13px", color: COLORS.textLight, marginTop: "4px" }}>
              {carModel} • {serviceType} • Requested: <span style={{ color: COLORS.text, fontWeight: 600 }}>{date}, {time}</span>
            </p>
          </div>
        </div>
        <div style={{ fontSize: "12px", color: COLORS.textLight }}>{timeAgo}</div>
      </div>

      {note && (
        <div style={{ background: "#F8F9FA", padding: "12px 20px", borderRadius: "10px", fontSize: "13px", color: COLORS.textLight, marginBottom: "20px" }}>
          Note: "{note}"
        </div>
      )}

      <div style={{ display: "flex", gap: "10px" }}>
        {status === "Pending" ? (
          <>
            <button onClick={() => onConfirm(id)} style={{ background: COLORS.primary, color: "#FFF", border: "none", padding: "10px 25px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>Confirm</button>
            <button onClick={() => onDecline(id)} style={{ background: "transparent", color: COLORS.text, border: `1px solid ${COLORS.border}`, padding: "10px 25px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Decline</button>
          </>
        ) : (
          status === "Confirmed" && (
            <button onClick={() => onCancel(id)} style={{ background: "transparent", color: COLORS.text, border: `1px solid ${COLORS.border}`, padding: "10px 25px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Cancel booking</button>
          )
        )}
        <button style={{ background: "transparent", color: COLORS.text, border: `1px solid ${COLORS.border}`, padding: "10px 25px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>View profile</button>
      </div>
    </div>
  );
};

const MOCK_REQUESTS = [
  { id: "b1", customerName: "Ahmed Mostafa", status: "Pending", carModel: "Toyota Corolla 2021", serviceType: "Oil Change", date: "May 28, 2026", time: "10:00 AM", timeAgo: "10m ago", note: "Please check the front brake pads as well." },
  { id: "b2", customerName: "Sara Khaled", status: "Confirmed", carModel: "Hyundai Tucson 2020", serviceType: "Brakes Repair", date: "May 29, 2026", time: "02:30 PM", timeAgo: "2h ago", note: "Using genuine Hyundai spare parts only please." },
  { id: "b3", customerName: "Mohamed Hassan", status: "Pending", carModel: "Kia Sportage 2022", serviceType: "AC Maintenance", date: "May 30, 2026", time: "11:15 AM", timeAgo: "Yesterday", note: "AC is blowing warm air." }
];

export default function BookingRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [centerName, setCenterName] = useState("AutoCare Nasr City");
  const [ownerName, setOwnerName] = useState("Mohamed Hassan");

  useEffect(() => {
    getMe()
      .then(res => {
        const name = res?.data?.fullName ?? res?.fullName;
        if (name) setOwnerName(name);
      })
      .catch(() => {});

    serviceCentersService.getMy()
      .then(res => {
        const d = res?.data ?? res;
        if (d) {
          const name = d.name ?? d.Name;
          if (name) setCenterName(name);
        }
      })
      .catch(() => {});

    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await bookingService.getServiceCenterBookings();
        setRequests(getBookingItems(res));
      } catch (error) {
        console.error("Failed to load bookings:", error);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const getRequestStatus = (r) => r?.status ?? r?.Status ?? "Pending";
  const getRequestId = (r) => r?.id ?? r?.Id;

  const handleConfirm = async (id) => {
    try {
      await bookingService.updateBookingStatus(id, "Confirmed");
      setRequests((prev) =>
        prev.map((r) =>
          getRequestId(r) === id ? { ...r, status: "Confirmed", Status: "Confirmed" } : r
        )
      );
    } catch (error) {
      alert("Failed to confirm booking: " + error.message);
    }
  };

  const handleDecline = async (id) => {
    try {
      await bookingService.updateBookingStatus(id, "Declined");
      setRequests((prev) =>
        prev.map((r) =>
          getRequestId(r) === id ? { ...r, status: "Declined", Status: "Declined" } : r
        )
      );
    } catch (error) {
      alert("Failed to decline booking: " + error.message);
    }
  };


  const filteredRequests = requests.filter(
    (r) => filter === "All" || getRequestStatus(r) === filter
  );

  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const closeDropdown = () => setDropdownOpen(false);
    window.addEventListener("click", closeDropdown);
    return () => window.removeEventListener("click", closeDropdown);
  }, []);

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "'Inter', sans-serif" }}>
      <header style={{ height: "70px", background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ fontSize: "18px", fontWeight: 800 }}>{centerName}</div>
        <div style={{ display: "flex", alignItems: "center", gap: "25px" }}>
          <Link href="/" style={{
            textDecoration: "none", color: COLORS.text, fontSize: "13px", fontWeight: 700,
            display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "8px", border: `1px solid ${COLORS.border}`
          }}>
            ← Back to Website
          </Link>
          <div style={{ position: "relative" }}>
            <div 
              onClick={(e) => { e.stopPropagation(); setDropdownOpen(!dropdownOpen); }}
              style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", userSelect: "none" }}
            >
              <span style={{ fontSize: "14px", fontWeight: 600 }}>{ownerName}</span>
              <div style={{ width: "35px", height: "35px", borderRadius: "50%", background: COLORS.primary, color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700 }}>
                {ownerName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "SC"}
              </div>
              <span style={{ fontSize: "9px", color: COLORS.textLight }}>▼</span>
            </div>

            {dropdownOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0,
                background: "#ffffff", borderRadius: "10px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)", border: `1px solid ${COLORS.border}`,
                minWidth: "160px", overflow: "hidden", zIndex: 1000
              }}>
                <Link href="/service-center" style={{ display: "block", padding: "10px 16px", color: COLORS.text, fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>
                  🏢 Business Profile
                </Link>
                <div style={{ borderTop: `1px solid ${COLORS.border}` }} />
                <Link href="/logout" style={{ display: "block", padding: "10px 16px", color: COLORS.primary, fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>
                  🚪 Log Out
                </Link>
              </div>
            )}
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
                    {tab} {tab === "Pending" && <span style={{ opacity: 0.6 }}>{requests.filter((r) => getRequestStatus(r) === "Pending").length}</span>}
                  </div>
                ))}
              </div>
              <input placeholder="Search customer" style={{ padding: "10px 20px", borderRadius: "10px", border: `1px solid ${COLORS.border}`, fontSize: "13px", outline: "none", width: "250px" }} />
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "50px", color: COLORS.textLight }}>Loading requests...</div>
            ) : (
              filteredRequests.map((req) => (
                <RequestCard
                  key={getRequestId(req) ?? req.customerName}
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
