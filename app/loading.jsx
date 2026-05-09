import { SkeletonBox, SkeletonCard } from "@/components/Skeleton";

export default function GlobalLoading() {
  return (
    <div style={{ maxWidth: "1200px", margin: "40px auto", padding: "0 5%" }}>
      
      <div style={{ marginBottom: "48px" }}>
        <SkeletonBox width="300px" height="40px" style={{ margin: "0 auto 16px" }} />
        <SkeletonBox width="500px" height="20px" style={{ margin: "0 auto" }} />
      </div>

      
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
        gap: "24px" 
      }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
