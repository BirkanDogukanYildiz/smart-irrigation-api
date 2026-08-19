import { useEffect, useMemo, useState } from "react";
import Section from "../components/common/Section";
import PageHeader from "../components/common/PageHeader";
import Alert from "../components/common/Alert";
import RegionForm from "../components/regions/RegionForm";
import RegionTable from "../components/regions/RegionTable";
import { listRegions, assignRegionHeadGardener, deleteRegion } from "../api/regions";
import { listUsers } from "../api/users";
import { ROLES } from "../utils/roles";

export default function RegionsPage() {
  const [regions, setRegions] = useState(null);
  const [headGardeners, setHeadGardeners] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function loadRegions() {
    try {
      setRegions(await listRegions());
    } catch (e) {
      setError(e.message);
    }
  }

  async function loadHeadGardeners() {
    try {
      const users = await listUsers();
      setHeadGardeners(users.filter((u) => u.role === ROLES.HEADGARDENER));
    } catch {
      // Baş bahçivan listesi yüklenemezse dropdown boş kalır.
    }
  }

  useEffect(() => {
    loadHeadGardeners().then(loadRegions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredRegions = useMemo(() => {
    if (!regions) return regions;
    const searchLower = search.trim().toLowerCase();
    if (!searchLower) return regions;
    return regions.filter(
      (r) =>
        r.regionName.toLowerCase().includes(searchLower) ||
        r.districtName.toLowerCase().includes(searchLower) ||
        r.irrigationAreaName.toLowerCase().includes(searchLower)
    );
  }, [regions, search]);

  async function handleAssign(regionId, headGardenerId) {
    try {
      await assignRegionHeadGardener(regionId, headGardenerId);
      loadRegions();
    } catch (e) {
      window.alert("Baş bahçivan ataması yapılamadı: " + e.message);
    }
  }

  async function handleDelete(region) {
    if (!window.confirm(`"${region.regionName}" bölgesini silmek istediğinize emin misiniz?`)) return;
    try {
      await deleteRegion(region.id);
      loadRegions();
    } catch (e) {
      window.alert("Bölge silinemedi: " + e.message);
    }
  }

  return (
    <>
      <PageHeader title="Bölgeler" subtitle="Park alanlarını, sorumlu personeli ve haritadaki sınırlarını yönetin." />

      <Section
        title="Bölge Listesi"
        actions={
          regions && regions.length > 0 ? (
            <input
              type="text"
              placeholder="Bölge, ilçe veya alan ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          ) : null
        }
      >
        <Alert type="error">{error}</Alert>
        <RegionTable
          regions={filteredRegions}
          headGardeners={headGardeners}
          onAssignHeadGardener={handleAssign}
          onDelete={handleDelete}
        />
      </Section>

      <RegionForm headGardeners={headGardeners} onCreated={loadRegions} />
    </>
  );
}
