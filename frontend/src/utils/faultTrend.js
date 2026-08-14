// "Arıza trendleri" grafiği için: yeni bir backend endpoint'i EKLENMEDİ. Mevcut
// İşlem Geçmişi API'sinden (GET /api/logs/list) "Arıza oluşturuldu" logları
// filtrelenip gün bazlı sayılıyor. Bu yüzden bu grafik sadece /api/logs/**'e
// erişimi olan roller (ADMIN, HEADGARDENER) için gösteriliyor — GARDENER için
// mevcut yetki sınırı korunuyor (bkz. DashboardPage.jsx: manager kontrolü).

function localDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function computeDailyFaultTrend(logs, actionName, days) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const buckets = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    buckets.push({
      key: localDateKey(d),
      label: `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`,
      value: 0,
    });
  }

  const byKey = Object.fromEntries(buckets.map((b) => [b.key, b]));
  let total = 0;

  (logs || []).forEach((l) => {
    if (l.action !== actionName || !l.timestamp) return;
    const key = localDateKey(new Date(l.timestamp));
    if (byKey[key]) {
      byKey[key].value += 1;
      total += 1;
    }
  });

  return { days: buckets, total };
}
