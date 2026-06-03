"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getAllCars, updateCar, getCarItems, getCarId } from "../../src/API/carsService";
import { useLanguage } from "@/context/LanguageContext";

const FUEL_TYPES = ["Petrol", "Diesel", "Hybrid", "Electric", "LPG"];
const TRANSMISSIONS = ["Manual", "Automatic"];

const CarSVG = ({ color = '#E8192C', size = 155 }) => (
  <svg viewBox="0 0 200 90" fill="none" width={size}>
    <ellipse cx="100" cy="86" rx="88" ry="4.5" fill="rgba(0,0,0,0.07)" />
    <rect x="15" y="42" width="170" height="38" rx="8" fill={color === '#FFFFFF' ? '#E8E8E8' : color} />
    <path d="M38 42 L70 18 H130 L162 42Z" fill={color === '#FFFFFF' ? '#D0D0D0' : color} opacity=".85" />
    <rect x="73" y="21" width="24" height="21" rx="3" fill="rgba(173,216,230,.65)" />
    <rect x="103" y="21" width="24" height="21" rx="3" fill="rgba(173,216,230,.65)" />
    <circle cx="52" cy="78" r="11" fill="#2a2a2a" />
    <circle cx="148" cy="78" r="11" fill="#2a2a2a" />
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const CarCard = ({ car, handleSetDefault, t }) => {
  const fuelName = FUEL_TYPES[car.fuelType] || "Petrol";
  const transmissionName = TRANSMISSIONS[car.transmission] || "Auto";

  return (
    <div className={`car-card ${car.isPrimary ? 'default' : ''}`}>
      <div className="car-visual"><CarSVG color={car.color} size={155} /></div>
      <div className="car-body">
        <div className="car-top">
          <div className="car-name">{car.make} {car.model}</div>
          {car.isPrimary && <div className="default-badge">{t("cars.defaultBadge")}</div>}
        </div>
        <div className="car-spec">{car.year} · {fuelName}</div>
        <div className="car-tags"><span className="car-tag">{transmissionName}</span></div>
      </div>
      <div className="car-footer">
        <div className="car-km">🛣 {car.mileage} km</div>
        <div className="car-plate">{car.licensePlate}</div>
      </div>
      <Link href={`/cars/details?id=${car.id || car.carId}`} style={{ display: "block", textAlign: "center", padding: "10px 16px", borderTop: "1px solid var(--g100)", fontSize: 12, fontWeight: 700, color: "var(--red)", textDecoration: "none", background: "var(--red-muted)" }}>
        {t("cars.mileageTracking")}
      </Link>
      <div className="car-actions">
        <Link href={`/cars/edit-car?id=${car.id}`} onClick={() => localStorage.setItem("selectedCar", JSON.stringify(car))} className="btn-edit" style={{ textDecoration: 'none' }}>
          <EditIcon /> {t("cars.edit")}
        </Link>
        {!car.isPrimary && (
          <button className="btn-set-default" onClick={() => handleSetDefault(car)}>{t("cars.setDefault")}</button>
        )}
        <Link href={`/cars/deleteCar?id=${getCarId(car)}`} className="btn-delete" style={{ textDecoration: 'none' }}><TrashIcon /></Link>
      </div>
    </div>
  );
};

export default function CarsPage() {
  const { t } = useLanguage();
  const [carsList, setCarsList] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCars = async () => {
    try {
      setIsLoading(true);
      const response = await getAllCars();
      let items = [];
      if (response.data?.data?.items) items = response.data.data.items;
      else if (response.data?.items) items = response.data.items;
      else if (Array.isArray(response.data)) items = response.data;
      setCarsList(items);
    } catch (error) {
      console.error("Failed to load cars:", error);
      setCarsList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadCars(); }, []);

  const displayToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2700);
  };

  const handleSetDefault = async (car) => {
    try {
      await updateCar(getCarId(car), { licensePlate: car.licensePlate, mileage: car.mileage, color: car.color, isPrimary: true });
      displayToast('Set as your default car');
      loadCars();
    } catch (error) {
      alert("Failed to update default car");
    }
  };

  return (
    <div className="cars-page-container">
      <style>{`
        :root { --red: #E8192C; --red-light: #FF3347; --red-muted: #FFF0F1; --red-border: #FFCDD0; --white: #FFFFFF; --off: #F7F8FA; --g50: #F7F7F7; --g100: #F0F0F0; --g200: #E0E0E0; --g400: #9E9E9E; --g600: #616161; --g700: #424242; --g800: #212121; --shadow-sm: 0 1px 4px rgba(0,0,0,.06); --shadow-md: 0 4px 20px rgba(0,0,0,.09); --shadow-red: 0 8px 28px rgba(232,25,44,.25); --r: 16px; --r-sm: 10px; --font: 'Cairo', sans-serif; }
        * { box-sizing: border-box; }
        .cars-page-container { font-family: var(--font); background: var(--off); color: var(--g800); min-height: 100vh; }
        .page { max-width: 1100px; margin: 0 auto; padding: 48px 32px; }
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 36px; }
        .page-title { font-size: 28px; font-weight: 900; }
        .btn-add { height: 46px; padding: 0 24px; border-radius: 40px; background: var(--red); color: white; font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 8px; box-shadow: var(--shadow-red); transition: all .2s; }
        .cars-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .car-card { background: var(--white); border: 1.5px solid var(--g100); border-radius: var(--r); overflow: hidden; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; }
        .car-card.default { border-color: var(--red); background: linear-gradient(160deg, #fff 0%, #FFF8F8 100%); }
        .car-visual { height: 140px; display: flex; align-items: center; justify-content: center; background: var(--g50); border-bottom: 1px solid var(--g100); }
        .car-body { padding: 16px; flex: 1; }
        .car-top { display: flex; justify-content: space-between; align-items: center; }
        .car-name { font-size: 17px; font-weight: 900; }
        .car-spec { font-size: 13px; color: var(--g400); margin-top: 4px; }
        .default-badge { font-size: 10px; background: var(--red); color: white; padding: 2px 8px; border-radius: 10px; }
        .car-tags { display: flex; gap: 5px; margin-top: 8px; flex-wrap: wrap; }
        .car-tag { background: var(--g50); font-size: 10px; padding: 2px 8px; border-radius: 10px; border: 1px solid var(--g100); }
        .car-footer { border-top: 1px solid var(--g100); padding: 10px 16px; display: flex; justify-content: space-between; background: var(--g50); font-size: 12px; }
        .car-actions { display: flex; gap: 7px; padding: 12px 16px; border-top: 1px solid var(--g100); }
        .btn-edit, .btn-set-default { flex: 1; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; cursor: pointer; gap: 6px; }
        .btn-edit { border: 1.5px solid var(--g200); color: var(--g700); background: transparent; }
        .btn-set-default { background: var(--red); color: white; border: none; }
        .btn-delete { width: 36px; height: 36px; border-radius: 8px; border: 1.5px solid var(--red-border); background: var(--red-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--red); }
        .add-card { border: 2px dashed var(--g200); border-radius: var(--r); display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 280px; cursor: pointer; }
        .toast { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: #333; color: white; padding: 10px 20px; border-radius: 30px; z-index: 200; }
        .loading { text-align: center; font-size: 18px; color: #666; padding: 40px; }
      `}</style>

      <div className="page">
        <div className="page-header">
          <div>
            <div className="page-title">{t("cars.title")}</div>
            <div style={{ fontSize: "14px", color: "#999" }}>{carsList.length} {t("cars.vehicles")}</div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link href="/user-dashboard" style={{ height: '46px', padding: '0 20px', borderRadius: '40px', background: '#fff', color: 'var(--g700)', border: '1.5px solid var(--g200)', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              {t("cars.dashboard")}
            </Link>
            <Link href="/cars/add-car" className="btn-add" style={{ textDecoration: 'none' }}>{t("cars.addNew")}</Link>
          </div>
        </div>

        {isLoading ? (
          <div className="loading">{t("cars.loading")}</div>
        ) : (
          <div className="cars-grid">
            {carsList.map(car => <CarCard key={car.carId || car.id || car.vin} car={car} handleSetDefault={handleSetDefault} t={t} />)}
            <Link href="/cars/add-car" className="add-card" style={{ textDecoration: 'none' }}>
              <div style={{ fontSize: "40px", color: "#ccc" }}>+</div>
              <div style={{ fontWeight: "700", color: "#666" }}>{t("cars.addNewCard")}</div>
            </Link>
          </div>
        )}

        {toastMessage && <div className="toast">✓ {toastMessage}</div>}
      </div>
    </div>
  );
}
