import { useEffect, useState } from "react";
import Section from "../components/common/Section";
import StatItem from "../components/common/StatItem";
import Loading from "../components/common/Loading";
import Alert from "../components/common/Alert";
import DeviceTable from "../components/devices/DeviceTable";
import ProportionBar from "../components/charts/ProportionBar";
import TrendBarChart from "../components/charts/TrendBarChart";
import { getDashboardSummary } from "../api/dashboard";
import { listDevices, updateDeviceStatus, deleteDevice } from "../api/devices";
import { listLogs } from "../api/logs";
import { computeDailyFaultTrend } from "../utils/faultTrend";
import { useAuth } from "../context/AuthContext";
import { isAdmin, isManager } from "../utils/roles";

const FAULT_TREND_DAYS = 14;

export default function DashboardPage() {
  const { role } = useAuth();
  const admin = isAdmin(role);
  // İşlem Geçmişi (/api/logs/**) sadece ADMIN + HEADGARDENER'a açık — arıza trendi
  // grafiği o veriden beslendiği için, mevcut yetki sınırını aynen koruyoruz:
  // GARDENER bu grafiği görmez (diğer iki grafik ve dashboard'un geri kalanı görür).
  const canSeeFaultTrend = isManager(role);

  const [summary, setSummary] = useState(null);
  const [devices, setDevices] = useState(null);
  const [error, setError] = useState("");
  const [faultTrend, setFaultTrend] = useState(null);

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

  async function loadFaultTrend() {
    if (!canSeeFaultTrend) return;
    try {
      const logs = await listLogs();
      setFaultTrend(computeDailyFaultTrend(logs, "Arıza oluşturuldu", FAULT_TREND_DAYS));
    } catch {
      // Loglar yüklenemezse sadece trend grafiği gösterilmez, dashboard'un geri kalanı etkilenmez.
    }
  }

  useEffect(() => {
    loadSummary();
    loadDevices();
    loadFaultTrend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        loadFaultTrend();
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

      {summary && (
        <Section title="Cihaz Durum Dağılımı" subtitle="Tüm ekipmanların çalışan/arızalı oranı.">
          <ProportionBar
            label="Tüm Ekipmanlar"
            segments={[
              { name: "Çalışıyor", value: summary.workingDevices, color: "var(--color-success)" },
              { name: "Arızalı", value: summary.faultyDevices, color: "var(--color-danger)" },
            ]}
          />
        </Section>
      )}

      {summary?.regionBreakdown?.length > 0 && (
        <Section title="Bölge Bazlı İstatistikler" subtitle="Her bölgenin çalışan/arızalı ekipman dağılımı.">
          {summary.regionBreakdown.map((r) => (
            <ProportionBar
              key={r.regionId}
              label={`${r.regionName} (${r.districtName})`}
              segments={[
                { name: "Çalışıyor", value: r.workingDevices, color: "var(--color-success)" },
                { name: "Arızalı", value: r.faultyDevices, color: "var(--color-danger)" },
              ]}
            />
          ))}
        </Section>
      )}

      {canSeeFaultTrend && faultTrend && (
        <Section title="Arıza Trendleri" subtitle={`Son ${FAULT_TREND_DAYS} günde oluşturulan arıza sayısı.`}>
          {faultTrend.total === 0 ? (
            <p className="hint">Son {FAULT_TREND_DAYS} günde arıza bildirimi yok.</p>
          ) : (
            <TrendBarChart data={faultTrend.days} />
          )}
        </Section>
      )}

      <Section title="Sulama Cihazları" subtitle="Arızalı bir cihaz gördüğünde işaretle.">
        <Alert type="error">{error}</Alert>
        <DeviceTable devices={devices} onToggleStatus={toggleStatus} onDelete={removeDevice} canDelete={admin} />
      </Section>
    </>
  );
}
