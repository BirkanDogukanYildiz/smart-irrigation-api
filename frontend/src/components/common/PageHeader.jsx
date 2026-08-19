import "../../index.css";

// Sayfa üstü büyük başlık — Section'ın kendi (kart içi) küçük başlığından (h3)
// bilinçli olarak ayrı: bu, sayfanın kendisinin kimliğini veren üst düzey başlık.
// actions: sağ tarafta buton/kısayol için opsiyonel alan (örn. "Talep Oluştur").
export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        flexWrap: "wrap",
        gap: "var(--space-4)",
        marginBottom: "var(--space-5)",
      }}
    >
      <div>
        <h2 className="page-title" style={{ fontWeight: 700 }}>{title}</h2>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>{actions}</div>}
    </div>
  );
}
