import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Section from "../components/common/Section";
import Loading from "../components/common/Loading";
import Alert from "../components/common/Alert";
import Icon from "../components/common/Icon";
import DonutChart from "../components/charts/DonutChart";
import TrendBarChart from "../components/charts/TrendBarChart";
import { getDashboardSummary } from "../api/dashboard";
import { listLogs } from "../api/logs";
import { listRequests } from "../api/requests";
import { computeDailyFaultTrend } from "../utils/faultTrend";
import { useAuth } from "../context/AuthContext";
import { isManager, isAdmin } from "../utils/roles";
import { regionDisplayName } from "../utils/regionDisplay";
import { requestTopicLabel, requestStatusLabel, REQUEST_STATUS } from "../utils/requestTopics";
import { formatDateTime } from "../utils/format";

const FAULT_TREND_DAYS = 14;

const REQ_STATUS_TONE = {
  [REQUEST_STATUS.YENI]: { bg: "var(--color-primary-light)", fg: "var(--color-primary-dark)" },
  [REQUEST_STATUS.INCELENIYOR]: { bg: "var(--color-warning-bg)", fg: "var(--color-warning)" },
  [REQUEST_STATUS.INCELENDI]: { bg: "var(--color-success-bg)", fg: "var(--color-success)" },
};

function StatCard({ icon, iconColor, iconBg, label, value, sub }) {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-sm)",
        padding: "var(--space-4)",
        display: "flex",
        alignItems: "center",
        gap: "var(--space-4)",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "var(--radius-sm)",
          background: iconBg,
          color: iconColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon name={icon} size={21} />
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-text)", lineHeight: 1.2 }}>{value}</div>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--color-text-muted)" }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: "var(--color-text-faint)" }}>{sub}</div>}
      </div>
    </div>
  );
}

function QuickAction({ to, icon, label }) {
  return (
    <Link
      to={to}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        padding: "var(--space-4)",
        background: "var(--color-bg)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        textAlign: "center",
        fontSize: 12.5,
        fontWeight: 600,
        color: "var(--color-text)",
      }}
    >
      <Icon name={icon} size={22} style={{ color: "var(--color-primary)" }} />
      {label}
    </Link>
  );
}

// Anasayfa: referans mockup'ın hiyerarşisini (karşılama + stat kartları + harita/
// son talepler + durum dağılımı + hızlı işlemler) izler — ama SADECE gerçek API
// verisiyle. Mockup'taki hava durumu widget'ı TopBar'da (gerçek Open-Meteo verisi),
// kullanıcı fotoğrafı TopBar/Profil'de zaten var; burada tekrarlanmadı.
export default function DashboardPage() {
  const { role, username } = useAuth();
  const admin = isAdmin(role);
  const canSeeFaultTrend = isManager(role);
  const canSeeRequests = isManager(role);

  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState("");
  const [faultTrend, setFaultTrend] = useState(null);
  const [requests, setRequests] = useState(null);

  useEffect(() => {
    getDashboardSummary()
      .then(setSummary)
      .catch((e) => setSummaryError(e.message || "İstatistikler yüklenemedi."));

    if (canSeeFaultTrend) {
      listLogs()
        .then((logs) => setFaultTrend(computeDailyFaultTrend(logs, "Arıza oluşturuldu", FAULT_TREND_DAYS)))
        .catch(() => {});
    }
    if (canSeeRequests) {
      listRequests()
        .then(setRequests)
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openRequests = requests ? requests.filter((r) => r.status !== REQUEST_STATUS.INCELENDI) : null;
  const recentRequests = requests ? requests.slice(0, 4) : null;

  return (
    <>
      {/* --- Karşılama --- */}
      <div style={{ marginBottom: "var(--space-5)" }}>
        <p style={{ margin: 0, fontSize: 13.5, color: "var(--color-text-muted)" }}>Hoş geldiniz, {username}</p>
        <h1 className="page-title" style={{ marginTop: 4 }}>
          Bugün parklarımız için neler yapabiliriz?
        </h1>
        <p className="page-subtitle">Park ve ekipmanlarımızın durumu ve talepler hakkında genel bir bakış.</p>
      </div>

      {summaryError && <Alert type="error">{summaryError}</Alert>}
      {!summary && !summaryError && <Loading label="İstatistikler yükleniyor..." />}

      {summary && (
        <>
          {/* --- Stat kartları --- */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "var(--space-4)",
              marginBottom: "var(--space-5)",
            }}
          >
            <StatCard
              icon="park"
              iconColor="var(--color-primary)"
              iconBg="var(--color-primary-light)"
              label="Toplam Bölge"
              value={summary.totalRegions}
            />
            <StatCard
              icon="checkCircle"
              iconColor="var(--color-success)"
              iconBg="var(--color-success-bg)"
              label="Çalışan Cihaz"
              value={summary.workingDevices}
            />
            <StatCard
              icon="warning"
              iconColor="var(--color-danger)"
              iconBg="var(--color-danger-bg)"
              label="Arızalı Cihaz"
              value={summary.faultyDevices}
            />
            {canSeeRequests && (
              <StatCard
                icon="document"
                iconColor="var(--color-primary)"
                iconBg="var(--color-primary-light)"
                label="Açık Talep"
                value={openRequests ? openRequests.length : "…"}
                sub="Çözümlenmeyi bekliyor"
              />
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: canSeeRequests ? "2fr 1fr" : "1fr",
              gap: "var(--space-5)",
              marginBottom: "var(--space-5)",
              alignItems: "start",
            }}
            className="dashboard-two-col"
          >
            <Section title="Cihaz Durum Dağılımı" subtitle="Status (arıza) ve mod (bakımda/pasif) bir arada.">
              <DonutChart
                centerLabel="Toplam"
                centerValue={summary.totalDevices}
                segments={[
                  { name: "Çalışıyor", value: summary.workingDevices, color: "var(--color-success)" },
                  { name: "Bakımda", value: summary.maintenanceDevices || 0, color: "var(--color-warning)" },
                  { name: "Arızalı", value: summary.faultyDevices, color: "var(--color-danger)" },
                  { name: "Pasif", value: summary.inactiveDevices || 0, color: "var(--color-text-faint)" },
                ]}
              />
            </Section>

            {canSeeRequests && (
              <Section
                title="Son Talepler"
                actions={
                  <Link to="/talepler" style={{ fontSize: 12.5, color: "var(--color-primary)", fontWeight: 600 }}>
                    Tümünü Gör
                  </Link>
                }
              >
                {!recentRequests && <Loading label="Yükleniyor..." />}
                {recentRequests && recentRequests.length === 0 && <p className="hint">Henüz talep yok.</p>}
                {recentRequests && recentRequests.length > 0 && (
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                    {recentRequests.map((r) => {
                      const tone = REQ_STATUS_TONE[r.status] || REQ_STATUS_TONE[REQUEST_STATUS.YENI];
                      return (
                        <li
                          key={r.id}
                          style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text)" }}>
                              {requestTopicLabel(r.topic)}
                            </div>
                            <div style={{ fontSize: 11.5, color: "var(--color-text-faint)" }}>
                              {r.regionName ? regionDisplayName(r) : "Genel"} · {formatDateTime(r.createdAt)}
                            </div>
                          </div>
                          <span
                            style={{
                              flexShrink: 0,
                              fontSize: 11,
                              fontWeight: 700,
                              padding: "3px 8px",
                              borderRadius: 999,
                              background: tone.bg,
                              color: tone.fg,
                            }}
                          >
                            {requestStatusLabel(r.status)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Section>
            )}
          </div>

          {canSeeFaultTrend && faultTrend && (
            <Section title="Arıza Trendleri" subtitle={`Son ${FAULT_TREND_DAYS} günde oluşturulan arıza sayısı.`}>
              {faultTrend.total === 0 ? (
                <p className="hint">Son {FAULT_TREND_DAYS} günde arıza bildirimi yok.</p>
              ) : (
                <TrendBarChart data={faultTrend.days} />
              )}
            </Section>
          )}

          {summary.regionBreakdown?.length > 0 && (
            <Section title="Bölge Bazlı İstatistikler" subtitle="Her bölgenin çalışan/arızalı ekipman dağılımı.">
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {summary.regionBreakdown.map((r) => (
                  <li
                    key={r.regionId}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px 0",
                      borderBottom: "1px solid var(--color-border)",
                      fontSize: 13.5,
                    }}
                  >
                    <span>{regionDisplayName(r)}</span>
                    <span>
                      <strong style={{ color: "var(--color-success)" }}>{r.workingDevices} çalışıyor</strong>
                      {r.faultyDevices > 0 && (
                        <strong style={{ color: "var(--color-danger)", marginLeft: 10 }}>{r.faultyDevices} arızalı</strong>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* --- Hızlı İşlemler --- */}
          <Section title="Hızlı İşlemler">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "var(--space-3)" }}>
              <QuickAction to="/harita" icon="map" label="Haritayı Aç" />
              <QuickAction to="/kategoriler" icon="box" label="Kategoriler" />
              {canSeeRequests && <QuickAction to="/talepler" icon="clipboard" label="Talepler" />}
              {canSeeFaultTrend && <QuickAction to="/loglar" icon="clock" label="İşlem Geçmişi" />}
              {admin && <QuickAction to="/bolgeler" icon="park" label="Bölgeler" />}
              {admin && <QuickAction to="/kullanicilar" icon="users" label="Kullanıcılar" />}
            </div>
          </Section>
        </>
      )}
    </>
  );
}
