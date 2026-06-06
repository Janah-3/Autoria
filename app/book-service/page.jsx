"use client";

import { useState, useEffect } from "react";
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

function FieldLabel({ children }) {
  return (
    <label
      style={{
        display: "block",
        fontSize: "11px",
        fontWeight: 700,
        color: COLORS.textLight,
        marginBottom: "8px",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
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

function TextInput({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
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
        }}
      >
        <div
          style={{
            background: COLORS.white,
            borderRadius: "24px",
            padding: "60px 40px",
            maxWidth: "480px",
            width: "100%",
            textAlign: "center",
            boxShadow: "0 10px 40px rgba(0,0,0,0.06)",
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "#E8F5E9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              fontSize: "32px",
            }}
          >
            ✓
          </div>
          <h2
            style={{ fontSize: "24px", fontWeight: 800, color: COLORS.text, marginBottom: "12px" }}
          >
            Booking Confirmed!
          </h2>
          <p
            style={{
              color: COLORS.textLight,
              fontSize: "15px",
              lineHeight: 1.7,
              marginBottom: "32px",
            }}
          >
            Your appointment at{" "}
            <strong style={{ color: COLORS.text }}>
              {serviceCenter?.name || "the service center"}
            </strong>{" "}
            on <strong style={{ color: COLORS.text }}>{selectedDate}</strong> at{" "}
            <strong style={{ color: COLORS.text }}>{selectedSlotLabel}</strong> has been submitted.
            The service center will confirm shortly.
          </p>
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
            }}
          >
            Go to My Bookings
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
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{ fontSize: "24px", fontWeight: 900, letterSpacing: "-1px", cursor: "default" }}
          >
            AUTO<span style={{ color: COLORS.primary }}>RIA</span>
          </div>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: 800,
              color: COLORS.text,
              marginTop: "12px",
              marginBottom: "6px",
            }}
          >
            Book a Service
          </h1>
          {serviceCenter && (
            <p style={{ color: COLORS.textLight, fontSize: "14px" }}>
              at{" "}
              <strong style={{ color: COLORS.text }}>
                {serviceCenter.name}
              </strong>
              {serviceCenter.address || serviceCenter.loc
                ? ` · ${serviceCenter.address || serviceCenter.loc}`
                : ""}
            </p>
          )}
        </div>

        {/* Form card */}
        <div
          style={{
            background: COLORS.white,
            borderRadius: "24px",
            padding: "36px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
            border: `1px solid ${COLORS.border}`,
            display: "flex",
            flexDirection: "column",
            gap: "28px",
          }}
        >
          {/* ── Car selection ── */}
          <div>
            <FieldLabel>Your Car</FieldLabel>
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
            <FieldLabel>Service Type</FieldLabel>
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
            <FieldLabel>Preferred Date</FieldLabel>
            <TextInput
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setErrors((prev) => ({ ...prev, date: undefined, slot: undefined }));
              }}
              
            />
            
            <style>{`input[type="date"] { min: ${today}; }`}</style>
            <ValidationError message={errors.date} />
          </div>

          
          <div>
            <FieldLabel>Available Time Slots</FieldLabel>

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
                        padding: "11px 8px",
                        borderRadius: "10px",
                        border: `1.5px solid ${isSelected ? COLORS.primary : COLORS.border}`,
                        background: isSelected ? COLORS.errorBg : COLORS.bg,
                        color: isSelected ? COLORS.primary : COLORS.text,
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
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
            <FieldLabel>Notes (Optional)</FieldLabel>
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
              {submitting ? "Booking…" : "Confirm Booking"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}