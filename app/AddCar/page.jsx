"use client";

import { useEffect, useState } from "react";
import CarCard from "./CarCard";

export default function Page() {
  const [car, setCar] = useState(null);

  useEffect(() => {
    setCar({
      brand: "BMW",
      model: "X5",
      year: "2022",
      plate: "ABC 123",
    });
  }, []);

  if (!car) return <p>Loading...</p>;

  return (
    <div style={{ padding: "40px" }}>
      <h1>Add Car</h1>
      <CarCard car={car} />
    </div>
  );
}