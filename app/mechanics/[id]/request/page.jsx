"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SkeletonCard } from "@/components/Skeleton";
import mechanicsService from "@/lib/api/mechanicsService";
import jobRequestsService from "@/lib/api/jobRequestsService";
import { CARS_ENDPOINTS } from "@/lib/api/endpoints";
import { apiAuthFetch } from "@/lib/api/client";

const R = "#E8272A";
const COLORS = { border: "#E9ECEF", text: "#1A1A1A", muted: "#6C757D", bg: "#F8F9FA", white: "#fff" };

const s = {
  input: {
    width: "100%",
    padding: "10px 14px",
    border: `1px solid ${COLORS.border}`,
    borderRadius: 8,
    fontSize: 13,
    color: COLORS.text,
    background: "#fff",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  label: { fontSize: 12, fontWeight: 600, color: COLORS.muted, marginBottom: 4, display: "block" },
  group: { marginBottom: 14 },
  row: { display: "flex", gap: 12 },
  card: { background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20, marginBottom: 16 },
  btn: (v = "primary") => ({
    padding: "10px 20px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    border: v === "outline" ? `1px solid ${COLORS.border}` : "none",
    background: v === "primary" ? R : "#fff",
    color: v === "primary" ? "#fff" : COLORS.text,
  }),
};

export default function RequestMechanicPage() {
  const { id: mechanicId } = useParams();
  const router = useRouter();

  const [mechanic, setMechanic] = useState(null);
  const [cars, setCars] = useState([]);
  const [loadingMech, setLoadingMech] = useState(true);
  const [loadingCars, setLoadingCars] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    carId: "",
    problemDescription: "",
    locationAddress: "",
    scheduledAt: "",
  });

  const hasCars = cars.length > 0;

  useEffect(() => {
    if (!mechanicId) return;

    mechanicsService
      .getById(mechanicId)
      .then((res) => {
        const mechData = res?.data?.data || res?.data || res;
        setMechanic(mechData);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoadingMech(false));

    // 🔥 Fetch ONLY user cars (backend should return logged-in user's cars)
    apiAuthFetch(CARS_ENDPOINTS.base)
      .then((res) => {
        let cleanCarsList = [];


        const carsData =
          res?.data?.data?.data?.items ||   
          res?.data?.data?.items ||
          res?.data?.items ||
          res?.data ||
          res?.items ||
          [];

            if (Array.isArray(carsData)) {
    cleanCarsList = carsData; 
  }

    
        setCars(cleanCarsList);
      })
      .catch(() => setCars([]))
      .finally(() => setLoadingCars(false));
  }, [mechanicId]);

  async function handleSubmit() {
    setError("");

    // 🚫 HARD GUARD: prevent submission without car
    if (!form.carId) {
      setError("Please select a car before sending the request.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        carId: form.carId,
        problemDescription: form.problemDescription,
        locationAddress: form.locationAddress,
      
        ...(form.scheduledAt
          ? { scheduledAt: new Date(form.scheduledAt).toISOString() }
          : {}),
      };

      await jobRequestsService.create(mechanicId, payload);
      router.push("/client-job-requests");
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />

      <div style={{ minHeight: "100vh", background: COLORS.bg, padding: "32px 5%" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Request a Mechanic</h1>
          <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 24 }}>
            Describe your issue and send a request
          </p>

          {/* MECHANIC */}
          {loadingMech ? (
            <SkeletonCard />
          ) : (
            mechanic && (
              <div style={s.card}>
                <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.muted }}>
                  SELECTED MECHANIC
                </div>

                <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 10 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: R,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 700,
                    }}
                  >
                    {(mechanic.fullName || mechanic.name || "ME").slice(0, 2).toUpperCase()}
                  </div>

                  <div>
                    <div style={{ fontWeight: 700 }}>
                      {mechanic.fullName || mechanic.name || "Mechanic"}
                    </div>
                    <div style={{ fontSize: 12, color: COLORS.muted }}>
                      ⭐ {mechanic.rating?.toFixed(1) || "0.0"} •{" "}
                      {mechanic.yearsOfExperience || 0} yrs • {mechanic.city || "Not set"}
                    </div>
                  </div>
                </div>
              </div>
            )
          )}

          {/* CARS SECTION */}
          <div style={s.card}>
            <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.muted, marginBottom: 10 }}>
              VEHICLE & PROBLEM
            </div>

            {loadingCars ? (
              <div style={{ height: 40, background: "#f3f4f6", borderRadius: 8 }} />
            ) : !hasCars ? (
              <div>
                <p style={{ fontSize: 13, marginBottom: 10 }}>
                  You don’t have any cars yet.
                </p>

                <button
                  style={s.btn("primary")}
                  onClick={() => router.push("/cars/add-car")}
                >
                  Add Car
                </button>
              </div>
            ) : (
              <>
                {/* CAR SELECT */}
                <div style={s.group}>
                  <label style={s.label}>Select Your Car</label>
                  <select
                    style={{ ...s.input, appearance: "none" }}
                    value={form.carId}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, carId: e.target.value }))
                    }
                  >
                    <option value="">Choose a car...</option>
                    {cars.map((car) => {
                      const id = car.carId || car.id;
                      return (
                        <option key={id} value={id}>
                          {car.year} {car.make} {car.model}{" "}
                          {car.licensePlate ? `— ${car.licensePlate}` : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* PROBLEM */}
                <div style={s.group}>
                  <label style={s.label}>Problem Description</label>
                  <textarea
                    style={{ ...s.input, minHeight: 100 }}
                    value={form.problemDescription}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, problemDescription: e.target.value }))
                    }
                  />
                </div>
              </>
            )}

            <div style={{ height: 1, background: COLORS.border, margin: "16px 0" }} />

            {/* LOCATION */}
            <div style={s.group}>
              <label style={s.label}>Address</label>
              <input
                style={s.input}
                value={form.locationAddress}
                onChange={(e) =>
                  setForm((p) => ({ ...p, locationAddress: e.target.value }))
                }
              />
            </div>

       

            {error && (
              <div
                style={{
                  background: "#FFEBEE",
                  color: "#C62828",
                  padding: 10,
                  borderRadius: 8,
                  marginTop: 10,
                }}
              >
                {error}
              </div>
            )}

            {/* BUTTONS */}
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button style={s.btn("outline")} onClick={() => router.back()}>
                Cancel
              </button>

              <button
                style={s.btn("primary")}
                onClick={handleSubmit}
                disabled={submitting || !form.carId || !hasCars}
              >
                {submitting ? "Sending..." : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}