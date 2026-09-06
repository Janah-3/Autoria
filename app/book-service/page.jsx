"use client";

import { Fragment, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { bookingsService } from "@/lib/api/bookingsService";
import { getAllCars, getCarItems, getCarId } from "@/lib/api/carsService";
import { serviceCentersService, getServiceCenterItems } from "@/lib/api/serviceCentersService";
import { getMe } from "@/lib/api/usersService";
import { lookupsService } from "@/lib/api/lookupsService";
import { useRoleGuard } from "@/lib/hooks/useRoleGuard";

// ── Constants ─────────────────────────────────────────────────────────────────

const COLORS = {
  primary: "#E8272A",
  primaryDark: "#B81C1F",
  bg: "#F8F9FA",
  white: "#FFFFFF",
  text: "#1A1A1A",
  textLight: "#6C757D",
  border: "#E9ECEF",
  success: "#28A745",
  errorBg: "#FFF4F4",
};

const DB_SERVICE_TYPES_FALLBACK = [
  { id: "ED392799-AC48-4DF4-A43B-4067838C5782", name: "Body Work" },
  { id: "5E7AE718-406E-4040-A99B-79975A468B04", name: "Suspension" },
  { id: "C0E62C6E-3BC1-4BF8-A6A4-7AC7CBF2E00D", name: "AC Repair" },
  { id: "1CE0FE70-1308-4FB2-B1CD-8B0E326ECBBD", name: "Brakes" },
  { id: "2F85B94E-C7A6-4FE3-8C62-C464EBC021B6", name: "Tires" },
  { id: "8E4EC0D1-4940-43D7-B809-D4F38111375E", name: "Oil Change" },
  { id: "07109B5A-5EFA-4234-A84B-EB5EFB32A877", name: "Electrical" },
  { id: "09014C26-42D5-4742-8119-F33BB2B94D2D", name: "Engine Diagnostics" },
];

// ── Slot helpers ──────────────────────────────────────────────────────────────

function parseSlotTime(slot) {
  
  const raw = slot?.startTime ?? slot?.time ?? slot?.label ?? slot?.StartTime ?? "";
  if (!raw) return "";
  
  if (/\d{1,2}:\d{2}\s*(AM|PM)/i.test(raw)) return raw;
 
  const match = raw.match(/^(\d{2}):(\d{2})/);
  if (match) {
    let h = parseInt(match[1], 10);
    const m = match[2];
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  }
  return raw;
}

function getSlotId(slot) {
  return slot?.id ?? slot?.Id ?? slot?.timeSlotId ?? slot?.TimeSlotId ?? null;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FieldLabel({ children, icon }) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "7px",
        fontSize: "11px",
        fontWeight: 700,
        color: COLORS.textLight,
        marginBottom: "8px",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {icon && (
        <i className={`fa-solid ${icon}`} style={{ color: COLORS.primary, fontSize: "11px" }} />
      )}
      {children}
    </label>
  );
}

function SelectInput({ value, onChange, children, disabled }) {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "12px 16px",
        borderRadius: "12px",
        border: `1.5px solid ${COLORS.border}`,
        background: disabled ? "#f0f0f0" : COLORS.bg,
        fontSize: "14px",
        color: COLORS.text,
        cursor: disabled ? "not-allowed" : "pointer",
        appearance: "auto",
      }}
    >
      {children}
    </select>
  );
}

function TextInput({ value, onChange, placeholder, type = "text", ...rest }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...rest}
      style={{
        width: "100%",
        padding: "12px 16px",
        borderRadius: "12px",
        border: `1.5px solid ${COLORS.border}`,
        background: COLORS.bg,
        fontSize: "14px",
        color: COLORS.text,
      }}
    />
  );
}

function ValidationError({ message }) {
  if (!message) return null;
  return (
    <div
      style={{
        fontSize: "12px",
        color: COLORS.primary,
        marginTop: "6px",
        fontWeight: 600,
      }}
    >
      {message}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function BookServicePage() {
  const { authorized, checking } = useRoleGuard();
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceCenterIdFromUrl = searchParams.get("serviceCenterId") || "";

  // ── State ──────────────────────────────────────────────────────────────────

  const [initLoading, setInitLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  
  const [cars, setCars] = useState([]);
  const [serviceCenter, setServiceCenter] = useState(null); // the one passed via URL
  const [dbServiceTypes, setDbServiceTypes] = useState(DB_SERVICE_TYPES_FALLBACK);

  
  const [selectedCarId, setSelectedCarId] = useState("");
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState("");
  const [selectedServiceTypeName, setSelectedServiceTypeName] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [selectedSlotLabel, setSelectedSlotLabel] = useState("");
  const [notes, setNotes] = useState("");

  
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");

  

  useEffect(() => {
    if (!serviceCenterIdFromUrl) {
      
      router.replace("/service-centers");
      return;
    }

    let cancelled = false;

    async function init() {
      try {
        if (typeof window !== "undefined" && !localStorage.getItem("token")) {
          router.push("/login");
          return;
        }

        const [carsRes, centersRes, serviceTypesRes] = await Promise.all([
          getAllCars(),
          serviceCentersService.getAll(),
          lookupsService
            .getServiceTypes()
            .catch(() => serviceCentersService.getServiceTypes())
            .catch(() => null),
        ]);

        if (cancelled) return;

        
        const carItems = getCarItems(carsRes);
        setCars(carItems);
        
        const primary = carItems.find((c) => c.isPrimary) || carItems[0];
        if (primary) setSelectedCarId(String(getCarId(primary) || ""));

        
        const allCenters = getServiceCenterItems(centersRes);
        const found = allCenters.find(
          (c) => String(c.id) === String(serviceCenterIdFromUrl)
        );
        setServiceCenter(found || null);

        // Service types
        if (serviceTypesRes?.data?.length > 0) {
          setDbServiceTypes(serviceTypesRes.data);
        } else if (Array.isArray(serviceTypesRes) && serviceTypesRes.length > 0) {
          setDbServiceTypes(serviceTypesRes);
        }
      } catch (err) {
        console.error("BookService init failed:", err);
      } finally {
        if (!cancelled) setInitLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [router, serviceCenterIdFromUrl]);

  // ── Load slots when date changes 

  useEffect(() => {
    if (!selectedDate || !serviceCenterIdFromUrl) {
      setAvailableSlots([]);
      setSlotsError("");
      return;
    }

    let cancelled = false;
    setSlotsLoading(true);
    setSlotsError("");
    
    setSelectedSlotId("");
    setSelectedSlotLabel("");

    bookingsService
      .getAvailableSlots(serviceCenterIdFromUrl, selectedDate)
      .then((res) => {
        if (cancelled) return;
        const items = res?.data?.items ?? res?.data ?? (Array.isArray(res) ? res : []);
        const parsed = Array.isArray(items) ? items : [];

        const valid = parsed.filter((s) => getSlotId(s) && parseSlotTime(s));
        setAvailableSlots(valid);
        if (valid.length === 0) {
          setSlotsError("No available time slots for this date. Please try another date.");
        }
      })
      .catch((err) => {
        console.error("getAvailableSlots failed:", err);
        if (!cancelled) {
          setAvailableSlots([]);
          setSlotsError("Failed to load time slots. Please try again.");
        }
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedDate, serviceCenterIdFromUrl]);

  if (checking || !authorized) return null;

  // ── Derived: service types to show 

  const displayServiceTypes = (() => {
    if (!serviceCenter) return dbServiceTypes;
    if (!serviceCenter.serviceTypes?.length) return dbServiceTypes;
    const matched = dbServiceTypes.filter((t) =>
      serviceCenter.serviceTypes.some(
        (name) => name.toLowerCase() === t.name.toLowerCase()
      )
    );
    return matched.length > 0 ? matched : dbServiceTypes;
  })();

  //Validation

  function validate() {
    const e = {};
    if (!selectedCarId) e.car = "Please select a car.";
    if (!selectedServiceTypeId) e.serviceType = "Please select a service type.";
    if (!selectedDate) e.date = "Please select a date.";
    if (!selectedSlotId) e.slot = "Please select a time slot.";
    return e;
  }

  

  async function handleSubmit() {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const payload = {
        CarId: selectedCarId,
        ServiceCenterId: serviceCenterIdFromUrl,
        ServiceTypeId: selectedServiceTypeId,
        TimeSlotId: selectedSlotId,
        Notes: notes.trim() || "",
      };

      await bookingsService.create({ request: payload });
      setSubmitted(true);
    } catch (err) {
      console.error("Booking submission failed:", err);
      setErrors({ submit: err.message || "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  

  const today = new Date().toISOString().split("T")[0];

  // ── Book progress steps ────────────────────────────────────────────────────

  const steps = [
    { label: "Car", icon: "fa-car", done: !!selectedCarId },
    { label: "Service", icon: "fa-wrench", done: !!selectedServiceTypeId },
    { label: "Schedule", icon: "fa-calendar-check", done: !!(selectedDate && selectedSlotId) },
    { label: "Confirm", icon: "fa-circle-check", done: false },
  ];

  const selectedCar = cars.find((c) => String(getCarId(c)) === String(selectedCarId));

  // ── Loading screen ─────────────────────────────────────────────────────────

  if (initLoading) {
    return (
      <div
        style={{
          background: COLORS.bg,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: `3px solid ${COLORS.border}`,
            borderTop: `3px solid ${COLORS.primary}`,
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: COLORS.textLight, fontSize: "14px" }}>Loading booking details…</p>
      </div>
    );
  }

  

  if (submitted) {
    const carLabel = selectedCar
      ? [selectedCar.make, selectedCar.model, selectedCar.year].filter(Boolean).join(" ")
      : "Your car";
    const summaryRows = [
      { icon: "fa-wrench", label: "Service", value: selectedServiceTypeName },
      { icon: "fa-car", label: "Car", value: carLabel },
      { icon: "fa-shop", label: "Center", value: serviceCenter?.name || "—" },
      {
        icon: "fa-calendar-day",
        label: "Date",
        value: selectedDate
          ? new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : selectedDate,
      },
      { icon: "fa-clock", label: "Time", value: selectedSlotLabel },
    ];
    return (
      <div
        style={{
          background: COLORS.bg,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -140,
            left: -140,
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: "rgba(232,39,42,0.07)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -140,
            right: -140,
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: "rgba(184,28,31,0.05)",
          }}
        />
        <div
          style={{
            background: COLORS.white,
            borderRadius: "24px",
            padding: "48px 40px",
            maxWidth: "480px",
            width: "100%",
            textAlign: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
            border: `1px solid ${COLORS.border}`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 6,
              background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
            }}
          />
          <div
            style={{
              width: "76px",
              height: "76px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
              color: COLORS.white,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 22px",
              fontSize: "34px",
              boxShadow: "0 10px 24px rgba(232,39,42,0.3)",
            }}
          >
            <i className="fa-solid fa-circle-check" />
          </div>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: 800,
              color: COLORS.text,
              marginBottom: "8px",
              letterSpacing: "-0.5px",
            }}
          >
            Booking Confirmed!
          </h2>
          <p
            style={{
              color: COLORS.textLight,
              fontSize: "14px",
              lineHeight: 1.7,
              marginBottom: "26px",
            }}
          >
            Your request has been submitted to the service center. They will confirm your appointment
            shortly.
          </p>
          <div
            style={{
              border: `1px solid ${COLORS.border}`,
              borderRadius: "16px",
              overflow: "hidden",
              marginBottom: "26px",
              textAlign: "left",
            }}
          >
            {summaryRows.map((row, i) => (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderBottom: i < summaryRows.length - 1 ? `1px solid ${COLORS.border}` : "none",
                  background: i % 2 === 0 ? COLORS.bg : COLORS.white,
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: "#fff0f0",
                    color: COLORS.primary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    flexShrink: 0,
                  }}
                >
                  <i className={`fa-solid ${row.icon}`} />
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: COLORS.textLight,
                    width: 64,
                    flexShrink: 0,
                  }}
                >
                  {row.label}
                </div>
                <div style={{ fontSize: "13.5px", fontWeight: 700, color: COLORS.text }}>
                  {row.value}
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => router.push("/user-dashboard")}
            style={{
              background: COLORS.primary,
              color: COLORS.white,
              border: "none",
              padding: "14px 32px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
              width: "100%",
              marginBottom: "10px",
            }}
          >
            <i className="fa-solid fa-calendar-check" style={{ marginRight: 6 }} />
            Go to My Bookings
          </button>
          <button
            type="button"
            onClick={() => router.push("/service-centers")}
            style={{
              background: "transparent",
              border: `1.5px solid ${COLORS.border}`,
              padding: "13px 32px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
              width: "100%",
              color: COLORS.text,
            }}
          >
            Book Another Appointment
          </button>
        </div>
      </div>
    );
  }

  

  return (
    <div
      style={{
        background: COLORS.bg,
        minHeight: "100vh",
        fontFamily: "sans-serif",
        padding: "40px 20px",
      }}
    >
      <style>{`
        * { box-sizing: border-box; }
        input:focus, select:focus, textarea:focus {
          border-color: ${COLORS.primary} !important;
          outline: none;
          box-shadow: 0 0 0 3px rgba(232,39,42,0.08);
        }
        button:hover:not(:disabled) { opacity: 0.88; }
      `}</style>

      <div style={{ maxWidth: "560px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              fontSize: "20px",
              fontWeight: 900,
              letterSpacing: "-1px",
              cursor: "default",
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
            }}
          >
            <i className="fa-solid fa-gear" style={{ color: COLORS.primary, fontSize: "17px" }} />
            AUTO<span style={{ color: COLORS.primary }}>RIA</span>
          </div>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: 800,
              color: COLORS.text,
              marginTop: "12px",
              marginBottom: "6px",
              letterSpacing: "-0.5px",
            }}
          >
            Book a Service
          </h1>
          <p style={{ fontSize: "13px", color: COLORS.textLight, margin: "0 0 22px" }}>
            Reserve your slot at a trusted service center in minutes
          </p>

          {/* Step progress */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              maxWidth: "460px",
              margin: "0 auto",
            }}
          >
            {steps.map((s, i) => (
              <Fragment key={s.label}>
                {i > 0 && (
                  <div
                    style={{
                      flex: 1,
                      height: 2,
                      background: s.done ? COLORS.primary : COLORS.border,
                      marginTop: 17,
                      borderRadius: 2,
                      transition: "background 0.2s ease",
                    }}
                  />
                )}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 64 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: s.done ? COLORS.primary : COLORS.white,
                      border: `2px solid ${s.done ? COLORS.primary : COLORS.border}`,
                      color: s.done ? COLORS.white : COLORS.textLight,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      boxShadow: s.done ? "0 4px 12px rgba(232,39,42,0.25)" : "none",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <i className={`fa-solid ${s.done ? "fa-circle-check" : s.icon}`} />
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: s.done ? COLORS.text : COLORS.textLight,
                      marginTop: 6,
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              </Fragment>
            ))}
          </div>

          {serviceCenter && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                background: COLORS.white,
                border: `1px solid ${COLORS.border}`,
                borderRadius: "12px",
                padding: "9px 18px",
                marginTop: "20px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: "#fff0f0",
                  color: COLORS.primary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                <i className="fa-solid fa-shop" />
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: COLORS.text }}>
                  {serviceCenter.name}
                </div>
                <div style={{ fontSize: 11, color: COLORS.textLight }}>
                  <i className="fa-solid fa-location-dot" style={{ marginRight: 3 }} />
                  {serviceCenter.address || serviceCenter.loc || "Service center"}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form card */}
        <div
          style={{
            position: "relative",
            background: COLORS.white,
            borderRadius: "24px",
            padding: "36px",
            boxShadow: "0 12px 48px rgba(0,0,0,0.07)",
            border: `1px solid ${COLORS.border}`,
            display: "flex",
            flexDirection: "column",
            gap: "28px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 6,
              background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
            }}
          />
          {/* ── Car selection ── */}
          <div>
            <FieldLabel icon="fa-car">Your Car</FieldLabel>
            {cars.length === 0 ? (
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: "12px",
                  border: `1.5px solid ${COLORS.border}`,
                  background: COLORS.errorBg,
                  fontSize: "13px",
                  color: COLORS.primary,
                  fontWeight: 600,
                }}
              >
                No cars found.{" "}
                <button
                  type="button"
                  onClick={() => router.push("/cars/add-car")}
                  style={{
                    background: "none",
                    border: "none",
                    color: COLORS.primaryDark,
                    fontWeight: 700,
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: 0,
                    fontSize: "13px",
                  }}
                >
                  Add a car first →
                </button>
              </div>
            ) : (
              <SelectInput
                value={selectedCarId}
                onChange={(e) => {
                  setSelectedCarId(e.target.value);
                  setErrors((prev) => ({ ...prev, car: undefined }));
                }}
              >
                <option value="">Select a car</option>
                {cars.map((car) => {
                  const id = String(getCarId(car) || "");
                  const label = [car.make, car.model, car.year, car.licensePlate]
                    .filter(Boolean)
                    .join(" · ");
                  return (
                    <option key={id} value={id}>
                      {label}
                      {car.isPrimary ? " (Primary)" : ""}
                    </option>
                  );
                })}
              </SelectInput>
            )}
            <ValidationError message={errors.car} />
          </div>

          {/* ── Service type ── */}
          <div>
            <FieldLabel icon="fa-wrench">Service Type</FieldLabel>
            <SelectInput
              value={selectedServiceTypeName}
              onChange={(e) => {
                const name = e.target.value;
                const matched = dbServiceTypes.find(
                  (t) => t.name.toLowerCase() === name.toLowerCase()
                );
                setSelectedServiceTypeName(name);
                setSelectedServiceTypeId(matched?.id || matched?.Id || "");
                setErrors((prev) => ({ ...prev, serviceType: undefined }));
              }}
            >
              <option value="">Select a service</option>
              {displayServiceTypes.map((t) => (
                <option key={t.id || t.Id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </SelectInput>
            <ValidationError message={errors.serviceType} />
          </div>

          {/* ── Date picker ── */}
          <div>
            <FieldLabel icon="fa-calendar-day">Preferred Date</FieldLabel>
            <TextInput
              type="date"
              min={today}
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setErrors((prev) => ({ ...prev, date: undefined, slot: undefined }));
              }}
            />
            <ValidationError message={errors.date} />
          </div>

          
          <div>
            <FieldLabel icon="fa-clock">Available Time Slots</FieldLabel>

            {!selectedDate ? (
              <p
                style={{
                  fontSize: "13px",
                  color: COLORS.textLight,
                  padding: "14px 16px",
                  background: COLORS.bg,
                  borderRadius: "12px",
                  border: `1.5px solid ${COLORS.border}`,
                  margin: 0,
                }}
              >
                Select a date above to see available slots.
              </p>
            ) : slotsLoading ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "14px 16px",
                  background: COLORS.bg,
                  borderRadius: "12px",
                  border: `1.5px solid ${COLORS.border}`,
                }}
              >
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    border: `2px solid ${COLORS.border}`,
                    borderTop: `2px solid ${COLORS.primary}`,
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: "13px", color: COLORS.textLight }}>
                  Loading slots…
                </span>
              </div>
            ) : slotsError ? (
              <p
                style={{
                  fontSize: "13px",
                  color: COLORS.primary,
                  padding: "14px 16px",
                  background: COLORS.errorBg,
                  borderRadius: "12px",
                  border: `1.5px solid #f5c6c6`,
                  margin: 0,
                  fontWeight: 600,
                }}
              >
                {slotsError}
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "10px",
                }}
              >
                {availableSlots.map((slot) => {
                  const id = getSlotId(slot);
                  const label = parseSlotTime(slot);
                  const isSelected = selectedSlotId === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setSelectedSlotId(id);
                        setSelectedSlotLabel(label);
                        setErrors((prev) => ({ ...prev, slot: undefined }));
                      }}
                      style={{
                        padding: "11px 4px",
                        borderRadius: "12px",
                        border: `1.5px solid ${isSelected ? COLORS.primary : COLORS.border}`,
                        background: isSelected ? COLORS.primary : COLORS.bg,
                        color: isSelected ? COLORS.white : COLORS.text,
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        boxShadow: isSelected ? "0 4px 12px rgba(232,39,42,0.25)" : "none",
                      }}
                    >
                      <i
                        className={`fa-solid ${isSelected ? "fa-circle-check" : "fa-clock"}`}
                        style={{ fontSize: "11px", marginRight: 4, opacity: isSelected ? 1 : 0.6 }}
                      />
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
            <ValidationError message={errors.slot} />
          </div>

          {/* ── Notes ── */}
          <div>
            <FieldLabel icon="fa-pen">Notes (Optional)</FieldLabel>
            <textarea
              rows={3}
              placeholder="Describe the issue or any special instructions…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "12px",
                border: `1.5px solid ${COLORS.border}`,
                background: COLORS.bg,
                fontSize: "14px",
                color: COLORS.text,
                resize: "vertical",
                fontFamily: "sans-serif",
                lineHeight: 1.5,
              }}
            />
          </div>

          {/* ── Submit error ── */}
          {errors.submit && (
            <div
              style={{
                padding: "14px 16px",
                borderRadius: "12px",
                background: COLORS.errorBg,
                border: `1.5px solid #f5c6c6`,
                color: COLORS.primary,
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              {errors.submit}
            </div>
          )}

          {/* ── Actions ── */}
          <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
            <button
              type="button"
              onClick={() => router.back()}
              style={{
                flex: 1,
                padding: "14px",
                borderRadius: "12px",
                border: `1.5px solid ${COLORS.border}`,
                background: "transparent",
                color: COLORS.text,
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || cars.length === 0}
              style={{
                flex: 2,
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                background: COLORS.primary,
                color: COLORS.white,
                fontSize: "14px",
                fontWeight: 700,
                cursor: submitting || cars.length === 0 ? "not-allowed" : "pointer",
                opacity: submitting || cars.length === 0 ? 0.65 : 1,
                transition: "opacity 0.2s",
              }}
            >
              {submitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 6 }} />
                  Booking…
                </>
              ) : (
                <>
                  <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} />
                  Confirm Booking
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}