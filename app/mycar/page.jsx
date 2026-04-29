import { useEffect, useState } from "react";
import { getCars } from "../../API/carsService";
import CarCard from "../AddCar/page";
import CarForm from "../EditCar/page";

export default function CarsPage() {
  const [cars, setCars] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = async () => {
    const data = await getCars();
    setCars(data || []);
  };

  return (
    <div className="page">
      <style>{`
        .page {
          padding: 40px;
          max-width: 1200px;
          margin: auto;
          font-family: sans-serif;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .title {
          font-size: 28px;
          font-weight: bold;
        }

        .btn {
          background: #d42b2b;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }
      `}</style>

      <div className="header">
        <div className="title">My Cars</div>
        <button className="btn" onClick={() => setShowForm(true)}>
          + Add Car
        </button>
      </div>

      {showForm && <CarForm onClose={() => setShowForm(false)} />}

      <div className="grid">
        {cars.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>
    </div>
  );
}