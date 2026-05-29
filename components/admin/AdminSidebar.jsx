"use client";

export default function AdminSidebar({ activeTab, setActiveTab, badges, colors }) {
  const menuItems = [
    { id: "Dashboard", icon: "📊" },
    { id: "Center verification", icon: "🛡️", badge: badges.verification },
    { id: "Review moderation", icon: "⭐", badge: badges.reviews },
    { id: "User reports", icon: "🚩", badge: badges.reports },
    { id: "Featured listings", icon: "💎", badge: badges.featured },
    { id: "User management", icon: "👥", badge: badges.users },
    { id: "Spare Parts", icon: "📦", badge: badges.spareParts },
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
      flexDirection: "column"
    }}>
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
              <span style={{ fontSize: "18px", opacity: activeTab === item.id ? 1 : 0.7 }}>{item.icon}</span> 
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

      <div style={{ padding: "0 16px", marginTop: "auto" }}>
        <div style={{ padding: "16px", background: colors.bg, borderRadius: "16px", textAlign: "center" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>Need help?</div>
          <div style={{ fontSize: "11px", color: colors.textLight, marginBottom: "12px" }}>Contact system support</div>
          <button style={{ width: "100%", background: "#fff", border: `1px solid ${colors.border}`, padding: "8px", borderRadius: "8px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}>Open Tickets</button>
        </div>
      </div>
    </aside>
  );
}
