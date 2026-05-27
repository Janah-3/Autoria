"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import userService from "@/lib/userService";
import { adminService } from "@/lib/api/adminService";
import { serviceCentersService, getServiceCenterItems } from "@/lib/api/serviceCentersService";

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

  const [reportsData, setReportsData] = useState([
    { id: 1, priority: "High", type: "Fake review", entity: "TopGear Workshop", reporter: "Karim Adel", time: "2 hr ago", status: "Open" },
    { id: 2, priority: "High", type: "Abusive behavior", entity: "ElMasry Auto Center", reporter: "Sara M.", time: "5 hr ago", status: "Open" },
    { id: 3, priority: "Medium", type: "Misleading pricing", entity: "Cairo Motors Service", reporter: "Nour Salah", time: "Yesterday", status: "Open" },
    { id: 4, priority: "Medium", type: "No-show by mechanic", entity: "Hassan K.", reporter: "Tarek Fouad", time: "2 days ago", status: "Open" },
  ]);

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

  useEffect(() => {
    if (currentUser && currentUser.role === "Admin") {
      fetchPendingCenters();
      fetchMetrics();
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

  const handleBanUser = (userId) => {
    if (!confirm("Are you sure you want to ban this user?")) return;
    userService.banUser(userId)
      .then(() => {
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
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} badges={{ verification: verificationQueue.length, reviews: reviewsData.length, reports: reportsData.length, featured: featuredData.length, users: usersList.length }} colors={COLORS} />

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
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "14px", fontWeight: 800 }}>{adminName}</div>
                <div style={{ fontSize: "11px", color: COLORS.textLight }}>{currentUser?.role || "Admin"}</div>
              </div>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: COLORS.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>{adminInitials}</div>
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
                  {reportsData.filter(r => r.priority === "High").map(rep => (
                    <div key={rep.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", background: "#FFF1F1", borderRadius: "8px", border: `1px solid #FFDCDC` }}>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 800 }}>{rep.type}</div>
                        <div style={{ fontSize: "11px", color: COLORS.textLight }}>Target: {rep.entity}</div>
                      </div>
                      <div style={{ color: COLORS.primary, fontWeight: 900, fontSize: "10px" }}>HIGH PRIORITY</div>
                    </div>
                  ))}
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
              <StatCard label="Open reports" value="5" trend="Moderate" trendUp={false} />
              <StatCard label="Under review" value="8" trend="Processing" />
              <StatCard label="Resolved this month" value="31" trend="↑ 12%" trendUp />
              <StatCard label="Avg. resolution time" value="1.4d" trend="Healthy" trendUp />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button style={{ background: "#E8F5E9", color: COLORS.success, border: `1px solid ${COLORS.success}`, padding: "8px 24px", borderRadius: "20px", fontSize: "13px", fontWeight: 700 }}>Open (5)</button>
              {["Under review", "Resolved", "Dismissed"].map(t => (<button key={t} style={{ background: "#fff", color: COLORS.textLight, border: `1px solid ${COLORS.border}`, padding: "8px 24px", borderRadius: "20px", fontSize: "13px", fontWeight: 700 }}>{t}</button>))}
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
                  {reportsData.map(rep => (
                    <tr key={rep.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 700 }}>
                          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: rep.priority === "High" ? COLORS.primary : (rep.priority === "Medium" ? "#FFB800" : "#28A745") }} />
                          {rep.priority}
                        </div>
                      </td>
                      <td style={{ padding: "16px 24px", fontSize: "14px", fontWeight: 700 }}>{rep.type}</td>
                      <td style={{ padding: "16px 24px", fontSize: "13px" }}>{rep.entity}</td>
                      <td style={{ padding: "16px 24px", fontSize: "13px" }}>{rep.reporter}</td>
                      <td style={{ padding: "16px 24px", fontSize: "12px", color: COLORS.textLight }}>{rep.time}</td>
                      <td style={{ padding: "16px 24px" }}>
                        <span style={{ color: COLORS.primary, background: "#FFF1F1", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 800 }}>{rep.status}</span>
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button className="admin-btn" style={{ background: "transparent", border: `1px solid ${COLORS.border}`, padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 700 }}>Review</button>
                          <button className="admin-btn" style={{ background: COLORS.success, color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 700 }}>Resolve</button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
      </main>
    </div>
  );
}
