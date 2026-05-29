"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { getMe } from "@/lib/api/usersService";
import mechanicsService from "@/lib/api/mechanicsService";
import Navbar from "@/components/Navbar";

const R = "#E8272A";
const RD = "#B81C1F";

const row = (gap = 0) => ({
  display: "flex",
  alignItems: "center",
  gap,
});

function SearchBanner({
  query,
  setQuery,
  city,
  setCity,
  onSearch,
}) {
  return (
    <section
      style={{
        background: `linear-gradient(135deg,#111 0%,#2d1010 52%,${RD} 100%)`,
        padding: "52px 5% 44px",
        textAlign: "center",
      }}
    >
      <h1 style={{ color: "#fff", fontSize: 38, fontWeight: 900 }}>
        Find Skilled <em style={{ color: "#ff6b6b", fontStyle: "normal" }}>Mechanics</em>
      </h1>

      <p style={{ color: "rgba(255,255,255,.6)", marginBottom: 25 }}>
        Browse verified mechanics .
      </p>

      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          display: "flex",
          maxWidth: 700,
          margin: "0 auto",
          overflow: "hidden",
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or specialization..."
          style={{
            flex: 1,
            padding: 14,
            border: "none",
            outline: "none",
          }}
        />

        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City..."
          style={{
            width: 180,
            border: "none",
            outline: "none",
            padding: 14,
            borderLeft: "1px solid #eee",
          }}
        />

        <button
          onClick={onSearch}
          style={{
            background: R,
            color: "#fff",
            border: "none",
            padding: "0 24px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </div>
    </section>
  );
}

function MechanicCard({ m }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #eee",
        borderRadius: 14,
        padding: 16,
        transition: "0.2s",
      }}
    >
      <div style={{ display: "flex", gap: 12 }}>
        <img
          src={m.profilePhotoUrl || "/default.png"}
          alt={m.fullName}
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />

        <div>
          <h3 style={{ margin: 0, fontSize: 16 }}>{m.fullName}</h3>
          <p style={{ margin: 0, fontSize: 12, color: "#777" }}>
            {m.city} • {m.yearsOfExperience} yrs exp
          </p>

          <p style={{ fontSize: 12, color: "#999" }}>
            ⭐ {m.rating ?? 0}
            {m.distanceInKm != null && (
              <> • {m.distanceInKm.toFixed(1)} km away</>
            )}
          </p>
        </div>
      </div>

      <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
        {m.specializations?.map((s) => (
          <span
            key={s}
            style={{
              fontSize: 11,
              background: "#f3f4f6",
              padding: "3px 8px",
              borderRadius: 6,
            }}
          >
            {s}
          </span>
        ))}
      </div>

     <Link href={`/mechanics/${m.id}`}>
  <button
    style={{
      marginTop: 12,
      width: "100%",
      background: R,
      color: "#fff",
      border: "none",
      padding: 10,
      borderRadius: 8,
      cursor: "pointer",
    }}
  >
    View Profile
  </button>
</Link>
    </div>
  );
}

export default function MechanicsPage() {
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [activeCity, setActiveCity] = useState("");
useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await mechanicsService.browse();

      // depending on apiAuthFetch return shape
      const data = res?.data?.items || res?.items || [];

      setMechanics(data);
    } catch (err) {
      console.error("Failed to load mechanics", err);
      setMechanics([]);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

  const handleSearch = () => {
    setActiveQuery(query.toLowerCase());
    setActiveCity(city.toLowerCase());
  };

  const filtered = useMemo(() => {
    let list = [...mechanics];

    if (activeQuery) {
      list = list.filter(
        (m) =>
          m.fullName?.toLowerCase().includes(activeQuery) ||
          m.specializations?.some((s) =>
            s.toLowerCase().includes(activeQuery)
          )
      );
    }

    if (activeCity) {
      list = list.filter((m) =>
        m.city?.toLowerCase().includes(activeCity)
      );
    }

    return list;
  }, [mechanics, activeQuery, activeCity]);

  return (
    <div style={{ fontFamily: "Inter", background: "#f7f7f8", minHeight: "100vh" }}>
      <Navbar />

      <SearchBanner
        query={query}
        setQuery={setQuery}
        city={city}
        setCity={setCity}
        onSearch={handleSearch}
      />

      <div style={{ padding: "30px 5%" }}>
        {loading ? (
          <p>Loading mechanics...</p>
        ) : filtered.length === 0 ? (
          <p>No mechanics found.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
            }}
          >
            {filtered.map((m) => (
              <MechanicCard key={m.id} m={m} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
