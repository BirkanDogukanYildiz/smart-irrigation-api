import { useState } from "react";
import Section from "../common/Section";
import Alert from "../common/Alert";
import Button from "../common/Button";
import { createRegion } from "../../api/regions";
import "../../styles/form.css";

const emptyForm = {
  districtNo: "",
  districtName: "",
  regionName: "",
  irrigationAreaNo: "",
  irrigationAreaName: "",
  description: "",
  headGardenerId: "",
};

export default function RegionForm({ headGardeners, onCreated }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await createRegion({
        districtNo: Number(form.districtNo),
        districtName: form.districtName,
        regionName: form.regionName,
        irrigationAreaNo: Number(form.irrigationAreaNo),
        irrigationAreaName: form.irrigationAreaName,
        description: form.description || null,
        headGardenerId: form.headGardenerId ? Number(form.headGardenerId) : null,
      });
      setSuccess("Bölge başarıyla eklendi.");
      setForm(emptyForm);
      onCreated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Section title="Yeni Bölge Ekle" subtitle="Bölge numarası sistem tarafından otomatik atanır, girmene gerek yok.">
      <form onSubmit={handleSubmit}>
        <Alert type="error">{error}</Alert>
        <Alert type="success">{success}</Alert>

        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="rDistrictNo">İlçe No</label>
            <input id="rDistrictNo" type="number" value={form.districtNo} onChange={(e) => update("districtNo", e.target.value)} />
          </div>
          <div className="form-field">
            <label htmlFor="rDistrictName">İlçe Adı</label>
            <input id="rDistrictName" type="text" value={form.districtName} onChange={(e) => update("districtName", e.target.value)} />
          </div>
          <div className="form-field">
            <label htmlFor="rRegionName">Bölge Adı</label>
            <input id="rRegionName" type="text" value={form.regionName} onChange={(e) => update("regionName", e.target.value)} />
          </div>
          <div className="form-field">
            <label htmlFor="rIrrigationAreaNo">Sulama Alanı No</label>
            <input id="rIrrigationAreaNo" type="number" value={form.irrigationAreaNo} onChange={(e) => update("irrigationAreaNo", e.target.value)} />
          </div>
          <div className="form-field">
            <label htmlFor="rIrrigationAreaName">Sulama Alanı Adı</label>
            <input id="rIrrigationAreaName" type="text" value={form.irrigationAreaName} onChange={(e) => update("irrigationAreaName", e.target.value)} />
          </div>
          <div className="form-field">
            <label htmlFor="rHeadGardener">Baş Bahçivan (opsiyonel)</label>
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
