"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ServicesPricingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/service-center");
  }, [router]);

  return null;
}
