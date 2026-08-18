import { useEffect, useState } from "react";
import Section from "../../components/common/Section";
import Alert from "../../components/common/Alert";
import Loading from "../../components/common/Loading";
import EmptyState from "../../components/common/EmptyState";
import CitizenParkMap from "../../components/map/CitizenParkMap";
import { getPublicParks } from "../../api/public";

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
    <Section
      title="Parklar"
      subtitle="Sınırları personel tarafından haritaya işlenmiş park alanları. Her pin, ilgili parkın konumunu gösterir."
    >
      <Alert type="error">{error}</Alert>
      {!parks && !error && <Loading label="Parklar yükleniyor..." />}

      {parks && parks.length === 0 && (
        <EmptyState>Henüz haritada işaretlenmiş bir park alanı yok.</EmptyState>
      )}

      {parks && parks.length > 0 && (
        <>
          <CitizenParkMap parks={parks} />

          <ul style={{ listStyle: "none", padding: 0, margin: "var(--space-4) 0 0" }}>
            {parks.map((p) => (
              <li
                key={p.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: "1px solid var(--color-border)",
                  fontSize: 13.5,
                }}
              >
                <span>
                  {p.regionName} <span style={{ color: "var(--color-text-faint)" }}>({p.districtName})</span>
                </span>
                <strong>{p.assetCount} ekipman</strong>
              </li>
            ))}
          </ul>
        </>
      )}
    </Section>
  );
}
