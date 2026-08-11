import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { greenPinIcon, redPinIcon } from "../../utils/mapIcons";
import "../../styles/map.css";

const ISTANBUL_CENTER = [41.0136, 28.955];

/**
 * props:
 * - devices: SprinklerInfoResponseDto[] (latitude/longitude olanlar haritada gösterilir)
 * - filter: "ALL" | "WORKING" | "FAULTY"
 * - isManager: sürükleyerek konum güncelleme + kaldırma yetkisi
 * - onLocationChange(id, lat, lng)
 * - onRemove(device)
 * - onEmptyClick(lat, lng): boş bir yere tıklanınca (yeni cihaz eklemek için)
 */
export default function DeviceMap({ devices, filter, isManager, onLocationChange, onRemove, onEmptyClick }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const clusterRef = useRef(null);

  useEffect(() => {
    const map = L.map(mapRef.current).setView(ISTANBUL_CENTER, 12);

    const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OSM",
    });
    const uydu = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 19, attribution: "© Esri" }
    );
    const karanlik = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      attribution: "© CartoDB",
    });
    osm.addTo(map);
    L.control
      .layers({ "Sokak Görünümü": osm, "Uydu Görünümü": uydu, "Karanlık Tema": karanlik })
      .addTo(map);

    if (onEmptyClick) {
      map.on("click", (e) => onEmptyClick(e.latlng.lat, e.latlng.lng));
    }

    mapInstance.current = map;
    setTimeout(() => map.invalidateSize(), 150);
    return () => {
      map.remove();
      mapInstance.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    if (clusterRef.current) {
      map.removeLayer(clusterRef.current);
    }
    const clusterGroup = L.markerClusterGroup({
      disableClusteringAtZoom: 17,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: 50,
      iconCreateFunction: (cluster) => {
        const children = cluster.getAllChildMarkers();
        const total = children.length;
        const faulty = children.filter((m) => m.options.deviceStatus === "FAULTY").length;
        let cls = "marker-cluster-working";
        if (faulty === total) cls = "marker-cluster-faulty";
        else if (faulty > 0) cls = "marker-cluster-mixed";
        return new L.DivIcon({
          html: `<div><span>${total}</span></div>`,
          className: "marker-cluster " + cls,
          iconSize: L.point(40, 40),
        });
      },
    });

    const visible = devices.filter((d) => d.latitude != null && d.longitude != null);
    const filtered = filter === "ALL" ? visible : visible.filter((d) => d.status === filter);

    filtered.forEach((d) => {
      const marker = L.marker([d.latitude, d.longitude], {
        icon: d.status === "WORKING" ? greenPinIcon : redPinIcon,
        draggable: isManager,
        deviceStatus: d.status,
      });

      let lastPos = marker.getLatLng();
      marker.on("dragstart", (e) => {
        lastPos = e.target.getLatLng();
      });
      marker.on("dragend", async (e) => {
        const pos = e.target.getLatLng();
        const confirmed = window.confirm(
          `Cihaz #${d.deviceNo} konumunu değiştirmek üzeresiniz.\n\nYeni konumu kaydetmek istediğinize emin misiniz?`
        );
        if (!confirmed) {
          e.target.setLatLng(lastPos);
          return;
        }
        try {
          await onLocationChange(d.id, pos.lat, pos.lng);
          lastPos = pos;
        } catch (err) {
          window.alert("Konum kaydedilemedi, değişiklik geri alınıyor: " + err.message);
          e.target.setLatLng(lastPos);
        }
      });

      const statusHtml =
        d.status === "WORKING"
          ? `<strong style="color:#1f8a55;">Çalışıyor</strong>`
          : `<strong style="color:#c1352a;">Arızalı</strong><br/><em>Sebep: ${d.description || ""}</em>`;

      const popupEl = document.createElement("div");
      popupEl.innerHTML = `
        <h4>Cihaz #${d.deviceNo}</h4>
        <p><strong>Bölge:</strong> ${d.region?.regionName ?? ""} (${d.region?.districtName ?? ""})</p>
        <p><strong>Durum:</strong> ${statusHtml}</p>
      `;
      if (isManager && onRemove) {
        const btn = document.createElement("button");
        btn.textContent = "Cihazı Kaldır";
        btn.className = "btn btn-danger btn-sm";
        btn.style.width = "100%";
        btn.style.marginTop = "8px";
        btn.onclick = () => onRemove(d);
        popupEl.appendChild(btn);
      }
      marker.bindPopup(popupEl);

      clusterGroup.addLayer(marker);
    });

    map.addLayer(clusterGroup);
    clusterRef.current = clusterGroup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [devices, filter, isManager]);

  return <div ref={mapRef} className="big-map" />;
}
