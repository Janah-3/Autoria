"use client";

import { SkeletonBox, SkeletonCard, SkeletonCircle } from "@/components/Skeleton";

export default function TestLoadingPage() {
  return (
    <div style={{ maxWidth: "1000px", margin: "60px auto", padding: "0 20px", fontFamily: "sans-serif" }}>
      <h1 style={{ marginBottom: "40px" }}>Previewing Skeletons (Loading States)</h1>
      
      <div style={{ marginBottom: "60px" }}>
        <h3 style={{ color: "#666", marginBottom: "20px" }}>1. Basic Shapes (Box & Circle)</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
          <SkeletonCircle size="80px" />
          <div style={{ flex: 1 }}>
            <SkeletonBox width="40%" height="24px" style={{ marginBottom: "12px" }} />
            <SkeletonBox width="80%" height="16px" />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "60px" }}>
        <h3 style={{ color: "#666", marginBottom: "20px" }}>2. Full Card Skeleton (Ready to use)</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>

      <p style={{ color: "#999", fontSize: "14px" }}>
        Note: These are shimmering because they use CSS animations. You can use them anywhere in the project.
      </p>
    </div>
  );
}
