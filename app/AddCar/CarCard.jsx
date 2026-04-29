"use client";

export default function CarCard({ car }) {
  if (!car) return <p>Loading...</p>;

  return (
    <div style={{
      border: "1px solid #eee",
      borderRadius: "12px",
      padding: "15px",
      background: "white"
    }}>
      <h3>{car.brand} {car.model}</h3>
      <p>{car.year}</p>
      <span style={{
        background: "black",
        color: "white",
        padding: "5px 10px",
        borderRadius: "6px"
      }}>
        {car.plate}
      </span>
    </div>
  );
}