import { apiDownload } from "./client";

export function exportRegionsCsv() {
  return apiDownload("/api/export/regions.csv", "bolgeler.csv");
}
export function exportDevicesCsv() {
  return apiDownload("/api/export/devices.csv", "ekipmanlar.csv");
}
export function exportFaultsCsv() {
  return apiDownload("/api/export/faults.csv", "arizalar.csv");
}
export function exportLogsCsv() {
  return apiDownload("/api/export/logs.csv", "islem_gecmisi.csv");
}
export function exportDashboardCsv() {
  return apiDownload("/api/export/dashboard.csv", "dashboard_ozet.csv");
}
