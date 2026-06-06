"use client";

// Simple component for a single review block
export default function ReviewItem({ user, date, text, reply, colors }) {
  return (
    <div style={{ borderTop: `1px solid #E2E8F0`, paddingTop: "20px", marginBottom: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ fontWeight: 700, fontSize: "14px" }}>{user}</div>
        <span style={{ fontSize: "11px", color: colors.textLight }}>{date}</span>
      </div>
      <p style={{ fontSize: "13px", color: colors.textLight, lineHeight: 1.6, marginBottom: "12px" }}>
        {text}
      </p>
      {reply && (
        <div style={{ background: "#F8FAFC", padding: "12px", borderRadius: "12px", fontSize: "12px", borderLeft: `3px solid ${colors.primary}` }}>
          <div style={{ fontWeight: 700, marginBottom: "4px" }}>Response:</div>
          {reply}
        </div>
      )}
    </div>
  );
}
