"use client";

// Simple sidebar component for the Admin panel
export default function AdminSidebar({ activeTab, setActiveTab, badges, colors }) {
  const menuItems = [
    { id: "Dashboard", icon: "📊" },
    { id: "Center verification", icon: "🛡️", badge: badges.verification },
    { id: "Review moderation", icon: "⭐", badge: badges.reviews },
    { id: "User reports", icon: "🚩", badge: badges.reports },
    { id: "Featured listings", icon: "💎", badge: badges.featured },
  ];

  return (
    <aside style={{ 
      width: "260px", 
      background: colors.sidebar, 
      borderRight: `1px solid ${colors.border}`, 
      padding: "30px 0",
      height: "100vh",
      position: "sticky",
      top: 0
    }}>
      <div style={{ padding: "0 25px", marginBottom: "40px", fontSize: "22px", fontWeight: "bold" }}>
        AUTO<span style={{ color: colors.primary }}>RIA</span> ADMIN
      </div>
      
      <div style={{ padding: "0 15px" }}>
        {menuItems.map(item => (
          <div key={item.id} 
            onClick={() => setActiveTab(item.id)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 15px", borderRadius: "10px", marginBottom: "5px",
              cursor: "pointer",
              background: activeTab === item.id ? "#FFF1F1" : "transparent",
              color: activeTab === item.id ? colors.primary : colors.text,
              fontWeight: activeTab === item.id ? "bold" : "normal"
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span>{item.icon}</span> {item.id}
            </div>
            {item.badge > 0 && (
              <span style={{ background: colors.primary, color: "#fff", fontSize: "10px", padding: "2px 6px", borderRadius: "10px" }}>
                {item.badge}
              </span>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
