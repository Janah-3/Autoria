"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import usersService, { getMe } from "@/lib/api/usersService";
import { getAllCars, getCarItems } from "@/lib/api/carsService";
import { getAllBookings } from "@/lib/api/bookingsService";
import { paymentService } from "@/lib/api/paymentService";
import { useRoleGuard } from "@/lib/hooks/useRoleGuard";

export default function UserDashboardPage() {
  const { authorized, checking } = useRoleGuard();
  const router = useRouter();
  const [cars, setCars] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [detectingLoc, setDetectingLoc] = useState(false);

  const handleDetectLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setDetectingLoc(true);

    // 1. Safety fallback timeout to unlock the UI under any browser hang conditions
    const safetyTimeout = setTimeout(() => {
      setDetectingLoc(false);
      alert("Location request timed out. Please check your browser location permissions.");
    }, 12000);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        clearTimeout(safetyTimeout);
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        try {
          // 2. Race API request with a 6-second timeout to handle slow/hanging backend calls
          const apiCall = usersService.setMyLocation(lat, lng);
          const apiTimeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("API request timed out")), 6000)
          );

          await Promise.race([apiCall, apiTimeout]);
          alert("Location detected and updated in your profile successfully!");
        } catch (err) {
          console.warn("Failed to sync location:", err);
          if (err.status === 401) {
            alert("Session expired. Please log in again.");
            router.push("/login");
          } else {
            alert("Location detected but failed to update profile: " + err.message);
          }
        } finally {
          setDetectingLoc(false);
        }
      },
      (error) => {
        clearTimeout(safetyTimeout);
        console.warn("Location error:", error);
        alert("Failed to acquire location: " + (error.message || "Permission denied"));
        setDetectingLoc(false);
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  // Checkout Modal State
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Visa"); 
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Card details state
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  useEffect(() => {
    if (upcomingBookings.length > 0 && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const payId = params.get("payBookingId");
      if (payId) {
        const matched = upcomingBookings.find(b => String(b.id) === String(payId));
        if (matched && matched.invoice && matched.invoice.status === "Pending") {
          setSelectedInvoice(matched.invoice);
          setShowCheckoutModal(true);
          router.replace("/user-dashboard");
        }
      }
    }
  }, [upcomingBookings, router]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const me = await getMe();
      if (me?.data?.fullName) {
        setUserName(me.data.fullName);
      } else {
        router.push("/login");
        return;
      }

      const carsRes = await getAllCars();
      setCars(
        getCarItems(carsRes).map((car, i) => ({
          id: car.id || i,
          make: car.make,
          model: car.model,
          year: car.year,
          license: car.licensePlate,
          nextService: "—",
        }))
      );

      // const bookingsRes = await getAllBookings();
      // const items = bookingsRes.data?.items || [];

      const bookingsRes = await getAllBookings();
const raw = bookingsRes?.data;
const items = Array.isArray(raw)
  ? raw
  : Array.isArray(raw?.items)
  ? raw.items
  : [];

const upcomingItems = items.filter((b) => {
  const s = (b.status || "").toLowerCase();
  return s !== "completed" && s !== "cancelled";
});

setUpcomingBookings(
  upcomingItems.map((b, i) => ({
    id: b.id || b.Id || i,
    center:
      b.serviceCenter?.name ||
      b.serviceCenterName ||
      b.ServiceCenterName ||
      "Service center",
    service:
      b.service?.type ||
      b.serviceType ||
      b.ServiceType ||
      "Service",
    date: b.date || b.appointmentDate || b.scheduledDate || "—",
    time: b.timeSlot || b.time || "—",
    status: b.status || "Pending",
    invoice: null,
  }))
);

      // Only fetch invoices for completed bookings
      const completedBookings = items.filter(
        b => b.status === "Completed"
      );

      const completedWithInvoices = await Promise.all(
        completedBookings.map(async (b) => {
          try {
            const invRes = await paymentService.getInvoiceForBooking(b.id);
            if (invRes.success && invRes.data) {
              return { ...b, invoice: invRes.data };
            }
          } catch (e) {
            console.warn("Invoice fetch failed for booking:", b.id, e);
          }
          return { ...b, invoice: null };
        })
      );

      // Upcoming bookings are non-completed / non-cancelled — no invoice fetch needed
      // const upcomingItems = items.filter(
      //   (b) => b.status !== "Completed" && b.status !== "Cancelled"
      // );

      // setUpcomingBookings(
      //   upcomingItems.map((b, i) => ({
      //       id: b.id || i,
      //       center: b.serviceCenter?.name || b.serviceCenterName || "Service center",
      //       service: b.service?.type || b.serviceType || "Service",
      //       date: b.date || b.scheduledDate || "—",
      //       time: b.timeSlot || b.time || "—",
      //       status: b.status || "Pending",
      //       invoice: null,
      //     }))
      // );

      // Fetch payment history
      const historyRes = await paymentService.getMyHistory();
      if (historyRes.success && historyRes.data) {
        // Hydrate history transactions with invoice service center metadata
        const invoicesStored = sessionStorage.getItem("mock_invoices") || "[]";
        const invoices = JSON.parse(invoicesStored);

        // Safely extract array from various API response shapes
        const historyArray = Array.isArray(historyRes.data)
          ? historyRes.data
          : Array.isArray(historyRes.data?.items)
          ? historyRes.data.items
          : Array.isArray(historyRes.data?.data)
          ? historyRes.data.data
          : [];

        const hydrated = historyArray.map(tx => {
          const inv = invoices.find(i => i.id === tx.invoiceId) || {};
          return {
            ...tx,
            serviceCenterName: inv.serviceCenterName || "AutoCare Nasr City"
          };
        });
        setPaymentHistory(hydrated);
      }
    } catch (err) {
      console.error("User dashboard:", err);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (checking) return null;
  if (!authorized) return null;

  const handleOpenCheckout = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentMethod("Visa");
    setCardNumber("");
    setCardName("");
    setCardExpiry("");
    setCardCvv("");
    setShowCheckoutModal(true);
  };

  const handleFormatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(" ");
    } else {
      return v.replace(/(\d{4})/g, "$1 ").trim().substr(0, 19);
    }
  };

  const handleFormatExpiry = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return `${v.substr(0, 2)}/${v.substr(2, 2)}`;
    }
    return v;
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    setCheckoutLoading(true);
    try {
      const res = await paymentService.payInvoice({
        invoiceId: selectedInvoice.id,
        method: paymentMethod,
        cardToken: paymentMethod === "Visa" ? "mock_card_visa_token" : null
      });

      if (res.success) {
        alert(res.data?.message || "Payment processed successfully!");
        setShowCheckoutModal(false);
        await loadDashboardData();
      } else {
        alert("Payment failed: " + res.message);
      }
    } catch (err) {
      alert("Error processing payment: " + err.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="user-dashboard-layout">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .user-dashboard-layout {
          display: flex;
          min-height: 100vh;
          background: #F4F7F6;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        /* Main Content */
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        /* Topbar */
        .topbar {
          height: 70px;
          background: #fff;
          border-bottom: 1px solid #E5E7EB;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
          position: sticky;
          top: 0;
          z-index: 5;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-name {
          font-size: 15px;
          font-weight: 600;
          color: #374151;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background: #F3F4F6;
          border: 2px solid #E8192C;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 700;
          color: #E8192C;
        }

        /* Dashboard Body */
        .dashboard-body {
          padding: 40px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        .welcome-section {
          margin-bottom: 40px;
        }

        .welcome-title {
          font-size: 32px;
          font-weight: 800;
          color: #111827;
          margin-bottom: 8px;
        }

        .welcome-subtitle {
          font-size: 16px;
          color: #6B7280;
        }

        /* Quick Stats & Actions */
        .top-row {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
          margin-bottom: 40px;
        }

        @media (max-width: 900px) {
          .top-row {
            grid-template-columns: 1fr;
          }
        }

        .stat-card {
          background: #fff;
          padding: 24px;
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .stat-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
        }

        .stat-icon.blue { background: #DBEAFE; color: #2563EB; }
        .stat-icon.green { background: #D1FAE5; color: #059669; }

        .stat-info h3 {
          font-size: 14px;
          font-weight: 600;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .stat-info p {
          font-size: 32px;
          font-weight: 800;
          color: #111827;
        }

        .quick-actions {
          background: #fff;
          padding: 24px;
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          gap: 12px;
          justify-content: center;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #E8192C;
          color: #fff;
        }

        .btn-primary:hover {
          background: #C8001E;
        }

        .btn-secondary {
          background: #F3F4F6;
          color: #374151;
        }

        .btn-secondary:hover {
          background: #E5E7EB;
        }

        /* Sections Grid */
        .sections-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }

        @media (max-width: 1024px) {
          .sections-grid {
            grid-template-columns: 1fr;
          }
        }

        .section-panel {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        .section-header {
          padding: 24px;
          border-bottom: 1px solid #F3F4F6;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .section-title {
          font-size: 18px;
          font-weight: 800;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .section-link {
          font-size: 14px;
          font-weight: 600;
          color: #E8192C;
          text-decoration: none;
        }

        .section-link:hover {
          text-decoration: underline;
        }

        /* Lists */
        .item-list {
          display: flex;
          flex-direction: column;
        }

        .list-item {
          padding: 20px 24px;
          border-bottom: 1px solid #F3F4F6;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .list-item:last-child {
          border-bottom: none;
        }

        .car-info h4 {
          font-size: 16px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 4px;
        }

        .car-info p {
          font-size: 14px;
          color: #6B7280;
        }

        .car-badge {
          background: #F3F4F6;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          color: #374151;
        }

        .booking-info h4 {
          font-size: 16px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 4px;
        }

        .booking-info p {
          font-size: 14px;
          color: #6B7280;
        }

        .status-badge {
          background: #D1FAE5;
          color: #059669;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
        }
      `}</style>

      <main className="main-content">
        <div className="topbar">
          <Link href="/" style={{
            textDecoration: "none", color: "#374151", fontSize: "13px", fontWeight: 700,
            display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "8px", border: `1px solid #E5E7EB`
          }}>
            ← Back to Website
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={handleDetectLocation}
              disabled={detectingLoc}
              style={{
                background: "transparent",
                border: "1.5px solid #CBD5E1",
                borderRadius: "10px",
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: 700,
                color: "#475569",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => { e.target.style.background = "#F1F5F9"; e.target.style.borderColor = "#94A3B8"; }}
              onMouseLeave={(e) => { e.target.style.background = "transparent"; e.target.style.borderColor = "#CBD5E1"; }}
            >
              <i className="fa-solid fa-location-crosshairs" style={{ color: "#E8192C" }}></i>
              {detectingLoc ? "Detecting..." : "Detect Location"}
            </button>
            <div className="user-profile">
              <span className="user-name">{userName || "User"}</span>
              <div className="user-avatar">
                {userName ? userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U"}
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-body">
          <div className="welcome-section">
            <h1 className="welcome-title">Welcome back{userName ? `, ${userName.split(" ")[0]}` : ""}</h1>
            <p className="welcome-subtitle">Here is what's happening with your vehicles today.</p>
          </div>

          <div className="top-row">
            <div style={{ display: 'flex', gap: '24px' }}>
              <div className="stat-card" style={{ flex: 1 }}>
                <div className="stat-icon blue">
                  <i className="fa-solid fa-car"></i>
                </div>
                <div className="stat-info">
                  <h3>Vehicles in Garage</h3>
                  <p>{cars.length}</p>
                </div>
              </div>
              <div className="stat-card" style={{ flex: 1 }}>
                <div className="stat-icon green">
                  <i className="fa-solid fa-calendar-check"></i>
                </div>
                <div className="stat-info">
                  <h3>Upcoming Services</h3>
                  <p>{upcomingBookings.length}</p>
                </div>
              </div>
            </div>

            <div className="quick-actions">           
              <Link href="/cars/add-car" className="action-btn btn-secondary">
                <i className="fa-solid fa-car-side"></i> Add a Vehicle
              </Link>
              <Link href="/reservations" className="action-btn btn-secondary" style={{ background: "#FEEBEB", color: "#E8192C" }}>
                <i className="fa-solid fa-box-open"></i> Part Reservations
              </Link>
              <Link href="/reviews" className="action-btn btn-secondary" style={{ background: "#FFFBEB", color: "#D97706" }}>
                <i className="fa-solid fa-star"></i> My Reviews
              </Link>
            </div>
          </div>

          {loading && (
            <p style={{ color: "#6B7280", marginBottom: 24 }}>Loading your dashboard…</p>
          )}

          <div className="sections-grid">
            <div className="section-panel">
              <div className="section-header">
                <h2 className="section-title"><i className="fa-solid fa-car"></i> My Garage</h2>
                <Link href="/cars" className="section-link">View All</Link>
              </div>
              <div className="item-list">
                {cars.map(car => (
                  <div className="list-item" key={car.id}>
                    <div className="car-info">
                      <h4>{car.make} {car.model} ({car.year})</h4>
                      <p>License: {car.license} • Next service: {car.nextService}</p>
                    </div>
                    <div className="car-badge">
                      Active
                    </div>
                  </div>
                ))}
                {cars.length === 0 && (
                  <div style={{ padding: "24px", color: "#6B7280", textAlign: "center" }}>
                    No vehicles found. Add a vehicle to get started.
                  </div>
                )}
              </div>
            </div>

            <div className="section-panel">
              <div className="section-header">
                <h2 className="section-title"><i className="fa-solid fa-calendar-alt"></i> Upcoming Bookings</h2>
                <Link href="/bookings" className="section-link">View History</Link>
              </div>
              <div className="item-list">
                {upcomingBookings.map(booking => (
                  <div className="list-item" key={booking.id}>
                    <div className="booking-info">
                      <h4>{booking.center}</h4>
                      <p>{booking.service} • {booking.date} at {booking.time}</p>
                    </div>
                    
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      {booking.invoice ? (
                        booking.invoice.status === "Paid" ? (
                          <span style={{ background: "#D1FAE5", color: "#059669", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>
                            Paid EGP {booking.invoice.totalAmount}
                          </span>
                        ) : booking.invoice.status === "AwaitingCashConfirmation" ? (
                          <span style={{ background: "#FFF9DB", color: "#F59F00", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>
                            Cash Pending
                          </span>
                        ) : (
                          <button
                            onClick={() => handleFormatCardNumber && handleOpenCheckout(booking.invoice)}
                            style={{ background: "#E8192C", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "8px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                          >
                            Pay EGP {booking.invoice.totalAmount}
                          </button>
                        )
                      ) : (
                        <div className="status-badge" style={{
                          background: booking.status === "Pending" ? "#FFF9DB" : (booking.status === "Confirmed" ? "#D1FAE5" : "#F3F4F6"),
                          color: booking.status === "Pending" ? "#F59F00" : (booking.status === "Confirmed" ? "#059669" : "#374151")
                        }}>
                          {booking.status}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {upcomingBookings.length === 0 && (
                  <div style={{ padding: "24px", color: "#6B7280", textAlign: "center" }}>
                    No upcoming bookings. Time for a checkup?
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment History Log */}
          <div className="section-panel" style={{ marginTop: "32px" }}>
            <div className="section-header">
              <h2 className="section-title"><i className="fa-solid fa-receipt"></i> Payment History & Receipts</h2>
              <span style={{ fontSize: "12px", color: "#6B7280", fontWeight: 600 }}>Log of completed invoice payments</span>
            </div>
            <div style={{ padding: "24px", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #F3F4F6", color: "#6B7280", fontSize: "12px", fontWeight: 700, textTransform: "uppercase" }}>
                    <th style={{ paddingBottom: "12px" }}>Receipt ID</th>
                    <th style={{ paddingBottom: "12px" }}>Service Center</th>
                    <th style={{ paddingBottom: "12px" }}>Method</th>
                    <th style={{ paddingBottom: "12px" }}>Amount</th>
                    <th style={{ paddingBottom: "12px" }}>Status</th>
                    <th style={{ paddingBottom: "12px" }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((tx) => (
                    <tr key={tx.id} style={{ borderBottom: "1px solid #F3F4F6", fontSize: "14px" }}>
                      <td style={{ padding: "16px 0", fontWeight: 700, color: "#374151" }}>{tx.id.toUpperCase()}</td>
                      <td style={{ padding: "16px 0" }}>{tx.serviceCenterName}</td>
                      <td style={{ padding: "16px 0" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600 }}>
                          {tx.method === "Visa" ? "💳 Visa" : "💵 Cash"}
                        </span>
                      </td>
                      <td style={{ padding: "16px 0", fontWeight: 700, color: "#E8192C" }}>EGP {tx.amount}</td>
                      <td style={{ padding: "16px 0" }}>
                        <span style={{
                          background: tx.status === "Completed" ? "#D1FAE5" : (tx.status === "Refunded" ? "#FEE2E2" : "#FFF9DB"),
                          color: tx.status === "Completed" ? "#059669" : (tx.status === "Refunded" ? "#EF4444" : "#F59F00"),
                          padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: 700
                        }}>{tx.status}</span>
                      </td>
                      <td style={{ padding: "16px 0", color: "#6B7280" }}>{new Date(tx.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {paymentHistory.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ padding: "32px", textAlign: "center", color: "#6B7280" }}>
                        No transactions recorded yet. Completed invoices will appear here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>

      {/* Checkout Modal with Premium animated Credit Card preview */}
      {showCheckoutModal && selectedInvoice && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 2000, padding: "20px"
        }}>
          <div style={{
            background: "#ffffff", borderRadius: "24px", width: "100%", maxWidth: "560px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.15)", padding: "40px", position: "relative",
            maxHeight: "90vh", overflowY: "auto"
          }}>
            <h2 style={{ fontSize: "22px", fontWeight: 900, marginBottom: "4px" }}>Secure Checkout</h2>
            <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "24px" }}>
              Service Center: <strong>{selectedInvoice.serviceCenterName}</strong>
            </p>

            <div style={{ background: "#F8FAFC", borderRadius: "12px", padding: "16px", marginBottom: "24px", border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", marginBottom: "12px", letterSpacing: "0.5px" }}>Invoice Breakdown</div>
              {selectedInvoice.items?.map((item, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px", margin: "6px 0" }}>
                  <span style={{ color: "#334155" }}>{item.description} <span style={{ color: "#94A3B8" }}>x{item.quantity}</span></span>
                  <span style={{ fontWeight: 700 }}>EGP {item.totalPrice}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px dashed #CBD5E1", paddingTop: "12px", marginTop: "12px", fontSize: "15px", fontWeight: 800 }}>
                <span>TOTAL DUE</span>
                <span style={{ color: "#E8192C" }}>EGP {selectedInvoice.totalAmount}</span>
              </div>
            </div>

            <form onSubmit={handleSubmitPayment}>
              {/* Payment Method Selector */}
              <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
                <div 
                  onClick={() => setPaymentMethod("Visa")}
                  style={{
                    flex: 1, padding: "14px", borderRadius: "12px", border: `2px solid ${paymentMethod === "Visa" ? "#E8192C" : "#E2E8F0"}`,
                    background: paymentMethod === "Visa" ? "#FFF1F1" : "#fff", display: "flex", flexDirection: "column",
                    alignItems: "center", cursor: "pointer", gap: "8px", transition: "all 0.2s"
                  }}
                >
                  <span style={{ fontSize: "20px" }}>💳</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: paymentMethod === "Visa" ? "#E8192C" : "#334155" }}>Credit Card / Visa</span>
                </div>
                <div 
                  onClick={() => setPaymentMethod("Cash")}
                  style={{
                    flex: 1, padding: "14px", borderRadius: "12px", border: `2px solid ${paymentMethod === "Cash" ? "#E8192C" : "#E2E8F0"}`,
                    background: paymentMethod === "Cash" ? "#FFF1F1" : "#fff", display: "flex", flexDirection: "column",
                    alignItems: "center", cursor: "pointer", gap: "8px", transition: "all 0.2s"
                  }}
                >
                  <span style={{ fontSize: "20px" }}>💵</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: paymentMethod === "Cash" ? "#E8192C" : "#334155" }}>Cash Desk</span>
                </div>
              </div>

              {paymentMethod === "Visa" && (
                <>
                  {/* Premium Credit Card Graphic Preview */}
                  <div style={{
                    background: "linear-gradient(135deg, #1E1E24 0%, #E8192C 100%)",
                    width: "100%", height: "200px", borderRadius: "16px", padding: "24px", color: "#fff",
                    display: "flex", flexDirection: "column", justifyContent: "space-between",
                    boxShadow: "0 10px 25px rgba(232, 25, 44, 0.15)", position: "relative",
                    overflow: "hidden", marginBottom: "24px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <span style={{ fontSize: "20px", fontWeight: 900, fontStyle: "italic", letterSpacing: "-0.5px" }}>AUTORIA</span>
                      <span style={{ fontSize: "11px", fontWeight: 700, background: "rgba(255,255,255,0.2)", padding: "4px 8px", borderRadius: "4px", letterSpacing: "1px" }}>CREDIT</span>
                    </div>

                    <div style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "2px", margin: "20px 0 10px", fontFamily: "monospace" }}>
                      {cardNumber || "•••• •••• •••• ••••"}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                      <div>
                        <div style={{ fontSize: "9px", opacity: 0.6, textTransform: "uppercase", marginBottom: "2px" }}>Card Holder</div>
                        <div style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase" }}>{cardName || "Your Name"}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "9px", opacity: 0.6, textTransform: "uppercase", marginBottom: "2px" }}>Expires</div>
                        <div style={{ fontSize: "13px", fontWeight: 700 }}>{cardExpiry || "MM/YY"}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "9px", opacity: 0.6, textTransform: "uppercase", marginBottom: "2px" }}>CVV</div>
                        <div style={{ fontSize: "13px", fontWeight: 700 }}>{cardCvv || "•••"}</div>
                      </div>
                    </div>
                  </div>

                  {/* Visa Form inputs */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Card Number</label>
                      <input
                        placeholder="4000 1234 5678 9010"
                        maxLength="19"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(handleFormatCardNumber(e.target.value))}
                        required
                        style={{ padding: "12px 14px", borderRadius: "8px", border: "1.5px solid #CBD5E1", fontSize: "14px" }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Cardholder Name</label>
                      <input
                        placeholder="JOHN DOE"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value.toUpperCase())}
                        required
                        style={{ padding: "12px 14px", borderRadius: "8px", border: "1.5px solid #CBD5E1", fontSize: "14px" }}
                      />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Expiry Date</label>
                        <input
                          placeholder="MM/YY"
                          maxLength="5"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(handleFormatExpiry(e.target.value))}
                          required
                          style={{ padding: "12px 14px", borderRadius: "8px", border: "1.5px solid #CBD5E1", fontSize: "14px" }}
                        />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>CVV</label>
                        <input
                          placeholder="123"
                          maxLength="3"
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/gi, ""))}
                          required
                          style={{ padding: "12px 14px", borderRadius: "8px", border: "1.5px solid #CBD5E1", fontSize: "14px" }}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {paymentMethod === "Cash" && (
                <div style={{ background: "#F1F5F9", border: "1.5px solid #E2E8F0", borderRadius: "12px", padding: "20px", fontSize: "13.5px", color: "#475569", lineHeight: 1.5, marginBottom: "24px" }}>
                  💡 <strong>Cash Desk Option:</strong> You can pay for this invoice directly in cash at the service center counter upon receiving your vehicle. The owner will confirm the receipt of cash to complete your checkout.
                </div>
              )}

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  disabled={checkoutLoading}
                  style={{
                    flex: 2, background: "#E8192C", color: "#fff", border: "none", padding: "14px",
                    borderRadius: "10px", fontSize: "14px", fontWeight: 800, cursor: "pointer",
                    opacity: checkoutLoading ? 0.7 : 1
                  }}
                >
                  {checkoutLoading ? "Processing Payment..." : paymentMethod === "Visa" ? `Pay EGP ${selectedInvoice.totalAmount}` : "Confirm Cash Booking"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCheckoutModal(false)}
                  style={{ flex: 1, background: "transparent", color: "#374151", border: "1px solid #E5E7EB", padding: "14px", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

