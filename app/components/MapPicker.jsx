"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

function LocationPicker({ setLocation }) {
  useMapEvents({
    click(e) {
      setLocation((prev) => ({
        ...prev,
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
        pinned: true,
      }));
    },
  });

  return null;
}

export default function MapPicker({ location, setLocation }) {
  if (!location) return null;

  return (
    <MapContainer
      center={[location.latitude, location.longitude]}
      zoom={13}
      style={{ height: "300px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <Marker
        position={[location.latitude, location.longitude]}
        draggable
        eventHandlers={{
          dragend: (e) => {
            const pos = e.target.getLatLng();
            setLocation((prev) => ({
              ...prev,
              latitude: pos.lat,
              longitude: pos.lng,
              pinned: true,
            }));
          },
        }}
      />

      <LocationPicker setLocation={setLocation} />
    </MapContainer>
  );
}