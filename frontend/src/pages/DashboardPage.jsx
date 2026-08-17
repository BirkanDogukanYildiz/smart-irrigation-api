import { useEffect, useState } from "react";
import Section from "../components/common/Section";
import StatItem from "../components/common/StatItem";
import Loading from "../components/common/Loading";
import ProportionBar from "../components/charts/ProportionBar";
import TrendBarChart from "../components/charts/TrendBarChart";
import { getDashboardSummary } from "../api/dashboard";
import { listLogs } from "../api/logs";
import { computeDailyFaultTrend } from "../utils/faultTrend";
import { useAuth } from "../context/AuthContext";
import { isManager } from "../utils/roles";

const FAULT_TREND_DAYS = 14;

// Anasayfa artık sadece genel bakış rakamları ve trend/dağılım grafiklerini gösteriyor.
// Cihaz listesi ve yönetimi (arıza bildir/çıkar vb.) buradan kaldırıldı — o iş zaten
// "Harita ve Cihazlar" sayfasında (ve tam liste için Cihazlar bölümünde) yapılabiliyor,
// burada tekrar tam bir yönetim tablosuna gerek yok.
export default function DashboardPage() {
  const { role } = useAuth();
  // İşlem Geçmişi (/api/logs/**) sadece ADMIN + HEADGARDENER'a açık — arıza trendi
  // grafiği o veriden beslendiği için, mevcut yetki sınırını aynen koruyoruz:
  // GARDENER bu grafiği görmez (diğer iki grafik ve dashboard'un geri kalanı görür).
  const canSeeFaultTrend = isManager(role);

  const [summary, setSummary] = useState(null);
  const [faultTrend, setFaultTrend] = useState(null);

  async function loadSummary() {
    try {
      const data = await getDashboardSummary();
      setSummary(data);
    } catch {
      // İstatistikler yüklenemezse sayfa geri kalanını engellemiyoruz.
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
    loadFaultTrend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    </>
  );
}
