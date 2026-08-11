import "../../styles/common.css";

export default function Loading({ label = "Yükleniyor..." }) {
  return <div className="loading-text">{label}</div>;
}
