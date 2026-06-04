"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getAllBookings } from "../../src/API/bookingsService";
import { paymentService } from "../../lib/api/paymentService";
import { useRoleGuard } from "@/lib/hooks/useRoleGuard";

const STATUS_TABS = ["All", "Pending", "Confirmed", "InProgress", "Completed", "Cancelled"];

const STATUS_STYLES = {
  Pending:   { background: "#FFF8E1", color: "#F9A825", border: "1px solid #FFE082" },
  Confirmed: { background: "#E3F2FD", color: "#1565C0", border: "1px solid #BBDEFB" },
  InProgress: { background: "#E8EAF6", color: "#3F51B5", border: "1px solid #C5CAE9" },
  Completed: { background: "#E8F5E9", color: "#2E7D32", border: "1px solid #C8E6C9" },
  Cancelled: { background: "#FAFAFA", color: "#9E9E9E", border: "1px solid #E0E0E0" },
};

const CarIcon = () => (
  <svg
    width="18" height="18" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-3" />
    <circle cx="7.5" cy="17.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
);

function BookingCard({ booking }) {
  const statusStyle = STATUS_STYLES[booking.status] || STATUS_STYLES.Pending;
  const isCancellable = booking.status === "Pending" || booking.status === "Confirmed";
  const displayStatus = booking.status === "InProgress" ? "In Progress" : booking.status;

  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    if (booking.status !== "Completed") return;
    paymentService.getInvoiceForBooking(booking.id || booking.Id)
      .then(res => {
        if (res.success && res.data) {
          setInvoice(res.data);
        }
      }).catch(() => {});
  }, [booking.id, booking.Id, booking.status]);

  return (
    <div className="booking-card">
      <div className="card-header">
        <div>
          <div className="center-name">{booking.serviceCenter.name}</div>
          {booking.serviceCenter.address && (
            <div className="center-address">{booking.serviceCenter.address}</div>
          )}
        </div>
        <span className="status-badge" style={statusStyle}>
          {displayStatus}
        </span>
      </div>

      <div className="card-divider" />

      <div className="card-body">
        <div className="info-row">
          <span className="info-label">Service</span>
          <span className="info-value">{booking.service.type}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Date & Time</span>
          <span className="info-value">{booking.date} at {booking.timeSlot}</span>
        </div>
        <div className="info-row car-row">
          <span className="info-label">Vehicle</span>
          <span className="info-value car-value">
            <CarIcon />
            {booking.car.make || booking.car.model ? (
              `${booking.car.make} ${booking.car.model} — ${booking.car.licensePlate}`
            ) : (
              `Plate: ${booking.car.licensePlate}`
            )}
          </span>
        </div>
        {invoice && (
          <div className="info-row invoice-row" style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px dashed #E0E0E0" }}>
            <span className="info-label">Invoice Status</span>
            <span className="info-value" style={{ 
              fontWeight: 800,
              color: invoice.status === "Paid" ? "#2E7D32" : (invoice.status === "Pending" ? "#E8192C" : "#F9A825")
            }}>
              EGP {invoice.totalAmount} • {
                invoice.status === "Paid" ? "Paid" : 
                (invoice.status === "Pending" ? "Unpaid" : 
                (invoice.status === "AwaitingCashConfirmation" ? "Awaiting Cash" : invoice.status))
              }
            </span>
          </div>
        )}
      </div>

      <div className="card-footer" style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        <Link href={`/bookings/details?id=${booking.id}`} className="btn-details" style={{ flex: 1, minWidth: "100px" }}>
          View Details
        </Link>
        {invoice && invoice.status === "Pending" && (
          <Link href={`/user-dashboard?payBookingId=${booking.id}`} className="btn-pay-link" style={{
            flex: 1,
            minWidth: "100px",
            padding: "10px 0",
            background: "#2E7D32",
            color: "#fff",
            textAlign: "center",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: "700",
            textDecoration: "none",
            transition: "background 0.2s"
          }}>
            Pay Invoice
          </Link>
        )}
        {isCancellable && (
          <Link href={`/bookings/cancel?id=${booking.id}`} className="btn-cancel-link" style={{ flex: 0.5, textAlign: "center" }}>
            Cancel
          </Link>
        )}
      </div>

      <style jsx>{`
        .booking-card {
          background: #fff;
          border: 1.5px solid #F0F0F0;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .booking-card:hover {
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.09);
          transform: translateY(-2px);
        }
        .card-header {
          padding: 20px 22px 16px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }
        .center-name {
          font-size: 16px;
          font-weight: 800;
          color: #212121;
          margin-bottom: 3px;
        }
        .center-address {
          font-size: 12px;
          color: #9E9E9E;
        }
        .status-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 20px;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .card-divider {
          height: 1px;
          background: #F5F5F5;
          margin: 0 22px;
        }
        .card-body {
          padding: 16px 22px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .info-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .info-label {
          font-size: 12px;
          font-weight: 700;
          color: #9E9E9E;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          flex-shrink: 0;
        }
        .info-value {
          font-size: 13px;
          font-weight: 600;
          color: #424242;
          text-align: right;
        }
        .car-value {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .card-footer {
          padding: 14px 22px;
          border-top: 1px solid #F5F5F5;
          background: #FAFAFA;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .btn-details {
          flex: 1;
          padding: 10px 0;
          background: #E8192C;
          color: #fff;
          text-align: center;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          transition: background 0.2s;
        }
        .btn-details:hover {
          background: #C8001E;
        }
        .btn-cancel-link {
          padding: 10px 16px;
          background: transparent;
          color: #9E9E9E;
          border: 1.5px solid #E0E0E0;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
        }
        .btn-cancel-link:hover {
          border-color: #E8192C;
          color: #E8192C;
        }
      `}</style>
    </div>
  );
}

export default function BookingHistoryPage() {
  const { authorized, checking } = useRoleGuard();
  const [activeTab, setActiveTab] = useState("All");
  const [allBookings, setAllBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAllBookings()
      .then((response) => {
        setAllBookings(response.data);
      })
      .catch((error) => {
        console.error("Failed to load bookings:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const filteredBookings =
    activeTab === "All"
      ? allBookings
      : allBookings.filter((b) => b.status === activeTab);

  if (checking) return null;
  if (!authorized) return null;

  return (
    <div className="page-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');

        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .page-container {
          min-height: 100vh;
          background: #F7F8FA;
          font-family: 'Cairo', sans-serif;
        }

        .top-nav {
          background: #fff;
          border-bottom: 2px solid #E8192C;
          height: 60px;
          padding: 0 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 2px 8px rgba(232, 25, 44, 0.07);
        }

        .logo {
          font-size: 20px;
          font-weight: 900;
          color: #E8192C;
        }

        .nav-back {
          font-size: 13px;
          font-weight: 600;
          color: #616161;
          text-decoration: none;
          transition: color 0.2s;
        }

        .nav-back:hover {
          color: #E8192C;
        }

        .page-content {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 24px;
        }

        .page-header {
          margin-bottom: 32px;
        }

        .page-title {
          font-size: 28px;
          font-weight: 900;
          color: #212121;
          margin-bottom: 4px;
        }

        .page-subtitle {
          font-size: 14px;
          color: #9E9E9E;
        }

        .filter-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }

        .tab-btn {
          padding: 8px 18px;
          border-radius: 20px;
          border: 1.5px solid #E0E0E0;
          background: #fff;
          font-size: 13px;
          font-weight: 700;
          color: #616161;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Cairo', sans-serif;
        }

        .tab-btn.active {
          background: #E8192C;
          border-color: #E8192C;
          color: #fff;
        }

        .tab-btn:hover:not(.active) {
          border-color: #E8192C;
          color: #E8192C;
        }

        .bookings-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        @media (max-width: 680px) {
          .bookings-grid {
            grid-template-columns: 1fr;
          }
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #9E9E9E;
          grid-column: 1 / -1;
        }

        .empty-state-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
          color: #424242;
        }

        .loading-state {
          text-align: center;
          padding: 60px;
          color: #9E9E9E;
          font-size: 15px;
        }
      `}</style>

      <nav className="top-nav">
        <span className="logo">Autoria</span>
        <Link href="/cars" className="nav-back">Back to Dashboard</Link>
      </nav>

      <div className="page-content">
        <div className="page-header">
          <div className="page-title">Booking History</div>
          <div className="page-subtitle">
            {allBookings.length} total {allBookings.length === 1 ? "booking" : "bookings"}
          </div>
        </div>

        <div className="filter-tabs">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "InProgress" ? "In Progress" : tab}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="loading-state">Loading your bookings...</div>
        ) : (
          <div className="bookings-grid">
            {filteredBookings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-title">No bookings found</div>
                <div>You have no {activeTab !== "All" ? activeTab.toLowerCase() : ""} bookings.</div>
              </div>
            ) : (
              filteredBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
