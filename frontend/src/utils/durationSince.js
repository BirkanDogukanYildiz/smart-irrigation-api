// Bir tarihten bu yana ne kadar süre geçtiğini okunabilir Türkçe metne çevirir.
// Backend'e YENİ bir alan/endpoint eklenmedi — mevcut statusChangedAt alanı üzerinden
// tamamen frontend'de hesaplanıyor.
//
// "açık" eki BİLİNÇLİ OLARAK burada, tek bir yerde ekleniyor (önceden 4 ayrı çağrı
// yerinde `${durationSince(...)} açık` şeklinde tekrarlanıyordu). Bu fonksiyon şu an
// yalnızca arıza açık-kalma süresi göstermek için kullanıldığından ek burada sabit;
// ileride süre metni "açık" dışında bir bağlamda (örn. bakım gecikmesi) kullanılırsa,
// bu fonksiyon bir `suffix` parametresi alacak şekilde genişletilmeli.
export function durationSince(dateString) {
  if (!dateString) return null;
  const start = new Date(dateString);
  if (Number.isNaN(start.getTime())) return null;

  let diffMs = Date.now() - start.getTime();
  if (diffMs < 0) diffMs = 0;

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let label;
  if (days > 0) {
    const remHours = hours % 24;
    label = remHours > 0 ? `${days} gün ${remHours} saat` : `${days} gün`;
  } else if (hours > 0) {
    const remMinutes = minutes % 60;
    label = remMinutes > 0 ? `${hours} saat ${remMinutes} dk` : `${hours} saat`;
  } else if (minutes > 0) {
    label = `${minutes} dakika`;
  } else {
    label = "Şimdi";
  }

  return `${label}`;
}

// 1 günden az açıksa "warning" (sarı), 1-3 gün "danger" (kırmızı), 3+ gün "danger-strong"
// gibi bir ayrım yapmak yerine bilinçli olarak TEK bir ton (danger) kullanıyoruz: bir
// arızanın "açık" olması zaten kırmızıyla ifade ediliyor (bkz. StatusBadge), süre arttıkça
// renk kademelendirmek görsel gürültü katardı — sade tutuldu.