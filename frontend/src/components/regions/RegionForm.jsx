import { useEffect, useState } from "react";
import Section from "../common/Section";
import Alert from "../common/Alert";
import Button from "../common/Button";
import PickOrCreateField from "./PickOrCreateField";
import { createRegion, listDistricts, listParkAlanlari } from "../../api/regions";
import "../../styles/form.css";

const emptyForm = {
  districtName: "",
  regionName: "",
  irrigationAreaName: "",
  description: "",
  headGardenerId: "",
};

export default function RegionForm({ headGardeners, onCreated }) {
  const [form, setForm] = useState(emptyForm);
  const [districts, setDistricts] = useState([]);
  const [parkAlanlari, setParkAlanlari] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadOptions() {
    try {
      setDistricts(await listDistricts());
    } catch {
      // Liste yüklenemezse "yeni ekle" akışıyla yine de bölge oluşturulabilir.
    }
    try {
      setParkAlanlari(await listParkAlanlari());
    } catch {
      // Aynı şekilde park alanı listesi de opsiyonel.
    }
  }

  useEffect(() => {
    loadOptions();
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.districtName.trim()) {
      setError("İlçe seçmelisin ya da yeni bir ilçe adı girmelisin.");
      return;
    }
    if (!form.irrigationAreaName.trim()) {
      setError("Park alanı seçmelisin ya da yeni bir park alanı adı girmelisin.");
      return;
    }

    setSubmitting(true);
    try {
      await createRegion({
        districtName: form.districtName,
        regionName: form.regionName,
        irrigationAreaName: form.irrigationAreaName,
        description: form.description || null,
        headGardenerId: form.headGardenerId ? Number(form.headGardenerId) : null,
      });
      setSuccess("Bölge başarıyla eklendi.");
      setForm(emptyForm);
      loadOptions();
      onCreated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Section title="Yeni Bölge Ekle" subtitle="Bölge, ilçe ve park alanı numaraları sistem tarafından otomatik atanır — elle girmene gerek yok.">
      <form onSubmit={handleSubmit}>
        <Alert type="error">{error}</Alert>
        <Alert type="success">{success}</Alert>

        <div className="form-grid">
          <PickOrCreateField
            id="rDistrictName"
            label="İlçe"
            options={districts}
            value={form.districtName}
            onChange={(v) => update("districtName", v)}
          />
          <div className="form-field">
            <label htmlFor="rRegionName">Bölge Adı</label>
            <input id="rRegionName" type="text" value={form.regionName} onChange={(e) => update("regionName", e.target.value)} />
          </div>
          <PickOrCreateField
            id="rIrrigationAreaName"
            label="Park Alanı"
            options={parkAlanlari}
            value={form.irrigationAreaName}
            onChange={(v) => update("irrigationAreaName", v)}
          />
          <div className="form-field">
            <label htmlFor="rHeadGardener">Personel Yetkilisi (opsiyonel)</label>
            <select id="rHeadGardener" value={form.headGardenerId} onChange={(e) => update("headGardenerId", e.target.value)}>
              <option value="">— Atanmadı —</option>
              {headGardeners.map((hg) => (
                <option key={hg.id} value={hg.id}>
                  {hg.username}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field span-2">
            <label htmlFor="rDescription">Açıklama (opsiyonel)</label>
            <input id="rDescription" type="text" value={form.description} onChange={(e) => update("description", e.target.value)} />
          </div>
        </div>

        <div className="form-actions">
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Ekleniyor..." : "Bölge Ekle"}
          </Button>
        </div>
      </form>
    </Section>
  );
}
