import { assetTypeLabel } from "../../utils/assetTypes";

// StatusBadge'in (çalışıyor/arızalı) yanına, "hangi tür ekipman" bilgisini
// gösteren nötr renkli bir rozet. Mevcut common.css'e dokunmamak için
// tasarım belirteçlerini (CSS variable) doğrudan inline kullanır.
export default function AssetTypeBadge({ type }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: "12.5px",
        fontWeight: 600,
        padding: "4px 10px",
        borderRadius: "999px",
        color: "var(--color-primary-dark)",
        background: "var(--color-primary-light)",
        whiteSpace: "nowrap",
      }}
    >
      {assetTypeLabel(type)}
    </span>
  );
}
