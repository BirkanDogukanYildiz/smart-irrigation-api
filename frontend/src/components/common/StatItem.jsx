import "../../styles/common.css";

export default function StatItem({ label, value, tone = "default" }) {
  return (
    <div className={`stat-item tone-${tone}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
