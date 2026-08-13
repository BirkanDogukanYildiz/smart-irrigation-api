// Bölge id'sine göre sabit, tutarlı bir renk döner (aynı bölge her zaman aynı renk).
// Zone çokgenlerinin dolgusu ve haritanın üstündeki "Bölgeler" listesindeki nokta
// göstergesi bu paletten renk kullanır.
const ZONE_PALETTE = [
  "#0b5fa5", // mavi
  "#1f8a55", // yeşil
  "#b5750a", // turuncu
  "#7a3ba6", // mor
  "#c1352a", // kırmızı
  "#0a8f8a", // turkuaz
  "#a6673b", // kahve
  "#5c6bc0", // indigo
];

export function zoneColorForRegion(regionId) {
  if (regionId == null) return ZONE_PALETTE[0];
  const idx = Number(regionId) % ZONE_PALETTE.length;
  return ZONE_PALETTE[idx];
}
