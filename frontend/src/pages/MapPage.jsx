import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Section from "../components/common/Section";
import Alert from "../components/common/Alert";
import Button from "../components/common/Button";
import PaginationControls from "../components/common/PaginationControls";
import DeviceMap from "../components/map/DeviceMap";
import RegionInfoPanel from "../components/map/RegionInfoPanel";
import DeviceForm from "../components/devices/DeviceForm";
import DeviceTable from "../components/devices/DeviceTable";
import ReportFaultModal from "../components/devices/ReportFaultModal";
import { listDevices, searchDevices, createDevice, updateDeviceStatus, deleteDevice, updateDeviceLocation } from "../api/devices";
import { listRegions, updateRegionBoundary } from "../api/regions";
import { exportDevicesCsv, exportFaultsCsv } from "../api/export";
import { useAuth } from "../context/AuthContext";
import { isManager, isAdmin } from "../utils/roles";
import { zoneColorForRegion } from "../utils/zoneColors";
import { ASSET_TYPES, assetTypeLabel } from "../utils/assetTypes";
import "../styles/map.css";

const PAGE_SIZE = 20;

// Harita ve Cihazlar sekmeleri BİRLEŞTİRİLDİ: hem görsel harita hem de arama/
// sayfalamalı cihaz listesi/yönetimi artık aynı sayfada. Yetkilendirme aynen
// korunuyor: harita herkese açık, cihaz yönetimi (form, silme, dışa aktarma)
// hâlâ sadece isManager (ADMIN+HEADGARDENER) rolüne görünür.
export default function MapPage() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const manager = isManager(role);
  const admin = isAdmin(role);
  const mapApiRef = useRef(null);
  const mapSectionRef = useRef(null);

  const [devices, setDevices] = useState([]);
  const [regions, setRegions] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [error, setError] = useState("");

  const [showZones, setShowZones] = useState(true);
  const [selectedRegionId, setSelectedRegionId] = useState(null);

  // Zone çizim modu: null iken kapalı, bir bölge id'si iken o bölge için çiziliyor demektir.
  const [drawingRegionId, setDrawingRegionId] = useState(null);
  const [drawPoints, setDrawPoints] = useState([]);
  const [savingBoundary, setSavingBoundary] = useState(false);

  // Haritaya tıklayarak hızlı ekipman ekleme: artık window.prompt ile numara YAZDIRMIYORUZ,
  // bölge gerçek bir <select> içinde alt alta listeleniyor, oradan seçiliyor.
  const [pendingLocation, setPendingLocation] = useState(null); // {lat, lng} | null
  const [quickAddRegionId, setQuickAddRegionId] = useState("");
  const [quickAddDeviceNo, setQuickAddDeviceNo] = useState("");
  const [quickAddAssetType, setQuickAddAssetType] = useState(ASSET_TYPES.SULAMA_CIHAZI);
  const [quickAddSubmitting, setQuickAddSubmitting] = useState(false);

  // Alttaki "Yeni Ekipman Ekle" formu için üst haritadan pinleme akışı: kullanıcı
  // formdaki "Haritadan Pinle" butonuna basınca pickingForForm true olur, harita
  // görünüme kaydırılır; bir sonraki harita tıklaması hızlı-ekle panelini DEĞİL,
  // bu konumu (formLocation) set eder ve kullanıcı tekrar forma kaydırılır.
  const [formLocation, setFormLocation] = useState(null);
  const [pickingForForm, setPickingForForm] = useState(false);
  const formSectionRef = useRef(null);

  // Arıza bildirme artık window.prompt yerine gerçek bir modal (bkz. ReportFaultModal) ile yapılıyor.
  const [reportingDevice, setReportingDevice] = useState(null);

  // ---- Alt bölüm: cihaz yönetimi (server-side arama/filtre/sayfalama) — sadece manager ----
  const [managedDevices, setManagedDevices] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [search, setSearch] = useState("");

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
      // Bölgeler yüklenemezse "Bölgeye Git" ve zone katmanı boş kalır, harita yine kullanılabilir.
    }
  }

  async function loadManagedDevices() {
    if (!manager) return;
    try {
      const result = await searchDevices({
        page,
        size: PAGE_SIZE,
        status: statusFilter || undefined,
        assetType: typeFilter || undefined,
        regionId: regionFilter || undefined,
        q: search || undefined,
      });
      setManagedDevices(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    loadDevices();
    loadRegions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadManagedDevices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, typeFilter, regionFilter, search, manager]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, typeFilter, regionFilter, search]);

  function refreshAll() {
    loadDevices();
    loadManagedDevices();
  }

  function handleFormDeviceCreated() {
    setFormLocation(null);
    refreshAll();
  }

  async function handleLocationChange(id, lat, lng) {
    await updateDeviceLocation(id, lat, lng);
    setDevices((prev) => prev.map((d) => (d.id === id ? { ...d, latitude: lat, longitude: lng } : d)));
  }

  async function handleRemove(device) {
    if (!window.confirm(`#${device.deviceNo} numaralı ekipmanı sistemden ÇIKARMAK istediğine emin misin?`)) return;
    try {
      await deleteDevice(device.id);
      refreshAll();
    } catch (e) {
      window.alert("Ekipman çıkarılamadı: " + e.message);
    }
  }

  function handleEmptyClick(lat, lng) {
    if (!manager) return;
    // Form için pinleme modu aktifse: hızlı-ekle panelini açmak yerine bu konumu
    // forma yaz, pinleme modunu kapat ve kullanıcıyı forma geri kaydır.
    if (pickingForForm) {
      setFormLocation({ lat, lng });
      setPickingForForm(false);
      formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setPendingLocation({ lat, lng });
    setQuickAddRegionId("");
    setQuickAddDeviceNo("");
    setQuickAddAssetType(ASSET_TYPES.SULAMA_CIHAZI);
  }

  function startPinningForForm() {
    setPickingForForm(true);
    setPendingLocation(null);
    mapSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function submitQuickAdd() {
    if (!quickAddRegionId) {
      window.alert("Lütfen bir bölge seçin.");
      return;
    }
    if (!quickAddDeviceNo) {
      window.alert("Lütfen ekipman numarasını girin.");
      return;
    }
    setQuickAddSubmitting(true);
    try {
      await createDevice({
        regionId: Number(quickAddRegionId),
        deviceNo: Number(quickAddDeviceNo),
        assetType: quickAddAssetType,
        latitude: pendingLocation.lat,
        longitude: pendingLocation.lng,
      });
      setPendingLocation(null);
      refreshAll();
    } catch (e) {
      window.alert("Ekipman eklenemedi: " + e.message);
    } finally {
      setQuickAddSubmitting(false);
    }
  }

  function flyToRegion(region) {
    mapApiRef.current?.flyToRegion(region);
  }

  // ---- Zone'a (bölge sınırına) tıklanınca: zoom + vurgula + bilgi paneli aç + haritayı görünüme getir ----
  function handleZoneClick(region) {
    setSelectedRegionId(region.id);
    flyToRegion(region);
    // Sayfa aşağı kaydırılmışsa (örn. alttaki cihaz listesindeyken "Bölgeye Git" kullanıldıysa)
    // harita otomatik olarak görünür alana kaydırılsın — kullanıcı elle yukarı çıkmasın.
    // requestAnimationFrame: state güncellemesiyle (RegionInfoPanel açılıp haritanın üstündeki
    // içerik büyüyebiliyor) DOM boyutunun oturmasını bekleyip ondan sonra kaydırıyoruz, yoksa
    // scrollIntoView eski (daha kısa) layout'a göre hesaplanıp hedefin biraz gerisinde kalabiliyordu.
    requestAnimationFrame(() => {
      mapSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  // ---- Admin: bölge sınırı (zone) çizimi ----
  function startDrawing(region) {
    setDrawingRegionId(region.id);
    setDrawPoints([]);
    setSelectedRegionId(null);
    setPendingLocation(null);
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

  function toggleStatus(device) {
    if (device.status === "WORKING") {
      setReportingDevice(device);
    } else {
      if (!window.confirm("Ekipmanın onarıldığını onaylıyor musun?")) return;
      updateDeviceStatus(device.id, "WORKING")
        .then(refreshAll)
        .catch((e) => window.alert("Durum güncellenemedi: " + e.message));
    }
  }

  async function submitFaultReport(description, faultType, photoDataUrl) {
    await updateDeviceStatus(reportingDevice.id, "FAULTY", description, faultType, photoDataUrl);
    setReportingDevice(null);
    refreshAll();
  }

  async function handleExport(fn) {
    try {
      await fn();
    } catch (e) {
      window.alert("İndirme başarısız: " + e.message);
    }
  }

  const drawingRegion = regions.find((r) => r.id === drawingRegionId) || null;
  const selectedRegion = regions.find((r) => r.id === selectedRegionId) || null;

  return (
    <>
      <div ref={mapSectionRef} className="map-scroll-target">
      <Section
        title="İnteraktif Harita"
        subtitle={
          manager
            ? "Yeni ekipman eklemek için haritada boş bir yere tıklayın. Bölge sınırlarına (zone) tıklayarak o bölgeyi inceleyebilirsiniz."
            : "Ekipmanların anlık lokasyonlarını ve durumlarını inceleyebilirsiniz. Bölge sınırlarına tıklayarak o bölgeyi inceleyebilirsiniz."
        }
      >
        <Alert type="error">{error}</Alert>

        {pickingForForm && (
          <div className="map-picking-banner">
            <span>📍 Aşağıdaki formda eklenecek ekipman için haritada bir konuma tıklayın.</span>
            <Button size="sm" variant="secondary" onClick={() => setPickingForForm(false)}>
              İptal
            </Button>
          </div>
        )}

        <RegionInfoPanel
          region={selectedRegion}
          devices={devices}
          onClose={() => setSelectedRegionId(null)}
          onFlyTo={flyToRegion}
        />

        {/* --- Bölgeye git: tek tıkla/tek seçimle harita o zone'a odaklanır. --- */}
        {regions.length > 0 && (
          <div className="map-toolbar" style={{ marginBottom: "var(--space-2)" }}>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12.5, fontWeight: 600, color: "var(--color-text-muted)" }}>
              Bölgeye Git:
              <select
                value={selectedRegionId ?? ""}
                onChange={(e) => {
                  const region = regions.find((r) => String(r.id) === e.target.value);
                  if (region) handleZoneClick(region);
                }}
                style={{ minWidth: 200 }}
              >
                <option value="">— Bölge seçin —</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.regionName} ({r.districtName})
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <div className="map-toolbar">
          <button className={"map-filter-btn" + (filter === "ALL" ? " is-active" : "")} onClick={() => setFilter("ALL")}>
            Tüm Ekipmanlar
          </button>
          <button className={"map-filter-btn" + (filter === "WORKING" ? " is-active" : "")} onClick={() => setFilter("WORKING")}>
            Sadece Çalışanlar
          </button>
          <button className={"map-filter-btn" + (filter === "FAULTY" ? " is-active" : "")} onClick={() => setFilter("FAULTY")}>
            Sadece Arızalılar
          </button>

          {regions.some((r) => r.boundary) && (
            <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, marginLeft: "auto" }}>
              <input type="checkbox" checked={showZones} onChange={(e) => setShowZones(e.target.checked)} />
              Bölge sınırlarını göster
            </label>
          )}
        </div>

        {/* --- Ekipman türü filtresi: haritada hangi pinlerin görüneceğini belirler.
            Aynı state (typeFilter) sayfanın en altındaki "Kayıtlı Ekipmanlar" tablo
            filtresiyle de PAYLAŞILIYOR — ikisi birbirinden bağımsız değil, tek bir
            filtre olarak davranıyorlar. --- */}
        <div className="map-toolbar">
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12.5, fontWeight: 600, color: "var(--color-text-muted)" }}>
            Ekipman Türü:
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ minWidth: 160 }}>
              <option value="">Tüm türler</option>
              {Object.values(ASSET_TYPES).map((t) => (
                <option key={t} value={t}>
                  {assetTypeLabel(t)}
                </option>
              ))}
            </select>
          </label>
          {typeFilter && (
            <Button size="sm" variant="ghost" onClick={() => setTypeFilter("")}>
              Filtreyi Temizle
            </Button>
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

        {/* --- Haritaya tıklayarak hızlı ekipman ekleme: bölge gerçek bir dropdown'dan seçiliyor --- */}
        {pendingLocation && (
          <div
            className="map-toolbar"
            style={{ flexWrap: "wrap", background: "var(--color-primary-lighter)", padding: "var(--space-3)", borderRadius: "var(--radius-sm)" }}
          >
            <span style={{ fontSize: 12.5, fontWeight: 600 }}>Bu konuma yeni ekipman ekle:</span>
            <select value={quickAddRegionId} onChange={(e) => setQuickAddRegionId(e.target.value)}>
              <option value="">— Bölge seçin —</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.regionName} ({r.districtName})
                </option>
              ))}
            </select>
            <select value={quickAddAssetType} onChange={(e) => setQuickAddAssetType(e.target.value)}>
              {Object.values(ASSET_TYPES).map((t) => (
                <option key={t} value={t}>
                  {assetTypeLabel(t)}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Ekipman No"
              value={quickAddDeviceNo}
              onChange={(e) => setQuickAddDeviceNo(e.target.value)}
              style={{ width: 110 }}
            />
            <Button size="sm" variant="primary" onClick={submitQuickAdd} disabled={quickAddSubmitting}>
              {quickAddSubmitting ? "Ekleniyor..." : "Ekle"}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setPendingLocation(null)}>
              İptal
            </Button>
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
          onViewFaultReport={(device) => navigate(`/cihazlar/${device.id}`)}
          regions={regions}
          showZones={showZones}
          selectedRegionId={selectedRegionId}
          onZoneClick={handleZoneClick}
          drawingRegionId={drawingRegionId}
          drawPoints={drawPoints}
          onDrawPointAdd={(lat, lng) => setDrawPoints((prev) => [...prev, [lat, lng]])}
          pickingLocation={pickingForForm}
          assetTypeFilter={typeFilter}
        />
      </Section>
      </div>

      {/* --- Cihaz yönetimi: form + arama/filtre/sayfalama + dışa aktarma. Harita ile
          AYNI sayfaya taşındı (eskiden ayrı "Cihazlar" sekmesindeydi). Sadece manager
          (ADMIN+HEADGARDENER) görür — mevcut yetkilendirme aynen korunuyor.
          Bu sayfada zaten yukarıda büyük bir interaktif harita var, üstelik haritaya
          tıklayarak konum seçip hızlıca ekipman ekleme akışı da mevcut (bkz. "pendingLocation").
          Bu yüzden DeviceForm'un kendi mini haritasını (LocationPicker) BURADA GÖSTERMİYORUZ —
          aynı sayfada iki ayrı Leaflet haritası olması kafa karıştırıcı oluyordu. Konum,
          formdan boş bırakılıp sonradan üstteki haritadan (pin sürükleyerek) da ayarlanabilir. --- */}
      {manager && (
        <>
          <div ref={formSectionRef} className="form-scroll-target">
            <DeviceForm
              regions={regions}
              onCreated={handleFormDeviceCreated}
              showLocationPicker={false}
              location={formLocation}
              onRequestPin={startPinningForForm}
              requireLocation
            />
          </div>

          <Section
            title="Kayıtlı Ekipmanlar"
            actions={
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input
                  type="text"
                  placeholder="Ara (no, bölge, açıklama)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ minWidth: 160 }}
                />
                <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)}>
                  <option value="">Tüm bölgeler</option>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.regionName}
                    </option>
                  ))}
                </select>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">Tüm durumlar</option>
                  <option value="WORKING">Çalışıyor</option>
                  <option value="FAULTY">Arızalı</option>
                </select>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <option value="">Tüm türler</option>
                  {Object.values(ASSET_TYPES).map((t) => (
                    <option key={t} value={t}>
                      {assetTypeLabel(t)}
                    </option>
                  ))}
                </select>
                <Button size="sm" variant="secondary" onClick={() => handleExport(exportDevicesCsv)}>
                  Ekipmanları İndir (CSV)
                </Button>
                <Button size="sm" variant="secondary" onClick={() => handleExport(exportFaultsCsv)}>
                  Arızaları İndir (CSV)
                </Button>
              </div>
            }
          >
            {totalElements > 0 && (
              <p className="hint" style={{ marginBottom: "var(--space-3)" }}>
                {totalElements} ekipman bulundu.
              </p>
            )}
            <DeviceTable devices={managedDevices} onToggleStatus={toggleStatus} onDelete={handleRemove} canDelete={admin} />
            <PaginationControls page={page} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage} />
          </Section>
        </>
      )}

      <ReportFaultModal
        device={reportingDevice}
        onSubmit={submitFaultReport}
        onClose={() => setReportingDevice(null)}
      />
    </>
  );
}
