"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/api/usersService";
import { getAllCars, getCarItems } from "@/lib/api/carsService";
import { getAllBookings } from "@/lib/api/bookingsService";

export default function UserDashboardPage() {
  const router = useRouter();
  const [cars, setCars] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
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

        const bookingsRes = await getAllBookings();
        const items = bookingsRes.data || [];
        setUpcomingBookings(
          items
            .filter((b) => b.status !== "Completed" && b.status !== "Cancelled")
            .map((b, i) => ({
              id: b.id || i,
              center: b.serviceCenter?.name || b.serviceCenterName || "Service center",
              service: b.service?.type || b.serviceType || "Service",
              date: b.date || b.scheduledDate || "—",
              time: b.timeSlot || b.time || "—",
              status: b.status || "Pending",
            }))
        );
      } catch (err) {
        console.error("User dashboard:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="user-dashboard-layout">
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
          <div className="user-profile">
            <span className="user-name">{userName || "User"}</span>
            <div className="user-avatar">
              {userName ? userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U"}
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
              <Link href="/book-service" className="action-btn btn-primary">
                <i className="fa-solid fa-plus"></i> Book New Service
              </Link>
              <Link href="/cars/add-car" className="action-btn btn-secondary">
                <i className="fa-solid fa-car-side"></i> Add a Vehicle
              </Link>
              <Link href="/reservations" className="action-btn btn-secondary" style={{ background: "#FEEBEB", color: "#E8192C" }}>
                <i className="fa-solid fa-box-open"></i> Part Reservations
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
                    <div className="status-badge">
                      {booking.status}
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

        </div>
      </main>
    </div>
  );
}
