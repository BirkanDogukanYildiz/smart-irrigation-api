import { useState } from "react";
import Section from "../common/Section";
import Alert from "../common/Alert";
import Button from "../common/Button";
import LocationPicker from "./LocationPicker";
import { createDevice } from "../../api/devices";
import { ASSET_TYPES, assetTypeLabel } from "../../utils/assetTypes";
import "../../styles/form.css";

export default function DeviceForm({ regions, onCreated }) {
  const [regionId, setRegionId] = useState("");
  const [deviceNo, setDeviceNo] = useState("");
  const [assetType, setAssetType] = useState(ASSET_TYPES.SULAMA_CIHAZI);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!regionId) {
      setError("Lütfen bir bölge seçin.");
      return;
    }
    if (!deviceNo) {
      setError("Lütfen cihaz numarası girin.");
      return;
    }

    setSubmitting(true);
    try {
      await createDevice({
        regionId: Number(regionId),
        deviceNo: Number(deviceNo),
        assetType,
        latitude: location?.lat ?? null,
        longitude: location?.lng ?? null,
      });
      setSuccess("Ekipman başarıyla eklendi.");
      setDeviceNo("");
      setAssetType(ASSET_TYPES.SULAMA_CIHAZI);
      setLocation(null);
      onCreated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Section title="Yeni Ekipman Ekle" subtitle="Var olan bir bölgeye yeni saha ekipmanı bağla.">
      <form onSubmit={handleSubmit}>
        <Alert type="error">{error}</Alert>
        <Alert type="success">{success}</Alert>

        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="deviceRegion">Bölge</label>
            <select id="deviceRegion" value={regionId} onChange={(e) => setRegionId(e.target.value)}>
              <option value="">— Bölge seçin —</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.regionName} ({r.districtName})
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="deviceNo">Ekipman No</label>
            <input
              id="deviceNo"
              type="number"
              value={deviceNo}
              onChange={(e) => setDeviceNo(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="assetType">Ekipman Türü</label>
            <select id="assetType" value={assetType} onChange={(e) => setAssetType(e.target.value)}>
              {Object.values(ASSET_TYPES).map((t) => (
                <option key={t} value={t}>
                  {assetTypeLabel(t)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-field" style={{ marginBottom: "var(--space-4)" }}>
          <label>Harita Konumu (opsiyonel)</label>
          <p className="hint" style={{ marginBottom: 4 }}>
            Boş bırakırsanız konum daha sonra Harita sayfasından da ayarlanabilir.
          </p>
          <LocationPicker value={location} onChange={setLocation} />
        </div>

        <div className="form-actions">
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Ekleniyor..." : "Ekipman Ekle"}
          </Button>
        </div>
      </form>
    </Section>
  );
}
