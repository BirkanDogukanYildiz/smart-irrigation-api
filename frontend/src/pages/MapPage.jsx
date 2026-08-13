import { useEffect, useRef, useState } from "react";
import Section from "../components/common/Section";
import Alert from "../components/common/Alert";
import Button from "../components/common/Button";
import DeviceMap from "../components/map/DeviceMap";
import FaultReportModal from "../components/map/FaultReportModal";
import RegionInfoPanel from "../components/map/RegionInfoPanel";
import { listDevices, createDevice, deleteDevice, updateDeviceLocation } from "../api/devices";
import { listRegions, updateRegionBoundary } from "../api/regions";
import { useAuth } from "../context/AuthContext";
import { isManager, isAdmin } from "../utils/roles";
import { zoneColorForRegion } from "../utils/zoneColors";
import "../styles/map.css";

export default function MapPage() {
  const { role } = useAuth();
  const manager = isManager(role);
  const admin = isAdmin(role);
  const mapApiRef = useRef(null);

  const [devices, setDevices] = useState([]);
  const [regions, setRegions] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [error, setError] = useState("");

  const [showZones, setShowZones] = useState(true);
  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const [faultReportDevice, setFaultReportDevice] = useState(null);

  // Zone çizim modu: null iken kapalı, bir bölge id'si iken o bölge için çiziliyor demektir.
  const [drawingRegionId, setDrawingRegionId] = useState(null);
  const [drawPoints, setDrawPoints] = useState([]);
  const [savingBoundary, setSavingBoundary] = useState(false);

  async function loadDevices() {
    try {
      setDevices(await listDevices());
    } catch (e) {
      setError(e.message);
    }
  }

  async function loadRegions() {
    try {
      setRegions(await listRegions());
    } catch {
      // Bölgeler yüklenemezse "Bölgeler" navigasyon barı ve zone katmanı boş kalır,
      // harita cihazlarla birlikte yine de kullanılabilir.
    }
  }

  useEffect(() => {
    loadDevices();
    // Not: bölgeler artık SADECE manager değil, herkes için yükleniyor —
    // "Bölgeler" navigasyon barı ve zone katmanı tüm rollerde faydalı.
    // Görünürlük zaten backend'de role göre filtreleniyor (RegionService.getVisibleRegionEntities).
    loadRegions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLocationChange(id, lat, lng) {
    await updateDeviceLocation(id, lat, lng);
    setDevices((prev) => prev.map((d) => (d.id === id ? { ...d, latitude: lat, longitude: lng } : d)));
  }

  async function handleRemove(device) {
    if (!window.confirm(`#${device.deviceNo} numaralı ekipmanı sistemden ÇIKARMAK istediğine emin misin?`)) return;
    try {
      await deleteDevice(device.id);
      loadDevices();
    } catch (e) {
      window.alert("Ekipman çıkarılamadı: " + e.message);
    }
  }

  async function handleEmptyClick(lat, lng) {
    if (!manager) return;
    if (regions.length === 0) {
      window.alert("Sistemde hiç bölge yok! Önce Bölgeler sayfasından bölge ekleyin.");
      return;
    }
    const regionLabel = regions.map((r, i) => `${i + 1}) ${r.regionName} (${r.districtName})`).join("\n");
    const choice = window.prompt(`Yeni ekipmanı hangi bölgeye eklemek istersiniz?\n\n${regionLabel}\n\nNumara girin:`);
    if (!choice) return;
    const region = regions[Number(choice) - 1];
    if (!region) {
      window.alert("Geçersiz seçim.");
      return;
    }
    const deviceNo = window.prompt("Ekipman numarasını girin:");
    if (!deviceNo) return;
    try {
      await createDevice({ regionId: region.id, deviceNo: Number(deviceNo), latitude: lat, longitude: lng });
      loadDevices();
    } catch (e) {
      window.alert("Ekipman eklenemedi: " + e.message);
    }
  }

  function flyToRegion(region) {
    mapApiRef.current?.flyToRegion(region);
  }

  // ---- Zone'a (bölge sınırına) tıklanınca: zoom + vurgula + bilgi paneli aç ----
  function handleZoneClick(region) {
    setSelectedRegionId(region.id);
    flyToRegion(region);
  }

  // ---- Admin: bölge sınırı (zone) çizimi ----
  function startDrawing(region) {
    setDrawingRegionId(region.id);
    setDrawPoints([]);
    setSelectedRegionId(null);
  }

  function cancelDrawing() {
    setDrawingRegionId(null);
    setDrawPoints([]);
  }

  function undoLastPoint() {
    setDrawPoints((prev) => prev.slice(0, -1));
  }

  async function saveDrawing() {
    if (drawPoints.length < 3) {
      window.alert("Bir zone en az 3 noktadan oluşmalı. Haritaya birkaç nokta daha ekleyin.");
      return;
    }
    setSavingBoundary(true);
    try {
      await updateRegionBoundary(drawingRegionId, drawPoints);
      await loadRegions();
      setDrawingRegionId(null);
      setDrawPoints([]);
    } catch (e) {
      window.alert("Bölge sınırı kaydedilemedi: " + e.message);
    } finally {
      setSavingBoundary(false);
    }
  }

  async function clearZone(region) {
    if (!window.confirm(`"${region.regionName}" bölgesinin haritadaki sınırını kaldırmak istediğinize emin misiniz?`))
      return;
    try {
      await updateRegionBoundary(region.id, null);
      loadRegions();
    } catch (e) {
      window.alert("Sınır kaldırılamadı: " + e.message);
    }
  }

  const drawingRegion = regions.find((r) => r.id === drawingRegionId) || null;
  const selectedRegion = regions.find((r) => r.id === selectedRegionId) || null;

  return (
    <Section
      title="İnteraktif Harita"
      subtitle={
        manager
          ? "Yeni ekipman eklemek için haritada boş bir yere tıklayın. Bölge sınırlarına (zone) tıklayarak o bölgeyi inceleyebilirsiniz."
          : "Ekipmanların anlık lokasyonlarını ve durumlarını inceleyebilirsiniz. Bölge sınırlarına tıklayarak o bölgeyi inceleyebilirsiniz."
      }
    >
      <Alert type="error">{error}</Alert>

      <RegionInfoPanel
        region={selectedRegion}
        devices={devices}
        onClose={() => setSelectedRegionId(null)}
        onFlyTo={flyToRegion}
      />

      {/* --- Bölgeler navigasyon barı: bir bölgeye tıklayınca harita o zone'a odaklanır --- */}
      {regions.length > 0 && (
        <div className="map-toolbar" style={{ marginBottom: "var(--space-2)" }}>
          {regions.map((r) => (
            <button
              key={r.id}
              className={"map-filter-btn" + (selectedRegionId === r.id ? " is-active" : "")}
              onClick={() => handleZoneClick(r)}
              title={`${r.regionName} bölgesine git`}
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: zoneColorForRegion(r.id),
                  display: "inline-block",
                }}
              />
              {r.regionName}
            </button>
          ))}
        </div>
      )}

      <div className="map-toolbar">
        <button
          className={"map-filter-btn" + (filter === "ALL" ? " is-active" : "")}
          onClick={() => setFilter("ALL")}
        >
          Tüm Ekipmanlar
        </button>
        <button
          className={"map-filter-btn" + (filter === "WORKING" ? " is-active" : "")}
          onClick={() => setFilter("WORKING")}
        >
          Sadece Çalışanlar
        </button>
        <button
          className={"map-filter-btn" + (filter === "FAULTY" ? " is-active" : "")}
          onClick={() => setFilter("FAULTY")}
        >
          Sadece Arızalılar
        </button>

        {regions.some((r) => r.boundary) && (
          <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, marginLeft: "auto" }}>
            <input type="checkbox" checked={showZones} onChange={(e) => setShowZones(e.target.checked)} />
            Bölge sınırlarını göster
          </label>
        )}
      </div>

      {/* --- Admin: zone çizim kontrolleri --- */}
      {admin && (
        <div className="map-toolbar" style={{ flexWrap: "wrap" }}>
          {drawingRegionId == null ? (
            <>
              <span className="hint" style={{ marginRight: 4 }}>
                Bölge sınırı çiz/düzenle:
              </span>
              {regions.map((r) => (
                <button key={r.id} className="map-filter-btn" onClick={() => startDrawing(r)}>
                  {r.boundary ? "Düzenle: " : "Çiz: "}
                  {r.regionName}
                </button>
              ))}
              {regions.filter((r) => r.boundary).length > 0 && (
                <select
                  defaultValue=""
                  onChange={(e) => {
                    const region = regions.find((r) => String(r.id) === e.target.value);
                    if (region) clearZone(region);
                    e.target.value = "";
                  }}
                >
                  <option value="" disabled>
                    Sınır kaldır...
                  </option>
                  {regions
                    .filter((r) => r.boundary)
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.regionName}
                      </option>
                    ))}
                </select>
              )}
            </>
          ) : (
            <>
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>
                "{drawingRegion?.regionName}" için sınır çiziliyor — haritaya tıklayarak nokta ekleyin (
                {drawPoints.length} nokta, en az 3 gerekli).
              </span>
              <Button size="sm" variant="secondary" onClick={undoLastPoint} disabled={drawPoints.length === 0}>
                Son Noktayı Geri Al
              </Button>
              <Button size="sm" variant="primary" onClick={saveDrawing} disabled={savingBoundary || drawPoints.length < 3}>
                {savingBoundary ? "Kaydediliyor..." : "Kaydet"}
              </Button>
              <Button size="sm" variant="secondary" onClick={cancelDrawing}>
                İptal
              </Button>
            </>
          )}
        </div>
      )}

      <div className="map-legend">
        <span><span className="dot" style={{ background: "#1f8a55" }} />Çalışıyor</span>
        <span><span className="dot" style={{ background: "#c1352a" }} />Arızalı</span>
        <span><span className="dot" style={{ background: "#b5750a" }} />Küme içinde karışık</span>
      </div>

      <DeviceMap
        ref={mapApiRef}
        devices={devices}
        filter={filter}
        isManager={manager}
        onLocationChange={handleLocationChange}
        onRemove={handleRemove}
        onEmptyClick={manager ? handleEmptyClick : null}
        onViewFaultReport={setFaultReportDevice}
        regions={regions}
        showZones={showZones}
        selectedRegionId={selectedRegionId}
        onZoneClick={handleZoneClick}
        drawingRegionId={drawingRegionId}
        drawPoints={drawPoints}
        onDrawPointAdd={(lat, lng) => setDrawPoints((prev) => [...prev, [lat, lng]])}
      />

      <FaultReportModal device={faultReportDevice} onClose={() => setFaultReportDevice(null)} />
    </Section>
  );
}
