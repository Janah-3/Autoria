"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getBookingById, cancelBooking } from "../../../src/API/bookingsService";

const CANCELLATION_REASONS = [
  "Change of plans",
  "Found another service center",
  "Car issue resolved",
  "Scheduling conflict",
  "Other",
];

export default function BookingCancellationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id");

  const [booking, setBooking] = useState(null);
  const [selectedReason, setSelectedReason] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      router.push("/bookings");
      return;
    }

    getBookingById(bookingId)
      .then((response) => {
        const loadedBooking = response.data;

        if (loadedBooking.status !== "Pending" && loadedBooking.status !== "Confirmed") {
          router.push(`/bookings/details?id=${bookingId}`);
          return;
        }

        setBooking(loadedBooking);
      })
      .catch(() => {
        router.push("/bookings");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [bookingId, router]);

  const handleConfirmCancellation = async () => {
    if (!selectedReason) return;

    setIsSubmitting(true);

    try {
      await cancelBooking(bookingId, selectedReason);
      setIsCancelled(true);

      setTimeout(() => {
        router.push("/bookings");
      }, 2500);
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      alert("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <style>{`.loading-screen { min-height:100vh; display:flex; align-items:center; justify-content:center; font-family:'Cairo',sans-serif; color:#9E9E9E; background:#F7F8FA; }`}</style>
        Loading booking...
      </div>
    );
  }

  if (!booking) return null;


  if (isCancelled) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
          .success-screen { 
            min-height: 100vh;
            background: #F7F8FA; 
            display: flex;
            align-items: center;
            justify-content: center; 
            font-family: 'Cairo', sans-serif; 
          }
          .success-box { text-align: center; }
          .success-title { font-size: 22px; font-weight: 900; color: #212121; margin-bottom: 8px; }
          .success-sub { font-size: 14px; color: #9E9E9E; line-height: 1.6; }
        `}</style>
        <div className="success-screen">
          <div className="success-box">
            <div className="success-title">Booking Cancelled</div>
            <div className="success-sub">
              Your booking at {booking.serviceCenter.name} has been cancelled.
              <br />Redirecting to booking history...
            </div>
          </div>
        </div>
      </>
    );
  }


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

        .nav-back:hover { color: #E8192C; }

        .page-content {
          max-width: 560px;
          margin: 0 auto;
          padding: 40px 24px;
        }

        .page-title {
          font-size: 26px;
          font-weight: 900;
          color: #212121;
          margin-bottom: 6px;
        }

        .page-subtitle {
          font-size: 14px;
          color: #9E9E9E;
          margin-bottom: 32px;
        }

        /* Booking Summary */
        .summary-card {
          background: #fff;
          border: 1.5px solid #F0F0F0;
          border-radius: 16px;
          padding: 22px;
          margin-bottom: 20px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
          position: relative;
          overflow: hidden;
        }

        .summary-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: #E8192C;
        }

        .summary-label {
          font-size: 11px;
          font-weight: 800;
          color: #9E9E9E;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          margin-bottom: 14px;
        }

        .center-name {
          font-size: 17px;
          font-weight: 900;
          color: #212121;
          margin-bottom: 12px;
        }

        .summary-rows {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
        }

        .row-label { color: #9E9E9E; font-weight: 600; }
        .row-value { color: #424242; font-weight: 700; }

        /* Warning */
        .warning-box {
          background: #FFF8E1;
          border: 1.5px solid #FFE082;
          border-radius: 12px;
          padding: 16px 18px;
          font-size: 13.5px;
          color: #6D4C00;
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .warning-title {
          font-weight: 800;
          margin-bottom: 4px;
        }

        /* Reason Selection */
        .reason-section {
          background: #fff;
          border: 1.5px solid #F0F0F0;
          border-radius: 16px;
          padding: 22px;
          margin-bottom: 28px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }

        .reason-title {
          font-size: 15px;
          font-weight: 800;
          color: #212121;
          margin-bottom: 16px;
        }

        .reason-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .reason-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 16px;
          border: 1.5px solid #E0E0E0;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.18s;
          background: #fff;
        }

        .reason-option:hover {
          border-color: #E8192C;
          background: #FFF8F8;
        }

        .reason-option.selected {
          border-color: #E8192C;
          background: #FFF0F1;
        }

        .reason-radio {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid #E0E0E0;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: border-color 0.18s;
        }

        .reason-option.selected .reason-radio {
          border-color: #E8192C;
        }

        .reason-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #E8192C;
          display: none;
        }

        .reason-option.selected .reason-dot {
          display: block;
        }

        .reason-text {
          font-size: 14px;
          font-weight: 600;
          color: #424242;
        }

        /* Actions */
        .action-bar {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .btn-confirm-cancel {
          width: 100%;
          padding: 15px;
          background: #E8192C;
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Cairo', sans-serif;
          box-shadow: 0 4px 14px rgba(232, 25, 44, 0.28);
        }

        .btn-confirm-cancel:hover:not(:disabled) {
          background: #C8001E;
        }

        .btn-confirm-cancel:disabled {
          background: #FFAAB1;
          cursor: not-allowed;
          box-shadow: none;
        }

        .btn-keep {
          width: 100%;
          padding: 14px;
          background: #F0F0F0;
          color: #424242;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          text-align: center;
          text-decoration: none;
          display: block;
          transition: background 0.2s;
          font-family: 'Cairo', sans-serif;
        }

        .btn-keep:hover {
          background: #E0E0E0;
        }
      `}</style>

      <nav className="top-nav">
        <span className="logo">Autoria</span>
        <Link href={`/bookings/details?id=${booking.id}`} className="nav-back">
          Back to Details
        </Link>
      </nav>

      <div className="page-content">
        <div className="page-title">Cancel Booking</div>
        <div className="page-subtitle">
          Please review the details below before confirming the cancellation.
        </div>

        {/* Booking Summary */}
        <div className="summary-card">
          <div className="summary-label">Booking to be Cancelled</div>
          <div className="center-name">{booking.serviceCenter.name}</div>
          <div className="summary-rows">
            <div className="summary-row">
              <span className="row-label">Service</span>
              <span className="row-value">{booking.service.type}</span>
            </div>
            <div className="summary-row">
              <span className="row-label">Date</span>
              <span className="row-value">{booking.date} at {booking.timeSlot}</span>
            </div>
            <div className="summary-row">
              <span className="row-label">Vehicle</span>
              <span className="row-value">
                {booking.car.make} {booking.car.model} &mdash; {booking.car.licensePlate}
              </span>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="warning-box">
          <div className="warning-title">Before you proceed</div>
          Once cancelled, this appointment slot will be released and may not be available again.
          Please make sure you no longer need this booking before confirming.
        </div>

        {/* Reason Selection */}
        <div className="reason-section">
          <div className="reason-title">Why are you cancelling? (Required)</div>
          <div className="reason-options">
            {CANCELLATION_REASONS.map((reason) => (
              <div
                key={reason}
                className={`reason-option ${selectedReason === reason ? "selected" : ""}`}
                onClick={() => setSelectedReason(reason)}
              >
                <div className="reason-radio">
                  <div className="reason-dot" />
                </div>
                <span className="reason-text">{reason}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="action-bar">
          <button
            className="btn-confirm-cancel"
            onClick={handleConfirmCancellation}
            disabled={!selectedReason || isSubmitting}
          >
            {isSubmitting ? "Cancelling..." : "Confirm Cancellation"}
          </button>
          <Link href={`/bookings/details?id=${booking.id}`} className="btn-keep">
            Keep My Booking
          </Link>
        </div>
      </div>
    </div>
  );
}
