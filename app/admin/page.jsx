"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import userService from "@/lib/userService";
import { adminService } from "@/lib/api/adminService";
import { serviceCentersService, getServiceCenterItems } from "@/lib/api/serviceCentersService";
import { sparePartsService } from "@/lib/sparePartsService";
import { reportsService } from "@/lib/api/reportsService";
import { contactUsService } from "@/lib/api/contactUsService";

const COLORS = {
  primary: "#E8272A",
  primaryDark: "#B81C1F",
  bg: "#F8F9FA",
  sidebar: "#FFFFFF",
  border: "#E9ECEF",
  text: "#1A1A1A",
  textLight: "#6C757D",
  success: "#1B5E20", 
  warning: "#FFB800",
  white: "#FFFFFF"
};

const SHADOW = "0 4px 20px rgba(0,0,0,0.05)";

const Card = ({ title, children, badge, badgeColor, actionText, onAction }) => (
  <div style={{ background: COLORS.white, borderRadius: "16px", padding: "24px", border: `1px solid ${COLORS.border}`, boxShadow: SHADOW, height: "100%" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
      <div>
        <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0 }}>{title}</h3>
        {badge && <span style={{ background: badgeColor || "#F8F9FA", color: COLORS.primary, fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", marginTop: "4px", display: "inline-block" }}>{badge}</span>}
      </div>
      {actionText && <button onClick={onAction} style={{ background: "none", border: "none", color: COLORS.primary, fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>{actionText}</button>}
    </div>
    {children}
  </div>
);

const StatCard = ({ label, value, trend, trendUp }) => (
  <div style={{ background: COLORS.white, borderRadius: "16px", padding: "24px", border: `1px solid ${COLORS.border}`, flex: 1, boxShadow: SHADOW }}>
    <div style={{ color: COLORS.textLight, fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>{label}</div>
    <div style={{ fontSize: "28px", fontWeight: 900, marginBottom: "8px" }}>{value}</div>
    <div style={{ fontSize: "12px", color: trendUp ? COLORS.success : COLORS.textLight, fontWeight: 600 }}>
      {trendUp ? "↑" : "→"} {trend} <span style={{ color: COLORS.textLight, fontWeight: 400 }}>vs last month</span>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const closeDropdown = () => setDropdownOpen(false);
    window.addEventListener("click", closeDropdown);
    return () => window.removeEventListener("click", closeDropdown);
  }, []);

  const [sparePartsList, setSparePartsList] = useState([]);
  const [sparePartsLoading, setSparePartsLoading] = useState(false);
  const [sparePartsError, setSparePartsError] = useState("");
  const [sparePartsSearch, setSparePartsSearch] = useState("");
  const [sparePartsCategoryFilter, setSparePartsCategoryFilter] = useState("");
  const [sparePartsIncludeInactive, setSparePartsIncludeInactive] = useState(true);
  
  const [showAddPartModal, setShowAddPartModal] = useState(false);

  // User Reports State
  const [reportsList, setReportsList] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState("");
  const [reportsStatusFilter, setReportsStatusFilter] = useState("Pending"); // "Pending", "UnderReview", "Resolved", "Dismissed"
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportResolutionNote, setReportResolutionNote] = useState("");
  const [submittingResolution, setSubmittingResolution] = useState(false);

  // Contact Us Messages State
  const [contactMessagesList, setContactMessagesList] = useState([]);
  const [contactMessagesLoading, setContactMessagesLoading] = useState(false);
  const [contactMessagesError, setContactMessagesError] = useState("");
  const [contactMessagesFilter, setContactMessagesFilter] = useState("pending"); // "all", "pending", "resolved"
  const [selectedContactMessage, setSelectedContactMessage] = useState(null);
  const [showContactMessageModal, setShowContactMessageModal] = useState(false);
  const [contactResolutionNote, setContactResolutionNote] = useState("");
  const [submittingContactResolution, setSubmittingContactResolution] = useState(false);

  // Pending Service Center Verification Modal State
  const [selectedPendingCenter, setSelectedPendingCenter] = useState(null);
  const [showPendingCenterModal, setShowPendingCenterModal] = useState(false);

  // Live Service Center Moderation States
  const [centersList, setCentersList] = useState([]);
  const [centersLoading, setCentersLoading] = useState(false);
  const [centerVerificationFilter, setCenterVerificationFilter] = useState("Pending");

  const [newPartData, setNewPartData] = useState({
    name: "",
    category: "Brake Pads",
    brand: "",
    model: "",
    productionDate: "",
    partNumber: "",
    countryOfOrigin: "",
    manufacturer: "",
    description: "",
    imageUrls: [""]
  });

  useEffect(() => {
    userService.getCurrentUser()
      .then((user) => {
        if (user?.role !== "Admin") {
          router.replace("/"); // مش Admin → ارجع للـ home
        } else {
          setCurrentUser(user);
        }
      })
      .catch(() => {
        router.replace("/login"); // مش logged in → روح للـ login
      })
      .finally(() => setAuthChecked(true));
  }, [router]);


  // Live and empty states (preventing flash of mock/fake data on load)
  const [urgentReportsList, setUrgentReportsList] = useState([]);

  const [verificationQueue, setVerificationQueue] = useState([]);

  const [metrics, setMetrics] = useState(null);

  const fetchPendingCenters = () => {
    serviceCentersService.getPending()
      .then((res) => {
        const rawItems = res?.data?.items ?? res?.data ?? (Array.isArray(res) ? res : []);
        const items = getServiceCenterItems(res);
        if (items.length > 0) {
          setVerificationQueue(items.map((c, index) => ({
            id: c.id,
            name: c.name,
            city: c.governorate || c.city || "Cairo",
            date: c.submittedAt || rawItems[index]?.submittedAt || rawItems[index]?.SubmittedAt 
              ? new Date(c.submittedAt || rawItems[index]?.submittedAt || rawItems[index]?.SubmittedAt).toLocaleDateString() 
              : "12 Mar",
            raw: {
              ...rawItems[index],
              ...c,
              documents: rawItems[index]?.documents ?? rawItems[index]?.Documents ?? [],
              commercialRegNo: rawItems[index]?.commercialRegNo ?? rawItems[index]?.CommercialRegNo ?? "",
              taxCardNo: rawItems[index]?.taxCardNo ?? rawItems[index]?.TaxCardNo ?? "",
              ownerNationalId: rawItems[index]?.ownerNationalId ?? rawItems[index]?.OwnerNationalId ?? "",
              yearEstablished: rawItems[index]?.yearEstablished ?? rawItems[index]?.YearEstablished ?? 1900,
              numServiceBays: rawItems[index]?.numServiceBays ?? rawItems[index]?.NumServiceBays ?? 1,
              description: rawItems[index]?.description ?? rawItems[index]?.Description ?? ""
            }
          })));
        } else {
          setVerificationQueue([]);
        }
      })
      .catch(() => {});
  };

  const fetchMetrics = () => {
    adminService.getDashboard()
      .then((res) => {
        const m = res?.data?.metrics || res?.data?.Metrics || res?.Data?.metrics || res?.Data?.Metrics || res?.metrics || res?.Metrics;
        if (m) {
          setMetrics({
            totalUsers: m.totalUsers ?? m.TotalUsers ?? 0,
            bookingsThisMonth: m.bookingsThisMonth ?? m.BookingsThisMonth ?? 0,
            activeCenters: m.activeCenters ?? m.ActiveCenters ?? 0,
            avgRating: m.avgServiceCenterRating ?? m.AvgServiceCenterRating ?? m.avgRating ?? m.AvgRating ?? 4.3
          });
        }
      })
      .catch(() => {});
  };

  const fetchAllCenters = () => {
    setCentersLoading(true);
    serviceCentersService.getAll()
      .then((res) => {
        const items = getServiceCenterItems(res);
        const rawItems = res?.data?.items ?? res?.data ?? (Array.isArray(res) ? res : []);
        setCentersList(items.map((c, index) => ({
          ...c,
          raw: {
            ...rawItems[index],
            ...c,
            documents: rawItems[index]?.documents ?? rawItems[index]?.Documents ?? [],
            commercialRegNo: rawItems[index]?.commercialRegNo ?? rawItems[index]?.CommercialRegNo ?? "",
            taxCardNo: rawItems[index]?.taxCardNo ?? rawItems[index]?.TaxCardNo ?? "",
            ownerNationalId: rawItems[index]?.ownerNationalId ?? rawItems[index]?.OwnerNationalId ?? "",
            yearEstablished: rawItems[index]?.yearEstablished ?? rawItems[index]?.YearEstablished ?? 1900,
            numServiceBays: rawItems[index]?.numServiceBays ?? rawItems[index]?.NumServiceBays ?? 1,
            description: rawItems[index]?.description ?? rawItems[index]?.Description ?? ""
          }
        })));
      })
      .catch(() => {})
      .finally(() => setCentersLoading(false));
  };

  const fetchReports = (statusValue = reportsStatusFilter) => {
    setReportsLoading(true);
    setReportsError("");
    
    let statusParam = undefined;
    if (statusValue === "Pending") statusParam = 0;
    else if (statusValue === "UnderReview") statusParam = 1;
    else if (statusValue === "Resolved") statusParam = 2;
    else if (statusValue === "Dismissed") statusParam = 3;

    reportsService.getAll({ Status: statusParam, Page: 1, PageSize: 50 })
      .then((res) => {
        const items = res?.data?.items ?? res?.data ?? [];
        setReportsList(Array.isArray(items) ? items : []);
      })
      .catch((err) => {
        console.error("Failed to load reports:", err);
        setReportsError(err.message || "Failed to load reports from backend");
      })
      .finally(() => {
        setReportsLoading(false);
      });
  };

  const handleViewReport = (id) => {
    reportsService.getById(id)
      .then((res) => {
        if (res?.data) {
          setSelectedReport(res.data);
          setReportResolutionNote(res.data.resolutionNote || "");
          setShowReportModal(true);
        } else if (res) {
          setSelectedReport(res);
          setReportResolutionNote(res.resolutionNote || "");
          setShowReportModal(true);
        }
      })
      .catch((err) => {
        alert("Failed to load report details: " + err.message);
      });
  };

  const handleResolveReport = async (id, note) => {
    setSubmittingResolution(true);
    try {
      await reportsService.resolve(id, note || "Resolved by Admin");
      alert("Report resolved successfully!");
      setShowReportModal(false);
      fetchReports();
      fetchUrgentReports();
    } catch (err) {
      alert("Failed to resolve report: " + err.message);
    } finally {
      setSubmittingResolution(false);
    }
  };

  const handleDismissReport = async (id, note) => {
    setSubmittingResolution(true);
    try {
      await reportsService.dismiss(id, note || "Dismissed by Admin");
      alert("Report dismissed successfully!");
      setShowReportModal(false);
      fetchReports();
      fetchUrgentReports();
    } catch (err) {
      alert("Failed to dismiss report: " + err.message);
    } finally {
      setSubmittingResolution(false);
    }
  };

  const fetchContactMessages = (filterValue = contactMessagesFilter) => {
    setContactMessagesLoading(true);
    setContactMessagesError("");
    
    let params = {};
    if (filterValue === "pending") params.isResolved = "false";
    else if (filterValue === "resolved") params.isResolved = "true";

    contactUsService.getAdminMessages(params)
      .then((res) => {
        const items = res?.data?.items ?? res?.data ?? res ?? [];
        setContactMessagesList(Array.isArray(items) ? items : []);
      })
      .catch((err) => {
        console.error("Failed to load contact messages:", err);
        setContactMessagesError(err.message || "Failed to load messages from backend");
      })
      .finally(() => {
        setContactMessagesLoading(false);
      });
  };

  const fetchUrgentReports = () => {
    reportsService.getAll({ Status: 0, Page: 1, PageSize: 5 })
      .then((res) => {
        const items = res?.data?.items ?? res?.data ?? [];
        setUrgentReportsList(Array.isArray(items) ? items : []);
      })
      .catch((err) => {
        console.error("Failed to load urgent reports:", err);
      });
  };

  const handleViewContactMessage = (msg) => {
    setSelectedContactMessage(msg);
    setContactResolutionNote(msg.adminNotes || msg.AdminNotes || "");
    setShowContactMessageModal(true);
  };

  const handleResolveContactMessage = async (id, note) => {
    setSubmittingContactResolution(true);
    try {
      await contactUsService.resolveMessage(id, note || "Resolved by Admin");
      alert("Contact message marked as resolved successfully!");
      setShowContactMessageModal(false);
      fetchContactMessages();
    } catch (err) {
      alert("Failed to resolve message: " + err.message);
    } finally {
      setSubmittingContactResolution(false);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.role === "Admin") {
      fetchPendingCenters();
      fetchMetrics();
      fetchReports();
      fetchContactMessages();
      fetchUrgentReports();
      fetchAllCenters();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && currentUser.role === "Admin") {
      fetchReports();
    }
  }, [reportsStatusFilter]);

  useEffect(() => {
    if (currentUser && currentUser.role === "Admin") {
      fetchContactMessages();
    }
  }, [contactMessagesFilter]);

  const handleApprove = async (id) => {
    try {
      await serviceCentersService.approve(id);
      fetchPendingCenters();
      fetchAllCenters();
      fetchMetrics();
      alert("Center approved successfully!");
    } catch (err) {
      alert("Failed to approve: " + err.message);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    try {
      await serviceCentersService.reject(id, reason);
      fetchPendingCenters();
      fetchAllCenters();
      fetchMetrics();
      alert("Center rejected successfully!");
    } catch (err) {
      alert("Failed to reject: " + err.message);
    }
  };

  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [userBanFilter, setUserBanFilter] = useState("all");

  const fetchUsers = () => {
    if (!currentUser || currentUser.role !== "Admin") return;
    setUsersLoading(true);
    setUsersError("");
    
    let isBannedParam = null;
    if (userBanFilter === "banned") isBannedParam = true;
    if (userBanFilter === "active") isBannedParam = false;

    userService.getAllUsers({
      Search: userSearch,
      Role: userRoleFilter || undefined,
      IsBanned: isBannedParam,
    })
      .then((users) => {
        setUsersList(users || []);
      })
      .catch((err) => {
        setUsersError(err.message || "Failed to fetch users");
      })
      .finally(() => {
        setUsersLoading(false);
      });
  };

  useEffect(() => {
    if (currentUser && currentUser.role === "Admin") {
      fetchUsers();
    }
  }, [currentUser, activeTab, userSearch, userRoleFilter, userBanFilter]);

  const handleBanUser = (userId) => {
    if (!confirm("Are you sure you want to ban this user?")) return;
    userService.banUser(userId)
      .then(() => {
    
        setUsersList(prev => prev.map(u => u.id === userId ? { ...u, is_Banned: true } : u));
        fetchUsers();
      })
      .catch((err) => {
        alert(err.message || "Failed to ban user");
      });
  };

  const handleUnbanUser = (userId) => {
    if (!confirm("Are you sure you want to unban this user?")) return;
    userService.unbanUser(userId)
      .then(() => {
        // Optimistically update local state to show active status immediately
        setUsersList(prev => prev.map(u => u.id === userId ? { ...u, is_Banned: false } : u));
        fetchUsers();
      })
      .catch((err) => {
        alert(err.message || "Failed to unban user");
      });
  };

  const handleDeleteUser = (userId) => {
    if (!confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) return;
    userService.deleteUser(userId)
      .then(() => {
        fetchUsers();
      })
      .catch((err) => {
        alert(err.message || "Failed to delete user");
      });
  };

  const fetchSpareParts = () => {
    if (!currentUser || currentUser.role !== "Admin") return;
    setSparePartsLoading(true);
    setSparePartsError("");

    sparePartsService.getAdminSpareParts({
      q: sparePartsSearch,
      category: sparePartsCategoryFilter || undefined,
      includeInactive: sparePartsIncludeInactive
    })
      .then((res) => {
        const items = res?.items ?? res ?? [];
        setSparePartsList(items);
      })
      .catch((err) => {
        setSparePartsError(err.message || "Failed to fetch spare parts catalog");
      })
      .finally(() => {
        setSparePartsLoading(false);
      });
  };

  useEffect(() => {
    if (currentUser && currentUser.role === "Admin" && activeTab === "Spare Parts") {
      fetchSpareParts();
    }
  }, [currentUser, activeTab, sparePartsSearch, sparePartsCategoryFilter, sparePartsIncludeInactive]);

  const handleAddSparePart = async (e) => {
    e.preventDefault();
    if (!newPartData.name || !newPartData.brand || !newPartData.model || !newPartData.productionDate || !newPartData.partNumber || !newPartData.countryOfOrigin || !newPartData.manufacturer || !newPartData.description) {
      alert("Please fill all required fields");
      return;
    }
    try {
      const cleanedUrls = newPartData.imageUrls.filter(url => url.trim() !== "");
      
      const payload = {
        ...newPartData,
        imageUrls: cleanedUrls.length > 0 ? cleanedUrls : ["https://www.carparts.com/details/brake-pad-set/bosch/bsbp934"]
      };

      await sparePartsService.addSparePart(payload);
      alert("Spare part added successfully to catalog!");
      setShowAddPartModal(false);
      setNewPartData({
        name: "",
        category: "Brake Pads",
        brand: "",
        model: "",
        productionDate: "",
        partNumber: "",
        countryOfOrigin: "",
        manufacturer: "",
        description: "",
        imageUrls: [""]
      });
      fetchSpareParts();
    } catch (err) {
      alert("Failed to add spare part: " + err.message);
    }
  };

  const handleDeleteSparePart = async (id, name) => {
    if (!confirm(`Are you sure you want to permanently delete ${name} from the global catalog?`)) return;
    try {
      await sparePartsService.deleteSparePart(id);
      alert("Spare part deleted successfully!");
      fetchSpareParts();
    } catch (err) {
      alert("Failed to delete spare part: " + err.message);
    }
  };

  
  if (!authChecked || !currentUser) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#F8F9FA" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #eee", borderTopColor: "#E8272A", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 16px" }} />
          <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
          <p style={{ color: "#6C757D", fontSize: 14 }}>Checking permissions...</p>
        </div>
      </div>
    );
  }

  const adminName = currentUser?.fullName || "Admin";
  const adminInitials = adminName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div style={{ display: "flex", background: COLORS.bg, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .admin-btn { transition: opacity 0.2s ease; cursor: pointer; }
        .admin-btn:hover { opacity: 0.85; }
        .admin-btn:active { opacity: 0.7; }
        .back-link { transition: background 0.2s ease; }
        .back-link:hover { background: #f5f5f5 !important; }
      `}</style>
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} badges={{ verification: verificationQueue.length, reports: reportsList.filter(r => r.status === 0 || r.status === "Pending").length, users: usersList.length, spareParts: sparePartsList.length, contacts: contactMessagesList.filter(m => !m.isResolved && !m.IsResolved).length }} colors={COLORS} />

      <main style={{ flex: 1, padding: "40px", maxWidth: "1600px" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 900, margin: 0 }}>{activeTab}</h1>
            <p style={{ color: COLORS.textLight, fontSize: "14px", margin: "4px 0 0" }}>Sunday, 15 March 2026 • Platform management</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <Link href="/" className="back-link" style={{ color: COLORS.text, textDecoration: "none", fontWeight: 700, fontSize: "14px", padding: "8px 16px", borderRadius: "8px", border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: "6px" }}>
                <span>←</span> Back to Website
              </Link>
            </div>
            <div style={{ position: "relative" }}>
              <div 
                onClick={(e) => { e.stopPropagation(); setDropdownOpen(!dropdownOpen); }}
                style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", userSelect: "none" }}
              >
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "14px", fontWeight: 800 }}>{adminName}</div>
                  <div style={{ fontSize: "11px", color: COLORS.textLight }}>{currentUser?.role || "Admin"}</div>
                </div>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: COLORS.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>{adminInitials}</div>
                <span style={{ fontSize: "9px", color: COLORS.textLight }}>▼</span>
              </div>

              {dropdownOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0,
                  background: "#ffffff", borderRadius: "10px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.15)", border: `1px solid ${COLORS.border}`,
                  minWidth: "160px", overflow: "hidden", zIndex: 1000
                }}>
                  <Link href="/admin" style={{ display: "block", padding: "10px 16px", color: COLORS.text, fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>
                     Admin Dashboard
                  </Link>
                  <div style={{ borderTop: `1px solid ${COLORS.border}` }} />
                  <Link href="/logout" style={{ display: "block", padding: "10px 16px", color: COLORS.primary, fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>
                     Log Out <span className="logout-arrow">→</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard View */}
        {activeTab === "Dashboard" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            {/* Stats Row */}
            <div style={{ display: "flex", gap: "24px" }}>
              <StatCard label="Total Users" value={metrics?.totalUsers !== undefined ? String(metrics.totalUsers) : "12,480"} trend="8% vs last month" trendUp />
              <StatCard label="Total Bookings" value={metrics?.bookingsThisMonth !== undefined ? String(metrics.bookingsThisMonth) : "3,241"} trend="12% vs last month" trendUp />
              <StatCard label="Active Centers" value={metrics?.activeCenters !== undefined ? String(metrics.activeCenters) : "184"} trend="3% vs last month" trendUp />
              <StatCard label="Avg. Platform Rating" value={metrics?.avgRating !== undefined ? String(metrics.avgRating) : "4.3"} trend="Stable" />
            </div>

            {/* Premium Welcome Banner */}
            <div style={{ 
              background: "linear-gradient(135deg, #E8272A 0%, #B81C1F 100%)", 
              padding: "40px", 
              borderRadius: "20px", 
              color: "#ffffff",
              boxShadow: "0 10px 30px rgba(232, 39, 42, 0.15)",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              {/* Subtle abstract background graphics */}
              <div style={{
                position: "absolute",
                top: "-20%",
                right: "-10%",
                width: "300px",
                height: "300px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.05)",
                pointerEvents: "none"
              }} />
              <div style={{
                position: "absolute",
                bottom: "-30%",
                right: "10%",
                width: "200px",
                height: "200px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.03)",
                pointerEvents: "none"
              }} />

              <div style={{ position: "relative", zIndex: 1 }}>
                <h2 style={{ fontSize: "28px", fontWeight: 900, margin: "0 0 8px 0", letterSpacing: "-0.5px" }}>Welcome Back, {adminName || "Admin"}! 👋</h2>
                <p style={{ fontSize: "15px", opacity: 0.9, margin: 0, maxWidth: "600px", lineHeight: "1.6" }}>
                  Here is what's happening on Autoria today. You have <strong style={{ textDecoration: "underline" }}>{verificationQueue.length} pending service centers</strong> waiting for verification. Keep the directory verified and pristine!
                </p>
              </div>

              {/* Dynamic Action Trigger from the banner */}
              {verificationQueue.length > 0 && (
                <button 
                  onClick={() => setActiveTab("Center verification")} 
                  className="admin-btn"
                  style={{
                    position: "relative",
                    zIndex: 1,
                    background: "#ffffff",
                    color: "#E8272A",
                    border: "none",
                    padding: "14px 28px",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    whiteSpace: "nowrap",
                    transition: "transform 0.2s, opacity 0.2s"
                  }}
                >
                  Verify Centers Now <span style={{ fontSize: "16px" }}>→</span>
                </button>
              )}
            </div>

            <div>
              <Card title="Urgent Reports" badge="Action Required" actionText="Manage reports" onAction={() => setActiveTab("User reports")}>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {urgentReportsList.slice(0, 3).map(rep => {
                    const targetTypeName = rep.targetType === 0 || rep.targetType === "ServiceCenter" ? "ServiceCenter" : (rep.targetType === 1 || rep.targetType === "Review" ? "Review" : "issue");
                    const reasonName = rep.reason === 0 || rep.reason === "Spam" ? "Spam" : (rep.reason === 1 || rep.reason === "Inappropriate" ? "Inappropriate" : (rep.reason === 2 || rep.reason === "Fake" ? "Fake" : (rep.reason === 3 || rep.reason === "Offensive" ? "Offensive" : "Other")));
                    return (
                      <div key={rep.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", background: "#FFF1F1", borderRadius: "8px", border: `1px solid #FFDCDC` }}>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 800 }}>{reasonName}</div>
                          <div style={{ fontSize: "11px", color: COLORS.textLight }}>Target: {targetTypeName}</div>
                        </div>
                        <div style={{ color: COLORS.primary, fontWeight: 900, fontSize: "10px" }}>PENDING REPORT</div>
                      </div>
                    );
                  })}
                  {urgentReportsList.length === 0 && (
                    <div style={{ padding: "20px", textAlign: "center", color: COLORS.textLight, fontSize: "13px" }}>
                      ✅ No pending reports at the moment.
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Verification Row */}
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              <Card title="Pending Center Verifications" badge={`${verificationQueue.length} pending`}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ background: COLORS.bg }}>
                    <tr style={{ textAlign: "left", color: COLORS.textLight, fontSize: "10px", fontWeight: 800 }}>
                      <th style={{ padding: "12px 16px" }}>CENTER NAME</th>
                      <th style={{ padding: "12px 16px" }}>CITY</th>
                      <th style={{ padding: "12px 16px" }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verificationQueue.map(c => (
                      <tr key={c.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                        <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: 700 }}>{c.name}</td>
                        <td style={{ padding: "14px 16px", fontSize: "12px" }}>{c.city}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <button 
                            onClick={() => {
                              setSelectedPendingCenter(c);
                              setShowPendingCenterModal(true);
                            }} 
                            style={{ background: COLORS.success, color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                          >
                            Verify Now
                          </button>
                        </td>
                      </tr>
                    ))}
                    {verificationQueue.length === 0 && (
                      <tr>
                        <td colSpan="3" style={{ padding: "30px", textAlign: "center", color: COLORS.textLight, fontSize: "13px" }}>
                          ✅ No pending service centers to verify.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Card>
            </div>
          </div>
        )}

        {/* User Reports */}
        {activeTab === "User reports" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <p style={{ color: COLORS.textLight, fontSize: "14px", margin: 0 }}>Manage reports submitted by users about service centers, reviews, or issues.</p>
            </div>
            
            <div style={{ display: "flex", gap: "20px" }}>
              <StatCard label="Open reports" value={reportsList.filter(r => r.status === 0 || r.status === "Pending" || r.status === 1 || r.status === "UnderReview").length.toString()} trend="Needs moderation" trendUp={false} />
              <StatCard label="Resolved reports" value={reportsList.filter(r => r.status === 2 || r.status === "Resolved").length.toString()} trend="Addressed issues" trendUp />
              <StatCard label="Dismissed reports" value={reportsList.filter(r => r.status === 3 || r.status === "Dismissed").length.toString()} trend="Archived items" />
              <StatCard label="Total Reports" value={reportsList.length.toString()} trend="Platform items" />
            </div>

            {/* Filter buttons */}
            <div style={{ display: "flex", gap: "10px" }}>
              {[
                { value: "Pending", label: `Open (${reportsList.filter(r => r.status === 0 || r.status === "Pending").length})` },
                { value: "UnderReview", label: `Under Review (${reportsList.filter(r => r.status === 1 || r.status === "UnderReview").length})` },
                { value: "Resolved", label: `Resolved (${reportsList.filter(r => r.status === 2 || r.status === "Resolved").length})` },
                { value: "Dismissed", label: `Dismissed (${reportsList.filter(r => r.status === 3 || r.status === "Dismissed").length})` }
              ].map(statusTab => (
                <button 
                  key={statusTab.value} 
                  onClick={() => setReportsStatusFilter(statusTab.value)}
                  style={{ 
                    background: reportsStatusFilter === statusTab.value ? "#FFF1F1" : "#fff", 
                    color: reportsStatusFilter === statusTab.value ? COLORS.primary : COLORS.textLight, 
                    border: `1px solid ${reportsStatusFilter === statusTab.value ? COLORS.primary : COLORS.border}`, 
                    padding: "8px 24px", 
                    borderRadius: "20px", 
                    fontSize: "13px", 
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  {statusTab.label}
                </button>
              ))}
            </div>

            {reportsError && (
              <div style={{ background: "#FEE2E2", color: COLORS.primary, padding: "12px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 700 }}>
                ⚠️ Error: {reportsError}
              </div>
            )}

            <div style={{ background: COLORS.white, borderRadius: "16px", padding: "0", border: `1px solid ${COLORS.border}`, overflow: "hidden", boxShadow: SHADOW }}>
              {reportsLoading ? (
                <div style={{ padding: "60px", textAlign: "center" }}>
                  <div style={{ width: 30, height: 30, border: "3px solid #eee", borderTopColor: COLORS.primary, borderRadius: "50%", margin: "0 auto 16px" }} />
                  <div style={{ color: COLORS.textLight, fontSize: "14px" }}>Loading reports...</div>
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ background: COLORS.bg }}>
                    <tr style={{ textAlign: "left", color: COLORS.textLight, fontSize: "11px", fontWeight: 800 }}>
                      <th style={{ padding: "16px 24px" }}>REASON</th>
                      <th style={{ padding: "16px 24px" }}>TARGET TYPE</th>
                      <th style={{ padding: "16px 24px" }}>REPORTER</th>
                      <th style={{ padding: "16px 24px" }}>SUBMITTED DATE</th>
                      <th style={{ padding: "16px 24px" }}>STATUS</th>
                      <th style={{ padding: "16px 24px", textAlign: "right" }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportsList
                      .filter(r => {
                        let matchesStatus = false;
                        if (reportsStatusFilter === "Pending") matchesStatus = r.status === 0 || r.status === "Pending";
                        else if (reportsStatusFilter === "UnderReview") matchesStatus = r.status === 1 || r.status === "UnderReview";
                        else if (reportsStatusFilter === "Resolved") matchesStatus = r.status === 2 || r.status === "Resolved";
                        else if (reportsStatusFilter === "Dismissed") matchesStatus = r.status === 3 || r.status === "Dismissed";
                        return matchesStatus;
                      })
                      .map(rep => {
                        const targetTypeName = rep.targetType === 0 || rep.targetType === "ServiceCenter" ? "ServiceCenter" : (rep.targetType === 1 || rep.targetType === "Review" ? "Review" : (rep.targetType === 2 || rep.targetType === "issue" ? "issue" : rep.targetType));
                        const reasonName = rep.reason === 0 || rep.reason === "Spam" ? "Spam" : (rep.reason === 1 || rep.reason === "Inappropriate" ? "Inappropriate" : (rep.reason === 2 || rep.reason === "Fake" ? "Fake" : (rep.reason === 3 || rep.reason === "Offensive" ? "Offensive" : (rep.reason === 4 || rep.reason === "Other" ? "Other" : rep.reason))));
                        return (
                          <tr key={rep.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                            <td style={{ padding: "16px 24px" }}>
                              <div style={{ fontSize: "14px", fontWeight: 800, color: COLORS.text }}>{reasonName}</div>
                            </td>
                            <td style={{ padding: "16px 24px" }}>
                              <span style={{ background: "#F1F5F9", color: "#475569", fontSize: "11px", fontWeight: 800, padding: "4px 8px", borderRadius: "4px" }}>
                                {targetTypeName}
                              </span>
                            </td>
                            <td style={{ padding: "16px 24px", fontSize: "13px", fontWeight: 600 }}>{rep.reporterName || "User"}</td>
                            <td style={{ padding: "16px 24px", fontSize: "12px", color: COLORS.textLight }}>
                              {rep.createdAt ? new Date(rep.createdAt).toLocaleDateString() : "—"}
                            </td>
                            <td style={{ padding: "16px 24px" }}>
                              <span style={{ 
                                color: rep.status === 0 || rep.status === "Pending" ? COLORS.primary : (rep.status === 2 || rep.status === "Resolved" ? COLORS.success : COLORS.textLight), 
                                background: rep.status === 0 || rep.status === "Pending" ? "#FFF1F1" : (rep.status === 2 || rep.status === "Resolved" ? "#E8F5E9" : "#F3F4F6"), 
                                padding: "4px 8px", 
                                borderRadius: "4px", 
                                fontSize: "11px", 
                                fontWeight: 800 
                              }}>
                                {rep.status === 0 || rep.status === "Pending" ? "Pending" : (rep.status === 1 || rep.status === "UnderReview" ? "UnderReview" : (rep.status === 2 || rep.status === "Resolved" ? "Resolved" : (rep.status === 3 || rep.status === "Dismissed" ? "Dismissed" : rep.status)))}
                              </span>
                            </td>
                            <td style={{ padding: "16px 24px", textAlign: "right" }}>
                              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                <button 
                                  onClick={() => handleViewReport(rep.id)}
                                  className="admin-btn" 
                                  style={{ background: "transparent", border: `1px solid ${COLORS.border}`, padding: "6px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 800, cursor: "pointer" }}
                                >
                                  Review Details
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    {reportsList.filter(r => {
                      let matchesStatus = false;
                      if (reportsStatusFilter === "Pending") matchesStatus = r.status === 0 || r.status === "Pending";
                      else if (reportsStatusFilter === "UnderReview") matchesStatus = r.status === 1 || r.status === "UnderReview";
                      else if (reportsStatusFilter === "Resolved") matchesStatus = r.status === 2 || r.status === "Resolved";
                      else if (reportsStatusFilter === "Dismissed") matchesStatus = r.status === 3 || r.status === "Dismissed";
                      return matchesStatus;
                    }).length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ padding: "60px", textAlign: "center", color: COLORS.textLight }}>
                          <div style={{ fontSize: "40px", marginBottom: "10px" }}>🚩</div>
                          <div style={{ fontWeight: 800 }}>No reports found</div>
                          <div style={{ fontSize: "12px" }}>There are no {reportsStatusFilter.toLowerCase()} reports at this moment.</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Center Verification */}
        {activeTab === "Center verification" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <p style={{ color: COLORS.textLight, fontSize: "14px", margin: 0 }}>Review and manage service center registration requests and legal documents.</p>
            
            <div style={{ display: "flex", gap: "20px" }}>
              <StatCard label="Pending Requests" value={verificationQueue.length.toString()} trend="Needs review" trendUp={false} />
              <StatCard label="Verified Centers" value={centersList.filter(c => c.approvalStatus === 1 || c.approvalStatus === "Approved" || c.ApprovalStatus === 1 || c.ApprovalStatus === "Approved").length.toString()} trend="Active centers" trendUp={true} />
              <StatCard label="Rejected Centers" value={centersList.filter(c => c.approvalStatus === 2 || c.approvalStatus === "Rejected" || c.ApprovalStatus === 2 || c.ApprovalStatus === "Rejected").length.toString()} trend="Failed verification" />
              <StatCard label="Total Registered" value={centersList.length.toString()} trend="Platform workshops" trendUp={true} />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              {[
                { value: "Pending", label: `Pending Requests (${verificationQueue.length})` },
                { value: "Verified", label: `Verified Centers (${centersList.filter(c => c.approvalStatus === 1 || c.approvalStatus === "Approved" || c.ApprovalStatus === 1 || c.ApprovalStatus === "Approved").length})` },
                { value: "Rejected", label: `Rejected (${centersList.filter(c => c.approvalStatus === 2 || c.approvalStatus === "Rejected" || c.ApprovalStatus === 2 || c.ApprovalStatus === "Rejected").length})` }
              ].map(subTab => (
                <button 
                  key={subTab.value}
                  onClick={() => setCenterVerificationFilter(subTab.value)}
                  style={{ 
                    background: centerVerificationFilter === subTab.value ? "#E8F5E9" : "#fff", 
                    color: centerVerificationFilter === subTab.value ? COLORS.success : COLORS.textLight, 
                    border: `1px solid ${centerVerificationFilter === subTab.value ? COLORS.success : COLORS.border}`, 
                    padding: "8px 24px", 
                    borderRadius: "20px", 
                    fontSize: "13px", 
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  {subTab.label}
                </button>
              ))}
            </div>

            <div style={{ background: COLORS.white, borderRadius: "16px", padding: "0", border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
              {centersLoading && centersList.length === 0 ? (
                <div style={{ padding: "60px", textAlign: "center" }}>
                  <div style={{ width: 30, height: 30, border: "3px solid #eee", borderTopColor: COLORS.primary, borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 16px" }} />
                  <div style={{ color: COLORS.textLight, fontSize: "14px" }}>Loading centers...</div>
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ background: COLORS.bg }}>
                    <tr style={{ textAlign: "left", color: COLORS.textLight, fontSize: "11px", fontWeight: 800 }}>
                      <th style={{ padding: "16px 24px" }}>CENTER DETAILS</th>
                      <th style={{ padding: "16px 24px" }}>CITY / LOCATION</th>
                      <th style={{ padding: "16px 24px" }}>STATUS DETAIL</th>
                      <th style={{ padding: "16px 24px" }}>DOCS STATUS</th>
                      <th style={{ padding: "16px 24px" }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {centerVerificationFilter === "Pending" && verificationQueue.map(item => (
                      <tr key={item.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                        <td style={{ padding: "20px 24px" }}>
                          <div style={{ fontSize: "14px", fontWeight: 800, marginBottom: "4px" }}>{item.name}</div>
                          <div style={{ fontSize: "11px", color: COLORS.primary, fontWeight: 700 }}>Full-Service Workshop</div>
                        </td>
                        <td style={{ padding: "20px 24px", fontSize: "13px" }}>{item.city}</td>
                        <td style={{ padding: "20px 24px", fontSize: "12px", color: COLORS.textLight }}>{item.date} · 10:30 AM</td>
                        <td style={{ padding: "20px 24px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: COLORS.success }}></span>
                            <span style={{ fontSize: "12px", fontWeight: 700, color: COLORS.text }}>3/3 Files Uploaded</span>
                          </div>
                          <div style={{ fontSize: "10px", color: COLORS.textLight, marginTop: "4px" }}>Trade License, Tax ID, ID</div>
                        </td>
                        <td style={{ padding: "20px 24px" }}>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button 
                              onClick={() => {
                                setSelectedPendingCenter(item);
                                setShowPendingCenterModal(true);
                              }}
                              className="admin-btn" 
                              style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, padding: "8px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: 800 }}
                            >
                              View Docs
                            </button>
                            <button onClick={() => handleApprove(item.id)} className="admin-btn" style={{ background: COLORS.success, color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontSize: "11px", fontWeight: 800 }}>Approve</button>
                            <button onClick={() => handleReject(item.id)} className="admin-btn" style={{ background: COLORS.primary, color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontSize: "11px", fontWeight: 800 }}>Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {centerVerificationFilter === "Verified" && centersList
                      .filter(c => c.approvalStatus === 1 || c.approvalStatus === "Approved" || c.ApprovalStatus === 1 || c.ApprovalStatus === "Approved")
                      .map(item => (
                        <tr key={item.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                          <td style={{ padding: "20px 24px" }}>
                            <div style={{ fontSize: "14px", fontWeight: 800, marginBottom: "4px" }}>{item.name}</div>
                            <div style={{ fontSize: "11px", color: COLORS.success, fontWeight: 700 }}>Verified & Active</div>
                          </td>
                          <td style={{ padding: "20px 24px", fontSize: "13px" }}>{item.city}</td>
                          <td style={{ padding: "20px 24px", fontSize: "12px", color: COLORS.textLight }}>Approved</td>
                          <td style={{ padding: "20px 24px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: COLORS.success }}></span>
                              <span style={{ fontSize: "12px", fontWeight: 700, color: COLORS.success }}>Active Workshop</span>
                            </div>
                          </td>
                          <td style={{ padding: "20px 24px" }}>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button 
                                onClick={() => {
                                  setSelectedPendingCenter(item);
                                  setShowPendingCenterModal(true);
                                }}
                                className="admin-btn" 
                                style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, padding: "8px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: 800 }}
                              >
                                View Details
                              </button>
                              <button onClick={() => handleReject(item.id)} className="admin-btn" style={{ background: COLORS.primary, color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontSize: "11px", fontWeight: 800 }}>Reject / Revoke</button>
                            </div>
                          </td>
                        </tr>
                      ))}

                    {centerVerificationFilter === "Rejected" && centersList
                      .filter(c => c.approvalStatus === 2 || c.approvalStatus === "Rejected" || c.ApprovalStatus === 2 || c.ApprovalStatus === "Rejected")
                      .map(item => (
                        <tr key={item.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                          <td style={{ padding: "20px 24px" }}>
                            <div style={{ fontSize: "14px", fontWeight: 800, marginBottom: "4px" }}>{item.name}</div>
                            <div style={{ fontSize: "11px", color: COLORS.primary, fontWeight: 700 }}>Rejected / Suspended</div>
                          </td>
                          <td style={{ padding: "20px 24px", fontSize: "13px" }}>{item.city}</td>
                          <td style={{ padding: "20px 24px", fontSize: "12.5px", color: COLORS.textLight }} title={item.raw?.rejectionReason || item.raw?.RejectionReason}>
                            Reason: {item.raw?.rejectionReason || item.raw?.RejectionReason || "No reason given"}
                          </td>
                          <td style={{ padding: "20px 24px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: COLORS.primary }}></span>
                              <span style={{ fontSize: "12px", fontWeight: 700, color: COLORS.primary }}>Rejected Application</span>
                            </div>
                          </td>
                          <td style={{ padding: "20px 24px" }}>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button 
                                onClick={() => {
                                  setSelectedPendingCenter(item);
                                  setShowPendingCenterModal(true);
                                }}
                                className="admin-btn" 
                                style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, padding: "8px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: 800 }}
                              >
                                View Details
                              </button>
                              <button onClick={() => handleApprove(item.id)} className="admin-btn" style={{ background: COLORS.success, color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontSize: "11px", fontWeight: 800 }}>Approve / Verify</button>
                            </div>
                          </td>
                        </tr>
                      ))}

                    {/* Empty states */}
                    {centerVerificationFilter === "Pending" && verificationQueue.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ padding: "60px", textAlign: "center", color: COLORS.textLight }}>
                          <div style={{ fontSize: "40px", marginBottom: "10px" }}>✅</div>
                          <div style={{ fontWeight: 800 }}>No pending requests</div>
                          <div style={{ fontSize: "12px" }}>All service center registrations have been processed.</div>
                        </td>
                      </tr>
                    )}

                    {centerVerificationFilter === "Verified" && centersList.filter(c => c.approvalStatus === 1 || c.approvalStatus === "Approved" || c.ApprovalStatus === 1 || c.ApprovalStatus === "Approved").length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ padding: "60px", textAlign: "center", color: COLORS.textLight }}>
                          <div style={{ fontSize: "40px", marginBottom: "10px" }}>🛡️</div>
                          <div style={{ fontWeight: 800 }}>No verified centers yet</div>
                          <div style={{ fontSize: "12px" }}>Approved centers will appear in this list.</div>
                        </td>
                      </tr>
                    )}

                    {centerVerificationFilter === "Rejected" && centersList.filter(c => c.approvalStatus === 2 || c.approvalStatus === "Rejected" || c.ApprovalStatus === 2 || c.ApprovalStatus === "Rejected").length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ padding: "60px", textAlign: "center", color: COLORS.textLight }}>
                          <div style={{ fontSize: "40px", marginBottom: "10px" }}>🚩</div>
                          <div style={{ fontWeight: 800 }}>No rejected centers</div>
                          <div style={{ fontSize: "12px" }}>Suspended or rejected centers will appear in this list.</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ background: "#F1F5F9", padding: "16px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ fontSize: "20px" }}>ℹ️</div>
              <div style={{ fontSize: "12px", color: "#475569", lineHeight: 1.5 }}>
                <strong>Tip:</strong> You can verify the workshop's authenticity by checking their Trade License against the official government database before approving. 
                Approved centers will gain the <span style={{ color: COLORS.primary, fontWeight: 700 }}>"Verified"</span> badge on their profile.
              </div>
            </div>
          </div>
        )}

        {/* User Management View */}
        {activeTab === "User management" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <p style={{ color: COLORS.textLight, fontSize: "14px", margin: 0 }}>View, moderate, and manage roles or ban status for platform users.</p>
            </div>
            
            <div style={{ display: "flex", gap: "20px" }}>
              <StatCard label="Total Registered" value={usersList.length.toString()} trend="Platform users" trendUp />
              <StatCard label="Banned Users" value={usersList.filter(u => u.is_Banned).length.toString()} trend="Restricted access" />
              <StatCard label="Admins" value={usersList.filter(u => u.role === "Admin").length.toString()} trend="Full privileges" />
              <StatCard label="Service Owners" value={usersList.filter(u => u.role === "ServiceCenterOwner" || u.role === "Mechanic").length.toString()} trend="Business accounts" />
            </div>

            {/* Filter controls */}
            <div style={{ display: "flex", gap: "12px", background: COLORS.white, padding: "16px", borderRadius: "12px", border: `1px solid ${COLORS.border}`, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <input 
                  type="text"
                  placeholder="Search users by name or email..." 
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{ width: "100%", padding: "10px 16px", borderRadius: "8px", border: `1px solid ${COLORS.border}`, fontSize: "14px" }} 
                />
              </div>

              <div style={{ minWidth: "150px" }}>
                <select 
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  style={{ width: "100%", padding: "10px 16px", borderRadius: "8px", border: `1px solid ${COLORS.border}`, fontSize: "14px", background: "#fff" }}
                >
                  <option value="">All Roles</option>
                  <option value="Admin">Admin</option>
                  <option value="User">User</option>
                  <option value="ServiceCenterOwner">Service Center Owner</option>
                  <option value="Mechanic">Mechanic</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "6px" }}>
                {[
                  { value: "all", label: "All Users" },
                  { value: "active", label: "Active" },
                  { value: "banned", label: "Banned" }
                ].map(tab => (
                  <button 
                    key={tab.value}
                    onClick={() => setUserBanFilter(tab.value)}
                    style={{ 
                      background: userBanFilter === tab.value ? "#FFF1F1" : "#fff", 
                      color: userBanFilter === tab.value ? COLORS.primary : COLORS.textLight, 
                      border: `1px solid ${userBanFilter === tab.value ? COLORS.primary : COLORS.border}`, 
                      padding: "8px 16px", 
                      borderRadius: "20px", 
                      fontSize: "13px", 
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {usersError && (
              <div style={{ background: "#FEE2E2", color: COLORS.primary, padding: "12px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 700 }}>
                ⚠️ Error: {usersError}
              </div>
            )}

            <div style={{ background: COLORS.white, borderRadius: "16px", padding: "0", border: `1px solid ${COLORS.border}`, overflow: "hidden", boxShadow: SHADOW }}>
              {usersLoading ? (
                <div style={{ padding: "60px", textAlign: "center" }}>
                  <div style={{ width: 30, height: 30, border: "3px solid #eee", borderTopColor: COLORS.primary, borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 16px" }} />
                  <div style={{ color: COLORS.textLight, fontSize: "14px" }}>Loading users...</div>
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ background: COLORS.bg }}>
                    <tr style={{ textAlign: "left", color: COLORS.textLight, fontSize: "11px", fontWeight: 800 }}>
                      <th style={{ padding: "16px 24px" }}>USER DETAILS</th>
                      <th style={{ padding: "16px 24px" }}>EMAIL</th>
                      <th style={{ padding: "16px 24px" }}>PHONE</th>
                      <th style={{ padding: "16px 24px" }}>ROLE</th>
                      <th style={{ padding: "16px 24px" }}>STATUS</th>
                      <th style={{ padding: "16px 24px", textAlign: "right" }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map(user => {
                      const initials = user.fullName
                        ? user.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
                        : "U";
                      return (
                        <tr key={user.id} style={{ borderTop: `1px solid ${COLORS.border}`, transition: "background 0.2s" }} className="user-row">
                          <td style={{ padding: "16px 24px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <div style={{ 
                                width: "36px", 
                                height: "36px", 
                                borderRadius: "50%", 
                                background: user.is_Banned ? "#F3F4F6" : "#FEEBEB", 
                                color: user.is_Banned ? "#9CA3AF" : COLORS.primary, 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center", 
                                fontWeight: 800,
                                fontSize: "13px"
                              }}>
                                {initials}
                              </div>
                              <div>
                                <div style={{ fontSize: "14px", fontWeight: 800, color: user.is_Banned ? "#9CA3AF" : COLORS.text }}>
                                  {user.fullName || "Unnamed User"}
                                </div>
                                <div style={{ fontSize: "11px", color: COLORS.textLight }}>ID: {user.id}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "16px 24px", fontSize: "13px", color: user.is_Banned ? "#9CA3AF" : COLORS.text }}>
                            {user.email}
                          </td>
                          <td style={{ padding: "16px 24px", fontSize: "13px", color: user.is_Banned ? "#9CA3AF" : COLORS.text }}>
                            {user.phoneNumber || "—"}
                          </td>
                          <td style={{ padding: "16px 24px" }}>
                            <span style={{ 
                              background: user.role === "Admin" ? "#FFF1F1" : (user.role === "ServiceCenterOwner" ? "#E0F2FE" : "#F3F4F6"), 
                              color: user.role === "Admin" ? COLORS.primary : (user.role === "ServiceCenterOwner" ? "#0369A1" : "#4B5563"), 
                              padding: "4px 8px", 
                              borderRadius: "4px", 
                              fontSize: "11px", 
                              fontWeight: 800 
                            }}>
                              {user.role}
                            </span>
                          </td>
                          <td style={{ padding: "16px 24px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ 
                                width: "8px", 
                                height: "8px", 
                                borderRadius: "50%", 
                                background: user.is_Banned ? COLORS.primary : COLORS.success 
                              }} />
                              <span style={{ 
                                fontSize: "12px", 
                                fontWeight: 700, 
                                color: user.is_Banned ? COLORS.primary : COLORS.success 
                              }}>
                                {user.is_Banned ? "Banned" : "Active"}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: "16px 24px", textAlign: "right" }}>
                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                              {user.is_Banned ? (
                                <button 
                                  onClick={() => handleUnbanUser(user.id)}
                                  className="admin-btn" 
                                  style={{ background: "#E8F5E9", color: COLORS.success, border: `1px solid ${COLORS.success}`, padding: "6px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 800 }}
                                >
                                  Unban
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleBanUser(user.id)}
                                  className="admin-btn" 
                                  style={{ background: "#FFF1F1", color: COLORS.primary, border: `1px solid ${COLORS.primary}`, padding: "6px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 800 }}
                                >
                                  Ban
                                </button>
                              )}
                              <button 
                                onClick={() => handleDeleteUser(user.id)}
                                className="admin-btn" 
                                style={{ background: "#F3F4F6", color: "#4B5563", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 800 }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {usersList.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ padding: "60px", textAlign: "center", color: COLORS.textLight }}>
                          <div style={{ fontSize: "40px", marginBottom: "10px" }}>👥</div>
                          <div style={{ fontWeight: 800 }}>No users found</div>
                          <div style={{ fontSize: "12px" }}>Try adjusting your search query or filters.</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
          </div>
        </div>
      )}

        {/* Spare Parts Catalog Management View */}
        {activeTab === "Spare Parts" && (
           <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
               <p style={{ color: COLORS.textLight, fontSize: "14px", margin: 0 }}>View, update, add, or delete genuine parts inside the platform global catalog.</p>
               <button 
                 onClick={() => setShowAddPartModal(true)}
                 style={{ background: COLORS.primary, color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 700, fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
               >
                 <span>+</span> Add Spare Part
               </button>
             </div>

             {/* Metrics row */}
             <div style={{ display: "flex", gap: "20px" }}>
               <StatCard label="Total Catalog Parts" value={sparePartsList.length.toString()} trend="Platform items" trendUp />
               <StatCard label="Unique Categories" value={new Set(sparePartsList.map(p => p.category)).size.toString()} trend="Different types" />
               <StatCard label="Unassigned Parts" value={sparePartsList.filter(p => p.totalAvailableCenters === 0).length.toString()} trend="No center offers them" />
               <StatCard label="Active Status" value="Healthy" trend="100% working API" trendUp />
             </div>

             {/* Search and Filters panel */}
             <div style={{ display: "flex", gap: "12px", background: COLORS.white, padding: "16px", borderRadius: "12px", border: `1px solid ${COLORS.border}`, alignItems: "center", flexWrap: "wrap" }}>
               <div style={{ flex: 1, minWidth: "200px" }}>
                 <input 
                   type="text"
                   placeholder="Search parts by name, SKU, serial, brand or model..." 
                   value={sparePartsSearch}
                   onChange={(e) => setSparePartsSearch(e.target.value)}
                   style={{ width: "100%", padding: "10px 16px", borderRadius: "8px", border: `1px solid ${COLORS.border}`, fontSize: "14px" }} 
                 />
               </div>

               <div style={{ minWidth: "180px" }}>
                 <select 
                   value={sparePartsCategoryFilter}
                   onChange={(e) => setSparePartsCategoryFilter(e.target.value)}
                   style={{ width: "100%", padding: "10px 16px", borderRadius: "8px", border: `1px solid ${COLORS.border}`, fontSize: "14px", background: "#fff" }}
                 >
                   <option value="">All Categories</option>
                   <option value="Brake Pads">Brake Pads</option>
                   <option value="Engine Parts">Engine Parts</option>
                   <option value="Filters">Filters</option>
                   <option value="Electrical">Electrical</option>
                   <option value="Suspension">Suspension</option>
                   <option value="Exhaust">Exhaust</option>
                 </select>
               </div>

               <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 8px" }}>
                 <label style={{ fontSize: "13px", fontWeight: 700, color: COLORS.textLight, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                   <input 
                     type="checkbox"
                     checked={sparePartsIncludeInactive}
                     onChange={(e) => setSparePartsIncludeInactive(e.target.checked)}
                     style={{ width: "16px", height: "16px", accentColor: COLORS.primary }}
                   />
                   Include Inactive
                 </label>
               </div>
             </div>

             {/* Error notification */}
             {sparePartsError && (
               <div style={{ background: "#FEE2E2", color: COLORS.primary, padding: "12px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 700 }}>
                 ⚠️ Error: {sparePartsError}
               </div>
             )}

             {/* Catalog Table */}
             <div style={{ background: COLORS.white, borderRadius: "16px", padding: "0", border: `1px solid ${COLORS.border}`, overflow: "hidden", boxShadow: SHADOW }}>
               {sparePartsLoading ? (
                 <div style={{ padding: "60px", textAlign: "center" }}>
                   <div style={{ width: 30, height: 30, border: "3px solid #eee", borderTopColor: COLORS.primary, borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 16px" }} />
                   <div style={{ color: COLORS.textLight, fontSize: "14px" }}>Loading catalog...</div>
                 </div>
               ) : (
                 <table style={{ width: "100%", borderCollapse: "collapse" }}>
                   <thead style={{ background: COLORS.bg }}>
                     <tr style={{ textAlign: "left", color: COLORS.textLight, fontSize: "11px", fontWeight: 800 }}>
                       <th style={{ padding: "16px 24px" }}>PART DETAILS</th>
                       <th style={{ padding: "16px 24px" }}>CATEGORY</th>
                       <th style={{ padding: "16px 24px" }}>PART NUMBER / SKU</th>
                       <th style={{ padding: "16px 24px" }}>ORIGIN & BRAND</th>
                       <th style={{ padding: "16px 24px" }}>AVAILABILITY</th>
                       <th style={{ padding: "16px 24px" }}>ACTIONS</th>
                     </tr>
                   </thead>
                   <tbody>
                     {sparePartsList.map(part => (
                       <tr key={part.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                         <td style={{ padding: "18px 24px", display: "flex", alignItems: "center", gap: "12px" }}>
                           <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: COLORS.bg, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                             {part.thumbnailUrl ? (
                               <img src={part.thumbnailUrl} alt={part.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                             ) : (
                               <span style={{ fontSize: "18px" }}>📦</span>
                             )}
                           </div>
                           <div>
                             <div style={{ fontSize: "14px", fontWeight: 800, color: COLORS.text }}>{part.name}</div>
                             <div style={{ fontSize: "11px", color: COLORS.textLight }}>Model: {part.model}</div>
                           </div>
                         </td>
                         <td style={{ padding: "18px 24px" }}>
                           <span style={{ background: "#F1F5F9", color: "#475569", fontSize: "11px", fontWeight: 800, padding: "4px 8px", borderRadius: "4px" }}>{part.category}</span>
                         </td>
                         <td style={{ padding: "18px 24px", fontSize: "13px", fontWeight: 600, fontFamily: "monospace" }}>{part.partNumber || "—"}</td>
                         <td style={{ padding: "18px 24px" }}>
                           <div style={{ fontSize: "13px", fontWeight: 700 }}>{part.brand}</div>
                           <div style={{ fontSize: "11px", color: COLORS.textLight }}>Made in {part.countryOfOrigin || "Germany"}</div>
                         </td>
                         <td style={{ padding: "18px 24px" }}>
                           <span style={{ color: part.totalAvailableCenters > 0 ? COLORS.success : COLORS.primary, fontWeight: 700, fontSize: "12px" }}>
                             {part.totalAvailableCenters > 0 ? `✓ Available at ${part.totalAvailableCenters} centers` : "✗ No centers offering this part"}
                           </span>
                         </td>
                         <td style={{ padding: "18px 24px" }}>
                           <button 
                             onClick={() => handleDeleteSparePart(part.id, part.name)}
                             className="admin-btn"
                             style={{ background: "#FFF1F1", color: COLORS.primary, border: `1px solid #FFDCDC`, padding: "6px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 800, cursor: "pointer" }}
                           >
                             Delete Part
                           </button>
                         </td>
                       </tr>
                     ))}
                     {sparePartsList.length === 0 && (
                       <tr>
                         <td colSpan="6" style={{ padding: "60px", textAlign: "center", color: COLORS.textLight }}>
                           <div style={{ fontSize: "40px", marginBottom: "10px" }}>📦</div>
                           <div style={{ fontWeight: 800 }}>No parts found in platform catalog</div>
                           <div style={{ fontSize: "12px" }}>Create one by clicking the "Add Spare Part" button above.</div>
                         </td>
                       </tr>
                     )}
                   </tbody>
                 </table>
               )}
             </div>

             {/* Add Spare Part Modal Overlay */}
             {showAddPartModal && (
               <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, animation: "fadeIn 0.2s ease-out" }}>
                 <div style={{ background: COLORS.white, borderRadius: "20px", width: "100%", maxWidth: "700px", padding: "32px", border: `1px solid ${COLORS.border}`, boxShadow: "0 20px 50px rgba(15, 23, 42, 0.15)", maxHeight: "90vh", overflowY: "auto", position: "relative" }}>
                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: `1.5px solid ${COLORS.border}`, paddingBottom: "12px" }}>
                     <h3 style={{ fontSize: "18px", fontWeight: 800, color: COLORS.text, margin: 0 }}>Add New Catalog Spare Part</h3>
                     <button 
                       onClick={() => setShowAddPartModal(false)}
                       style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: COLORS.textLight }}
                     >
                       ✕
                     </button>
                   </div>
                   
                   <form onSubmit={handleAddSparePart} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                     <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                       <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                         <label style={{ fontSize: "12px", fontWeight: 700, color: COLORS.textLight }}>Part Name / Model</label>
                         <input 
                           type="text"
                           value={newPartData.name}
                           onChange={(e) => setNewPartData({ ...newPartData, name: e.target.value })}
                           placeholder="e.g. QuietCast Rear Brake Pad"
                           required
                           style={{ padding: "10px 14px", border: `1.5px solid ${COLORS.border}`, borderRadius: "8px", fontSize: "13.5px" }}
                         />
                       </div>

                       <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                         <label style={{ fontSize: "12px", fontWeight: 700, color: COLORS.textLight }}>Category</label>
                         <select
                           value={newPartData.category}
                           onChange={(e) => setNewPartData({ ...newPartData, category: e.target.value })}
                           style={{ padding: "10px 14px", border: `1.5px solid ${COLORS.border}`, borderRadius: "8px", fontSize: "13.5px", background: "#fff" }}
                         >
                           <option value="Brake Pads">Brake Pads</option>
                           <option value="Engine Parts">Engine Parts</option>
                           <option value="Filters">Filters</option>
                           <option value="Electrical">Electrical</option>
                           <option value="Suspension">Suspension</option>
                           <option value="Exhaust">Exhaust</option>
                         </select>
                       </div>
                     </div>

                     <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                       <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                         <label style={{ fontSize: "12px", fontWeight: 700, color: COLORS.textLight }}>Brand</label>
                         <input 
                           type="text"
                           value={newPartData.brand}
                           onChange={(e) => setNewPartData({ ...newPartData, brand: e.target.value })}
                           placeholder="e.g. Bosch"
                           required
                           style={{ padding: "10px 14px", border: `1.5px solid ${COLORS.border}`, borderRadius: "8px", fontSize: "13.5px" }}
                         />
                       </div>

                       <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                         <label style={{ fontSize: "12px", fontWeight: 700, color: COLORS.textLight }}>Vehicle Model Code</label>
                         <input 
                           type="text"
                           value={newPartData.model}
                           onChange={(e) => setNewPartData({ ...newPartData, model: e.target.value })}
                           placeholder="e.g. BP934 / Corolla"
                           required
                           style={{ padding: "10px 14px", border: `1.5px solid ${COLORS.border}`, borderRadius: "8px", fontSize: "13.5px" }}
                         />
                       </div>
                     </div>

                     <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                       <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                         <label style={{ fontSize: "12px", fontWeight: 700, color: COLORS.textLight }}>Production Date</label>
                         <input 
                           type="date"
                           value={newPartData.productionDate}
                           onChange={(e) => setNewPartData({ ...newPartData, productionDate: e.target.value })}
                           required
                           style={{ padding: "10px 14px", border: `1.5px solid ${COLORS.border}`, borderRadius: "8px", fontSize: "13.5px" }}
                         />
                       </div>

                       <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                         <label style={{ fontSize: "12px", fontWeight: 700, color: COLORS.textLight }}>Part SKU / Serial Number</label>
                         <input 
                           type="text"
                           value={newPartData.partNumber}
                           onChange={(e) => setNewPartData({ ...newPartData, partNumber: e.target.value })}
                           placeholder="e.g. BP934-SKU"
                           required
                           style={{ padding: "10px 14px", border: `1.5px solid ${COLORS.border}`, borderRadius: "8px", fontSize: "13.5px" }}
                         />
                       </div>
                     </div>

                     <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                       <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                         <label style={{ fontSize: "12px", fontWeight: 700, color: COLORS.textLight }}>Country of Origin</label>
                         <input 
                           type="text"
                           value={newPartData.countryOfOrigin}
                           onChange={(e) => setNewPartData({ ...newPartData, countryOfOrigin: e.target.value })}
                           placeholder="e.g. Germany"
                           required
                           style={{ padding: "10px 14px", border: `1.5px solid ${COLORS.border}`, borderRadius: "8px", fontSize: "13.5px" }}
                         />
                       </div>

                       <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                         <label style={{ fontSize: "12px", fontWeight: 700, color: COLORS.textLight }}>Manufacturer</label>
                         <input 
                           type="text"
                           value={newPartData.manufacturer}
                           onChange={(e) => setNewPartData({ ...newPartData, manufacturer: e.target.value })}
                           placeholder="e.g. Robert Bosch GmbH"
                           required
                           style={{ padding: "10px 14px", border: `1.5px solid ${COLORS.border}`, borderRadius: "8px", fontSize: "13.5px" }}
                         />
                       </div>
                     </div>

                     <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                       <label style={{ fontSize: "12px", fontWeight: 700, color: COLORS.textLight }}>Part Description</label>
                       <textarea 
                         value={newPartData.description}
                         onChange={(e) => setNewPartData({ ...newPartData, description: e.target.value })}
                         placeholder="Describe technical specs, compatibility, and fitment..."
                         required
                         rows="3"
                         style={{ padding: "10px 14px", border: `1.5px solid ${COLORS.border}`, borderRadius: "8px", fontSize: "13.5px", fontFamily: "inherit" }}
                       />
                     </div>

                     {/* Image URLs input list */}
                     <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                       <label style={{ fontSize: "12px", fontWeight: 700, color: COLORS.textLight, display: "flex", justifyContent: "space-between" }}>
                         <span>Part Image URLs</span>
                         <button 
                           type="button" 
                           onClick={() => setNewPartData({ ...newPartData, imageUrls: [...newPartData.imageUrls, ""] })}
                           style={{ background: "none", border: "none", color: COLORS.primary, fontSize: "11px", fontWeight: 800, cursor: "pointer" }}
                         >
                           + Add Another URL
                         </button>
                       </label>
                       {newPartData.imageUrls.map((url, idx) => (
                         <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                           <input 
                             type="url"
                             value={url}
                             onChange={(e) => {
                               const updated = [...newPartData.imageUrls];
                               updated[idx] = e.target.value;
                               setNewPartData({ ...newPartData, imageUrls: updated });
                             }}
                             placeholder="https://example.com/image.jpg"
                             style={{ flex: 1, padding: "9px 12px", border: `1.5px solid ${COLORS.border}`, borderRadius: "8px", fontSize: "13px" }}
                           />
                           {newPartData.imageUrls.length > 1 && (
                             <button 
                               type="button"
                               onClick={() => {
                                 const updated = newPartData.imageUrls.filter((_, i) => i !== idx);
                                 setNewPartData({ ...newPartData, imageUrls: updated });
                               }}
                               style={{ background: "#FEE2E2", border: "none", color: COLORS.primary, width: "32px", height: "32px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}
                             >
                               ✕
                             </button>
                           )}
                         </div>
                       ))}
                     </div>

                     <div style={{ display: "flex", gap: "12px", marginTop: "16px", borderTop: `1.5px solid ${COLORS.border}`, paddingTop: "16px", justifyContent: "flex-end" }}>
                       <button 
                         type="button" 
                         onClick={() => setShowAddPartModal(false)}
                         style={{ background: "#F3F4F6", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 700, fontSize: "13px", color: COLORS.textLight, cursor: "pointer" }}
                       >
                         Cancel
                       </button>
                       <button 
                         type="submit" 
                         style={{ background: "#10B981", color: "#fff", border: "none", padding: "10px 24px", borderRadius: "8px", fontWeight: 800, fontSize: "13px", cursor: "pointer" }}
                       >
                         Save Part Catalog
                       </button>
                     </div>
                   </form>
                 </div>
               </div>
             )}
            </div>
         )}

        {/* Contact Messages View */}
        {activeTab === "Contact Messages" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <p style={{ color: COLORS.textLight, fontSize: "14px", margin: 0 }}>View, moderate, and resolve support/inquiry messages submitted by users.</p>
            </div>
            
            <div style={{ display: "flex", gap: "20px" }}>
              <StatCard label="Pending Messages" value={contactMessagesList.filter(m => !m.isResolved && !m.IsResolved).length.toString()} trend="Requires response" trendUp={false} />
              <StatCard label="Resolved Messages" value={contactMessagesList.filter(m => m.isResolved || m.IsResolved).length.toString()} trend="Closed support" trendUp />
              <StatCard label="Total Messages" value={contactMessagesList.length.toString()} trend="All inquiries" />
              <StatCard label="System SLA" value="100%" trend="Active backend" trendUp />
            </div>

            {/* Filter controls */}
            <div style={{ display: "flex", gap: "6px" }}>
              {[
                { value: "all", label: `All Inquiries (${contactMessagesList.length})` },
                { value: "pending", label: `Pending (${contactMessagesList.filter(m => !m.isResolved && !m.IsResolved).length})` },
                { value: "resolved", label: `Resolved (${contactMessagesList.filter(m => m.isResolved || m.IsResolved).length})` }
              ].map(tab => (
                <button 
                  key={tab.value}
                  onClick={() => setContactMessagesFilter(tab.value)}
                  style={{ 
                    background: contactMessagesFilter === tab.value ? "#FFF1F1" : "#fff", 
                    color: contactMessagesFilter === tab.value ? COLORS.primary : COLORS.textLight, 
                    border: `1px solid ${contactMessagesFilter === tab.value ? COLORS.primary : COLORS.border}`, 
                    padding: "8px 24px", 
                    borderRadius: "20px", 
                    fontSize: "13px", 
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {contactMessagesError && (
              <div style={{ background: "#FEE2E2", color: COLORS.primary, padding: "12px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 700 }}>
                ⚠️ Error: {contactMessagesError}
              </div>
            )}

            <div style={{ background: COLORS.white, borderRadius: "16px", padding: "0", border: `1px solid ${COLORS.border}`, overflow: "hidden", boxShadow: SHADOW }}>
              {contactMessagesLoading ? (
                <div style={{ padding: "60px", textAlign: "center" }}>
                  <div style={{ width: 30, height: 30, border: "3px solid #eee", borderTopColor: COLORS.primary, borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 16px" }} />
                  <div style={{ color: COLORS.textLight, fontSize: "14px" }}>Loading messages...</div>
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ background: COLORS.bg }}>
                    <tr style={{ textAlign: "left", color: COLORS.textLight, fontSize: "11px", fontWeight: 800 }}>
                      <th style={{ padding: "16px 24px" }}>SENDER DETAILS</th>
                      <th style={{ padding: "16px 24px" }}>SUBJECT</th>
                      <th style={{ padding: "16px 24px" }}>MESSAGE PREVIEW</th>
                      <th style={{ padding: "16px 24px" }}>SUBMITTED DATE</th>
                      <th style={{ padding: "16px 24px" }}>STATUS</th>
                      <th style={{ padding: "16px 24px", textAlign: "right" }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contactMessagesList.map(msg => {
                      const initials = msg.fullName
                        ? msg.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
                        : "U";
                      const isMsgResolved = msg.isResolved || msg.IsResolved;
                      return (
                        <tr key={msg.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                          <td style={{ padding: "16px 24px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <div style={{ 
                                width: "36px", 
                                height: "36px", 
                                borderRadius: "50%", 
                                background: isMsgResolved ? "#F3F4F6" : "#FEEBEB", 
                                color: isMsgResolved ? "#9CA3AF" : COLORS.primary, 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center", 
                                fontWeight: 800,
                                fontSize: "13px"
                              }}>
                                {initials}
                              </div>
                              <div>
                                <div style={{ fontSize: "14px", fontWeight: 800, color: COLORS.text }}>{msg.fullName || "User"}</div>
                                <div style={{ fontSize: "11px", color: COLORS.textLight }}>{msg.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "16px 24px", fontSize: "13px", fontWeight: 700, color: COLORS.text }}>
                            {msg.subject || "No Subject"}
                          </td>
                          <td style={{ padding: "16px 24px", fontSize: "13px", color: COLORS.textLight, maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {msg.message}
                          </td>
                          <td style={{ padding: "16px 24px", fontSize: "12px", color: COLORS.textLight }}>
                            {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : "—"}
                          </td>
                          <td style={{ padding: "16px 24px" }}>
                            <span style={{ 
                              color: isMsgResolved ? COLORS.success : COLORS.primary, 
                              background: isMsgResolved ? "#E8F5E9" : "#FFF1F1", 
                              padding: "4px 8px", 
                              borderRadius: "4px", 
                              fontSize: "11px", 
                              fontWeight: 800 
                            }}>
                              {isMsgResolved ? "Resolved" : "Pending"}
                            </span>
                          </td>
                          <td style={{ padding: "16px 24px", textAlign: "right" }}>
                            <button 
                              onClick={() => handleViewContactMessage(msg)}
                              className="admin-btn" 
                              style={{ background: "transparent", border: `1px solid ${COLORS.border}`, padding: "6px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 800, cursor: "pointer" }}
                            >
                              Review & Reply
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {contactMessagesList.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ padding: "60px", textAlign: "center", color: COLORS.textLight }}>
                          <div style={{ fontSize: "40px", marginBottom: "10px" }}>✉️</div>
                          <div style={{ fontWeight: 800 }}>No messages found</div>
                          <div style={{ fontSize: "12px" }}>There are no {contactMessagesFilter} support inquiries currently.</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

      {/* User Report Details Modal Overlay */}
      {showReportModal && selectedReport && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, animation: "fadeIn 0.2s ease-out" }}>
          <div style={{ background: COLORS.white, borderRadius: "20px", width: "100%", maxWidth: "600px", padding: "32px", border: `1px solid ${COLORS.border}`, boxShadow: "0 20px 50px rgba(15, 23, 42, 0.15)", maxHeight: "90vh", overflowY: "auto", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: `1.5px solid ${COLORS.border}`, paddingBottom: "12px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: COLORS.text, margin: 0 }}>🚩 Report Moderation Details</h3>
              <button 
                onClick={() => setShowReportModal(false)}
                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: COLORS.textLight }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Top Meta info */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", background: COLORS.bg, padding: "16px", borderRadius: "12px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: COLORS.textLight, textTransform: "uppercase" }}>Reporter</div>
                  <div style={{ fontSize: "14px", fontWeight: 800 }}>{selectedReport.reporterName || "Platform User"}</div>
                  <div style={{ fontSize: "10px", color: COLORS.textLight }}>ID: {selectedReport.reporterId || "—"}</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: COLORS.textLight, textTransform: "uppercase" }}>Submitted On</div>
                  <div style={{ fontSize: "14px", fontWeight: 700 }}>
                    {selectedReport.createdAt ? new Date(selectedReport.createdAt).toLocaleString() : "—"}
                  </div>
                </div>
              </div>

              {/* Target & Reason */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: COLORS.textLight }}>Target Type</label>
                  <div>
                    <span style={{ background: "#F1F5F9", color: "#475569", fontSize: "12px", fontWeight: 800, padding: "6px 12px", borderRadius: "6px", display: "inline-block" }}>
                      {selectedReport.targetType === 0 || selectedReport.targetType === "ServiceCenter" ? "ServiceCenter" : (selectedReport.targetType === 1 || selectedReport.targetType === "Review" ? "Review" : (selectedReport.targetType === 2 || selectedReport.targetType === "issue" ? "issue" : selectedReport.targetType))}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: COLORS.textLight }}>Reason</label>
                  <div>
                    <span style={{ background: "#FFF1F1", color: COLORS.primary, fontSize: "12px", fontWeight: 800, padding: "6px 12px", borderRadius: "6px", display: "inline-block" }}>
                      {selectedReport.reason === 0 || selectedReport.reason === "Spam" ? "Spam" : (selectedReport.reason === 1 || selectedReport.reason === "Inappropriate" ? "Inappropriate" : (selectedReport.reason === 2 || selectedReport.reason === "Fake" ? "Fake" : (selectedReport.reason === 3 || selectedReport.reason === "Offensive" ? "Offensive" : (selectedReport.reason === 4 || selectedReport.reason === "Other" ? "Other" : selectedReport.reason))))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Target ID */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: COLORS.textLight }}>Target Entity ID</label>
                <div style={{ fontSize: "13px", fontWeight: 600, fontFamily: "monospace", background: COLORS.bg, padding: "10px 14px", borderRadius: "8px", border: `1.5px solid ${COLORS.border}`, wordBreak: "break-all" }}>
                  {selectedReport.targetId}
                </div>
              </div>

              {/* Details / Explanation */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: COLORS.textLight }}>Details Provided</label>
                <div style={{ fontSize: "13.5px", background: COLORS.bg, padding: "12px 16px", borderRadius: "8px", border: `1.5px solid ${COLORS.border}`, minHeight: "60px", color: COLORS.text, whiteSpace: "pre-wrap" }}>
                  {selectedReport.details || <span style={{ color: COLORS.textLight, fontStyle: "italic" }}>No additional details provided.</span>}
                </div>
              </div>

              {/* Status information */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "8px 0" }}>
                <span style={{ fontSize: "13px", fontWeight: 700 }}>Current Moderation Status:</span>
                <span style={{ 
                  color: selectedReport.status === 0 || selectedReport.status === "Pending" ? COLORS.primary : (selectedReport.status === 2 || selectedReport.status === "Resolved" ? COLORS.success : COLORS.textLight), 
                  background: selectedReport.status === 0 || selectedReport.status === "Pending" ? "#FFF1F1" : (selectedReport.status === 2 || selectedReport.status === "Resolved" ? "#E8F5E9" : "#F3F4F6"), 
                  padding: "4px 10px", 
                  borderRadius: "6px", 
                  fontSize: "12px", 
                  fontWeight: 800 
                }}>
                  {selectedReport.status === 0 || selectedReport.status === "Pending" ? "Pending" : (selectedReport.status === 1 || selectedReport.status === "UnderReview" ? "Under Review" : (selectedReport.status === 2 || selectedReport.status === "Resolved" ? "Resolved" : (selectedReport.status === 3 || selectedReport.status === "Dismissed" ? "Dismissed" : selectedReport.status)))}
                </span>
              </div>

              {/* Resolution Input / Display */}
              <div style={{ borderTop: `1.5px solid ${COLORS.border}`, paddingTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <label style={{ fontSize: "13px", fontWeight: 800, color: COLORS.text }}>Resolution Action & Notes</label>
                
                {(selectedReport.status === 0 || selectedReport.status === "Pending" || selectedReport.status === 1 || selectedReport.status === "UnderReview") ? (
                  <>
                    <textarea 
                      value={reportResolutionNote}
                      onChange={(e) => setReportResolutionNote(e.target.value)}
                      placeholder="Enter resolution notes or actions taken to resolve/dismiss this report..."
                      rows="3"
                      style={{ padding: "10px 14px", border: `1.5px solid ${COLORS.border}`, borderRadius: "8px", fontSize: "13.5px", fontFamily: "inherit", width: "100%" }}
                    />
                    <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                      <button 
                        type="button" 
                        disabled={submittingResolution}
                        onClick={() => handleDismissReport(selectedReport.id, reportResolutionNote)}
                        style={{ flex: 1, background: "#F1F5F9", color: "#475569", border: `1px solid ${COLORS.border}`, padding: "10px", borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: "pointer", opacity: submittingResolution ? 0.6 : 1 }}
                      >
                        {submittingResolution ? "Processing..." : "Dismiss Report"}
                      </button>
                      <button 
                        type="button"
                        disabled={submittingResolution}
                        onClick={() => handleResolveReport(selectedReport.id, reportResolutionNote)}
                        style={{ flex: 1, background: COLORS.primary, color: "#fff", border: "none", padding: "10px", borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: "pointer", opacity: submittingResolution ? 0.6 : 1 }}
                      >
                        {submittingResolution ? "Processing..." : "Resolve & Fix"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ background: "#F8F9FA", padding: "14px", borderRadius: "10px", border: `1.5px solid ${COLORS.border}` }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "8px", fontSize: "11px", color: COLORS.textLight }}>
                      <div>Reviewed By: {selectedReport.reviewerName || "System Admin"}</div>
                      <div style={{ textAlign: "right" }}>Action Date: {selectedReport.reviewedAt ? new Date(selectedReport.reviewedAt).toLocaleDateString() : "—"}</div>
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: COLORS.text }}>
                      <strong>Resolution Note:</strong> {selectedReport.resolutionNote || "None provided."}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Message Details Modal Overlay */}
      {showContactMessageModal && selectedContactMessage && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, animation: "fadeIn 0.2s ease-out" }}>
          <div style={{ background: COLORS.white, borderRadius: "20px", width: "100%", maxWidth: "600px", padding: "32px", border: `1px solid ${COLORS.border}`, boxShadow: "0 20px 50px rgba(15, 23, 42, 0.15)", maxHeight: "90vh", overflowY: "auto", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: `1.5px solid ${COLORS.border}`, paddingBottom: "12px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: COLORS.text, margin: 0 }}>✉️ Support Inquiry Details</h3>
              <button 
                onClick={() => setShowContactMessageModal(false)}
                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: COLORS.textLight }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Sender Metadata */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", background: COLORS.bg, padding: "16px", borderRadius: "12px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: COLORS.textLight, textTransform: "uppercase" }}>Sender Name</div>
                  <div style={{ fontSize: "14px", fontWeight: 800 }}>{selectedContactMessage.fullName || "Platform User"}</div>
                  <div style={{ fontSize: "11px", color: COLORS.textLight }}>{selectedContactMessage.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: COLORS.textLight, textTransform: "uppercase" }}>Submitted Date</div>
                  <div style={{ fontSize: "14px", fontWeight: 700 }}>
                    {selectedContactMessage.createdAt ? new Date(selectedContactMessage.createdAt).toLocaleString() : "—"}
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: COLORS.textLight }}>Inquiry Subject</label>
                <div style={{ fontSize: "15px", fontWeight: 800, color: COLORS.text, background: COLORS.bg, padding: "10px 14px", borderRadius: "8px", border: `1.5px solid ${COLORS.border}` }}>
                  {selectedContactMessage.subject || "No Subject"}
                </div>
              </div>

              {/* Message Details */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: COLORS.textLight }}>Message Description</label>
                <div style={{ fontSize: "13.5px", background: COLORS.bg, padding: "12px 16px", borderRadius: "8px", border: `1.5px solid ${COLORS.border}`, minHeight: "80px", color: COLORS.text, whiteSpace: "pre-wrap" }}>
                  {selectedContactMessage.message}
                </div>
              </div>

              {/* Status information */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "8px 0" }}>
                <span style={{ fontSize: "13px", fontWeight: 700 }}>Resolution Status:</span>
                <span style={{ 
                  color: (selectedContactMessage.isResolved || selectedContactMessage.IsResolved) ? COLORS.success : COLORS.primary, 
                  background: (selectedContactMessage.isResolved || selectedContactMessage.IsResolved) ? "#E8F5E9" : "#FFF1F1", 
                  padding: "4px 10px", 
                  borderRadius: "6px", 
                  fontSize: "12px", 
                  fontWeight: 800 
                }}>
                  {(selectedContactMessage.isResolved || selectedContactMessage.IsResolved) ? "Resolved" : "Pending Support"}
                </span>
              </div>

              {/* Resolution Input / Display */}
              <div style={{ borderTop: `1.5px solid ${COLORS.border}`, paddingTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <label style={{ fontSize: "13px", fontWeight: 800, color: COLORS.text }}>Resolution Action & Admin Notes</label>
                
                {!(selectedContactMessage.isResolved || selectedContactMessage.IsResolved) ? (
                  <>
                    <textarea 
                      value={contactResolutionNote}
                      onChange={(e) => setContactResolutionNote(e.target.value)}
                      placeholder="Enter resolution notes, actions taken, or instructions sent to the user..."
                      rows="3"
                      style={{ padding: "10px 14px", border: `1.5px solid ${COLORS.border}`, borderRadius: "8px", fontSize: "13.5px", fontFamily: "inherit", width: "100%" }}
                    />
                    <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                      <button 
                        type="button" 
                        disabled={submittingContactResolution}
                        onClick={() => handleResolveContactMessage(selectedContactMessage.id, contactResolutionNote)}
                        style={{ flex: 1, background: COLORS.primary, color: "#fff", border: "none", padding: "10px", borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: "pointer", opacity: submittingContactResolution ? 0.6 : 1 }}
                      >
                        {submittingContactResolution ? "Resolving Inbound..." : "Mark as Resolved"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ background: "#F8F9FA", padding: "14px", borderRadius: "10px", border: `1.5px solid ${COLORS.border}` }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "8px", fontSize: "11px", color: COLORS.textLight }}>
                      <div>Status: Closed Ticket</div>
                      <div style={{ textAlign: "right" }}>Resolved Successfully</div>
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: COLORS.text }}>
                      <strong>Resolution Note:</strong> {selectedContactMessage.adminNotes || selectedContactMessage.AdminNotes || "None provided."}
                    </div>
                  </div>
                )}
              </div>
              </div>
            </div>
          </div>
        )}

      {/* Pending Service Center Details Modal Overlay */}
      {showPendingCenterModal && selectedPendingCenter && (() => {
        const raw = selectedPendingCenter.raw || {};
        const docs = raw.documents || raw.Documents || [];
        const getDocUrl = (type) => {
          const doc = docs.find(d => 
            (d.documentType || d.DocumentType || "").toLowerCase() === type.toLowerCase()
          );
          return doc?.fileUrl || doc?.FileUrl || null;
        };
        const nationalIdUrl = getDocUrl("NationalId") || getDocUrl("OwnerNationalId");
        const commercialRegUrl = getDocUrl("CommercialReg");
        const taxCardUrl = getDocUrl("TaxCard");

        return (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, animation: "fadeIn 0.2s ease-out" }}>
            <div style={{ background: COLORS.white, borderRadius: "20px", width: "100%", maxWidth: "750px", padding: "32px", border: `1px solid ${COLORS.border}`, boxShadow: "0 20px 50px rgba(15, 23, 42, 0.15)", maxHeight: "90vh", overflowY: "auto", position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: `1.5px solid ${COLORS.border}`, paddingBottom: "12px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: 850, color: COLORS.text, margin: 0 }}>🛡️ Service Center Verification Request</h3>
                <button 
                  onClick={() => setShowPendingCenterModal(false)}
                  style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: COLORS.textLight }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                
                {/* Center Title Card */}
                <div style={{ background: "linear-gradient(135deg, #FFF5F5 0%, #FFF1F1 100%)", padding: "20px", borderRadius: "16px", border: `1.5px solid #FFDCDC` }}>
                  <div style={{ fontSize: "20px", fontWeight: 900, color: COLORS.text, marginBottom: "4px" }}>{raw.name || selectedPendingCenter.name}</div>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", marginTop: "8px" }}>
                    <span style={{ background: COLORS.primary, color: "#fff", fontSize: "11px", fontWeight: 800, padding: "4px 10px", borderRadius: "6px" }}>
                      {raw.type === 0 || raw.type === "Maintenance" ? "Maintenance Center" : (raw.type === 1 || raw.type === "PartsStore" ? "Parts Store" : "Hybrid Center")}
                    </span>
                    <span style={{ color: COLORS.textLight, fontSize: "12.5px", fontWeight: 600 }}>
                      📍 {raw.district ? `${raw.district}, ` : ""}{raw.governorate || selectedPendingCenter.city}
                    </span>
                  </div>
                </div>

                {/* Info Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  
                  {/* Left Column - Business Info */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: COLORS.primary, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: "4px" }}>BUSINESS PROFILE</div>
                    
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: COLORS.textLight }}>BUSINESS EMAIL</div>
                      <div style={{ fontSize: "13.5px", fontWeight: 600, color: COLORS.text }}>{raw.businessEmail || raw.BusinessEmail || "—"}</div>
                    </div>
                    
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: COLORS.textLight }}>BUSINESS PHONE</div>
                      <div style={{ fontSize: "13.5px", fontWeight: 600, color: COLORS.text }}>{raw.phone || raw.Phone || "—"}</div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: COLORS.textLight }}>ESTABLISHED</div>
                        <div style={{ fontSize: "13.5px", fontWeight: 600, color: COLORS.text }}>{raw.yearEstablished || raw.YearEstablished || "—"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: COLORS.textLight }}>SERVICE BAYS</div>
                        <div style={{ fontSize: "13.5px", fontWeight: 600, color: COLORS.text }}>{raw.numServiceBays || raw.NumServiceBays || "—"}</div>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: COLORS.textLight }}>STREET ADDRESS</div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: COLORS.text }}>{raw.streetAddress || raw.StreetAddress || "—"}</div>
                    </div>
                  </div>

                  {/* Right Column - Legal & Owner */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: COLORS.primary, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: "4px" }}>LEGAL & REPRESENTATIVE</div>
                    
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: COLORS.textLight }}>OWNER / REPRESENTATIVE</div>
                      <div style={{ fontSize: "13.5px", fontWeight: 600, color: COLORS.text }}>{raw.ownerFullName || raw.OwnerFullName || "—"}</div>
                    </div>
                    
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: COLORS.textLight }}>OWNER NATIONAL ID</div>
                      <div style={{ fontSize: "13.5px", fontWeight: 600, fontFamily: "monospace" }}>{raw.ownerNationalId || raw.OwnerNationalId || "—"}</div>
                    </div>

                    <div>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: COLORS.textLight }}>COMMERCIAL REGISTRATION NO.</div>
                      <div style={{ fontSize: "13.5px", fontWeight: 600, fontFamily: "monospace" }}>{raw.commercialRegNo || raw.CommercialRegNo || "—"}</div>
                    </div>

                    <div>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: COLORS.textLight }}>TAX CARD NO.</div>
                      <div style={{ fontSize: "13.5px", fontWeight: 600, fontFamily: "monospace" }}>{raw.taxCardNo || raw.TaxCardNo || "—"}</div>
                    </div>
                  </div>
                </div>

                {/* Documents Section */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderTop: `1.5px solid ${COLORS.border}`, paddingTop: "16px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 800, color: COLORS.text }}>UPLOADED LEGAL DOCUMENTS</div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                    {/* Commercial Reg Card */}
                    <div style={{ border: `1.5px solid ${COLORS.border}`, borderRadius: "10px", padding: "14px", display: "flex", flexDirection: "column", gap: "10px", background: commercialRegUrl ? "#F8F9FA" : "#FFF1F1" }}>
                      <div style={{ fontSize: "11.5px", fontWeight: 800, color: COLORS.text }}>Commercial Registry</div>
                      {commercialRegUrl ? (
                        <a href={commercialRegUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: COLORS.primary, fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                          📄 View Document →
                        </a>
                      ) : (
                        <span style={{ color: COLORS.primary, fontSize: "11px", fontWeight: 700 }}>⚠️ File Missing</span>
                      )}
                    </div>

                    {/* Tax Card Card */}
                    <div style={{ border: `1.5px solid ${COLORS.border}`, borderRadius: "10px", padding: "14px", display: "flex", flexDirection: "column", gap: "10px", background: taxCardUrl ? "#F8F9FA" : "#FFF1F1" }}>
                      <div style={{ fontSize: "11.5px", fontWeight: 800, color: COLORS.text }}>Tax Card ID</div>
                      {taxCardUrl ? (
                        <a href={taxCardUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: COLORS.primary, fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                          📄 View Document →
                        </a>
                      ) : (
                        <span style={{ color: COLORS.primary, fontSize: "11px", fontWeight: 700 }}>⚠️ File Missing</span>
                      )}
                    </div>

                    {/* Owner National ID Card */}
                    <div style={{ border: `1.5px solid ${COLORS.border}`, borderRadius: "10px", padding: "14px", display: "flex", flexDirection: "column", gap: "10px", background: nationalIdUrl ? "#F8F9FA" : "#FFF1F1" }}>
                      <div style={{ fontSize: "11.5px", fontWeight: 800, color: COLORS.text }}>Owner National ID</div>
                      {nationalIdUrl ? (
                        <a href={nationalIdUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: COLORS.primary, fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                          📄 View Document →
                        </a>
                      ) : (
                        <span style={{ color: COLORS.primary, fontSize: "11px", fontWeight: 700 }}>⚠️ File Missing</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description Box */}
                {raw.description && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", background: "#F8F9FA", padding: "12px 16px", borderRadius: "10px", border: `1px solid ${COLORS.border}` }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: COLORS.textLight }}>BUSINESS DESCRIPTION</div>
                    <div style={{ fontSize: "12.5px", color: COLORS.text, lineHeight: 1.4 }}>"{raw.description}"</div>
                  </div>
                )}

                {/* Action Footer */}
                <div style={{ display: "flex", gap: "12px", borderTop: `1.5px solid ${COLORS.border}`, paddingTop: "20px", justifyContent: "flex-end" }}>
                  <button 
                    onClick={() => {
                      handleReject(selectedPendingCenter.id);
                      setShowPendingCenterModal(false);
                    }}
                    style={{ background: "#FFF1F1", border: `1.5px solid ${COLORS.primary}`, color: COLORS.primary, padding: "10px 24px", borderRadius: "8px", fontWeight: 800, fontSize: "13px", cursor: "pointer" }}
                  >
                    Reject Application
                  </button>
                  
                  <button 
                    onClick={() => {
                      handleApprove(selectedPendingCenter.id);
                      setShowPendingCenterModal(false);
                    }}
                    style={{ background: COLORS.success, color: "#fff", border: "none", padding: "10px 28px", borderRadius: "8px", fontWeight: 800, fontSize: "13px", cursor: "pointer" }}
                  >
                    Approve & Verify Center
                  </button>
                </div>

              </div>
            </div>
          </div>
        );
      })()}
      </main>
    </div>
  );
}
