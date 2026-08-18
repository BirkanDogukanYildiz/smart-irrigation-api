import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { parkPinIcon } from "../../utils/mapIcons";
import { parseBoundary, polygonCentroid } from "../../utils/geo";
import "../../styles/map.css";

const ISTANBUL_CENTER = [41.0136, 28.955];

// Vatandaş haritası: personel tarafında (bkz. DeviceMap.jsx) çizilen zone'ları
// AYNEN kullanır — ayrı bir veri kaynağı/koordinat sistemi YOK. Tek fark: polygon'un
// kendisi kullanıcıya çizim olarak gösterilmez, bunun yerine geometrik merkezine
// (centroid, bkz. utils/geo.js) tek bir park pini yerleştirilir. Çizim araçları yok,
// polygon düzenlenemez — sadece bilgi amaçlı, salt-görüntüleme.
//
// props:
// - parks: PublicParkDto[] (id, regionName, districtName, description, boundary, assetCount)
export default function CitizenParkMap({ parks }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersLayerRef = useRef(null);

  useEffect(() => {
    const map = L.map(mapRef.current).setView(ISTANBUL_CENTER, 11);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OSM",
    }).addTo(map);

    mapInstance.current = map;
    setTimeout(() => map.invalidateSize(), 150);
    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    if (markersLayerRef.current) {
      map.removeLayer(markersLayerRef.current);
      markersLayerRef.current = null;
    }

    const layer = L.layerGroup();
    const bounds = [];

    (parks || []).forEach((park) => {
      const coords = parseBoundary(park.boundary);
      const centroid = polygonCentroid(coords);
      if (!centroid) return; // boundary yoksa/parse edilemiyorsa bu park haritada gösterilmez

      bounds.push(centroid);

      const marker = L.marker(centroid, { icon: parkPinIcon });

      const popupEl = document.createElement("div");
      popupEl.innerHTML = `
        <h4>${park.regionName}</h4>
        <p><strong>İlçe:</strong> ${park.districtName ?? "—"}</p>
        ${park.description ? `<p>${park.description}</p>` : ""}
        <p><strong>Ekipman Sayısı:</strong> ${park.assetCount}</p>
      `;
      marker.bindPopup(popupEl);

      layer.addLayer(marker);
    });

    layer.addTo(map);
    markersLayerRef.current = layer;

    if (bounds.length > 0) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [50, 50], maxZoom: 15 });
    }
  }, [parks]);

  return <div ref={mapRef} className="big-map" />;
}
