import { useEffect, useImperativeHandle, useRef, forwardRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { deviceSymbolIcon } from "../../utils/mapIcons";
import { zoneColorForRegion } from "../../utils/zoneColors";
import { deviceDisplayName } from "../../utils/deviceDisplay";
import { formatDateTime } from "../../utils/format";
import { durationSince } from "../../utils/durationSince";
import "../../styles/map.css";

const ISTANBUL_CENTER = [41.0136, 28.955];

function parseBoundary(boundary) {
  if (!boundary) return null;
  try {
    const coords = JSON.parse(boundary);
    if (Array.isArray(coords) && coords.length >= 3) return coords;
    return null;
  } catch {
    return null;
  }
}

/**
 * props:
 * - devices: SprinklerInfoResponseDto[] (latitude/longitude olanlar haritada gösterilir)
 * - filter: "ALL" | "WORKING" | "FAULTY"
 * - isManager: sürükleyerek konum güncelleme + kaldırma yetkisi
 * - onLocationChange(id, lat, lng)
 * - onRemove(device)
 * - onEmptyClick(lat, lng): boş bir yere tıklanınca (yeni cihaz eklemek için) — çizim modu KAPALIYKEN çalışır
 * - onViewFaultReport(device): pin popup'ındaki "Arıza Raporunu Görüntüle" butonuna basılınca
 * - regions: RegionResponseDto[] — zone katmanı ve "Bölgeler" navigasyonu için
 * - showZones: bölge sınırlarını (zone) saydam katman olarak göster/gizle
 * - selectedRegionId: haritada tıklanarak seçilmiş/vurgulanmış bölgenin id'si
 * - onZoneClick(region): bir zone çokgenine tıklanınca çalışır
 * - drawingRegionId / drawPoints / onDrawPointAdd: admin zone çizim modu (bkz. MapPage)
 *
 * ref üzerinden dışa açılan metod:
 * - flyToRegion(region): bölgenin zone'u varsa sınırlarına, yoksa bölgedeki cihazların
 *   ortalama konumuna (o da yoksa hiçbir şey yapmadan) haritayı odaklar.
 */
const DeviceMap = forwardRef(function DeviceMap(
  {
    devices,
    filter,
    isManager,
    onLocationChange,
    onRemove,
    onEmptyClick,
    onViewFaultReport,
    regions = [],
    showZones = true,
    selectedRegionId = null,
    onZoneClick,
    drawingRegionId = null,
    drawPoints = [],
    onDrawPointAdd,
    pickingLocation = false,
    assetTypeFilter = "",
  },
  ref
) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const clusterRef = useRef(null);
  const zonesLayerRef = useRef(null);
  const drawLayerRef = useRef(null);

  // Parent'tan gelen prop'ları güncel tutmak için (event handler'lar closure'da bayatlamasın diye)
  const stateRef = useRef({});
  stateRef.current = { onEmptyClick, drawingRegionId, onDrawPointAdd };

  useImperativeHandle(ref, () => ({
    flyToRegion(region) {
      const map = mapInstance.current;
      if (!map || !region) return;

      const coords = parseBoundary(region.boundary);
      if (coords) {
        const bounds = L.latLngBounds(coords.map(([lat, lng]) => [lat, lng]));
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 });
        return;
      }

      // Zone çizilmemişse: o bölgeye ait cihazların ortalama konumuna git.
      const regionDevices = (devices || []).filter(
        (d) => d.region?.id === region.id && d.latitude != null && d.longitude != null
      );
      if (regionDevices.length > 0) {
        const avgLat = regionDevices.reduce((s, d) => s + d.latitude, 0) / regionDevices.length;
        const avgLng = regionDevices.reduce((s, d) => s + d.longitude, 0) / regionDevices.length;
        map.setView([avgLat, avgLng], 16);
        return;
      }

      window.alert(
        `"${region.regionName}" için henüz haritada bir sınır çizilmemiş ve konumu bilinen bir ekipmanı yok.`
      );
    },
  }));

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

    map.on("click", (e) => {
      const { drawingRegionId, onDrawPointAdd, onEmptyClick } = stateRef.current;
      if (drawingRegionId != null) {
        onDrawPointAdd?.(e.latlng.lat, e.latlng.lng);
      } else {
        onEmptyClick?.(e.latlng.lat, e.latlng.lng);
      }
    });

    mapInstance.current = map;
    setTimeout(() => map.invalidateSize(), 150);
    return () => {
      map.remove();
      mapInstance.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Cihaz marker'ları (kümelenmiş) ----
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
    const statusFiltered = filter === "ALL" ? visible : visible.filter((d) => d.status === filter);
    const filtered = assetTypeFilter ? statusFiltered.filter((d) => d.assetType === assetTypeFilter) : statusFiltered;

    filtered.forEach((d) => {
      // Not: backend şu an sadece iki gerçek durum tutuyor (WORKING / FAULTY).
      // Üçüncü bir "pasif/bilinmeyen" pin rengi eklemedik çünkü bunu destekleyecek
      // gerçek bir veri yok — fake bir durum uydurmak yanıltıcı olurdu.
      const marker = L.marker([d.latitude, d.longitude], {
        icon: deviceSymbolIcon(d.assetType, d.status),
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
          `${deviceDisplayName(d)} konumunu değiştirmek üzeresiniz.\n\nYeni konumu kaydetmek istediğinize emin misiniz?`
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

      // ---- Popup içeriği: cihaz adı, ID, bölge, durum, son çalışma zamanı ----
      const statusHtml =
        d.status === "WORKING"
          ? `<strong style="color:#1f8a55;">Çalışıyor</strong>`
          : `<strong style="color:#c1352a;">Arızalı</strong>`;

      // Arıza SLA rozeti: sadece arızalıyken, mevcut statusChangedAt'tan hesaplanır
      // (yeni bir backend alanı/endpoint'i eklenmedi).
      const faultAge = d.status === "FAULTY" ? durationSince(d.statusChangedAt) : null;
      const faultAgeHtml = faultAge
        ? `<p><strong>Açık Süresi:</strong> <span style="color:#c1352a; font-weight:600;">${faultAge}</span></p>`
        : "";

      const popupEl = document.createElement("div");
      popupEl.innerHTML = `
        <h4>${deviceDisplayName(d)}</h4>
        <p><strong>Cihaz ID:</strong> #${d.id}</p>
        <p><strong>Bölge:</strong> ${d.region?.regionName ?? ""} (${d.region?.districtName ?? ""})</p>
        <p><strong>Durum:</strong> ${statusHtml}</p>
        <p><strong>Son Çalışma/Güncelleme:</strong> ${formatDateTime(d.statusChangedAt)}</p>
        ${faultAgeHtml}
      `;

      if (d.status === "FAULTY" && onViewFaultReport) {
        const reportBtn = document.createElement("button");
        reportBtn.textContent = "Arıza Raporunu Görüntüle";
        reportBtn.className = "btn btn-danger btn-sm";
        reportBtn.style.width = "100%";
        reportBtn.style.marginTop = "8px";
        reportBtn.onclick = () => onViewFaultReport(d);
        popupEl.appendChild(reportBtn);
      }

      if (isManager && onRemove) {
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Ekipmanı Kaldır";
        removeBtn.className = "btn btn-secondary btn-sm";
        removeBtn.style.width = "100%";
        removeBtn.style.marginTop = "6px";
        removeBtn.onclick = () => onRemove(d);
        popupEl.appendChild(removeBtn);
      }
      marker.bindPopup(popupEl);

      clusterGroup.addLayer(marker);
    });

    map.addLayer(clusterGroup);
    clusterRef.current = clusterGroup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [devices, filter, isManager, assetTypeFilter]);

  // ---- Bölge zone katmanı (saydam çokgenler, tıklanabilir, seçili olan vurgulanır) ----
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    if (zonesLayerRef.current) {
      map.removeLayer(zonesLayerRef.current);
      zonesLayerRef.current = null;
    }
    if (!showZones) return;

    const zonesLayer = L.layerGroup();
    regions.forEach((region) => {
      const coords = parseBoundary(region.boundary);
      if (!coords) return;
      // Şu an çizilmekte olan bölgeyi burada tekrar çizmiyoruz, çünkü onu ayrı
      // (canlı güncellenen) bir katman olarak drawLayerRef üzerinden gösteriyoruz.
      if (drawingRegionId === region.id) return;

      const isSelected = selectedRegionId === region.id;
      const color = zoneColorForRegion(region.id);
      const polygon = L.polygon(coords, {
        color,
        weight: isSelected ? 4 : 2,
        fillColor: color,
        fillOpacity: isSelected ? 0.32 : 0.15,
        opacity: isSelected ? 1 : 0.7,
      });
      polygon.bindTooltip(region.regionName, { sticky: true });
      polygon.on("click", (e) => {
        // Harita üzerinde tıklama zone'dan taşıp map'in genel click handler'ına (yeni
        // ekipman ekleme/çizim modu) gitmesin diye durduruyoruz.
        L.DomEvent.stopPropagation(e);
        onZoneClick?.(region);
      });
      polygon.on("mouseover", () => polygon.setStyle({ fillOpacity: Math.min((isSelected ? 0.32 : 0.15) + 0.12, 0.5) }));
      polygon.on("mouseout", () => polygon.setStyle({ fillOpacity: isSelected ? 0.32 : 0.15 }));
      zonesLayer.addLayer(polygon);
    });

    zonesLayer.addTo(map);
    zonesLayer.eachLayer((l) => l.bringToBack?.());
    zonesLayerRef.current = zonesLayer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regions, showZones, drawingRegionId, selectedRegionId]);

  // ---- Çizim modu: şu ana kadar eklenen noktaları canlı göster ----
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    if (drawLayerRef.current) {
      map.removeLayer(drawLayerRef.current);
      drawLayerRef.current = null;
    }
    if (drawingRegionId == null || drawPoints.length === 0) return;

    const color = zoneColorForRegion(drawingRegionId);
    const layer = L.layerGroup();

    if (drawPoints.length >= 3) {
      layer.addLayer(
        L.polygon(drawPoints, { color, weight: 2, fillColor: color, fillOpacity: 0.25, dashArray: "6 4" })
      );
    } else {
      layer.addLayer(L.polyline(drawPoints, { color, weight: 2, dashArray: "6 4" }));
    }
    drawPoints.forEach(([lat, lng], idx) => {
      layer.addLayer(
        L.circleMarker([lat, lng], { radius: 5, color, fillColor: "#fff", fillOpacity: 1, weight: 2 }).bindTooltip(
          String(idx + 1),
          { permanent: false }
        )
      );
    });

    layer.addTo(map);
    drawLayerRef.current = layer;
  }, [drawingRegionId, drawPoints]);

  return <div ref={mapRef} className="big-map" style={{ cursor: drawingRegionId != null || pickingLocation ? "crosshair" : "" }} />;
});

export default DeviceMap;
