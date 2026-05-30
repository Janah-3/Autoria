"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getCarById, deleteCar } from "../../../src/API/carsService";

const FUELS = ["Petrol", "Diesel", "Hybrid", "Electric", "LPG"];


const CarSVG = ({ color = "#E8192C", size = 160 }) => (
  <svg viewBox="0 0 200 90" fill="none" width={size}>
    <ellipse cx="100" cy="86" rx="88" ry="4.5" fill="rgba(0,0,0,0.07)" />
    <rect x="15" y="42" width="170" height="38" rx="8" fill={color === "#FFFFFF" ? "#E8E8E8" : color} />
    <path d="M38 42 L70 18 H130 L162 42Z" fill={color === "#FFFFFF" ? "#D0D0D0" : color} opacity=".85" />
    <rect x="73" y="21" width="24" height="21" rx="3" fill="rgba(173,216,230,.65)" />
    <rect x="103" y="21" width="24" height="21" rx="3" fill="rgba(173,216,230,.65)" />
    <rect x="12" y="52" width="12" height="8" rx="2" fill="#FFD700" opacity=".9" />
    <rect x="176" y="52" width="12" height="8" rx="2" fill="#FF5555" opacity=".8" />
    <circle cx="52" cy="78" r="11" fill="#2a2a2a" />
    <circle cx="52" cy="78" r="6.5" fill="#555" />
    <circle cx="52" cy="78" r="3" fill="#888" />
    <circle cx="148" cy="78" r="11" fill="#2a2a2a" />
    <circle cx="148" cy="78" r="6.5" fill="#555" />
    <circle cx="148" cy="78" r="3" fill="#888" />
    <rect x="80" y="44" width="40" height="2" rx="1" fill="rgba(255,255,255,.18)" />
  </svg>
);

const TrashIcon = ({ size = 28 }) => (
  <svg 
    width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

export default function DeleteCarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const carId = searchParams.get("id");

  // State
  const [carDetails, setCarDetails] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Car Details
  useEffect(() => {
    if (carId) {
      getCarById(carId)
        .then((response) => {
          setCarDetails(response.data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Failed to fetch car for deletion:", error);
          alert("Car not found");
          router.push("/cars");
        });
    } else {
      router.push("/cars");
    }
  }, [carId, router]);

  // Handlers
  const handleDeleteCar = async () => {
    try {
      await deleteCar(carId);
      setIsConfirmed(true);
      
      setTimeout(() => {
        router.push("/cars");
      }, 2000);
      
    } catch (error) {
      alert(`Failed to delete car: ${error.message}`);
    }
  };

  const triggerCancelShake = () => {
    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
    }, 500);
  };


  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#F7F8FA", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cairo', sans-serif" }}>
        <div style={{ color: "#9E9E9E", fontSize: "15px" }}>Loading details…</div>
      </div>
    );
  }


  if (!carDetails) {
    return (
      <div style={{ minHeight: "100vh", background: "#F7F8FA", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cairo', sans-serif" }}>
        <div style={{ color: "#9E9E9E", fontSize: "15px" }}>Car not found</div>
      </div>
    );
  }


  if (isConfirmed) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
          @keyframes pop-in { 
            from { transform: scale(0.6); opacity: 0; } 
            to { transform: scale(1); opacity: 1; } 
          }
        `}</style>
        
        <div style={{ minHeight: "100vh", background: "#F7F8FA", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cairo', sans-serif" }}>
          <div style={{ textAlign: "center", animation: "pop-in .4s cubic-bezier(.34,1.56,.64,1) both" }}>
            <div style={{ 
              width: "88px", height: "88px", 
              background: "linear-gradient(135deg,#E8192C,#FF3347)",
              borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 22px", boxShadow: "0 8px 28px rgba(232,25,44,.35)", fontSize: "38px" 
            }}>
              🗑️
            </div>
            
            <div style={{ fontSize: "24px", fontWeight: "900", marginBottom: "8px", color: "#212121" }}>
              Car Deleted
            </div>
            
            <div style={{ fontSize: "14px", color: "#9E9E9E" }}>
              {carDetails.make} {carDetails.model} has been removed.
            </div>
            
            <div style={{ fontSize: "13px", color: "#BDBDBD", marginTop: "6px" }}>
              Redirecting to My Cars…
            </div>
          </div>
        </div>
      </>
    );
  }


  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');

        /* Base Resets */
        *, *::before, *::after { 
          box-sizing: border-box; 
          margin: 0; 
          padding: 0; 
        }

        /* Animations */
        @keyframes fade-up { 
          from { opacity: 0; transform: translateY(18px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        
        @keyframes shake { 
          0%, 100% { transform: translateX(0); } 
          20%, 60% { transform: translateX(-6px); } 
          40%, 80% { transform: translateX(6px); } 
        }
        
        @keyframes pulse-red { 
          0%, 100% { box-shadow: 0 0 0 0 rgba(232,25,44,.45); } 
          50% { box-shadow: 0 0 0 12px rgba(232,25,44,0); } 
        }

        /* Layout */
        .del-page { 
          min-height: 100vh; 
          background: #F7F8FA; 
          font-family: 'Cairo', sans-serif; 
        }
        
        .del-nav { 
          background: #fff; 
          border-bottom: 2px solid #E8192C; 
          height: 60px; 
          padding: 0 32px;
          display: flex; 
          align-items: center; 
          justify-content: space-between;
          box-shadow: 0 2px 8px rgba(232,25,44,.08); 
        }
        
        .del-logo { 
          font-size: 20px; 
          font-weight: 900; 
          color: #E8192C; 
          letter-spacing: -.5px; 
        }
        
        .del-back { 
          font-size: 13px; 
          font-weight: 600; 
          color: #616161; 
          text-decoration: none;
          display: flex; 
          align-items: center; 
          gap: 5px; 
          transition: color .18s; 
        }
        
        .del-back:hover { 
          color: #E8192C; 
        }

        .del-wrap { 
          max-width: 520px; 
          margin: 0 auto; 
          padding: 40px 24px; 
          animation: fade-up .45s ease both; 
        }

        /* Danger Banner */
        .danger-banner {
          background: linear-gradient(135deg, #FFF0F1, #FFE5E7);
          border: 1.5px solid #FFCDD0; 
          border-radius: 16px;
          padding: 28px 24px; 
          text-align: center; 
          margin-bottom: 24px;
          position: relative; 
          overflow: hidden;
        }
        
        .danger-icon {
          width: 72px; 
          height: 72px; 
          border-radius: 50%;
          background: linear-gradient(135deg, #E8192C, #FF3347);
          display: flex; 
          align-items: center; 
          justify-content: center;
          margin: 0 auto 16px; 
          color: #fff;
          box-shadow: 0 6px 20px rgba(232,25,44,.35);
          animation: pulse-red 2.2s ease-in-out infinite;
        }
        
        .danger-title { 
          font-size: 22px; 
          font-weight: 900; 
          color: #212121; 
          margin-bottom: 6px; 
        }
        
        .danger-sub { 
          font-size: 13.5px; 
          color: #757575; 
          line-height: 1.55; 
        }

        /* Car Preview */
        .car-preview {
          background: #fff; 
          border: 1.5px solid #F0F0F0; 
          border-radius: 16px;
          padding: 24px; 
          display: flex; 
          align-items: center; 
          gap: 20px;
          box-shadow: 0 2px 16px rgba(0,0,0,.06); 
          margin-bottom: 20px;
          position: relative; 
          overflow: hidden;
        }
        
        .car-preview::after {
          content: ''; 
          position: absolute; 
          top: 0; 
          left: 0; 
          right: 0; 
          height: 3px;
          background: linear-gradient(90deg, #E8192C, #FF3347);
          border-radius: 16px 16px 0 0;
        }
        
        .car-preview-info { 
          flex: 1; 
          min-width: 0; 
        }
        
        .car-preview-name { 
          font-size: 18px; 
          font-weight: 900; 
          color: #212121; 
        }
        
        .car-preview-sub { 
          font-size: 13px; 
          color: #9E9E9E; 
          margin-top: 3px; 
        }

        /* Details Grid */
        .detail-grid { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 10px; 
          margin-bottom: 24px; 
        }
        
        .detail-item {
          background: #fff; 
          border: 1.5px solid #F0F0F0; 
          border-radius: 12px;
          padding: 14px 16px; 
          box-shadow: 0 1px 4px rgba(0,0,0,.04);
        }
        
        .detail-label { 
          font-size: 11px; 
          font-weight: 700; 
          color: #9E9E9E; 
          text-transform: uppercase; 
          letter-spacing: .5px; 
          margin-bottom: 4px; 
        }
        
        .detail-value { 
          font-size: 15px; 
          font-weight: 800; 
          color: #212121; 
        }

        /* Warning Box */
        .warn-box {
          background: #FFF8E1; 
          border: 1.5px solid #FFE082; 
          border-radius: 12px;
          padding: 14px 16px; 
          display: flex; 
          align-items: flex-start; 
          gap: 10px;
          margin-bottom: 24px; 
          font-size: 13px; 
          color: #6D4C00; 
          line-height: 1.5;
        }

        /* Actions */
        .del-actions { 
          display: flex; 
          flex-direction: column; 
          gap: 10px; 
        }
        
        .btn-delete {
          width: 100%; 
          padding: 15px; 
          background: linear-gradient(135deg, #E8192C, #FF3347);
          color: #fff; 
          border: none; 
          border-radius: 12px; 
          font-size: 15px; 
          font-weight: 800;
          cursor: pointer; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          gap: 8px;
          box-shadow: 0 6px 20px rgba(232,25,44,.35); 
          transition: all .2s;
          font-family: 'Cairo', sans-serif;
        }
        
        .btn-delete:hover { 
          transform: translateY(-1px); 
          box-shadow: 0 8px 28px rgba(232,25,44,.45); 
        }
        
        .btn-cancel {
          width: 100%; 
          padding: 14px; 
          background: #F0F0F0; 
          color: #424242;
          border: none; 
          border-radius: 12px; 
          font-size: 15px; 
          font-weight: 700;
          cursor: pointer; 
          transition: all .2s; 
          font-family: 'Cairo', sans-serif;
          text-align: center; 
          text-decoration: none; 
          display: block;
        }
        
        .btn-cancel.shaking { 
          animation: shake .5s ease; 
        }
      `}</style>

      <div className="del-page">
        
        <nav className="del-nav">
          <span className="del-logo">Autoria</span>
          <Link href="/cars" className="del-back">
            ← Back to My Cars
          </Link>
        </nav>

        <div className="del-wrap">
          
          <div className="danger-banner">
            <div className="danger-icon">
              <TrashIcon size={30} />
            </div>
            <div className="danger-title">Delete This Car?</div>
            <div className="danger-sub">
              You're about to permanently remove this vehicle from your account.<br />
              This action <strong>cannot be undone</strong>.
            </div>
          </div>

          <div className="car-preview">
            <CarSVG color={carDetails.color} size={130} />
            <div className="car-preview-info">
              <div className="car-preview-name">
                {carDetails.make} {carDetails.model}
              </div>
              <div className="car-preview-sub">
                {carDetails.year} · {FUELS[carDetails.fuelType]} · {carDetails.licensePlate}
              </div>
            </div>
          </div>

          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Brand</div>
              <div className="detail-value">{carDetails.make}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Model</div>
              <div className="detail-value">{carDetails.model}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Year</div>
              <div className="detail-value">{carDetails.year}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Mileage</div>
              <div className="detail-value">{carDetails.mileage} km</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Fuel</div>
              <div className="detail-value">{FUELS[carDetails.fuelType]}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">License Plate</div>
              <div className="detail-value">{carDetails.licensePlate}</div>
            </div>
          </div>

          <div className="warn-box">
            <span style={{ fontSize: "18px", flexShrink: 0 }}>warning</span>
            <span>
              All data associated with <strong>{carDetails.make} {carDetails.model}</strong> will be permanently erased.
            </span>
          </div>

          <div className="del-actions">
            <button className="btn-delete" onClick={handleDeleteCar}>
              <TrashIcon size={18} /> Yes, Delete {carDetails.make}
            </button>
            <Link 
              href="/cars" 
              className={`btn-cancel${isShaking ? " shaking" : ""}`} 
              onMouseEnter={triggerCancelShake}
            >
              Cancel — Keep My Car
            </Link>
          </div>
          
        </div>
      </div>
    </>
  );
}
