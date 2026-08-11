import { useEffect, useState } from "react";
import Section from "../components/common/Section";
import Alert from "../components/common/Alert";
import DeviceForm from "../components/devices/DeviceForm";
import DeviceTable from "../components/devices/DeviceTable";
import { listDevices, updateDeviceStatus, deleteDevice } from "../api/devices";
import { listRegions } from "../api/regions";
import { useAuth } from "../context/AuthContext";
import { isAdmin } from "../utils/roles";

export default function DevicesPage() {
  const { role } = useAuth();
  const admin = isAdmin(role);

  const [devices, setDevices] = useState(null);
  const [regions, setRegions] = useState([]);
  const [error, setError] = useState("");

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
      } catch (e) {
        window.alert("Durum güncellenemedi: " + e.message);
      }
    } else {
      if (!window.confirm("Cihazın onarıldığını ve tekrar çalışır duruma geldiğini onaylıyor musun?")) return;
      try {
        await updateDeviceStatus(device.id, "WORKING");
        loadDevices();
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
    } catch (e) {
      window.alert("Cihaz çıkarılamadı: " + e.message);
    }
  }

  return (
    <>
      <DeviceForm regions={regions} onCreated={loadDevices} />

      <Section title="Kayıtlı Cihazlar">
        <Alert type="error">{error}</Alert>
        <DeviceTable devices={devices} onToggleStatus={toggleStatus} onDelete={removeDevice} canDelete={admin} />
      </Section>
    </>
  );
}
