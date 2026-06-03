"use client";

import Link from "next/link";

export default function AdminSidebar({ activeTab, setActiveTab, badges, colors }) {
  const menuItems = [
    { id: "Dashboard", iconClass: "fa-solid fa-gauge" },
    { id: "Center verification", iconClass: "fa-solid fa-shield-halved", badge: badges.verification },
    { id: "User reports", iconClass: "fa-solid fa-flag", badge: badges.reports },
    { id: "User management", iconClass: "fa-solid fa-users", badge: badges.users },
    { id: "Spare Parts", iconClass: "fa-solid fa-cubes", badge: badges.spareParts },
    { id: "Payments & Revenue", iconClass: "fa-solid fa-credit-card" },
  ];

  return (
    <aside style={{ 
      width: "280px", 
      background: "#FFFFFF", 
      borderRight: `1px solid ${colors.border}`, 
      padding: "40px 0",
      height: "100vh",
      position: "sticky",
      top: 0,
      display: "flex",
      flexDirection: "column",
      overflowY: "auto"
    }}>
      <style>{`
        aside::-webkit-scrollbar {
          width: 5px;
        }
        aside::-webkit-scrollbar-track {
          background: transparent;
        }
        aside::-webkit-scrollbar-thumb {
          background: #e0e0e0;
          border-radius: 4px;
        }
        aside::-webkit-scrollbar-thumb:hover {
          background: #cccccc;
        }
      `}</style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      
      <div style={{ padding: "0 32px", marginBottom: "48px" }}>
        <div style={{ fontSize: "24px", fontWeight: 900, letterSpacing: "-1px" }}>
          AUTO<span style={{ color: colors.primary }}>RIA</span>
          <div style={{ fontSize: "10px", color: colors.textLight, letterSpacing: "2px", fontWeight: 700, marginTop: "4px" }}>ADMIN PANEL</div>
        </div>
      </div>
      
      <div style={{ padding: "0 16px", flex: 1 }}>
        <div style={{ fontSize: "11px", fontWeight: 800, color: colors.textLight, letterSpacing: "1px", padding: "0 16px", marginBottom: "16px" }}>MENU</div>
        {menuItems.map(item => (
          <div key={item.id} 
            onClick={() => setActiveTab(item.id)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 16px", borderRadius: "12px", marginBottom: "4px",
              cursor: "pointer",
              background: activeTab === item.id ? "#FFF1F1" : "transparent",
              color: activeTab === item.id ? colors.primary : colors.textLight,
              fontWeight: activeTab === item.id ? 800 : 600,
              transition: "all 0.2s ease",
              fontSize: "14px"
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "18px", opacity: activeTab === item.id ? 1 : 0.7, width: "24px", textAlign: "center", display: "inline-block" }}>
                <i className={item.iconClass}></i>
              </span> 
              {item.id}
            </div>
            {item.badge > 0 && (
              <span style={{ background: colors.primary, color: "#fff", fontSize: "10px", fontWeight: 800, minWidth: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "10px", padding: "0 6px" }}>
                {item.badge}
              </span>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
