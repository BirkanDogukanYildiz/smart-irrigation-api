# İBB Bitki Sulama Yönetim Paneli — React Frontend

Bu proje, orijinal `static/*.html` + `common.js` frontend'inin **React + Vite**
karşılığıdır. Backend (Spring Boot) hiçbir şekilde değiştirilmemiştir; tüm
endpoint yolları, request/response alanları ve iş kuralları birebir korunmuştur.

## Kurulum ve çalıştırma

```bash
npm install
npm run dev       # geliştirme sunucusu (varsayılan: http://localhost:5173)
npm run build     # üretim derlemesi -> dist/
```

Geliştirme sırasında backend'i ayrı çalıştırıp (örn. :8080), Vite tarafında
`vite.config.js` içine bir proxy eklemeniz gerekebilir:

```js
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { "/api": "http://localhost:8080" },
  },
});
```

Üretimde ise `dist/` klasörünü, backend'in mevcut `src/main/resources/static`
dizini yerine dağıtabilir ya da ayrı bir statik sunucudan servis edebilirsiniz.

## İBB Logosu

`../src/main/resources/static/ibb-logo.svg` şu an yer tutucu bir kurumsal rozettir (resmi logo
dosyasına güvenilir bir kaynaktan ulaşılamadığı için). Gerçek İBB logo dosyanızı
aynı isim ve konumla (`../src/main/resources/static/ibb-logo.svg`) değiştirmeniz yeterlidir;
`IBBLogo` bileşeni otomatik olarak kullanır.

## Klasör yapısı

```
src/
  api/            Backend ile iletişim (fetch tabanlı servis katmanı)
  context/        Oturum/rol durumu (AuthContext)
  components/
    layout/       Header, NavBar, Layout
    common/       Button, Alert, StatusBadge, Section, Loading, ...
    devices/      Cihaz formu, tablosu, konum seçici (Leaflet)
    map/          Kümeleme haritası (Leaflet + markercluster)
    regions/      Bölge formu ve tablosu
    users/        Kullanıcı formu ve tablosu
    logs/         İşlem geçmişi tablosu
  pages/          Rotalara karşılık gelen sayfalar
  styles/         Bileşen bazlı CSS (layout, common, table, form, map, login)
  utils/          Rol sabitleri, tarih biçimlendirme
```

## Korunan davranışlar

- JWT tabanlı giriş, `localStorage` ile oturum saklama
- Rol bazlı görünürlük: ADMIN / HEADGARDENER / GARDENER
- Cihaz durum güncelleme, arıza açıklaması zorunluluğu
- Harita üzerinde sürükle-bırak ile konum güncelleme + onay istemi
- Bölge/kullanıcı ekleme, baş bahçivan atama, silme işlemleri
- Audit log listesi (rol bazlı filtreleme backend'de yapılıyor)
