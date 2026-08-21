// Basit, bağımlılıksız donut chart — conic-gradient CSS ile. Yeni bir chart
// kütüphanesi eklemek yerine mevcut ProportionBar/TrendBarChart deseniyle
// (küçük, özel component'ler) tutarlı kalındı.
// segments: [{ name, value, color }]
export default function DonutChart({ segments, centerLabel, centerValue }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  let cumulative = 0;
  const stops = segments
    .filter((s) => s.value > 0)
    .map((s) => {
      const start = total > 0 ? (cumulative / total) * 360 : 0;
      cumulative += s.value;
      const end = total > 0 ? (cumulative / total) * 360 : 0;
      return `${s.color} ${start}deg ${end}deg`;
    });

  const gradient = stops.length > 0 ? `conic-gradient(${stops.join(", ")})` : "var(--color-border)";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-5)", flexWrap: "wrap" }}>
      <div
        style={{
          width: 140,
          height: 140,
          borderRadius: "50%",
          background: gradient,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 92,
            height: 92,
            borderRadius: "50%",
            background: "var(--color-surface)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 700, color: "var(--color-text)" }}>{centerValue}</div>
          <div style={{ fontSize: 10.5, color: "var(--color-text-faint)" }}>{centerLabel}</div>
        </div>
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        {segments.map((s) => (
          <li key={s.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
            <span style={{ color: "var(--color-text-muted)" }}>{s.name}</span>
            <strong style={{ marginLeft: "auto", color: "var(--color-text)" }}>
              {s.value}
              {total > 0 && (
                <span style={{ color: "var(--color-text-faint)", fontWeight: 500 }}>
                  {" "}
                  (%{Math.round((s.value / total) * 100)})
                </span>
              )}
            </strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
