"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { bookingService, getBookingItems } from "@/lib/api/bookingsService";
import { serviceCentersService } from "@/lib/api/serviceCentersService";
import { getMe } from "@/lib/api/usersService";
import { paymentService } from "@/lib/api/paymentService";

const Toast = ({ show, type, message }) => (
  <div style={{
    position: "fixed", top: "24px", right: "24px", zIndex: 9999,
    transform: show ? "translateY(0)" : "translateY(-80px)",
    opacity: show ? 1 : 0,
    transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
    background: type === "success" ? "#10B981" : type === "error" ? "#EF4444" : "#F59E0B",
    color: "#fff", borderRadius: "12px", padding: "14px 20px",
    fontSize: "14px", fontWeight: 700, boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
    display: "flex", alignItems: "center", gap: "10px", maxWidth: "360px",
    pointerEvents: "none",
  }}>
    <span style={{ fontSize: "18px" }}>{type === "success" ? "✅" : type === "error" ? "❌" : "⚠️"}</span>
    {message}
  </div>
);

const COLORS = {
  primary: "#E8272A",
  bg: "#F8F9FA",
  surface: "#FFFFFF",
  border: "#E9ECEF",
  text: "#111111",
  textLight: "#6C757D",
  success: "#28A745",
  activeBg: "#FEEBEB",
};

const Sidebar = ({ active }) => (
  <aside style={{ width: "240px", background: COLORS.surface, borderRight: `1px solid ${COLORS.border}`, padding: "30px 0", height: "100vh", position: "sticky", top: 0 }}>
    <div style={{ padding: "0 25px", marginBottom: "40px" }}>
      <div style={{ fontSize: "11px", fontWeight: 800, color: COLORS.textLight, letterSpacing: "1.5px", marginBottom: "20px" }}>MANAGE</div>
      {[
        { id: "Dashboard", icon: "📊", path: "/service-center" },
        { id: "Analytics", icon: "📈", path: "/service-center/analytics" },
        { id: "Booking requests", icon: "📬", path: "/booking-requests" },
        { id: "Availability", icon: "📅", path: "/availability" },
        { id: "Spare parts", icon: "⚙️", path: "/spare-parts-inventory" },
        { id: "Part reservations", icon: "📦", path: "/reservations" },
        { id: "Reviews", icon: "⭐", path: "/reviews" },
        { id: "Business profile", icon: "🏢", path: "/service-center/edit" },
        { id: "Subscription", icon: "💎", path: "/service-center/subscription" },
        { id: "Promotions", icon: "📣", path: "/service-center/promotions" }
      ].map(item => (
        <Link href={item.path} key={item.id} style={{ textDecoration: "none" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "12px", padding: "12px 25px", margin: "4px 15px", borderRadius: "10px",
            fontSize: "14px", fontWeight: active === item.id ? 700 : 500, cursor: "pointer",
            background: active === item.id ? COLORS.activeBg : "transparent",
            color: active === item.id ? COLORS.primary : COLORS.textLight,
            marginLeft: active === item.id ? "0" : "15px",
            borderLeft: active === item.id ? `4px solid ${COLORS.primary}` : "none"
          }}>
            <span>{item.icon}</span> {item.id}
          </div>
        </Link>
      ))}
    </div>
  </aside>
);

const RequestCard = ({ request, onConfirm, onDecline, onCancel, onCreateInvoice, onConfirmCash, updateTrigger }) => {
  const customerName = request.customerName ?? request.CustomerName ?? "";
  const status = request.status ?? request.Status ?? "Pending";
  const carModel = request.carModel ?? request.CarModel ?? "";
  const serviceType = request.serviceType ?? request.ServiceType ?? "";
  const date = request.date ?? request.Date ?? "";
  const time = request.time ?? request.Time ?? request.timeSlot ?? "";
  const timeAgo = request.timeAgo ?? request.TimeAgo ?? "";
  const note = request.note ?? request.Note ?? "";
  const id = request.id ?? request.Id;
  // userId for "View profile" link
  const userId = request.userId ?? request.UserId ?? request.customerId ?? null;

  const [invoice, setInvoice] = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  useEffect(() => {
    setLoadingInvoice(true);
    paymentService.getInvoiceForBooking(id)
      .then(res => {
        if (res.success && res.data) {
          setInvoice(res.data);
        } else {
          setInvoice(null);
        }
      })
      .catch(() => setInvoice(null))
      .finally(() => setLoadingInvoice(false));
  }, [id, status, updateTrigger]);

  return (
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: "16px", padding: "25px", marginBottom: "15px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "15px" }}>
          <div style={{ width: "45px", height: "45px", borderRadius: "50%", background: "#F1F3F5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: COLORS.textLight }}>
            {customerName?.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h4 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>{customerName}</h4>
              <span style={{
                background: status === "Pending" ? COLORS.activeBg : (status === "Confirmed" ? "#E7F5EA" : "#F1F3F5"),
                color: status === "Pending" ? COLORS.primary : (status === "Confirmed" ? COLORS.success : COLORS.textLight),
                fontSize: "10px", fontWeight: 800, padding: "2px 10px", borderRadius: "10px"
              }}>{status}</span>

              {invoice && (
                <span style={{
                  background: invoice.status === "Paid" ? "#E7F5EA" : (invoice.status === "AwaitingCashConfirmation" ? "#FFF9DB" : "#E8F5E9"),
                  color: invoice.status === "Paid" ? COLORS.success : (invoice.status === "AwaitingCashConfirmation" ? "#F59F00" : COLORS.primary),
                  fontSize: "10px", fontWeight: 800, padding: "2px 10px", borderRadius: "10px"
                }}>
                  Invoice: {invoice.status === "AwaitingCashConfirmation" ? "Awaiting Cash" : invoice.status} (EGP {invoice.totalAmount})
                </span>
              )}
            </div>
            <p style={{ fontSize: "13px", color: COLORS.textLight, marginTop: "4px" }}>
              {carModel} • {serviceType} • Requested: <span style={{ color: COLORS.text, fontWeight: 600 }}>{date}, {time}</span>
            </p>
          </div>
        </div>
        <div style={{ fontSize: "12px", color: COLORS.textLight }}>{timeAgo}</div>
      </div>

      {note && (
        <div style={{ background: "#F8F9FA", padding: "12px 20px", borderRadius: "10px", fontSize: "13px", color: COLORS.textLight, marginBottom: "20px" }}>
          Note: "{note}"
        </div>
      )}

      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        {status === "Pending" ? (
          <>
            <button onClick={() => onConfirm(id)} style={{ background: COLORS.primary, color: "#FFF", border: "none", padding: "10px 25px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>Confirm</button>
            <button onClick={() => onDecline(id)} style={{ background: "transparent", color: COLORS.text, border: `1px solid ${COLORS.border}`, padding: "10px 25px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Decline</button>
          </>
        ) : (
          status === "Confirmed" && (
            <>
              <button onClick={() => onCancel(id)} style={{ background: "transparent", color: COLORS.text, border: `1px solid ${COLORS.border}`, padding: "10px 25px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Cancel booking</button>
              
              {!invoice && !loadingInvoice && (
                <button onClick={() => onCreateInvoice(id, customerName)} style={{ background: COLORS.success, color: "#FFF", border: "none", padding: "10px 25px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
                  Create Invoice
                </button>
              )}

              {invoice && invoice.status === "AwaitingCashConfirmation" && (
                <button onClick={() => onConfirmCash(invoice.id)} style={{ background: "#F59F00", color: "#FFF", border: "none", padding: "10px 25px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
                  Confirm Cash Received
                </button>
              )}
            </>
          )
        )}
        {userId ? (
          <Link
            href={`/user-profile?id=${userId}`}
            style={{ background: "transparent", color: COLORS.text, border: `1px solid ${COLORS.border}`, padding: "10px 25px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            👤 View client profile
          </Link>
        ) : (
          <button
            disabled
            style={{ background: "transparent", color: COLORS.textLight, border: `1px solid ${COLORS.border}`, padding: "10px 25px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "not-allowed", opacity: 0.5 }}
          >
            👤 View profile
          </button>
        )}
      </div>
    </div>
  );
};

export default function BookingRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [centerName, setCenterName] = useState("AutoCare Nasr City");
  const [ownerName, setOwnerName] = useState("Mohamed Hassan");

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [selectedClientName, setSelectedClientName] = useState("");
  const [invoiceItems, setInvoiceItems] = useState([{ description: "", unitPrice: "", quantity: "1" }]);
  const [invoiceNotes, setInvoiceNotes] = useState("");
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });
  const triggerToast = (message, type = "success") => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 4000);
  };

  useEffect(() => {
    getMe()
      .then(res => {
        const name = res?.data?.fullName ?? res?.fullName;
        if (name) setOwnerName(name);
      })
      .catch(() => {});

    serviceCentersService.getMy()
      .then(res => {
        const d = res?.data ?? res;
        if (d) {
          const name = d.name ?? d.Name;
          if (name) setCenterName(name);
        }
      })
      .catch(() => {});

    fetchBookings();
  }, []);

  const fetchBookings = async () => {
  setLoading(true);
  try {
    const res = await bookingService.getServiceCenterBookings();

    console.log("BOOKINGS RESPONSE", res);
    console.log("BOOKINGS ITEMS", getBookingItems(res));

    setRequests(getBookingItems(res));
  } catch (error) {
      console.error("Failed to load bookings:", error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const getRequestStatus = (r) => r?.status ?? r?.Status ?? "Pending";
  const getRequestId = (r) => r?.id ?? r?.Id;

  const handleConfirm = async (id) => {
    try {
      await bookingService.updateBookingStatus(id, "Confirmed");
      setRequests((prev) =>
        prev.map((r) =>
          getRequestId(r) === id ? { ...r, status: "Confirmed", Status: "Confirmed" } : r
        )
      );
    } catch (error) {
      triggerToast("Failed to confirm booking: " + error.message, "error");
    }
  };

  const handleDecline = async (id) => {
    try {
      await bookingService.updateBookingStatus(id, "Declined");
      setRequests((prev) =>
        prev.map((r) =>
          getRequestId(r) === id ? { ...r, status: "Declined", Status: "Declined" } : r
        )
      );
    } catch (error) {
      triggerToast("Failed to decline booking: " + error.message, "error");
    }
  };

  const handleOpenInvoiceModal = (bookingId, clientName) => {
    setSelectedBookingId(bookingId);
    setSelectedClientName(clientName);
    setInvoiceItems([{ description: "", unitPrice: "", quantity: "1" }]);
    setInvoiceNotes("");
    setShowInvoiceModal(true);
  };

  const handleAddInvoiceItem = () => {
    setInvoiceItems(prev => [...prev, { description: "", unitPrice: "", quantity: "1" }]);
  };

  const handleRemoveInvoiceItem = (index) => {
    setInvoiceItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    setInvoiceItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const handleIssueInvoice = async (e) => {
    e.preventDefault();
    const items = invoiceItems.map(item => ({
      description: item.description,
      unitPrice: parseFloat(item.unitPrice) || 0,
      quantity: parseInt(item.quantity, 10) || 1
    })).filter(i => i.description.trim());

    if (items.length === 0) {
      alert("Please add at least one valid invoice item.");
      return;
    }

    try {
      const res = await paymentService.createInvoice({
        bookingId: selectedBookingId,
        items,
        notes: invoiceNotes
      });
      if (res.success) {
        triggerToast("Invoice issued successfully!", "success");
        setShowInvoiceModal(false);
        setUpdateTrigger(prev => prev + 1);
      } else {
        triggerToast("Failed to create invoice: " + res.message, "error");
      }
    } catch (err) {
      triggerToast("Error: " + err.message, "error");
    }
  };

  const handleConfirmCash = async (invoiceId) => {
    try {
      const res = await paymentService.confirmCashReceived(invoiceId);
      if (res.success) {
        triggerToast("Cash payment confirmed successfully!", "success");
        setUpdateTrigger(prev => prev + 1);
      } else {
        triggerToast("Failed to confirm cash: " + res.message, "error");
      }
    } catch (err) {
      triggerToast("Error: " + err.message, "error");
    }
  };

  const filteredRequests = requests.filter(
    (r) => filter === "All" || getRequestStatus(r) === filter
  );

  useEffect(() => {
    const closeDropdown = () => setDropdownOpen(false);
    window.addEventListener("click", closeDropdown);
    return () => window.removeEventListener("click", closeDropdown);
  }, []);

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "'Inter', sans-serif" }}>
      <Toast show={toast.show} type={toast.type} message={toast.message} />
      <header style={{ height: "70px", background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ fontSize: "18px", fontWeight: 800 }}>{centerName}</div>
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
        <Sidebar active="Booking requests" />

        <main style={{ flex: 1, padding: "40px" }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
              <div style={{ display: "flex", gap: "10px" }}>
                {["All", "Pending", "Confirmed", "Declined"].map(tab => (
                  <div key={tab}
                    onClick={() => setFilter(tab)}
                    style={{
                      padding: "8px 20px", borderRadius: "20px", cursor: "pointer", fontSize: "13px", fontWeight: 600,
                      background: filter === tab ? COLORS.activeBg : "#FFF",
                      border: `1px solid ${filter === tab ? COLORS.primary : COLORS.border}`,
                      color: filter === tab ? COLORS.primary : COLORS.textLight,
                    }}>
                    {tab} {tab === "Pending" && <span style={{ opacity: 0.6 }}>{requests.filter((r) => getRequestStatus(r) === "Pending").length}</span>}
                  </div>
                ))}
              </div>
              <input placeholder="Search customer" style={{ padding: "10px 20px", borderRadius: "10px", border: `1px solid ${COLORS.border}`, fontSize: "13px", outline: "none", width: "250px" }} />
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "50px", color: COLORS.textLight }}>Loading requests...</div>
            ) : (
              filteredRequests.map((req) => (
                <RequestCard
                  key={getRequestId(req) ?? req.customerName}
                  request={req}
                  onConfirm={handleConfirm}
                  onDecline={handleDecline}
                  onCancel={handleDecline}
                  onCreateInvoice={handleOpenInvoiceModal}
                  onConfirmCash={handleConfirmCash}
                  updateTrigger={updateTrigger}
                />
              ))
            )}

            {!loading && filteredRequests.length === 0 && (
              <div style={{ textAlign: "center", padding: "100px", color: COLORS.textLight, background: "#FFF", borderRadius: "20px" }}>
                No booking requests found in this category.
              </div>
            )}

          </div>
        </main>
      </div>

      {showInvoiceModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 2000, padding: "20px"
        }}>
          <div style={{
            background: "#ffffff", borderRadius: "24px", width: "100%", maxWidth: "600px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.15)", padding: "40px", position: "relative",
            maxHeight: "90vh", overflowY: "auto"
          }}>
            <h2 style={{ fontSize: "22px", fontWeight: 900, marginBottom: "8px" }}>Issue Invoice</h2>
            <p style={{ fontSize: "14px", color: COLORS.textLight, marginBottom: "30px" }}>
              Client: <strong>{selectedClientName}</strong>
            </p>

            <form onSubmit={handleIssueInvoice} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "8px", borderBottom: `1px solid ${COLORS.border}` }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: COLORS.textLight }}>INVOICE LINE ITEMS</span>
                  <button type="button" onClick={handleAddInvoiceItem} style={{ background: "transparent", color: COLORS.primary, border: "none", fontSize: "13px", fontWeight: 800, cursor: "pointer" }}>
                    + Add Item
                  </button>
                </div>

                {invoiceItems.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <input
                      placeholder="e.g. Engine Oil 5W-30"
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                      required
                      style={{ flex: 3, padding: "10px 14px", borderRadius: "8px", border: `1.5px solid ${COLORS.border}`, fontSize: "13.5px" }}
                    />
                    <input
                      placeholder="Price"
                      type="number"
                      min="1"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(idx, "unitPrice", e.target.value)}
                      required
                      style={{ flex: 1.2, padding: "10px 14px", borderRadius: "8px", border: `1.5px solid ${COLORS.border}`, fontSize: "13.5px" }}
                    />
                    <input
                      placeholder="Qty"
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                      required
                      style={{ flex: 0.8, padding: "10px 14px", borderRadius: "8px", border: `1.5px solid ${COLORS.border}`, fontSize: "13.5px" }}
                    />
                    {invoiceItems.length > 1 && (
                      <button type="button" onClick={() => handleRemoveInvoiceItem(idx)} style={{ background: "transparent", border: "none", color: COLORS.primary, fontSize: "15px", cursor: "pointer", padding: "5px" }}>
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: 800, color: COLORS.textLight }}>Additional Notes / Summary</label>
                <textarea
                  placeholder="Spare parts specifications, work warranty details, etc."
                  value={invoiceNotes}
                  onChange={(e) => setInvoiceNotes(e.target.value)}
                  rows={2}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1.5px solid ${COLORS.border}`, fontSize: "13.5px", resize: "none" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: COLORS.bg, borderRadius: "12px", marginTop: "10px" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: COLORS.textLight }}>TOTAL AMOUNT</span>
                <span style={{ fontSize: "18px", fontWeight: 900, color: COLORS.primary }}>
                  EGP {invoiceItems.reduce((sum, item) => sum + ((parseFloat(item.unitPrice) || 0) * (parseInt(item.quantity, 10) || 1)), 0)}
                </span>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button type="submit" style={{ flex: 2, background: COLORS.primary, color: "#fff", border: "none", padding: "12px", borderRadius: "10px", fontSize: "14px", fontWeight: 800, cursor: "pointer" }}>
                  Issue Invoice
                </button>
                <button type="button" onClick={() => setShowInvoiceModal(false)} style={{ flex: 1, background: "transparent", color: COLORS.text, border: `1px solid ${COLORS.border}`, padding: "12px", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
