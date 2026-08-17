import { useEffect, useMemo, useState } from "react";
import Section from "../components/common/Section";
import Alert from "../components/common/Alert";
import DeviceForm from "../components/devices/DeviceForm";
import DeviceTable from "../components/devices/DeviceTable";
import ReportFaultModal from "../components/devices/ReportFaultModal";
import { listDevices, updateDeviceStatus, deleteDevice } from "../api/devices";
import { listRegions } from "../api/regions";
import { useAuth } from "../context/AuthContext";
import { isAdmin } from "../utils/roles";
import { ASSET_TYPES, assetTypeLabel } from "../utils/assetTypes";

export default function DevicesPage() {
  const { role } = useAuth();
  const admin = isAdmin(role);

  const [devices, setDevices] = useState(null);
  const [regions, setRegions] = useState([]);
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");

  // Arıza bildirme artık window.prompt yerine gerçek bir modal (bkz. ReportFaultModal) ile yapılıyor.
  const [reportingDevice, setReportingDevice] = useState(null);

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
      // Bölgeler yüklenemezse form dropdown'ı boş kalır, sayfa yine de kullanılabilir.
    }
  }

  useEffect(() => {
    loadDevices();
    loadRegions();
  }, []);

  const filteredDevices = useMemo(() => {
    if (!devices) return devices;
    return devices.filter((d) => {
      if (typeFilter && d.assetType !== typeFilter) return false;
      if (statusFilter && d.status !== statusFilter) return false;
      if (regionFilter && String(d.region?.id) !== regionFilter) return false;
      return true;
    });
  }, [devices, typeFilter, statusFilter, regionFilter]);

  function toggleStatus(device) {
    if (device.status === "WORKING") {
      setReportingDevice(device);
    } else {
      if (!window.confirm("Ekipmanın onarıldığını ve tekrar çalışır duruma geldiğini onaylıyor musun?")) return;
      updateDeviceStatus(device.id, "WORKING")
        .then(loadDevices)
        .catch((e) => window.alert("Durum güncellenemedi: " + e.message));
    }
  }

  async function submitFaultReport(description, faultType) {
    await updateDeviceStatus(reportingDevice.id, "FAULTY", description, faultType);
    setReportingDevice(null);
    loadDevices();
  }

  async function removeDevice(device) {
    if (!window.confirm(`#${device.deviceNo} numaralı ekipmanı sistemden ÇIKARMAK istediğine emin misin?`)) return;
    try {
      await deleteDevice(device.id);
      loadDevices();
    } catch (e) {
      window.alert("Ekipman çıkarılamadı: " + e.message);
    }
  }

  const hasActiveFilter = typeFilter || statusFilter || regionFilter;

  return (
    <>
      <DeviceForm regions={regions} onCreated={loadDevices} />

      <Section
        title="Kayıtlı Ekipmanlar"
        actions={
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
          </div>
        }
      >
        <Alert type="error">{error}</Alert>
        {hasActiveFilter && devices && (
          <p className="hint" style={{ marginBottom: "var(--space-3)" }}>
            {filteredDevices.length} / {devices.length} ekipman gösteriliyor.
          </p>
        )}
        <DeviceTable devices={filteredDevices} onToggleStatus={toggleStatus} onDelete={removeDevice} canDelete={admin} />
      </Section>

      <ReportFaultModal
        device={reportingDevice}
        onSubmit={submitFaultReport}
        onClose={() => setReportingDevice(null)}
      />
    </>
  );
}
