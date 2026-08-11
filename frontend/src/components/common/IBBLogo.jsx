// Kurum rozeti. public/ibb-logo.png dosyasını gerçek İBB logosuyla değiştirebilirsiniz;
// bileşenin geri kalanı değişmeden çalışmaya devam eder.
export default function IBBLogo({ size = 36 }) {
  return (
    <img
      src="/ibb-logo.png"
      alt="İstanbul Büyükşehir Belediyesi"
      width={size}
      height={size}
      style={{ borderRadius: 8, display: "block" }}
    />
  );
}
