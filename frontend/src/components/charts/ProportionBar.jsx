// Basit, bağımlılıksız oran çubuğu. Cihaz durum dağılımı ve bölge bazlı istatistikler
// için kullanılır — sade tutmak amacıyla tek bir görsel dil (segment renkli çubuk) her
// ikisinde de tekrarlanıyor.
export default function ProportionBar({ label, segments }) {
  const total = segments.reduce((sum, seg) => sum + (seg.value || 0), 0);

  return (
    <div style={{ marginBottom: "var(--space-3)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
        <span style={{ fontWeight: 600, color: "var(--color-text)" }}>{label}</span>
        <span style={{ color: "var(--color-text-muted)" }}>{total} toplam</span>
      </div>
      <div
        style={{
          display: "flex",
          height: 10,
          borderRadius: 6,
          overflow: "hidden",
          background: "var(--color-border)",
        }}
      >
        {total > 0 &&
          segments.map((seg, i) => (
            <div
              key={i}
              title={`${seg.name}: ${seg.value}`}
              style={{ width: `${(seg.value / total) * 100}%`, background: seg.color }}
            />
          ))}
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 4, fontSize: 11.5, color: "var(--color-text-muted)" }}>
        {segments.map((seg, i) => (
          <span key={i}>
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                borderRadius: 2,
                background: seg.color,
                marginRight: 4,
              }}
            />
            {seg.name}: {seg.value}
          </span>
        ))}
      </div>
    </div>
  );
}
