// Kurumsal, tutarlı bir görsel dil için: emoji yerine tek stroke kalınlığına (1.75)
// sahip, sade outline SVG ikon seti. Yeni bir npm bağımlılığı eklemek yerine (build
// güvenilirliği ve offline çalışma için) burada, projenin ihtiyaç duyduğu ikonlarla
// sınırlı, küçük bir yerel set tutuluyor — Lucide/Feather ikon dilinden ilham alındı.
const PATHS = {
  home: "M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9",
  park: "M12 3c-3 3-5 6-5 9a5 5 0 0 0 10 0c0-3-2-6-5-9ZM12 15v6M9 21h6",
  map: "M9 3 3 5v16l6-2 6 2 6-2V3l-6 2-6-2Zm0 0v16m6-16v16",
  box: "M21 8 12 3 3 8l9 5 9-5ZM3 8v9l9 5m0-14v14m9-14v9l-9 5",
  clipboard: "M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1ZM6 6h12v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6Zm3 6h6m-6 4h6",
  users: "M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 20c0-3 2.5-5 6-5s6 2 6 5m2-5c3 0 6 2 6 5",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-14v5l3 3",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9c0-3.9 3.1-7 7-7s7 3.1 7 7",
  logout: "M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4m5 4 4 5-4 5m4-5H9",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm9 2-5-5",
  bell: "M12 3a5 5 0 0 0-5 5v3.5c0 .8-.3 1.5-.9 2.1L4.5 15.5A1 1 0 0 0 5.2 17h13.6a1 1 0 0 0 .7-1.5l-1.6-1.9c-.6-.6-.9-1.3-.9-2.1V8a5 5 0 0 0-5-5Zm-2.5 16a2.5 2.5 0 0 0 5 0",
  sun: "M12 4V2m0 20v-2M4 12H2m20 0h-2M5.6 5.6 4.2 4.2m15.6 15.6-1.4-1.4M5.6 18.4l-1.4 1.4M18.4 5.6l1.4-1.4M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z",
  moon: "M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z",
  check: "M4 12.5 9.5 18 20 6",
  checkCircle: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-4-9 3 3 5.5-6",
  warning: "M12 3 2 20h20L12 3Zm0 6v5m0 3h.01",
  document: "M8 3h6l4 4v13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm6 0v4h4M9 12h6m-6 4h6",
  layers: "m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5",
  droplet: "M12 3s6 6.5 6 11a6 6 0 1 1-12 0c0-4.5 6-11 6-11Z",
  lightbulb: "M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.4.9 1 .9 1.6V16h5.2v-.5c0-.6.3-1.2.9-1.6A6 6 0 0 0 12 3Z",
  bench: "M4 11h16M4 11v7m16-7v7M6 11V8a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v3M6 15h12",
  trash: "M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13",
  camera: "M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Zm8 3.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z",
  playground: "M6 20V10m0 0 6-6 6 6M6 10h12M12 4v16m6-6v6",
  pin: "M12 21s7-6.4 7-11.5A7 7 0 0 0 5 9.5C5 14.6 12 21 12 21Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  cloud: "M7 18a4 4 0 0 1-.5-8 5.5 5.5 0 0 1 10.7-1.7A4.5 4.5 0 0 1 17 18H7Z",
  cloudSun: "M9 17a4 4 0 1 1 4.2-6.6A5.5 5.5 0 0 1 21 12.5 4 4 0 0 1 17 17H9Zm-4-9 1.1 1.1M3 11h1.5",
  cloudRain: "M7 16a4 4 0 0 1-.5-8 5.5 5.5 0 0 1 10.7-1.7A4.5 4.5 0 0 1 17 16H7Zm1 3 1-2m3 2 1-2m3 2 1-2",
  cloudSnow: "M7 15a4 4 0 0 1-.5-8 5.5 5.5 0 0 1 10.7-1.7A4.5 4.5 0 0 1 17 15H7Zm2 4h.01M12 19h.01M15 19h.01",
  cloudLightning: "M7 14a4 4 0 0 1-.5-8 5.5 5.5 0 0 1 10.7-1.7A4.5 4.5 0 0 1 17 14H7Zm6 1-2 4h3l-2 4",
  cloudFog: "M6 16h12M6 12a4 4 0 0 1 3.8-4 5.5 5.5 0 0 1 10.6 1.8A4 4 0 0 1 20 12M4 20h16",
  chevronDown: "m6 9 6 6 6-6",
  chevronLeft: "m15 18-6-6 6-6",
  chevronRight: "m9 18 6-6-6-6",
};

export default function Icon({ name, size = 18, strokeWidth = 1.75, className = "", style }) {
  const path = PATHS[name];
  if (!path) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ display: "block", flexShrink: 0, ...style }}
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}
