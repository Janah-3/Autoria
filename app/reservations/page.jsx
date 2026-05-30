"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { reservationsService } from "@/lib/api/reservationsService";
import { getMe } from "@/lib/api/usersService";

const COLORS = {
  primary: "#E8272A",
  primaryDark: "#B81C1F",
  success: "#10B981",
  successDark: "#059669",
  bg: "#F4F7F6",
  white: "#FFFFFF",
  border: "#E5E7EB",
  text: "#111827",
  textLight: "#6B7280",
  warning: "#F59E0B",
  danger: "#EF4444",
};

// Safe mapper to handle both camelCase and PascalCase backend responses
const mapReservation = (item) => {
  if (!item) return null;
  return {
    id: item.id ?? item.Id,
    sparePartName: item.sparePartName ?? item.SparePartName ?? "Spare Part",
    serviceCenterName: item.serviceCenterName ?? item.ServiceCenterName ?? "Service Center",
    quantity: item.quantity ?? item.Quantity ?? 1,
    unitPrice: item.unitPrice ?? item.UnitPrice ?? 0,
    totalPrice: item.totalPrice ?? item.TotalPrice ?? 0,
    status: item.status ?? item.Status ?? "Reserved",
    bookingId: item.bookingId ?? item.BookingId,
    reservedAt: item.reservedAt ?? item.ReservedAt,
    expiresAt: item.expiresAt ?? item.ExpiresAt,
    pickedUpAt: item.pickedUpAt ?? item.PickedUpAt,
    cancelledAt: item.cancelledAt ?? item.CancelledAt,
    cancellationReason: item.cancellationReason ?? item.CancellationReason,
  };
};

export default function PartReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Role and User info
  const [isServiceCenter, setIsServiceCenter] = useState(false);
  const [userName, setUserName] = useState("User");

  // Filtering & Search
  const [activeTab, setActiveTab] = useState("All"); // All, Active, PickedUp, Cancelled, Expired
  const [searchQuery, setSearchQuery] = useState("");

  // Cancellation Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // Pick up action state
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        // 1. Fetch user profile to check authentication and get details
        const me = await getMe();
        if (me?.data) {
          setUserName(me.data.fullName || "User");
        } else {
          router.push("/login");
          return;
        }

        // 2. Read role from localStorage
        const role = localStorage.getItem("userRole") || "User";
        const isPartner = role === "ServiceCenter" || role === "Center" || role === "ServiceCenterOwner";
        setIsServiceCenter(isPartner);

        // 3. Fetch reservations based on role
        let res;
        if (isPartner) {
          res = await reservationsService.getServiceCenterReservations();
        } else {
          res = await reservationsService.getMyReservations();
        }

        const rawItems = res?.data?.items ?? res?.items ?? (Array.isArray(res?.data) ? res?.data : []) ?? [];
        const mappedItems = rawItems.map(mapReservation);
        setReservations(mappedItems);
      } catch (err) {
        console.error("Error loading reservations dashboard:", err);
        setError(err.message || "Failed to load reservations.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  // Helper to determine if an active reservation has expired
  const getEffectiveStatus = (res) => {
    if (res.status === "Reserved" && res.expiresAt) {
      const expiry = new Date(res.expiresAt);
      if (new Date() > expiry) {
        return "Expired";
      }
    }
    return res.status;
  };

  // Perform Pick Up Action
  const handleMarkAsPickedUp = async (id) => {
    if (processingId) return;
    setProcessingId(id);
    try {
      const res = await reservationsService.pickupReservation(id);
      if (res?.success || res?.success === undefined) {
        setReservations(prev => prev.map(r => r.id === id ? { ...r, status: "PickedUp", pickedUpAt: new Date().toISOString() } : r));
      } else {
        alert(res?.message || "Failed to mark as picked up.");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  // Trigger Cancel Dialog
  const openCancelDialog = (id) => {
    setCancelTargetId(id);
    setCancelReason("");
    setCancelModalOpen(true);
  };

  // Submit Cancel Action
  const handleCancelSubmit = async () => {
    if (!cancelTargetId || cancelling) return;
    setCancelling(true);
    try {
      const res = await reservationsService.cancelReservation(cancelTargetId, cancelReason || "Cancelled by user request");
      if (res?.success || res?.success === undefined) {
        setReservations(prev => prev.map(r => r.id === cancelTargetId ? { 
          ...r, 
          status: "Cancelled", 
          cancelledAt: new Date().toISOString(),
          cancellationReason: cancelReason || "Cancelled by user request" 
        } : r));
        setCancelModalOpen(false);
      } else {
        alert(res?.message || "Failed to cancel reservation.");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setCancelling(false);
      setCancelTargetId(null);
    }
  };

  // Formatting date strings
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  // Expiration countdown label helper
  const getExpirationLabel = (expiresAt) => {
    if (!expiresAt) return "";
    const diff = new Date(expiresAt) - new Date();
    if (diff <= 0) return "Expired";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m remaining`;
  };

  // Filtering logic
  const filteredReservations = reservations.filter(res => {
    const effectiveStatus = getEffectiveStatus(res);
    
    // Tab Filter
    if (activeTab === "Active" && effectiveStatus !== "Reserved") return false;
    if (activeTab === "PickedUp" && effectiveStatus !== "PickedUp") return false;
    if (activeTab === "Cancelled" && effectiveStatus !== "Cancelled") return false;
    if (activeTab === "Expired" && effectiveStatus !== "Expired") return false;

    // Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchPart = res.sparePartName.toLowerCase().includes(q);
      const matchCenter = res.serviceCenterName.toLowerCase().includes(q);
      return matchPart || matchCenter;
    }

    return true;
  });

  // Count active reservations for notification/summary
  const activeCount = reservations.filter(r => getEffectiveStatus(r) === "Reserved").length;

  const activeThemeColor = isServiceCenter ? COLORS.success : COLORS.primary;
  const activeThemeDark = isServiceCenter ? COLORS.successDark : COLORS.primaryDark;

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "sans-serif" }}>
      <Navbar />

      <main style={{ flex: 1, padding: "40px 5%" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          
          {/* Header Banner */}
          <div style={{
            background: `linear-gradient(135deg, ${activeThemeColor} 0%, ${activeThemeDark} 100%)`,
            borderRadius: "20px", padding: "40px", color: "#FFF", marginBottom: "40px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.08)", display: "flex", justifyContent: "space-between",
            alignItems: "center", flexWrap: "wrap", gap: "20px"
          }}>
            <div>
              <div style={{ fontSize: "12px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1.5px", opacity: 0.85, marginBottom: "8px" }}>
                {isServiceCenter ? "PARTNER DASHBOARD" : "CUSTOMER PORTAL"}
              </div>
              <h1 style={{ fontSize: "32px", fontWeight: "900", margin: 0, letterSpacing: "-0.5px" }}>
                {isServiceCenter ? "Spare Part Reservations" : "My Reservations"}
              </h1>
              <p style={{ fontSize: "15px", marginTop: "10px", opacity: 0.9, fontWeight: 500 }}>
                {isServiceCenter 
                  ? `Manage spare parts reserved by customers at your workshop. Current pending: ${activeCount} reservations.`
                  : `Review and track your reserved automotive genuine parts. You have ${activeCount} active bookings.`
                }
              </p>
            </div>
            {isServiceCenter && (
              <button 
                onClick={() => router.push("/booking-requests")}
                style={{
                  background: "#FFF", color: COLORS.success, border: "none", padding: "12px 24px",
                  borderRadius: "10px", fontWeight: "700", cursor: "pointer", fontSize: "14px",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
                }}
              >
                📬 Bookings Requests
              </button>
            )}
          </div>

          {error ? (
            <div style={{ background: "#FFF", padding: "40px", borderRadius: "15px", textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
              <div style={{ fontSize: "50px", marginBottom: "15px" }}>⚠️</div>
              <h3 style={{ color: COLORS.danger, marginBottom: "10px" }}>Authentication Error</h3>
              <p style={{ color: COLORS.textLight, marginBottom: "25px" }}>{error}</p>
              <button 
                onClick={() => router.push("/login")}
                style={{
                  background: COLORS.primary, color: "#FFF", border: "none", padding: "12px 30px",
                  borderRadius: "8px", fontWeight: "700", cursor: "pointer"
                }}
              >
                Log In
              </button>
            </div>
          ) : loading ? (
            <div style={{ textAlign: "center", padding: "100px 0", color: COLORS.textLight, fontSize: "16px", fontWeight: "600" }}>
              🔄 Loading reservations...
            </div>
          ) : (
            <>
              {/* Filter controls */}
              <div style={{ 
                display: "flex", justifyContent: "space-between", alignItems: "center", 
                marginBottom: "30px", flexWrap: "wrap", gap: "20px" 
              }}>
                <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "5px" }}>
                  {[
                    { id: "All", label: "All Reservations" },
                    { id: "Active", label: `Active (${activeCount})` },
                    { id: "PickedUp", label: "Picked Up" },
                    { id: "Cancelled", label: "Cancelled" },
                    { id: "Expired", label: "Expired" }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        padding: "10px 20px", borderRadius: "30px", border: "none",
                        fontSize: "13px", fontWeight: "700", cursor: "pointer",
                        background: activeTab === tab.id ? (isServiceCenter ? COLORS.success : COLORS.primary) : "#FFF",
                        color: activeTab === tab.id ? "#FFF" : COLORS.textLight,
                        boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                        border: `1px solid ${activeTab === tab.id ? "transparent" : COLORS.border}`,
                        transition: "all 0.2s"
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div style={{ position: "relative", width: "100%", maxWidth: "300px" }}>
                  <input
                    type="text"
                    placeholder="Search parts or centers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: "100%", padding: "12px 16px", borderRadius: "10px",
                      border: `1.5px solid ${COLORS.border}`, fontSize: "14px",
                      outline: "none", background: "#FFF", boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>

              {/* Reservations List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {filteredReservations.map(res => {
                  const effectiveStatus = getEffectiveStatus(res);
                  const isPending = effectiveStatus === "Reserved";

                  return (
                    <div 
                      key={res.id} 
                      style={{
                        background: "#FFF", borderRadius: "16px", padding: "25px",
                        border: `1px solid ${COLORS.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.01)",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        flexWrap: "wrap", gap: "20px"
                      }}
                    >
                      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                        {/* Icon Box */}
                        <div style={{
                          width: "55px", height: "55px", borderRadius: "12px",
                          background: isPending ? (isServiceCenter ? "#E7F5EA" : "#FEEBEB") : "#F3F4F6",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "24px"
                        }}>
                          ⚙️
                        </div>

                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                            <h3 style={{ fontSize: "18px", fontWeight: "800", margin: 0, color: COLORS.text }}>
                              {res.sparePartName}
                            </h3>
                            
                            {/* Status Tag */}
                            <span style={{
                              fontSize: "11px", fontWeight: "800", padding: "3px 10px", borderRadius: "12px",
                              background: effectiveStatus === "Reserved" ? "#FEF3C7" : 
                                          effectiveStatus === "PickedUp" ? "#E7F5EA" : 
                                          effectiveStatus === "Cancelled" ? "#FEEBEB" : "#F3F4F6",
                              color: effectiveStatus === "Reserved" ? COLORS.warning : 
                                     effectiveStatus === "PickedUp" ? COLORS.success : 
                                     effectiveStatus === "Cancelled" ? COLORS.danger : COLORS.textLight,
                            }}>
                              {effectiveStatus === "Reserved" ? "Reserved" :
                               effectiveStatus === "PickedUp" ? "Picked Up" :
                               effectiveStatus === "Cancelled" ? "Cancelled" : "Expired"}
                            </span>
                          </div>

                          <p style={{ fontSize: "14px", color: COLORS.textLight, marginTop: "6px" }}>
                            🏢 <strong>Workshop:</strong> {res.serviceCenterName}
                          </p>

                          <div style={{ display: "flex", gap: "15px", marginTop: "8px", flexWrap: "wrap", fontSize: "13px", color: COLORS.textLight }}>
                            <span>🔢 <strong>Quantity:</strong> {res.quantity} pcs</span>
                            <span>💰 <strong>Total Price:</strong> <strong style={{ color: isServiceCenter ? COLORS.success : COLORS.primary }}>EGP {res.totalPrice}</strong></span>
                            <span>📅 <strong>Date:</strong> {formatDate(res.reservedAt)}</span>
                          </div>

                          {effectiveStatus === "Cancelled" && res.cancellationReason && (
                            <div style={{
                              background: "#FAF5F5", padding: "10px 15px", borderRadius: "8px",
                              fontSize: "12px", color: COLORS.danger, marginTop: "12px",
                              borderLeft: `3px solid ${COLORS.danger}`
                            }}>
                              ❌ <strong>Cancellation Reason:</strong> "{res.cancellationReason}"
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Expiry / CTA Actions */}
                      <div style={{ textAlign: "right", minWidth: "200px" }}>
                        {isPending ? (
                          <>
                            <div style={{
                              background: "#FEF3C7", color: COLORS.warning, fontSize: "12px",
                              fontWeight: "700", padding: "6px 12px", borderRadius: "8px",
                              display: "inline-block", marginBottom: "15px"
                            }}>
                              ⏳ {getExpirationLabel(res.expiresAt)}
                            </div>
                            
                            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                              {isServiceCenter ? (
                                <>
                                  <button
                                    onClick={() => handleMarkAsPickedUp(res.id)}
                                    disabled={processingId === res.id}
                                    style={{
                                      background: COLORS.success, color: "#FFF", border: "none",
                                      padding: "10px 16px", borderRadius: "8px", fontSize: "13px",
                                      fontWeight: "700", cursor: "pointer"
                                    }}
                                  >
                                    {processingId === res.id ? "Processing..." : "✓ Picked Up"}
                                  </button>
                                  <button
                                    onClick={() => openCancelDialog(res.id)}
                                    style={{
                                      background: "transparent", color: COLORS.danger,
                                      border: `1.5px solid ${COLORS.danger}`, padding: "8px 16px",
                                      borderRadius: "8px", fontSize: "13px", fontWeight: "600",
                                      cursor: "pointer"
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => openCancelDialog(res.id)}
                                  style={{
                                    background: "transparent", color: COLORS.danger,
                                    border: `1.5px solid ${COLORS.danger}`, padding: "8px 16px",
                                    borderRadius: "8px", fontSize: "13px", fontWeight: "600",
                                    cursor: "pointer"
                                  }}
                                >
                                  Cancel Reservation
                                </button>
                              )}
                            </div>
                          </>
                        ) : (
                          <div style={{ color: COLORS.textLight, fontSize: "13px" }}>
                            {effectiveStatus === "PickedUp" && (
                              <span>Completed: {formatDate(res.pickedUpAt)}</span>
                            )}
                            {effectiveStatus === "Cancelled" && (
                              <span>Cancelled: {formatDate(res.cancelledAt)}</span>
                            )}
                            {effectiveStatus === "Expired" && (
                              <span style={{ color: COLORS.danger }}>Expired: Passed 24h limit</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {filteredReservations.length === 0 && (
                  <div style={{
                    background: "#FFF", borderRadius: "16px", padding: "80px 20px",
                    textAlign: "center", border: `1px solid ${COLORS.border}`
                  }}>
                    <span style={{ fontSize: "50px", display: "block", marginBottom: "15px" }}>📦</span>
                    <h3 style={{ fontSize: "18px", fontWeight: "700", color: COLORS.text, marginBottom: "8px" }}>
                      No Reservations Found
                    </h3>
                    <p style={{ color: COLORS.textLight, fontSize: "14px", margin: "0 auto", maxWidth: "400px" }}>
                      There are no reservations matching the filter "{activeTab}" or search criteria.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </main>

      {/* Cancellation Modal */}
      {cancelModalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0, 0, 0, 0.5)", display: "flex", justifyContent: "center",
          alignItems: "center", zIndex: 1000, backdropFilter: "blur(4px)"
        }}>
          <div style={{
            background: "#FFF", borderRadius: "16px", padding: "30px", width: "90%",
            maxWidth: "450px", boxShadow: "0 10px 25px rgba(0,0,0,0.15)"
          }}>
            <h3 style={{ fontSize: "20px", fontWeight: "800", color: COLORS.text, marginBottom: "10px" }}>
              Cancel Reservation
            </h3>
            <p style={{ fontSize: "14px", color: COLORS.textLight, marginBottom: "20px", lineHeight: "1.5" }}>
              Are you sure you want to cancel this reservation? The spare part will be returned to the workshop's active stock.
            </p>

            <div style={{ marginBottom: "25px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: COLORS.textLight, marginBottom: "8px" }}>
                REASON FOR CANCELLATION
              </label>
              <textarea
                rows="3"
                placeholder={isServiceCenter ? "e.g., Damaged stock or out of inventory" : "e.g., Decided to purchase later or wrong part size"}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{
                  width: "100%", padding: "12px", borderRadius: "10px",
                  border: `1.5px solid ${COLORS.border}`, fontSize: "14px",
                  outline: "none", resize: "none", boxSizing: "border-box",
                  fontFamily: "sans-serif"
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                disabled={cancelling}
                onClick={() => setCancelModalOpen(false)}
                style={{
                  flex: 1, padding: "12px", borderRadius: "10px", border: `1.5px solid ${COLORS.border}`,
                  background: "transparent", fontWeight: "600", fontSize: "14px", cursor: "pointer"
                }}
              >
                Keep Reservation
              </button>
              <button
                disabled={cancelling}
                onClick={handleCancelSubmit}
                style={{
                  flex: 1, padding: "12px", borderRadius: "10px", border: "none",
                  background: COLORS.danger, color: "#FFF", fontWeight: "700",
                  fontSize: "14px", cursor: "pointer"
                }}
              >
                {cancelling ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
