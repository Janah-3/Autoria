"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SparePartsDetailsRedirect() {
  const router = useRouter();

  useEffect(() => {

    router.replace("/spare-parts-search");
  }, [router]);

  return (
    <div style={{ textAlign: "center", padding: "100px", fontFamily: "sans-serif" }}>
      <h2>Redirecting to search...</h2>
      <p>Please select a specific part to view its details.</p>
    </div>
  );
}
