// Bağımlılıksız, sade bir SVG çubuk grafiği. Arıza trendi (gün bazlı sayım) için.
export default function TrendBarChart({ data, color = "var(--color-danger)" }) {
  const W = 300;
  const H = 120;
  const PAD_BOTTOM = 16;

  const max = Math.max(1, ...data.map((d) => d.value));
  const slot = W / data.length;
  const barGap = 2;
  const barWidth = Math.max(1, slot - barGap);

  // Çok fazla gün varsa her etiketi değil, aralıklı göster — kalabalık olmasın.
  const labelEvery = data.length <= 10 ? 1 : Math.ceil(data.length / 7);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 140, display: "block" }}>
        {data.map((d, i) => {
          const barHeight = (d.value / max) * (H - PAD_BOTTOM - 6);
          const x = i * slot + barGap / 2;
          const y = H - PAD_BOTTOM - barHeight;
          return (
            <rect key={i} x={x} y={y} width={barWidth} height={barHeight} fill={color} rx={1}>
              <title>{`${d.label}: ${d.value}`}</title>
            </rect>
          );
        })}
        <line x1={0} y1={H - PAD_BOTTOM} x2={W} y2={H - PAD_BOTTOM} stroke="var(--color-border)" strokeWidth="1" />
      </svg>
      <div style={{ display: "flex", fontSize: 9.5, color: "var(--color-text-faint)", marginTop: 2 }}>
        {data.map((d, i) => (
          <span key={i} style={{ flex: 1, textAlign: "center" }}>
            {i % labelEvery === 0 ? d.label : ""}
          </span>
        ))}
      </div>
    </div>
  );
}
