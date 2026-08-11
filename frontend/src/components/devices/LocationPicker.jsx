import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Button from "../common/Button";
import { bluePinIcon } from "../../utils/mapIcons";
import "../../styles/map.css";

const ISTANBUL_CENTER = [41.0136, 28.955];

export default function LocationPicker({ value, onChange }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const [locating, setLocating] = useState(false);

  // Harita bir kez kurulur
  useEffect(() => {
    if (mapInstance.current) return;
    const map = L.map(mapRef.current).setView(ISTANBUL_CENTER, 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    map.on("click", (e) => onChange({ lat: e.latlng.lat, lng: e.latlng.lng }));
    mapInstance.current = map;

    setTimeout(() => map.invalidateSize(), 150);
    return () => {
      map.remove();
      mapInstance.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Seçilen konum değiştiğinde pini güncelle
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    if (!value) {
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      return;
    }
    if (markerRef.current) {
      markerRef.current.setLatLng(value);
    } else {
      const marker = L.marker(value, { draggable: true, icon: bluePinIcon }).addTo(map);
      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        onChange({ lat: pos.lat, lng: pos.lng });
      });
      markerRef.current = marker;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function useMyLocation() {
    if (!("geolocation" in navigator)) {
      window.alert("Tarayıcınız konum servisini desteklemiyor. Konumu haritaya tıklayarak elle seçebilirsiniz.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        onChange(coords);
        mapInstance.current?.setView(coords, 15);
        setLocating(false);
      },
      () => {
        window.alert("Konum alınamadı. Konumu haritaya tıklayarak elle seçebilirsiniz.");
        setLocating(false);
      }
    );
  }

  return (
    <div>
      <div className="location-picker-toolbar">
        <p className="hint">Konum seçmek için haritaya tıklayın ya da pini sürükleyin. Opsiyoneldir.</p>
        <Button size="sm" variant="secondary" type="button" disabled={locating} onClick={useMyLocation}>
          {locating ? "Konum alınıyor..." : "Bulunduğum Konumu Kullan"}
        </Button>
      </div>
      <div ref={mapRef} className="location-picker-map" />
      <div className="location-picker-info">
        {value ? (
          <>
            <b>Seçilen konum:</b> {value.lat.toFixed(5)}, {value.lng.toFixed(5)}{" "}
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange(null)}>
              Temizle
            </button>
          </>
        ) : (
          "Konum seçilmedi."
        )}
      </div>
    </div>
  );
}
