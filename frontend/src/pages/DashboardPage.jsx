import { useEffect, useState } from "react";
import Section from "../components/common/Section";
import StatItem from "../components/common/StatItem";
import Loading from "../components/common/Loading";
import Alert from "../components/common/Alert";
import DeviceTable from "../components/devices/DeviceTable";
import { getDashboardSummary } from "../api/dashboard";
import { listDevices, updateDeviceStatus, deleteDevice } from "../api/devices";
import { useAuth } from "../context/AuthContext";
import { isAdmin } from "../utils/roles";

export default function DashboardPage() {
  const { role } = useAuth();
  const admin = isAdmin(role);

  const [summary, setSummary] = useState(null);
  const [devices, setDevices] = useState(null);
  const [error, setError] = useState("");

  async function loadSummary() {
    try {
      const data = await getDashboardSummary();
      setSummary(data);
    } catch {
      // İstatistikler yüklenemezse sayfa geri kalanını engellemiyoruz.
    }
  }

  async function loadDevices() {
    try {
      const data = await listDevices();
      setDevices(data);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    loadSummary();
    loadDevices();
  }, []);

  async function toggleStatus(device) {
    if (device.status === "WORKING") {
      const sebep = window.prompt("Arıza açıklamasını gir:");
      if (sebep === null) return;
      if (!sebep.trim()) {
        window.alert("Arıza açıklaması boş olamaz.");
        return;
      }
      try {
        await updateDeviceStatus(device.id, "FAULTY", sebep.trim());
        loadDevices();
        loadSummary();
      } catch (e) {
        window.alert("Durum güncellenemedi: " + e.message);
      }
    } else {
      if (!window.confirm("Cihazın onarıldığını ve tekrar çalışır duruma geldiğini onaylıyor musun?")) return;
      try {
        await updateDeviceStatus(device.id, "WORKING");
        loadDevices();
        loadSummary();
      } catch (e) {
        window.alert("Durum güncellenemedi: " + e.message);
      }
    }
  }

  async function removeDevice(device) {
    if (!window.confirm(`#${device.deviceNo} numaralı sulama cihazını sistemden ÇIKARMAK istediğine emin misin?`)) return;
    try {
      await deleteDevice(device.id);
      loadDevices();
      loadSummary();
    } catch (e) {
      window.alert("Cihaz çıkarılamadı: " + e.message);
    }
  }

  return (
    <>
      <Section title="Genel Bakış" subtitle="Sulama sisteminin güncel durumu.">
        {summary ? (
          <div className="stat-grid">
            <StatItem label="Toplam Cihaz" value={summary.totalDevices} tone="primary" />
            <StatItem label="Çalışan Cihaz" value={summary.workingDevices} tone="success" />
            <StatItem label="Arızalı Cihaz" value={summary.faultyDevices} tone="danger" />
            <StatItem label="Toplam Bölge" value={summary.totalRegions} />
            <StatItem label="Toplam Kullanıcı" value={summary.totalUsers} />
          </div>
        ) : (
          <Loading label="İstatistikler yükleniyor..." />
        )}
      </Section>

      <Section title="Sulama Cihazları" subtitle="Arızalı bir cihaz gördüğünde işaretle.">
        <Alert type="error">{error}</Alert>
        <DeviceTable devices={devices} onToggleStatus={toggleStatus} onDelete={removeDevice} canDelete={admin} />
      </Section>
    </>
  );
}
