import { useEffect, useState } from "react";
import Section from "../components/common/Section";
import Alert from "../components/common/Alert";
import DeviceMap from "../components/map/DeviceMap";
import { listDevices, createDevice, deleteDevice, updateDeviceLocation } from "../api/devices";
import { listRegions } from "../api/regions";
import { useAuth } from "../context/AuthContext";
import { isManager } from "../utils/roles";
import "../styles/map.css";

export default function MapPage() {
  const { role } = useAuth();
  const manager = isManager(role);

  const [devices, setDevices] = useState([]);
  const [regions, setRegions] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [error, setError] = useState("");

  async function loadDevices() {
    try {
      setDevices(await listDevices());
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    loadDevices();
    if (manager) {
      listRegions()
        .then(setRegions)
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLocationChange(id, lat, lng) {
    await updateDeviceLocation(id, lat, lng);
    setDevices((prev) => prev.map((d) => (d.id === id ? { ...d, latitude: lat, longitude: lng } : d)));
  }

  async function handleRemove(device) {
    if (!window.confirm(`#${device.deviceNo} numaralı sulama cihazını sistemden ÇIKARMAK istediğine emin misin?`))
      return;
    try {
      await deleteDevice(device.id);
      loadDevices();
    } catch (e) {
      window.alert("Cihaz çıkarılamadı: " + e.message);
    }
  }

  async function handleEmptyClick(lat, lng) {
    if (!manager) return;
    if (regions.length === 0) {
      window.alert("Sistemde hiç bölge yok! Önce Bölgeler sayfasından bölge ekleyin.");
      return;
    }
    const regionLabel = regions.map((r, i) => `${i + 1}) ${r.regionName} (${r.districtName})`).join("\n");
    const choice = window.prompt(`Yeni cihazı hangi bölgeye eklemek istersiniz?\n\n${regionLabel}\n\nNumara girin:`);
    if (!choice) return;
    const region = regions[Number(choice) - 1];
    if (!region) {
      window.alert("Geçersiz seçim.");
      return;
    }
    const deviceNo = window.prompt("Cihaz numarasını girin:");
    if (!deviceNo) return;
    try {
      await createDevice({ regionId: region.id, deviceNo: Number(deviceNo), latitude: lat, longitude: lng });
      loadDevices();
    } catch (e) {
      window.alert("Cihaz eklenemedi: " + e.message);
    }
  }

  return (
    <Section
      title="İnteraktif Harita"
      subtitle={
        manager
          ? "Yeni cihaz eklemek için haritada boş bir yere tıklayın. Sağ üstten harita türünü değiştirebilirsiniz."
          : "Cihazların anlık lokasyonlarını ve durumlarını inceleyebilirsiniz. Sağ üstten görünümü değiştirebilirsiniz."
      }
    >
      <Alert type="error">{error}</Alert>

      <div className="map-toolbar">
        <button
          className={"map-filter-btn" + (filter === "ALL" ? " is-active" : "")}
          onClick={() => setFilter("ALL")}
        >
          Tüm Cihazlar
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
      </div>

      <div className="map-legend">
        <span><span className="dot" style={{ background: "#1f8a55" }} />Çalışıyor</span>
        <span><span className="dot" style={{ background: "#c1352a" }} />Arızalı</span>
        <span><span className="dot" style={{ background: "#b5750a" }} />Küme içinde karışık</span>
      </div>

      <DeviceMap
        devices={devices}
        filter={filter}
        isManager={manager}
        onLocationChange={handleLocationChange}
        onRemove={handleRemove}
        onEmptyClick={manager ? handleEmptyClick : null}
      />
    </Section>
  );
}
