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


  // Detailed Mock Data
  const [featuredData, setFeaturedData] = useState([
    { id: 1, name: "AutoCare Nasr City", loc: "Cairo · German cars specialist", expires: "31 Mar 2026", daysLeft: 15, progress: 50, price: "2,400", type: "30-day slot", status: "Active" },
    { id: 2, name: "TopGear Workshop", loc: "Cairo · AC specialist", expires: "19 Mar 2026", daysLeft: 3, progress: 90, price: "2,400", type: "30-day slot", status: "Expiring soon" },
    { id: 3, name: "Precision Auto Works", loc: "Zamalek · Luxury cars", expires: "10 Apr 2026", daysLeft: 25, progress: 17, price: "1,200", type: "15-day slot", status: "Active" },
  ]);

  const [reviewsData, setReviewsData] = useState([
    { id: 1, user: "Karim Adel", initials: "KA", target: "TopGear Workshop", date: "14 Mar 2026", time: "2 hr ago", rating: 5, text: "This place is absolutely amazing, best service I've ever had in my entire life. Every single mechanic was incredibly professional and the prices were unbelievably cheap.", flag: "This review seems fake — no booking history found.", status: "Flagged - Fake review" },
    { id: 2, user: "Nour Salah", initials: "NS", target: "ElMasry Auto Center", date: "13 Mar 2026", time: "5 hr ago", rating: 1, text: "Terrible experience, the staff were rude and used inappropriate language.", flag: "Review contains offensive language.", status: "Flagged - Offensive" },
  ]);

  const [reportsList, setReportsList] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState("");
  const [reportFilter, setReportFilter] = useState("Pending"); // "Pending", "Resolved", "Dismissed"
  const [selectedReportForReview, setSelectedReportForReview] = useState(null);

  const [verificationQueue, setVerificationQueue] = useState([
    { id: 1, name: "Al Faris Auto", city: "Cairo", date: "12 Mar" },
    { id: 2, name: "QuickFix Heliopolis", city: "Cairo", date: "12 Mar" },
  ]);

  const [metrics, setMetrics] = useState(null);

  const fetchPendingCenters = () => {
    serviceCentersService.getPending()
      .then((res) => {
        const items = getServiceCenterItems(res);
        if (items.length > 0) {
          setVerificationQueue(items.map(c => ({
            id: c.id,
            name: c.name,
            city: c.governorate || c.city || "Cairo",
            date: c.submittedAt ? new Date(c.submittedAt).toLocaleDateString() : "12 Mar"
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
        if (res?.data?.metrics) {
          setMetrics(res.data.metrics);
        }
      })
      .catch(() => {});
  };

  const fetchReports = () => {
    setReportsLoading(true);
    setReportsError("");
    reportsService.getAllReports()
      .then((res) => {
        const items = res?.data?.items ?? res?.items ?? [];
        setReportsList(items);
      })
      .catch((err) => {
        setReportsError(err.message || "Failed to fetch reports");
      })
      .finally(() => {
        setReportsLoading(false);
      });
  };

  const handleResolveReport = async (id) => {
    const note = prompt("Enter resolution note:");
    if (note === null) return;
    try {
      await reportsService.resolveReport(id, note || "Resolved");
      alert("Report marked as resolved successfully!");
      fetchReports();
    } catch (err) {
      alert("Failed to resolve report: " + err.message);
    }
  };

  const handleDismissReport = async (id) => {
    const note = prompt("Enter dismissal note:");
    if (note === null) return;
    try {
      await reportsService.dismissReport(id, note || "Dismissed");
      alert("Report marked as dismissed successfully!");
      fetchReports();
    } catch (err) {
      alert("Failed to dismiss report: " + err.message);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.role === "Admin") {
      fetchPendingCenters();
      fetchMetrics();
      fetchReports();
    }
  }, [currentUser]);

  const handleApprove = async (id) => {
    try {
      await serviceCentersService.approve(id);
      fetchPendingCenters();
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

  useEffect(() => {
    if (currentUser && currentUser.role === "Admin" && activeTab === "User reports") {
      fetchReports();
    }
  }, [currentUser, activeTab]);

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
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} badges={{ verification: verificationQueue.length, reviews: reviewsData.length, reports: reportsList.filter(r => (r.status ?? r.Status) === "Pending").length, featured: featuredData.length, users: usersList.length, spareParts: sparePartsList.length }} colors={COLORS} />

      <main style={{ flex: 1, padding: "40px", maxWidth: "1600px" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 900, margin: 0 }}>{activeTab}</h1>
            <p style={{ color: COLORS.textLight, fontSize: "14px", margin: "4px 0 0" }}>Sunday, 15 March 2026 • Platform management</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="admin-btn" style={{ background: COLORS.primary, color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: 700, fontSize: "12px" }}>Quick Add</button>
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
                    🔑 Admin Dashboard
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

            {/* Quick Actions / Shortcuts */}
            <div style={{ background: COLORS.white, padding: "20px", borderRadius: "16px", border: `1px solid ${COLORS.border}`, display: "flex", gap: "32px", alignItems: "center" }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: COLORS.textLight }}>QUICK ACTIONS:</div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button onClick={() => setActiveTab("Center verification")} style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, padding: "10px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>Verify Centers ({verificationQueue.length})</button>
                <button onClick={() => setActiveTab("Featured listings")} style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, padding: "10px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>Add Featured</button>
                <button onClick={() => setActiveTab("Review moderation")} style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, padding: "10px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>Moderate Reviews</button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
              {/* Recent Reviews Summary */}
              <Card title="Latest Flagged Reviews" badge={`${reviewsData.length} new`} actionText="View all" onAction={() => setActiveTab("Review moderation")}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {reviewsData.slice(0, 2).map(rev => (
                    <div key={rev.id} style={{ padding: "12px", borderRadius: "8px", border: `1px solid ${COLORS.border}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={{ fontWeight: 800, fontSize: "13px" }}>{rev.user}</span>
                        <span style={{ color: COLORS.primary, fontSize: "11px", fontWeight: 800 }}>{rev.status}</span>
                      </div>
                      <p style={{ fontSize: "12px", color: COLORS.textLight, margin: "0 0 8px 0", fontStyle: "italic" }}>"{rev.text.slice(0, 80)}..."</p>
                      <div style={{ fontSize: "10px", fontWeight: 700, color: COLORS.primary }}>Reason: {rev.flag.slice(0, 40)}</div>
                    </div>
                  ))}
                </div>
              </Card>

              
              <Card title="Urgent Reports" badge="Action Required" actionText="Manage reports" onAction={() => setActiveTab("User reports")}>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {reportsList
                    .filter(r => (r.status ?? r.Status) === "Pending")
                    .slice(0, 3)
                    .map(rep => {
                      const isHigh = rep.reason === "Offensive" || rep.reason === "Inappropriate";
                      return (
                        <div key={rep.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", background: isHigh ? "#FFF1F1" : "#FFF8F2", borderRadius: "8px", border: `1px solid ${isHigh ? "#FFDCDC" : "#FFEBDC"}` }}>
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: 800 }}>{rep.reason}</div>
                            <div style={{ fontSize: "11px", color: COLORS.textLight }}>Target: {rep.targetType} ({rep.targetId.slice(0, 8)})</div>
                          </div>
                          <div style={{ color: isHigh ? COLORS.primary : "#D97706", fontWeight: 900, fontSize: "10px" }}>
                            {isHigh ? "HIGH PRIORITY" : "MEDIUM PRIORITY"}
                          </div>
                        </div>
                      );
                    })}
                  {reportsList.filter(r => (r.status ?? r.Status) === "Pending").length === 0 && (
                    <div style={{ color: COLORS.textLight, fontSize: "13px", textAlign: "center", padding: "20px 0" }}>
                      ✅ No open reports.
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Verification & Analytics Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "32px" }}>
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
                          <button onClick={() => handleApprove(c.id)} style={{ background: COLORS.success, color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}>Verify Now</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>

              <Card title="Analytics Snapshot">
                <div style={{ textAlign: "center", padding: "10px 0" }}>
                  <div style={{ fontSize: "12px", color: COLORS.textLight, marginBottom: "20px" }}>Booking Trend</div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "80px", justifyContent: "center" }}>
                    {[30, 50, 40, 70, 60, 90, 85].map((h, i) => (
                      <div key={i} style={{ flex: 1, background: i === 6 ? COLORS.primary : "#E5E7EB", height: `${h}%`, borderRadius: "4px 4px 0 0", minWidth: "15px" }} />
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px", textAlign: "left" }}>
                    <div>
                      <div style={{ fontSize: "18px", fontWeight: 900 }}>487</div>
                      <div style={{ fontSize: "10px", color: COLORS.success }}>↑ 12% Growth</div>
                    </div>
                    <div style={{ borderLeft: `1px solid ${COLORS.border}`, paddingLeft: "16px" }}>
                      <div style={{ fontSize: "18px", fontWeight: 900 }}>312</div>
                      <div style={{ fontSize: "10px", color: COLORS.textLight }}>New Customers</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        
        {activeTab === "Featured listings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <p style={{ color: COLORS.textLight, fontSize: "14px", margin: 0 }}>Manage which service centers appear as featured across the platform.</p>
              <button style={{ background: COLORS.primary, color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 700, fontSize: "13px" }}>+ Add featured listing</button>
            </div>
            
            <div style={{ display: "flex", gap: "20px" }}>
              <StatCard label="Active featured slots" value="6 / 8" trend="Healthy" trendUp />
              <StatCard label="Expiring this week" value="2" trend="Action required" />
              <StatCard label="Revenue this month" value="EGP 14,400" trend="↑ 15%" trendUp />
              <StatCard label="Pending requests" value="3" trend="From last 24h" />
            </div>

            <div style={{ display: "flex", gap: "10px", margin: "10px 0" }}>
              {["Active", "Pending requests (3)", "Expired"].map((t, i) => (
                <button key={t} className="admin-btn" style={{ background: i === 0 ? "#E8F5E9" : "#fff", color: i === 0 ? COLORS.success : COLORS.textLight, border: `1px solid ${i === 0 ? COLORS.success : COLORS.border}`, padding: "8px 24px", borderRadius: "20px", fontSize: "13px", fontWeight: 700 }}>{t}</button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {featuredData.map(item => (
                <div key={item.id} style={{ background: COLORS.white, borderRadius: "16px", padding: "20px", border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: "20px", position: "relative" }}>
                  <div style={{ position: "absolute", left: 0, top: "20%", bottom: "20%", width: "4px", background: item.progress > 80 ? COLORS.primary : "#FFB800", borderRadius: "0 4px 4px 0" }} />
                  <div style={{ width: "60px", height: "60px", background: COLORS.bg, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>🏢</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "16px", fontWeight: 800 }}>{item.name}</span>
                      <span style={{ background: "#FEF3C7", color: "#D97706", fontSize: "10px", fontWeight: 800, padding: "2px 8px", borderRadius: "4px" }}>⭐ Featured</span>
                      <span style={{ color: item.daysLeft < 5 ? COLORS.primary : COLORS.success, fontSize: "11px", fontWeight: 700 }}>● {item.status}</span>
                    </div>
                    <div style={{ fontSize: "12px", color: COLORS.textLight }}>{item.loc} • Expires: {item.expires}</div>
                    <div style={{ marginTop: "12px", width: "300px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontWeight: 700, marginBottom: "4px" }}>
                        <span>{item.daysLeft} days remaining</span>
                        <span>{item.progress}%</span>
                      </div>
                      <div style={{ height: "6px", background: "#E5E7EB", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ width: `${item.progress}%`, height: "100%", background: item.progress > 80 ? COLORS.primary : COLORS.success }} />
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "16px", fontWeight: 900 }}>EGP {item.price}</div>
                    <div style={{ fontSize: "10px", color: COLORS.textLight, marginBottom: "12px" }}>{item.type}</div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button className="admin-btn" style={{ background: COLORS.success, color: "#fff", border: "none", padding: "8px 20px", borderRadius: "8px", fontWeight: 700, fontSize: "12px" }}>Extend</button>
                      <button className="admin-btn" style={{ background: "#fff", color: COLORS.primary, border: `1px solid ${COLORS.primary}`, padding: "8px 20px", borderRadius: "8px", fontWeight: 700, fontSize: "12px" }}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        
        {activeTab === "Review moderation" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <p style={{ color: COLORS.textLight, fontSize: "14px", margin: 0 }}>Review flagged or pending content before it goes public.</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button style={{ background: "#E8F5E9", color: COLORS.success, border: `1px solid ${COLORS.success}`, padding: "8px 24px", borderRadius: "20px", fontSize: "13px", fontWeight: 700 }}>Flagged ({reviewsData.length})</button>
              {["Pending", "Approved", "Removed"].map(t => (<button key={t} style={{ background: "#fff", color: COLORS.textLight, border: `1px solid ${COLORS.border}`, padding: "8px 24px", borderRadius: "20px", fontSize: "13px", fontWeight: 700 }}>{t}</button>))}
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <input placeholder="Search reviews..." style={{ flex: 1, padding: "10px 16px", borderRadius: "8px", border: `1px solid ${COLORS.border}`, fontSize: "14px" }} />
              <select style={{ padding: "10px 16px", borderRadius: "8px", border: `1px solid ${COLORS.border}`, fontSize: "14px" }}><option>All centers</option></select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {reviewsData.map(rev => (
                <div key={rev.id} style={{ background: COLORS.white, borderRadius: "16px", padding: "24px", border: `1px solid ${COLORS.border}`, position: "relative" }}>
                  <div style={{ position: "absolute", left: 0, top: "20%", bottom: "20%", width: "4px", background: COLORS.primary, borderRadius: "0 4px 4px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#FEEBEB", color: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>{rev.initials}</div>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 800 }}>{rev.user}</div>
                        <div style={{ fontSize: "11px", color: COLORS.textLight }}>{rev.target} · {rev.date}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ color: COLORS.primary, fontSize: "11px", fontWeight: 800 }}>{rev.status}</span>
                      <div style={{ fontSize: "11px", color: COLORS.textLight }}>{rev.time}</div>
                    </div>
                  </div>
                  <div style={{ color: COLORS.warning, marginBottom: "8px" }}>{"★".repeat(rev.rating)}</div>
                  <p style={{ fontSize: "14px", lineHeight: 1.6, margin: "0 0 16px 0" }}>"{rev.text}"</p>
                  <div style={{ background: "#FFF4F4", border: `1px solid #FFDCDC`, padding: "12px 16px", borderRadius: "8px", marginBottom: "20px" }}>
                    <div style={{ fontSize: "11px", color: COLORS.primary, fontWeight: 800, marginBottom: "4px" }}>Flag reason:</div>
                    <div style={{ fontSize: "13px", color: "#333" }}>"{rev.flag}"</div>
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button className="admin-btn" style={{ flex: 1, background: COLORS.success, color: "#fff", border: "none", padding: "10px", borderRadius: "8px", fontWeight: 700, fontSize: "12px" }}>Approve review</button>
                    <button className="admin-btn" style={{ flex: 1, background: "#fff", color: COLORS.primary, border: `1px solid ${COLORS.primary}`, padding: "10px", borderRadius: "8px", fontWeight: 700, fontSize: "12px" }}>Remove review</button>
                    <button className="admin-btn" style={{ flex: 1, background: "#fff", color: COLORS.text, border: `1px solid ${COLORS.border}`, padding: "10px", borderRadius: "8px", fontWeight: 700, fontSize: "12px" }}>View full profile</button>
                    <button className="admin-btn" style={{ flex: 1, background: "#fff", color: COLORS.text, border: `1px solid ${COLORS.border}`, padding: "10px", borderRadius: "8px", fontWeight: 700, fontSize: "12px" }}>Contact user</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Reports */}
        {activeTab === "User reports" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <p style={{ color: COLORS.textLight, fontSize: "14px", margin: 0 }}>Manage reports submitted by users about service centers, mechanics, or other users.</p>
            <div style={{ display: "flex", gap: "20px" }}>
              <StatCard label="Open reports" value={String(reportsList.filter(r => (r.status ?? r.Status) === "Pending").length)} trend="Action required" trendUp={false} />
              <StatCard label="Resolved reports" value={String(reportsList.filter(r => (r.status ?? r.Status) === "Resolved").length)} trend="Platform health" trendUp />
              <StatCard label="Dismissed reports" value={String(reportsList.filter(r => (r.status ?? r.Status) === "Dismissed").length)} trend="Stable" />
              <StatCard label="Total Reports" value={String(reportsList.length)} trend="All records" />
            </div>
            
            <div style={{ display: "flex", gap: "10px" }}>
              {["Pending", "Resolved", "Dismissed"].map(filterVal => {
                const isActive = reportFilter === filterVal;
                const count = reportsList.filter(r => (r.status ?? r.Status) === filterVal).length;
                return (
                  <button 
                    key={filterVal}
                    onClick={() => setReportFilter(filterVal)}
                    style={{
                      background: isActive ? "#E8F5E9" : "#fff",
                      color: isActive ? COLORS.success : COLORS.textLight,
                      border: `1px solid ${isActive ? COLORS.success : COLORS.border}`,
                      padding: "8px 24px",
                      borderRadius: "20px",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    {filterVal === "Pending" ? `Open (${count})` : `${filterVal} (${count})`}
                  </button>
                );
              })}
            </div>

            <div style={{ background: COLORS.white, borderRadius: "16px", padding: "0", border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ background: COLORS.bg }}>
                  <tr style={{ textAlign: "left", color: COLORS.textLight, fontSize: "11px", fontWeight: 800 }}>
                    <th style={{ padding: "16px 24px" }}>PRIORITY</th>
                    <th style={{ padding: "16px 24px" }}>REPORT TYPE</th>
                    <th style={{ padding: "16px 24px" }}>REPORTED ENTITY</th>
                    <th style={{ padding: "16px 24px" }}>REPORTED BY</th>
                    <th style={{ padding: "16px 24px" }}>SUBMITTED</th>
                    <th style={{ padding: "16px 24px" }}>STATUS</th>
                    <th style={{ padding: "16px 24px" }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {reportsLoading ? (
                    <tr>
                      <td colSpan="7" style={{ padding: "32px", textAlign: "center", color: COLORS.textLight }}>
                        Loading reports...
                      </td>
                    </tr>
                  ) : (
                    reportsList
                      .filter(rep => (rep.status ?? rep.Status) === reportFilter)
                      .map(rep => {
                        const isHigh = rep.reason === "Offensive" || rep.reason === "Inappropriate";
                        const priority = isHigh ? "High" : "Medium";
                        const priorityColor = isHigh ? COLORS.primary : "#FFB800";
                        
                        const reportedEntity = `${rep.targetType} (${rep.targetId.slice(0, 8)})`;
                        const reporterName = rep.reporterName && rep.reporterName !== "string" ? rep.reporterName : `User (${rep.reporterId.slice(0, 8)})`;
                        const formattedTime = new Date(rep.createdAt).toLocaleDateString();

                        return (
                          <tr key={rep.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                            <td style={{ padding: "16px 24px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 700 }}>
                                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: priorityColor }} />
                                {priority}
                              </div>
                            </td>
                            <td style={{ padding: "16px 24px", fontSize: "14px", fontWeight: 700 }}>{rep.reason}</td>
                            <td style={{ padding: "16px 24px", fontSize: "13px" }}>{reportedEntity}</td>
                            <td style={{ padding: "16px 24px", fontSize: "13px" }}>{reporterName}</td>
                            <td style={{ padding: "16px 24px", fontSize: "12px", color: COLORS.textLight }}>{formattedTime}</td>
                            <td style={{ padding: "16px 24px" }}>
                              <span style={{ 
                                color: rep.status === "Pending" ? COLORS.primary : (rep.status === "Resolved" ? COLORS.success : COLORS.textLight), 
                                background: rep.status === "Pending" ? "#FFF1F1" : (rep.status === "Resolved" ? "#E7F5EA" : "#F1F3F5"), 
                                padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 800 
                              }}>
                                {rep.status}
                              </span>
                            </td>
                            <td style={{ padding: "16px 24px" }}>
                              <div style={{ display: "flex", gap: "8px" }}>
                                <button 
                                  onClick={() => setSelectedReportForReview(rep)}
                                  className="admin-btn" 
                                  style={{ background: "transparent", border: `1px solid ${COLORS.border}`, padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                                >
                                  Review
                                </button>
                                {rep.status === "Pending" && (
                                  <>
                                    <button 
                                      onClick={() => handleResolveReport(rep.id)}
                                      className="admin-btn" 
                                      style={{ background: COLORS.success, color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                                    >
                                      Resolve
                                    </button>
                                    <button 
                                      onClick={() => handleDismissReport(rep.id)}
                                      className="admin-btn" 
                                      style={{ background: COLORS.primary, color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                                    >
                                      Dismiss
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                  )}
                  {!reportsLoading && reportsList.filter(rep => (rep.status ?? rep.Status) === reportFilter).length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ padding: "48px", textAlign: "center", color: COLORS.textLight }}>
                        No reports found in this category.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Center Verification */}
        {activeTab === "Center verification" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <p style={{ color: COLORS.textLight, fontSize: "14px", margin: 0 }}>Review and manage service center registration requests and legal documents.</p>
            
            <div style={{ display: "flex", gap: "20px" }}>
              <StatCard label="Pending Requests" value={verificationQueue.length.toString()} trend="Needs review" trendUp={false} />
              <StatCard label="Verified Centers" value="184" trend="↑ 4 this week" trendUp />
              <StatCard label="Rejected / Blocked" value="12" trend="Manual review" />
              <StatCard label="Total Centers" value="196" trend="Overall growth" trendUp />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button style={{ background: "#E8F5E9", color: COLORS.success, border: `1px solid ${COLORS.success}`, padding: "8px 24px", borderRadius: "20px", fontSize: "13px", fontWeight: 700 }}>Pending Requests ({verificationQueue.length})</button>
              {["Verified Centers", "Rejected", "Blocked"].map(t => (<button key={t} style={{ background: "#fff", color: COLORS.textLight, border: `1px solid ${COLORS.border}`, padding: "8px 24px", borderRadius: "20px", fontSize: "13px", fontWeight: 700 }}>{t}</button>))}
            </div>

            <div style={{ background: COLORS.white, borderRadius: "16px", padding: "0", border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ background: COLORS.bg }}>
                  <tr style={{ textAlign: "left", color: COLORS.textLight, fontSize: "11px", fontWeight: 800 }}>
                    <th style={{ padding: "16px 24px" }}>CENTER DETAILS</th>
                    <th style={{ padding: "16px 24px" }}>CITY / LOCATION</th>
                    <th style={{ padding: "16px 24px" }}>SUBMITTED</th>
                    <th style={{ padding: "16px 24px" }}>DOCS STATUS</th>
                    <th style={{ padding: "16px 24px" }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {verificationQueue.map(item => (
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
                          <button className="admin-btn" style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, padding: "8px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: 800 }}>View Docs</button>
                          <button onClick={() => handleApprove(item.id)} className="admin-btn" style={{ background: COLORS.success, color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontSize: "11px", fontWeight: 800 }}>Approve</button>
                          <button onClick={() => handleReject(item.id)} className="admin-btn" style={{ background: COLORS.primary, color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontSize: "11px", fontWeight: 800 }}>Reject</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {verificationQueue.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ padding: "60px", textAlign: "center", color: COLORS.textLight }}>
                        <div style={{ fontSize: "40px", marginBottom: "10px" }}>✅</div>
                        <div style={{ fontWeight: 800 }}>No pending requests</div>
                        <div style={{ fontSize: "12px" }}>All service center registrations have been processed.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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

      {/* Report Review Modal */}
      {selectedReportForReview && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999, backdropFilter: "blur(4px)"
        }}>
          <div style={{
            background: COLORS.white, borderRadius: "20px", padding: "30px", width: "550px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)", border: `1px solid ${COLORS.border}`,
            color: COLORS.text, fontFamily: "'Inter', sans-serif"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 900 }}>Report Details</h3>
              <button 
                onClick={() => setSelectedReportForReview(null)}
                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: COLORS.textLight }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "400px", overflowY: "auto", paddingRight: "4px" }}>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: COLORS.textLight, textTransform: "uppercase", letterSpacing: "0.5px" }}>Reported Entity</div>
                <div style={{ fontSize: "14px", fontWeight: 800, marginTop: "4px" }}>
                  {selectedReportForReview.targetType}
                </div>
                <div style={{ fontSize: "12px", fontFamily: "monospace", color: COLORS.textLight, background: "#F3F4F6", padding: "6px 10px", borderRadius: "6px", marginTop: "4px" }}>
                  ID: {selectedReportForReview.targetId}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: COLORS.textLight, textTransform: "uppercase", letterSpacing: "0.5px" }}>Reporter</div>
                  <div style={{ fontSize: "13px", fontWeight: 600, marginTop: "4px" }}>
                    {selectedReportForReview.reporterName && selectedReportForReview.reporterName !== "string" ? selectedReportForReview.reporterName : "Anonymous User"}
                  </div>
                  <div style={{ fontSize: "11px", color: COLORS.textLight, fontFamily: "monospace" }}>ID: {selectedReportForReview.reporterId?.slice(0, 8)}...</div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: COLORS.textLight, textTransform: "uppercase", letterSpacing: "0.5px" }}>Date Submitted</div>
                  <div style={{ fontSize: "13px", fontWeight: 600, marginTop: "4px" }}>
                    {new Date(selectedReportForReview.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: COLORS.textLight, textTransform: "uppercase", letterSpacing: "0.5px" }}>Reason for Complaint</div>
                <span style={{ display: "inline-block", background: "#FFF1F1", color: COLORS.primary, fontSize: "12px", fontWeight: 800, padding: "4px 10px", borderRadius: "6px", marginTop: "4px" }}>
                  ⚠️ {selectedReportForReview.reason}
                </span>
              </div>

              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: COLORS.textLight, textTransform: "uppercase", letterSpacing: "0.5px" }}>Details / Explanation</div>
                <p style={{ fontSize: "13px", color: "#374151", lineHeight: 1.6, background: "#F9FAFB", padding: "12px 14px", borderRadius: "10px", border: `1px solid ${COLORS.border}`, marginTop: "4px" }}>
                  "{selectedReportForReview.details || "No explanation provided."}"
                </p>
              </div>

              {selectedReportForReview.status !== "Pending" && (
                <div style={{ background: "#E8F5E9", border: "1px solid #C3E6CB", padding: "12px 14px", borderRadius: "10px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: COLORS.success, textTransform: "uppercase", letterSpacing: "0.5px" }}>Resolution Status ({selectedReportForReview.status})</div>
                  <p style={{ fontSize: "13px", color: "#1B5E20", fontWeight: 600, marginTop: "4px" }}>
                    Note: "{selectedReportForReview.resolutionNote || "No note provided."}"
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              {(selectedReportForReview.status ?? selectedReportForReview.Status) === "Pending" ? (
                <>
                  <button 
                    onClick={() => { handleResolveReport(selectedReportForReview.id); setSelectedReportForReview(null); }}
                    style={{ flex: 1, background: COLORS.success, color: "#fff", border: "none", padding: "12px", borderRadius: "10px", fontWeight: 700, cursor: "pointer" }}
                  >
                    Resolve
                  </button>
                  <button 
                    onClick={() => { handleDismissReport(selectedReportForReview.id); setSelectedReportForReview(null); }}
                    style={{ flex: 1, background: COLORS.primary, color: "#fff", border: "none", padding: "12px", borderRadius: "10px", fontWeight: 700, cursor: "pointer" }}
                  >
                    Dismiss
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setSelectedReportForReview(null)}
                  style={{ flex: 1, background: "#F3F4F6", border: `1px solid ${COLORS.border}`, padding: "12px", borderRadius: "10px", fontWeight: 700, cursor: "pointer", color: COLORS.textLight }}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}
