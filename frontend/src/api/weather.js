import { apiCall } from "./client";

// GET /api/weather -> WeatherResponseDto { temperatureC, condition, weatherCode } | null
// Dış servise (Open-Meteo) erişilemezse backend null döner — widget o durumda
// kendini gizler, dashboard'un geri kalanını etkilemez.
export function getCurrentWeather() {
  return apiCall("/api/weather");
}
