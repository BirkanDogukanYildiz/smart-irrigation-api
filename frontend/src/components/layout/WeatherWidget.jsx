import { useEffect, useState } from "react";
import { getCurrentWeather } from "../../api/weather";
import Icon from "../common/Icon";

function iconFor(code) {
  if (code === 0) return "sun";
  if (code <= 2) return "cloudSun";
  if (code === 3) return "cloud";
  if (code === 45 || code === 48) return "cloudFog";
  if (code >= 51 && code <= 67) return "cloudRain";
  if (code >= 71 && code <= 77) return "cloudSnow";
  if (code >= 80 && code <= 82) return "cloudRain";
  if (code >= 85 && code <= 86) return "cloudSnow";
  if (code >= 95) return "cloudLightning";
  return "cloud";
}

// Gerçek Open-Meteo verisiyle çalışır (bkz. WeatherController) — istek başarısız
// olursa (backend null döner ya da network hatası) widget'ı hiç göstermez, sahte
// bir sıcaklık/koşul UYDURMAZ.
export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    getCurrentWeather()
      .then((data) => {
        if (data) setWeather(data);
        else setFailed(true);
      })
      .catch(() => setFailed(true));
  }, []);

  if (failed || !weather) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 13.5,
        fontWeight: 600,
        color: "var(--color-text-muted)",
      }}
    >
      <Icon name={iconFor(weather.weatherCode)} size={19} style={{ color: "var(--color-primary)" }} />
      <span>
        {Math.round(weather.temperatureC)}°C
        <span style={{ fontWeight: 500, color: "var(--color-text-faint)", marginLeft: 4 }}>{weather.condition}</span>
      </span>
    </div>
  );
}
