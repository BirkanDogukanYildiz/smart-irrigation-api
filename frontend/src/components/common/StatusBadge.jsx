import "../../styles/common.css";

export default function StatusBadge({ status }) {
  const isWorking = status === "WORKING";
  return (
    <span className={`status-badge ${isWorking ? "is-working" : "is-faulty"}`}>
      <span className="status-dot" />
      {isWorking ? "Çalışıyor" : "Arızalı"}
    </span>
  );
}
