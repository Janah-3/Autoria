"use client";

import React from "react";

/**
 * Reusable Skeleton components for loading states.
 * Use these to build custom loading layouts.
 */

const shimmerStyle = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .skeleton-box {
    background: #f0f0f0;
    background-image: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite linear;
    border-radius: 8px;
  }
`;

export function SkeletonBox({ width = "100%", height = "20px", borderRadius = "8px", style = {} }) {
  return (
    <>
      <style>{shimmerStyle}</style>
      <div 
        className="skeleton-box" 
        style={{ width, height, borderRadius, ...style }} 
      />
    </>
  );
}

export function SkeletonCircle({ size = "50px", style = {} }) {
  return (
    <SkeletonBox 
      width={size} 
      height={size} 
      borderRadius="50%" 
      style={style} 
    />
  );
}

// Pre-built layout: Card Skeleton
export function SkeletonCard() {
  return (
    <div style={{ background: "#fff", padding: "20px", borderRadius: "16px", border: "1px solid #eee", marginBottom: "16px" }}>
      <SkeletonBox height="150px" style={{ marginBottom: "16px" }} />
      <SkeletonBox width="60%" height="24px" style={{ marginBottom: "12px" }} />
      <SkeletonBox width="40%" height="16px" style={{ marginBottom: "20px" }} />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <SkeletonBox width="80px" height="32px" />
        <SkeletonBox width="100px" height="32px" />
      </div>
    </div>
  );
}
