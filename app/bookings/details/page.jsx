"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getBookingById } from "../../../src/API/bookingsService";

const STATUS_STYLES = {
  Pending:   { background: "#FFF8E1", color: "#F9A825", border: "1px solid #FFE082" },
  Confirmed: { background: "#E3F2FD", color: "#1565C0", border: "1px solid #BBDEFB" },
  Completed: { background: "#E8F5E9", color: "#2E7D32", border: "1px solid #C8E6C9" },
  Cancelled: { background: "#FAFAFA", color: "#9E9E9E", border: "1px solid #E0E0E0" },
};

function DetailRow({ label, value }) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
      <style jsx>{`
        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 13px 0;
          border-bottom: 1px solid #F5F5F5;
          gap: 16px;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          font-size: 13px;
          font-weight: 700;
          color: #9E9E9E;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          flex-shrink: 0;
        }
        .detail-value {
          font-size: 14px;
          font-weight: 600;
          color: #212121;
          text-align: right;
        }
      `}</style>
    </div>
  );
}

export default function BookingDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id");

  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) {
      router.push("/bookings");
      return;
    }

    getBookingById(bookingId)
      .then((response) => {
        setBooking(response.data);
      })
      .catch((error) => {
        console.error("Booking not found:", error);
        router.push("/bookings");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [bookingId, router]);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <style>{`
          .loading-screen {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Cairo', sans-serif;
            color: #9E9E9E;
            font-size: 15px;
            background: #F7F8FA;
          }
        `}</style>
        Loading booking details...
      </div>
    );
  }

  if (!booking) return null;

  const statusStyle = STATUS_STYLES[booking.status] || STATUS_STYLES.Pending;
  const isCancellable = booking.status === "Pending" || booking.status === "Confirmed";

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
          max-width: 700px;
          margin: 0 auto;
          padding: 40px 24px;
        }

        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 28px;
          gap: 16px;
        }

        .page-title {
          font-size: 26px;
          font-weight: 900;
          color: #212121;
          margin-bottom: 4px;
        }

        .booking-id {
          font-size: 13px;
          color: #9E9E9E;
        }

        .status-badge {
          font-size: 12px;
          font-weight: 700;
          padding: 6px 16px;
          border-radius: 20px;
          flex-shrink: 0;
        }

        .section-card {
          background: #fff;
          border: 1.5px solid #F0F0F0;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
          margin-bottom: 16px;
        }

        .section-title {
          font-size: 13px;
          font-weight: 800;
          color: #9E9E9E;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #F5F5F5;
        }

        .center-name {
          font-size: 18px;
          font-weight: 900;
          color: #212121;
          margin-bottom: 8px;
        }

        .center-address {
          font-size: 14px;
          color: #757575;
          margin-bottom: 4px;
        }

        .center-phone {
          font-size: 14px;
          color: #E8192C;
          font-weight: 600;
        }

        .notes-box {
          background: #F7F8FA;
          border: 1.5px solid #EEEEEE;
          border-radius: 10px;
          padding: 14px;
          font-size: 14px;
          color: #424242;
          line-height: 1.6;
          margin-top: 16px;
        }

        .notes-label {
          font-size: 13px;
          font-weight: 700;
          color: #9E9E9E;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          margin-bottom: 8px;
        }

        .color-dot {
          display: inline-block;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 1.5px solid rgba(0,0,0,0.1);
          vertical-align: middle;
          margin-right: 6px;
        }

        .action-bar {
          display: flex;
          gap: 12px;
          margin-top: 28px;
        }

        .btn-back {
          flex: 1;
          padding: 14px;
          background: #F0F0F0;
          color: #424242;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          text-align: center;
          text-decoration: none;
          display: block;
          transition: background 0.2s;
        }

        .btn-back:hover {
          background: #E0E0E0;
        }

        .btn-cancel {
          flex: 2;
          padding: 14px;
          background: #fff;
          color: #E8192C;
          border: 2px solid #E8192C;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          text-align: center;
          text-decoration: none;
          display: block;
          transition: all 0.2s;
        }

        .btn-cancel:hover {
          background: #E8192C;
          color: #fff;
        }
      `}</style>

      <nav className="top-nav">
        <span className="logo">Autoria</span>
        <Link href="/bookings" className="nav-back">Back to Booking History</Link>
      </nav>

      <div className="page-content">
        <div className="page-header">
          <div>
            <div className="page-title">Booking Details</div>
            <div className="booking-id">Booking ID: {booking.id}</div>
          </div>
          <span className="status-badge" style={statusStyle}>
            {booking.status}
          </span>
        </div>

        <div className="section-card">
          <div className="section-title">Service Center</div>
          <div className="center-name">{booking.serviceCenter.name}</div>
          <div className="center-address">{booking.serviceCenter.address}</div>
          <div className="center-phone">{booking.serviceCenter.phone}</div>
        </div>

        <div className="section-card">
          <div className="section-title">Appointment</div>
          <DetailRow label="Service Type" value={booking.service.type} />
          <DetailRow label="Description" value={booking.service.description} />
          <DetailRow label="Date" value={booking.date} />
          <DetailRow label="Time Slot" value={booking.timeSlot} />
          <DetailRow label="Booked On" value={booking.createdAt} />

          {booking.notes && (
            <div>
              <div className="notes-label">Additional Notes</div>
              <div className="notes-box">{booking.notes}</div>
            </div>
          )}
        </div>


        <div className="section-card">
          <div className="section-title">Vehicle</div>
          <DetailRow
            label="Car"
            value={`${booking.car.make} ${booking.car.model} (${booking.car.year})`}
          />
          <DetailRow label="License Plate" value={booking.car.licensePlate} />
          <DetailRow
            label="Color"
            value={
              <>
                <span
                  className="color-dot"
                  style={{ backgroundColor: booking.car.color }}
                />
                {booking.car.color}
              </>
            }
          />
        </div>

        {booking.status === "Cancelled" && booking.cancellationReason && (
          <div className="section-card">
            <div className="section-title">Cancellation</div>
            <DetailRow label="Reason" value={booking.cancellationReason} />
          </div>
        )}

        <div className="action-bar">
          <Link href="/bookings" className="btn-back">Back</Link>
          {isCancellable && (
            <Link href={`/bookings/cancel?id=${booking.id}`} className="btn-cancel">
              Cancel This Booking
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
