import { useState } from "react";
import Section from "../common/Section";
import Alert from "../common/Alert";
import Button from "../common/Button";
import LocationPicker from "./LocationPicker";
import { createDevice } from "../../api/devices";
import "../../styles/form.css";

export default function DeviceForm({ regions, onCreated }) {
  const [regionId, setRegionId] = useState("");
  const [deviceNo, setDeviceNo] = useState("");
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
        latitude: location?.lat ?? null,
        longitude: location?.lng ?? null,
      });
      setSuccess("Cihaz başarıyla eklendi.");
      setDeviceNo("");
      setLocation(null);
      onCreated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Section title="Yeni Sulama Cihazı Ekle" subtitle="Var olan bir bölgeye yeni sulama cihazı bağla.">
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
            <label htmlFor="deviceNo">Cihaz No</label>
            <input
              id="deviceNo"
              type="number"
              value={deviceNo}
              onChange={(e) => setDeviceNo(e.target.value)}
            />
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
            {submitting ? "Ekleniyor..." : "Cihaz Ekle"}
          </Button>
        </div>
      </form>
    </Section>
  );
}
