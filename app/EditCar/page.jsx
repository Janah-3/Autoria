import { useState } from "react";
import { addCar } from "../../API/carsService";

export default function CarForm({ onClose }) {
  const [form, setForm] = useState({
    brand: "",
    model: "",
    year: "",
    plate: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await addCar(form);
    onClose();
  };

  return (
    <div className="overlay">
      <style>{`
        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.4);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .form {
          background: white;
          padding: 20px;
          border-radius: 12px;
          width: 300px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        input {
          padding: 8px;
          border-radius: 6px;
          border: 1px solid #ccc;
        }

        button {
          padding: 10px;
          background: #d42b2b;
          color: white;
          border: none;
          border-radius: 6px;
        }
      `}</style>

      <form className="form" onSubmit={handleSubmit}>
        <h3>Add Car</h3>

        <input name="brand" placeholder="Brand" onChange={handleChange} />
        <input name="model" placeholder="Model" onChange={handleChange} />
        <input name="year" placeholder="Year" onChange={handleChange} />
        <input name="plate" placeholder="Plate" onChange={handleChange} />

        <button>Add</button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </form>
    </div>
  );
}