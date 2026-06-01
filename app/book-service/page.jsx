"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { bookingsService } from "@/lib/api/bookingsService";
import { getAllCars, getCarItems, getCarId } from "@/lib/api/carsService";
import { serviceCentersService, getServiceCenterItems } from "@/lib/api/serviceCentersService";
import { getMe } from "@/lib/api/usersService";
import { lookupsService } from "@/lib/api/lookupsService";

const COLORS = {
  primary: "#E8272A",
  primaryDark: "#B81C1F",
  bg: "#F8F9FA",
  white: "#FFFFFF",
  text: "#1A1A1A",
  textLight: "#6C757D",
  border: "#E9ECEF",
  success: "#28A745",
};

const FALLBACK_SLOTS = ["09:00 AM", "11:00 AM", "01:00 PM", "03:00 PM", "05:00 PM", "07:00 PM"];

function parseSlotTime(slot) {
  return slot?.startTime ?? slot?.time ?? slot?.label ?? "";
}

function getSlotId(slot) {
  return slot?.id ?? slot?.timeSlotId ?? slot?.TimeSlotId ?? null;
}

const DB_SERVICE_TYPES_FALLBACK = [
  { id: "ED392799-AC48-4DF4-A43B-4067838C5782", name: "Body Work" },
  { id: "5E7AE718-406E-4040-A99B-79975A468B04", name: "Suspension" },
  { id: "C0E62C6E-3BC1-4BF8-A6A4-7AC7CBF2E00D", name: "AC Repair" },
  { id: "1CE0FE70-1308-4FB2-B1CD-8B0E326ECBBD", name: "Brakes" },
  { id: "2F85B94E-C7A6-4FE3-8C62-C464EBC021B6", name: "Tires" },
  { id: "8E4EC0D1-4940-43D7-B809-D4F38111375E", name: "Oil Change" },
  { id: "07109B5A-5EFA-4234-A84B-EB5EFB32A877", name: "Electrical" },
  { id: "09014C26-42D5-4742-8119-F33BB2B94D2D", name: "Engine Diagnostics" }
];

export default function BookServicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceCenterFromUrl = searchParams.get("serviceCenterId") || "";

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [selectedCarId, setSelectedCarId] = useState("");
  const [selectedServiceCenterId, setSelectedServiceCenterId] = useState(serviceCenterFromUrl);
  const [serviceCenters, setServiceCenters] = useState([]);
  const [dbServiceTypes, setDbServiceTypes] = useState(DB_SERVICE_TYPES_FALLBACK);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [formData, setFormData] = useState({
    serviceType: "",
    serviceTypeId: "",
    carBrand: "",
    carModel: "",
    carYear: "",
    date: "",
    timeSlot: "",
    timeSlotId: "",
    name: "",
    phone: "",
    notes: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function loadBookingData() {
      try {
        if (typeof window !== "undefined" && !localStorage.getItem("token")) {
          router.push("/login");
          return;
        }

        const [carsResponse, centersResponse, meResponse, serviceTypesRes] = await Promise.all([
          getAllCars(),
          serviceCentersService.getAll(),
          getMe().catch(() => null),
          lookupsService.getServiceTypes().catch(() => serviceCentersService.getServiceTypes()),
        ]);

        if (cancelled) return;

        const cars = getCarItems(carsResponse);
        const primary = cars.find((car) => car.isPrimary) || cars[0];

        if (primary) {
          const carId = getCarId(primary);
          setSelectedCarId(carId || "");
          setFormData((prev) => ({
            ...prev,
            carBrand: primary.make || prev.carBrand,
            carModel: primary.model || prev.carModel,
            carYear: String(primary.year || prev.carYear),
          }));
        }

        const centers = getServiceCenterItems(centersResponse);
        setServiceCenters(centers);

        if (serviceTypesRes?.data && serviceTypesRes.data.length > 0) {
          setDbServiceTypes(serviceTypesRes.data);
        } else if (Array.isArray(serviceTypesRes) && serviceTypesRes.length > 0) {
          setDbServiceTypes(serviceTypesRes);
        }

        if (!serviceCenterFromUrl && centers.length === 1) {
          setSelectedServiceCenterId(centers[0].id);
        }

        const user = meResponse?.data;
        if (user) {
          setFormData((prev) => ({
            ...prev,
            name: user.fullName || user.FullName || prev.name,
            phone: user.phoneNumber || user.PhoneNumber || user.phone || prev.phone,
          }));
        }
      } catch (error) {
        console.error("Failed to load booking data:", error);
      } finally {
        if (!cancelled) setInitLoading(false);
      }
    }

    loadBookingData();
    return () => {
      cancelled = true;
    };
  }, [router, serviceCenterFromUrl]);

  useEffect(() => {
    if (!formData.date || !selectedServiceCenterId) {
      setAvailableSlots([]);
      return;
    }

    let cancelled = false;
    setSlotsLoading(true);

    bookingsService
      .getAvailableSlots(selectedServiceCenterId, formData.date)
      .then((response) => {
        if (cancelled) return;
        const items = response?.data?.items ?? response?.data ?? [];
        setAvailableSlots(Array.isArray(items) ? items : []);
      })
      .catch((error) => {
        console.error("Failed to load time slots:", error);
        if (!cancelled) setAvailableSlots([]);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [formData.date, selectedServiceCenterId]);

  const selectedCenter = serviceCenters.find(
    (center) => String(center.id) === String(selectedServiceCenterId)
  );

  const centerServiceTypes = selectedCenter
    ? dbServiceTypes.filter((type) =>
        selectedCenter.serviceTypes?.some(
          (name) => name.toLowerCase() === type.name.toLowerCase()
        )
      )
    : [];

  const nextStep = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (step === 1 && !selectedServiceCenterId) {
      alert("Please select a service center");
      return;
    }
    if (step === 1 && !formData.serviceType) {
      alert("Please select a service type first");
      return;
    }
    if (step === 2 && (!formData.date || !formData.timeSlot)) {
      alert("Please select a date and time slot");
      return;
    }
    if (step === 3 && (!formData.name.trim() || !formData.phone.trim())) {
      alert("Please enter your name and phone number");
      return;
    }
    setStep((s) => Math.min(s + 1, 4));
  };

  const prevStep = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleBooking = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!localStorage.getItem("token")) {
      alert("Please log in to book a service");
      router.push("/login");
      return;
    }

    if (!selectedCarId) {
      alert("Please add a car to your account before booking");
      router.push("/cars/add-car");
      return;
    }

    if (!selectedServiceCenterId) {
      alert("Please select a service center");
      return;
    }

    setLoading(true);
    try {
      const appointment = formData.date
        ? `${formData.date}T00:00:00.000Z`
        : new Date().toISOString();

      const payload = {
        // PascalCase keys for .NET case-sensitive JSON deserialization
        CarId: selectedCarId,
        ServiceCenterId: selectedServiceCenterId,
        TimeSlotId: formData.timeSlotId || undefined,
        ServiceTypeId: formData.serviceTypeId || undefined,
        ServiceType: formData.serviceType,
        CarBrand: formData.carBrand,
        CarModel: formData.carModel || "Unknown",
        CarYear: parseInt(formData.carYear, 10) || null,
        AppointmentDate: formData.date,
        Date: formData.date,
        CustomerName: formData.name,
        Phone: formData.phone,
        Notes: formData.notes || "",
        Status: "Pending",

        // camelCase keys for standard JS/JSON compatibility
        carId: selectedCarId,
        serviceCenterId: selectedServiceCenterId,
        timeSlotId: formData.timeSlotId || undefined,
        serviceTypeId: formData.serviceTypeId || undefined,
        serviceType: formData.serviceType,
        carBrand: formData.carBrand,
        carModel: formData.carModel || "Unknown",
        carYear: parseInt(formData.carYear, 10) || null,
        appointmentDate: formData.date,
        date: formData.date,
        appointment,
        timeSlot: formData.timeSlot,
        customerName: formData.name,
        phone: formData.phone,
        notes: formData.notes || "",
        status: "Pending",
      };

      await bookingsService.create(payload);
      setStep(5);
    } catch (err) {
      console.error("Booking error:", err);
      alert(err.message || "Something went wrong while booking");
    } finally {
      setLoading(false);
    }
  };

  const slotOptions =
    availableSlots.length > 0
      ? availableSlots.map((slot) => ({
          id: getSlotId(slot),
          label: parseSlotTime(slot),
        }))
      : FALLBACK_SLOTS.map((time) => ({ id: "", label: time }));

  if (initLoading) {
    return (
      <div style={{ background: COLORS.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "sans-serif", padding: "40px 20px" }}>
      <style>{`
        * { box-sizing: border-box; }
        input, select, textarea { transition: 0.2s; }
        input:focus, select:focus, textarea:focus { border-color: ${COLORS.primary} !important; outline: none; }
      `}</style>

      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <span style={{ color: COLORS.text, fontSize: "24px", fontWeight: 900, cursor: "default", letterSpacing: "-1px" }}>
            AUTO<span style={{ color: COLORS.primary }}>RIA</span>
          </span>
          <h1 style={{ fontSize: "28px", fontWeight: 800, marginTop: "12px", color: COLORS.text }}>Book Your Service</h1>
        </div>

        {step < 5 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "40px", position: "relative" }}>
            <div style={{ position: "absolute", top: "15px", left: "0", right: "0", height: "2px", background: "#e5e7eb", zIndex: 0 }} />
            <div style={{ position: "absolute", top: "15px", left: "0", width: `${((step - 1) / 3) * 100}%`, height: "2px", background: COLORS.primary, zIndex: 0, transition: "width 0.4s ease" }} />

            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: step >= i ? COLORS.primary : COLORS.white,
                  color: step >= i ? COLORS.white : COLORS.textLight,
                  border: `2px solid ${step >= i ? COLORS.primary : "#e5e7eb"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: 700,
                  zIndex: 1,
                  transition: "all 0.3s ease",
                }}
              >
                {step > i ? "✓" : i}
              </div>
            ))}
          </div>
        )}

        <div
          style={{
            background: COLORS.white,
            borderRadius: "24px",
            padding: "40px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
            border: `1px solid ${COLORS.border}`,
          }}
        >
          {step === 1 && (
            <div className="step-content">
              <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "24px" }}>Vehicle & Service</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: COLORS.textLight, marginBottom: "8px", textTransform: "uppercase" }}>Service Center</label>
                  <select
                    value={selectedServiceCenterId}
                    onChange={(e) => {
                      setSelectedServiceCenterId(e.target.value);
                      setFormData((prev) => ({ ...prev, timeSlot: "", timeSlotId: "" }));
                    }}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${COLORS.border}`, background: COLORS.bg, fontSize: "14px" }}
                  >
                    <option value="">Select a service center</option>
                    {serviceCenters.map((center) => (
                      <option key={center.id} value={center.id}>
                        {center.name}{center.loc ? ` — ${center.loc}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: COLORS.textLight, marginBottom: "8px", textTransform: "uppercase" }}>Service Type</label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => {
                      const selectedName = e.target.value;
                      const matchedType = dbServiceTypes.find(
                        (t) => t.name.toLowerCase() === selectedName.toLowerCase()
                      );
                      setFormData((prev) => ({
                        ...prev,
                        serviceType: selectedName,
                        serviceTypeId: matchedType ? (matchedType.id || matchedType.Id || "") : "",
                      }));
                    }}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${COLORS.border}`, background: COLORS.bg, fontSize: "14px" }}
                  >
                    <option value="">Select a service</option>
                    {centerServiceTypes.length > 0 ? (
                      centerServiceTypes.map((t) => (
                        <option key={t.id || t.Id} value={t.name}>{t.name}</option>
                      ))
                    ) : (
                      ["Oil Change", "Brakes", "AC Repair", "Tires", "Body Work", "Suspension", "Electrical", "Engine Diagnostics"].map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))
                    )}
                  </select>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: COLORS.textLight, marginBottom: "8px", textTransform: "uppercase" }}>Car Brand</label>
                    <input
                      placeholder="e.g. Toyota"
                      value={formData.carBrand}
                      onChange={(e) => setFormData({ ...formData, carBrand: e.target.value })}
                      style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${COLORS.border}`, background: COLORS.bg, fontSize: "14px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: COLORS.textLight, marginBottom: "8px", textTransform: "uppercase" }}>Model Year</label>
                    <input
                      placeholder="e.g. 2022"
                      value={formData.carYear}
                      onChange={(e) => setFormData({ ...formData, carYear: e.target.value })}
                      style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${COLORS.border}`, background: COLORS.bg, fontSize: "14px" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="step-content">
              <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "24px" }}>Schedule</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: COLORS.textLight, marginBottom: "8px", textTransform: "uppercase" }}>Preferred Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value, timeSlot: "", timeSlotId: "" })}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${COLORS.border}`, background: COLORS.bg, fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: COLORS.textLight, marginBottom: "8px", textTransform: "uppercase" }}>Time Slot</label>
                  {slotsLoading ? (
                    <div style={{ fontSize: "13px", color: COLORS.textLight }}>Loading available slots...</div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                      {slotOptions.map((slot) => (
                        <button
                          key={`${slot.id || "fallback"}-${slot.label}`}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setFormData({ ...formData, timeSlot: slot.label, timeSlotId: slot.id || "" });
                          }}
                          style={{
                            padding: "10px",
                            borderRadius: "10px",
                            border: `1.5px solid ${formData.timeSlot === slot.label ? COLORS.primary : COLORS.border}`,
                            background: formData.timeSlot === slot.label ? "#FFF4F4" : COLORS.bg,
                            color: formData.timeSlot === slot.label ? COLORS.primary : COLORS.text,
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-content">
              <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "24px" }}>Contact Information</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: COLORS.textLight, marginBottom: "8px", textTransform: "uppercase" }}>Full Name</label>
                  <input
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${COLORS.border}`, background: COLORS.bg, fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: COLORS.textLight, marginBottom: "8px", textTransform: "uppercase" }}>Phone Number</label>
                  <input
                    placeholder="01xxxxxxxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${COLORS.border}`, background: COLORS.bg, fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: COLORS.textLight, marginBottom: "8px", textTransform: "uppercase" }}>Additional Notes</label>
                  <textarea
                    placeholder="Tell us more about the issue..."
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: `1.5px solid ${COLORS.border}`, background: COLORS.bg, fontSize: "14px", resize: "none" }}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="step-content">
              <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "24px" }}>Review Booking</h2>
              <div style={{ background: COLORS.bg, borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: COLORS.textLight, fontSize: "14px" }}>Service Center:</span>
                  <span style={{ fontWeight: 700 }}>{selectedCenter?.name || "—"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: COLORS.textLight, fontSize: "14px" }}>Service:</span>
                  <span style={{ fontWeight: 700 }}>{formData.serviceType}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: COLORS.textLight, fontSize: "14px" }}>Vehicle:</span>
                  <span style={{ fontWeight: 700 }}>{formData.carBrand} ({formData.carYear})</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: COLORS.textLight, fontSize: "14px" }}>Appointment:</span>
                  <span style={{ fontWeight: 700 }}>{formData.date} at {formData.timeSlot}</span>
                </div>
                <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "16px", marginTop: "4px" }}>
                  <span style={{ color: COLORS.textLight, fontSize: "14px" }}>Customer:</span>
                  <div style={{ fontWeight: 700, marginTop: "4px" }}>{formData.name}</div>
                  <div style={{ fontSize: "13px", color: COLORS.textLight }}>{formData.phone}</div>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="step-content" style={{ textAlign: "center", padding: "30px 0" }}>
              <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
              <div style={{ marginBottom: "24px" }}>
                <i className="fas fa-check-circle" style={{ fontSize: "80px", color: "#28A745" }}></i>
              </div>
              <h2 style={{ fontSize: "26px", fontWeight: 900, marginBottom: "12px" }}>Booking Confirmed!</h2>
              <p style={{ color: COLORS.textLight, fontSize: "15px", lineHeight: 1.6, marginBottom: "30px", maxWidth: "400px", margin: "0 auto 30px" }}>
                Your appointment has been successfully scheduled. We have informed the service center of your upcoming booking.
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/user-dashboard");
                }}
                style={{ background: COLORS.primary, color: COLORS.white, border: "none", padding: "14px 32px", borderRadius: "12px", fontSize: "14px", fontWeight: 700, cursor: "pointer", transition: "opacity 0.2s" }}
              >
                Go to Dashboard
              </button>
            </div>
          )}

          {step < 5 && (
            <div style={{ display: "flex", gap: "15px", marginTop: "40px" }}>
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  style={{ flex: 1, background: "transparent", color: COLORS.text, border: `1.5px solid ${COLORS.border}`, padding: "14px", borderRadius: "12px", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}
                >
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={(e) => (step === 4 ? handleBooking(e) : nextStep(e))}
                disabled={loading}
                style={{
                  flex: 2,
                  background: COLORS.primary,
                  color: COLORS.white,
                  border: "none",
                  padding: "14px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Processing..." : step === 4 ? "Confirm Booking" : "Continue"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
