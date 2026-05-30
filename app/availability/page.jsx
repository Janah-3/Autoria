"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { serviceCentersService } from "@/lib/api/serviceCentersService";
import { getMe } from "@/lib/api/usersService";
import { bookingsService } from "@/lib/api/bookingsService";


const COLORS = {
  primary: "#E8272A",
  bg: "#F8F9FA",
  surface: "#FFFFFF",
  border: "#E9ECEF",
  text: "#111111",
  textLight: "#6C757D",
  activeBg: "#FEEBEB",
  success: "#E7F5EA",
  successText: "#28A745",
};

const Sidebar = ({ active }) => (
  <aside style={{ width: "240px", background: COLORS.surface, borderRight: `1px solid ${COLORS.border}`, padding: "30px 0", height: "100vh", position: "sticky", top: 0 }}>
    <div style={{ padding: "0 25px", marginBottom: "40px" }}>
      <div style={{ fontSize: "11px", fontWeight: 800, color: COLORS.textLight, letterSpacing: "1.5px", marginBottom: "20px" }}>MANAGE</div>
      {[
        { id: "Dashboard", icon: "📊", path: "/service-center" },
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
            borderLeft: active === item.id ? `4px solid ${COLORS.primary}` : "none"
          }}>
            <span>{item.icon}</span> {item.id}
          </div>
        </Link>
      ))}
    </div>
  </aside>
);

const DayRow = ({ dayData, onToggle, onTimeChange }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${COLORS.border}` }}>
    <div style={{ display: "flex", alignItems: "center", gap: "15px", width: "120px" }}>
      <div 
        onClick={() => onToggle(dayData.day)}
        style={{ width: "36px", height: "20px", background: dayData.isOpen ? COLORS.primary : "#DEE2E6", borderRadius: "20px", position: "relative", cursor: "pointer" }}>
        <div style={{ width: "14px", height: "14px", background: "#FFF", borderRadius: "50%", position: "absolute", top: "3px", left: dayData.isOpen ? "19px" : "3px", transition: "0.2s" }} />
      </div>
      <span style={{ fontSize: "14px", fontWeight: 600 }}>{dayData.day}</span>
    </div>
    {dayData.isOpen ? (
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <input 
          value={dayData.start} 
          onChange={(e) => onTimeChange(dayData.day, 'start', e.target.value)}
          style={{ width: "60px", padding: "8px", borderRadius: "8px", border: `1px solid ${COLORS.border}`, fontSize: "13px", textAlign: "center" }} 
        />
        <span style={{ color: COLORS.textLight }}>-</span>
        <input 
          value={dayData.end} 
          onChange={(e) => onTimeChange(dayData.day, 'end', e.target.value)}
          style={{ width: "60px", padding: "8px", borderRadius: "8px", border: `1px solid ${COLORS.border}`, fontSize: "13px", textAlign: "center" }} 
        />
      </div>
    ) : (
      <span style={{ color: COLORS.textLight, fontSize: "13px", fontStyle: "italic" }}>Closed</span>
    )}
  </div>
);

export default function AvailabilityPage() {
  const [workingHours, setWorkingHours] = useState([
    { day: "Sunday", isOpen: true, start: "09:00", end: "18:00" },
    { day: "Monday", isOpen: true, start: "09:00", end: "18:00" },
    { day: "Tuesday", isOpen: true, start: "09:00", end: "18:00" },
    { day: "Wednesday", isOpen: true, start: "09:00", end: "18:00" },
    { day: "Thursday", isOpen: true, start: "09:00", end: "18:00" },
    { day: "Friday", isOpen: false, start: "00:00", end: "00:00" },
    { day: "Saturday", isOpen: true, start: "10:00", end: "16:00" },
  ]);

  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState("Monday 16 March");
  const [centerName, setCenterName] = useState("AutoCare Nasr City");
  const [ownerName, setOwnerName] = useState("Nada Hany");
  const [centerId, setCenterId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const closeDropdown = () => setDropdownOpen(false);
    window.addEventListener("click", closeDropdown);
    return () => window.removeEventListener("click", closeDropdown);
  }, []);
  const [blockForm, setBlockForm] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: "09:00",
    endTime: "10:00"
  });

  const handleBlockSlot = async () => {
    if (!centerId) {
      alert("Error: Service Center ID not loaded. Please try again.");
      return;
    }

    try {
      const response = await bookingsService.addAvailableSlot({
        serviceCenterId: centerId,
        date: blockForm.date,
        startTime: blockForm.startTime,
        endTime: blockForm.endTime
      });

      if (response?.success || response?.message === "Success") {
        alert("Slot blocked successfully!");
        setIsModalOpen(false);
        setTimeSlots(prev => [
          ...prev,
          { time: `${blockForm.startTime} - ${blockForm.endTime}`, status: "blocked" }
        ]);
      } else {
        alert(response?.message || "Failed to block slot. Slot might already be booked or blocked.");
      }
    } catch (err) {
      alert("Error blocking slot: " + err.message);
    }
  };

  useEffect(() => {

    setTimeSlots([
      { time: "09:00", status: "available" },
      { time: "09:30", status: "available" },
      { time: "10:00", status: "booked" },
      { time: "10:30", status: "available" },
      { time: "11:00", status: "booked" },
      { time: "11:30", status: "available" },
      { time: "12:00", status: "available" },
      { time: "12:30", status: "available" },
      { time: "13:00", status: "booked" },
      { time: "13:30", status: "booked" },
      { time: "14:00", status: "available" },
      { time: "14:30", status: "available" },
    ]);
  }, [selectedDate]);

  useEffect(() => {
    getMe()
      .then(res => {
        const name = res?.data?.fullName ?? res?.fullName;
        if (name) setOwnerName(name);
      })
      .catch(() => {});

    serviceCentersService.getMy()
      .then(res => {
        console.log("=== getMy API Response ===", res);
        const d = res?.data ?? res;
        if (d) {
          const name = d.name ?? d.Name;
          if (name) setCenterName(name);
          
          // Robust ID fallbacks to match any backend variation
          const cid = d.id ?? d.Id ?? d.serviceCenterId ?? d.ServiceCenterId ?? d.centerId ?? d.CenterId;
          if (cid) {
            setCenterId(cid);
            console.log("=== setCenterId Success ===", cid);
          } else {
            console.warn("=== Could not find ID in response ===", d);
          }
          
          const rawHours = d.operatingHours ?? d.OperatingHours;
          if (rawHours && rawHours.length) {
            setWorkingHours(rawHours.map(h => ({
              day: h.day ?? h.Day,
              isOpen: h.isOpen ?? h.IsOpen ?? false,
              start: h.start ?? h.Start ?? "09:00",
              end: h.end ?? h.End ?? "18:00"
            })));
          }
        }
      })
      .catch(err => {
        console.error("=== getMy API Error ===", err);
      });
  }, []);

  const handleToggleDay = (day) => {
    setWorkingHours(prev => prev.map(d => d.day === day ? { ...d, isOpen: !d.isOpen } : d));
  };

  const handleTimeChange = (day, type, value) => {
    setWorkingHours(prev => prev.map(d => d.day === day ? { ...d, [type]: value } : d));
  };

  const handleSaveHours = async () => {
    try {
      await serviceCentersService.updateOperatingHours(workingHours);
      alert("Hours saved successfully!");
    } catch (err) {
      alert("Failed to save: " + err.message);
    }
  };

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "'Inter', sans-serif" }}>
      <header style={{ height: "70px", background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ fontSize: "18px", fontWeight: 800 }}>{centerName}</div>
          <span style={{ background: "#E7F5EA", color: "#28A745", fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "6px" }}>● Live Backend API Connected</span>
        </div>
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
        <Sidebar active="Availability" />

        <main style={{ flex: 1, padding: "30px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginBottom: "30px" }}>
            
            <div style={{ background: COLORS.surface, padding: "30px", borderRadius: "20px", border: `1px solid ${COLORS.border}` }}>
              <h3 style={{ fontSize: "16px", fontWeight: 800, marginBottom: "25px" }}>Working hours</h3>
              {workingHours.map(dayData => (
                <DayRow key={dayData.day} dayData={dayData} onToggle={handleToggleDay} onTimeChange={handleTimeChange} />
              ))}
              <button onClick={handleSaveHours} style={{ width: "100%", background: COLORS.primary, color: "#FFF", border: "none", padding: "12px", borderRadius: "10px", fontWeight: 700, marginTop: "25px", cursor: "pointer" }}>Save hours</button>
            </div>

            <div style={{ background: COLORS.surface, padding: "30px", borderRadius: "20px", border: `1px solid ${COLORS.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 800 }}>March 2026</h3>
                <div style={{ display: "flex", gap: "15px", fontSize: "11px", color: COLORS.textLight, fontWeight: 600 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#28A745" }}></div> Bookings</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><div style={{ width: "8px", height: "8px", borderRadius: "50%", background: COLORS.primary }}></div> Blocked</div>
                </div>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "10px", textAlign: "center", fontSize: "12px" }}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d} style={{ fontWeight: 800, color: COLORS.textLight, marginBottom: "10px" }}>{d}</div>)}
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <div key={day} style={{ 
                    padding: "10px 0", borderRadius: "8px", cursor: "pointer", fontWeight: 600,
                    background: day === 16 ? COLORS.activeBg : (day === 19 || day === 21 ? "#FEEBEB" : "transparent"),
                    border: day === 16 ? `1px solid ${COLORS.primary}` : "none",
                    color: day === 16 || day === 19 || day === 21 ? COLORS.primary : COLORS.text
                  }}>
                    {day}
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                style={{ width: "100%", background: "transparent", color: COLORS.text, border: `1px solid ${COLORS.border}`, padding: "12px", borderRadius: "10px", fontWeight: 700, marginTop: "25px", cursor: "pointer" }}
              >
                + Block a date or range
              </button>
            </div>

          </div>

          {isModalOpen && (
            <div style={{
              position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
              background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 1000, backdropFilter: "blur(4px)"
            }}>
              <div style={{
                background: COLORS.surface, borderRadius: "20px", padding: "30px", width: "400px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)", border: `1px solid ${COLORS.border}`,
                position: "relative", color: COLORS.text
              }}>
                <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "20px" }}>Block a Time Slot</h3>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: COLORS.textLight }}>DATE</label>
                    <input 
                      type="date" 
                      value={blockForm.date} 
                      onChange={(e) => setBlockForm(prev => ({ ...prev, date: e.target.value }))}
                      style={{ padding: "10px", borderRadius: "10px", border: `1px solid ${COLORS.border}`, fontSize: "14px", fontFamily: "inherit" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "12px", fontWeight: 700, color: COLORS.textLight }}>START TIME</label>
                      <input 
                        type="time" 
                        value={blockForm.startTime} 
                        onChange={(e) => setBlockForm(prev => ({ ...prev, startTime: e.target.value }))}
                        style={{ padding: "10px", borderRadius: "10px", border: `1px solid ${COLORS.border}`, fontSize: "14px", fontFamily: "inherit" }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "12px", fontWeight: 700, color: COLORS.textLight }}>END TIME</label>
                      <input 
                        type="time" 
                        value={blockForm.endTime} 
                        onChange={(e) => setBlockForm(prev => ({ ...prev, endTime: e.target.value }))}
                        style={{ padding: "10px", borderRadius: "10px", border: `1px solid ${COLORS.border}`, fontSize: "14px", fontFamily: "inherit" }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "15px", marginTop: "30px" }}>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    style={{ flex: 1, background: "#F1F3F5", border: "none", padding: "12px", borderRadius: "10px", fontWeight: 700, cursor: "pointer", color: COLORS.textLight }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleBlockSlot}
                    style={{ flex: 1, background: COLORS.primary, border: "none", padding: "12px", borderRadius: "10px", fontWeight: 700, cursor: "pointer", color: "#FFF" }}
                  >
                    Block Slot
                  </button>
                </div>
              </div>
            </div>
          )}

          <div style={{ background: COLORS.surface, padding: "30px", borderRadius: "20px", border: `1px solid ${COLORS.border}` }}>
            <h3 style={{ fontSize: "16px", fontWeight: 800, marginBottom: "25px" }}>Time slots — {selectedDate}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px" }}>
              {timeSlots.map((slot, idx) => (
                <div key={idx} style={{ 
                  padding: "12px", borderRadius: "10px", fontSize: "12px", fontWeight: 700, textAlign: "center",
                  background: slot.status === "booked" ? COLORS.activeBg : (slot.status === "blocked" ? "#F1F3F5" : "#E7F5EA"),
                  color: slot.status === "booked" ? COLORS.primary : (slot.status === "blocked" ? "#ADB5BD" : "#28A745"),
                  border: `1px solid ${slot.status === "booked" ? COLORS.primary + "22" : (slot.status === "blocked" ? "#DEE2E6" : "#C3E6CB")}`
                }}>
                  {slot.time}
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
