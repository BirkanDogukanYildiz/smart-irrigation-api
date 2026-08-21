import { useEffect, useState } from "react";
import Section from "../../components/common/Section";
import PageHeader from "../../components/common/PageHeader";
import Alert from "../../components/common/Alert";
import Loading from "../../components/common/Loading";
import EmptyState from "../../components/common/EmptyState";
import Icon from "../../components/common/Icon";
import CitizenParkMap from "../../components/map/CitizenParkMap";
import { getPublicParks } from "../../api/public";
import { regionDisplayName } from "../../utils/regionDisplay";

// Vatandaş "Parklar" sayfası: personel tarafında zone'u çizilmiş bölgeleri, polygon
// olarak DEĞİL, merkez noktasına yerleştirilmiş bir pin olarak gösterir (bkz.
// CitizenParkMap.jsx). Aynı Region/boundary verisi — ayrı bir veri kaynağı yok.
export default function CitizenParksPage() {
  const [parks, setParks] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getPublicParks()
      .then(setParks)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <PageHeader
        title="Parklar"
        subtitle="Sınırları personel tarafından haritaya işlenmiş park alanları. Her pin, ilgili parkın konumunu gösterir."
      />

      <Alert type="error">{error}</Alert>
      {!parks && !error && <Loading label="Parklar yükleniyor..." />}
      {parks && parks.length === 0 && <EmptyState>Henüz haritada işaretlenmiş bir park alanı yok.</EmptyState>}

      {parks && parks.length > 0 && (
        <>
          <Section>
            <CitizenParkMap parks={parks} />
          </Section>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "var(--space-4)",
            }}
          >
            {parks.map((p) => (
              <div
                key={p.id}
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "var(--shadow-sm)",
                  padding: "var(--space-4)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "var(--radius-sm)",
                    background: "var(--color-primary-light)",
                    color: "var(--color-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 4,
                  }}
                >
                  <Icon name="park" size={18} />
                </div>
                <h3 style={{ margin: 0 }}>{regionDisplayName(p)}</h3>
                {p.description && (
                  <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: 0 }}>{p.description}</p>
                )}
                <div
                  style={{
                    marginTop: "auto",
                    paddingTop: "var(--space-3)",
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "var(--color-text-muted)",
                  }}
                >
                  {p.assetCount} ekipman
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
