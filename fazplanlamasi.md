# Akıllı Sulama Sistemi — Faz Planı (v2)

**Proje:** smart-irrigation-api (Bitki Sulama Yönetim Paneli, Belediye)
**Güncelleme:** 12 Ağustos 2026 — canlıya çıkış hazırlığı ileriye alındı, kalan 2 hafta Faz 5 + Faz 6-A'ya ayrıldı.
**Kritik kısıt:** Stajın bitmesine 2 hafta kaldı.

---

## Değişen şey ne

Önceki planda kalan 2 hafta "canlıya çıkış hazırlığı"na (sırlar, Docker, testler vb.) ayrılmıştı. Bu karardan vazgeçtiniz — o iş **Faz 5**'e taşındı ve staj sonrasına ertelendi. Kalan 2 hafta artık **mimariyi genel bir "akıllı park" modeline genelleştirmeye** ve **vatandaşa açık bir şeffaflık sayfası** eklemeye ayrılıyor. Bunun tek dezavantajı: teslim ettiğinizde sistem hâlâ dev konfigürasyonuyla (düz metin DB şifresi, `admin/1234` test hesapları vb.) çalışıyor olacak — bunu sunumda/teslim notunda "bilinen ve planlanmış bir sonraki adım" olarak açıkça belirtmenizi öneririm, sürpriz olmasın.

---

## Faz 3 (YENİ) — Akıllı Park Mimarisine Genelleme + Vatandaş Şeffaflık Sayfası (kalan 2 hafta)

İki parçalı, birbirinden bağımsız yürütülebilir bir çalışma. Sıra önemli: önce mimari genelleme (3.1), çünkü vatandaş sayfası (3.2) onun ürettiği veriyi gösterecek.

### 3.1 Mimari genelleme — `SprinklerInfo` → genel saha ekipmanı modeli

Amaç, önceki dokümanda konuştuğumuz gibi, sistemi sadece sulamaya değil genel park ekipmanına (bank, aydınlatma, çöp kutusu, oyun grubu, kamera...) açık hâle getirmek. 2 haftada **tam yeniden adlandırma** (SprinklerInfo→Asset, `/api/devices`→`/api/assets` gibi) riskli ve gereksiz — bunun yerine mevcut modele bir tür alanı ekleyip uçtan uca kanıtlamayı öneriyorum:

1. `AssetType` enum'u ekleyin: `SULAMA_CIHAZI, AYDINLATMA, BANK, COP_KUTUSU, OYUN_GRUBU, KAMERA, DIGER`.
2. `SprinklerInfo` entity'sine `assetType` alanı ekleyin (varsayılan `SULAMA_CIHAZI` — mevcut kayıtlar bozulmaz).
3. Request/Response DTO'larına (`SprinklerInfoRequestDto`, `SprinklerInfoResponseDto`) bu alanı işleyin; servis katmanında (`toEntity`/`toDto`) geçirin.
4. `DataInitializer`'a 1-2 örnek farklı türde ekipman ekleyin (örn. bir aydınlatma direği, bir bank) — demo sırasında "genelleştirildi" iddiasını somut gösterecek veri bu.
5. Frontend (`cihazlar.html`): ekipman ekleme formuna tür seçici ekleyin, listeye tür sütunu/filtresi koyun. `index.html`'deki durum tablosuna da tür rozetini ekleyin.
6. Metin/etiket düzeyinde: panel başlığındaki "Sulama Alanı" gibi ifadeleri "Bölge/Alan" gibi daha nötr ifadelere çekmek isteğe bağlı — zorunlu değil.

**Bilinçli olarak yapmıyorum:** tablo/entity/endpoint isimlerinin tam değişimi (`Irrigation_System`→`Park_Ekipmanlari`, `/api/devices`→`/api/assets`). Bu kozmetik değişiklik, mevcut her katmanı (entity, repo, service, controller, 4 DTO, frontend JS çağrıları, exception sınıfları) dokunmayı gerektiriyor ve 2 haftalık pencerede bug riski/zaman kaybı olarak fayda-maliyet dengesi kötü. Tür alanı eklenmiş, uçtan uca çalışan bir model, "mimari buna açık" iddiasını kanıtlamak için yeterli — isim değişimini staj sonrasına not düşün.

### 3.2 Vatandaşa açık şeffaflık sayfası (Faz 6-A)

1. Yeni, kimlik doğrulama gerektirmeyen bir endpoint: `GET /api/public/ozet`. `DashboardController`'daki veriye benzer ama hassas olmayan bir alt küme döndürsün: toplam ekipman sayısı, tür bazlı dağılım (3.1'in meyvesi), çalışan/arızalı oranı, bölge sayısı. Kullanıcı sayısı gibi iç bilgiyi **buraya koymayın**.
2. `SecurityConfig`'te bu path'i `permitAll()` yapın (mevcut `.csrf(disable)` + JWT filtresi yapısına ekleme, büyük değişiklik değil).
3. Yeni statik sayfa (`seffaflik.html` veya `vatandas.html`): login gerektirmeden erişilebilir, mevcut `common.css` marka diliyle uyumlu, mobil uyumlu. "X park alanında Y ekipman izleniyor, %Z çalışır durumda" gibi sade bir görünüm.
4. `login.html`'e bu sayfaya giden bir link koyun ("Vatandaş görünümü" gibi) — panele girmeden de erişilebilsin.
5. Zaman kalırsa: bölge bazlı basit bir liste (yalnızca genel/hassas olmayan konum bilgisi).

**Bilinçli olarak yapmıyorum:** vatandaş arıza ihbar formu (Faz 6-B). Moderasyon kuyruğu, spam/kötüye kullanım koruması ve KVKK kapsamında kişisel veri işleme süreci gerektiriyor — 2 haftalık pencereye sığmaz, ayrı bir faz olarak kalsın.

### Kaba zaman dağılımı (10 iş günü)

Gün 1: `AssetType` enum + entity alanı + `DataInitializer` örnek verisi · Gün 2–3: DTO/servis/controller güncellemeleri · Gün 4–5: `cihazlar.html`/`index.html`'e tür seçici ve rozet · Gün 6: `/api/public/ozet` endpoint'i + `SecurityConfig` ayarı · Gün 7–8: şeffaflık sayfası (HTML/CSS/JS) · Gün 9: uçtan uca test, küçük UX düzeltmeleri · Gün 10: demo hazırlığı, sunum notları.

---

## Faz 4 — Staj sonrası kısa vade (1–2 ay, proje devam ederse)

Değişmedi: bildirim sistemi (cihaz FAULTY olunca ilgiliye e-posta), raporlama (Excel/PDF export), gerçek sulama otomasyonu + hava durumu API entegrasyonu (şu an sistem sulamayı tetiklemiyor, yalnızca izliyor — bunu hatırlatmakta fayda var), toprak nem sensörü/IoT ucu, CI pipeline.

---

## Faz 5 (ERTELENDİ, eski Faz 3) — Canlıya Çıkış Hazırlığı

Staj bitiminde sistem hâlâ dev konfigürasyonuyla çalışıyor olacağı için, projeyi biri devralırsa veya siz devam ederseniz **ilk yapılması gereken iş bu**. Önceki dokümanda detaylandırdığım somut bulgular hâlâ geçerli ve değişmedi:

- `application.properties`'teki düz metin DB şifresini (`000141`) ortam değişkenine taşıyın, repo geçmişinde kaldıysa döndürün.
- `DataInitializer`'ın her ortamda `admin/1234` vb. hesapları otomatik açması ve `login.html`'in bu şifreleri göstermesi prod'a çıkmadan kapatılmalı.
- `ddl-auto=update` yerine migration tabanlı bir şema yönetimine (Flyway/Liquibase) geçin.
- `/api/auth/login`'e rate limit ekleyin.
- CORS allow-list'i netleştirin, HTTPS zorunlu kılın.
- Cihaz açıklamasının (`description`) frontend'de doğrudan `innerHTML`'e basılması — gerçek bir XSS açığı, escape edilmeli. Faz 3'te tür alanı eklerken bu render kodunu zaten elleyeceksiniz, o esnada düzeltmek ucuz.
- Docker/docker-compose + kurulum README'si + Elasticsearch'ün prod'da gerekli olup olmadığına karar (öneri: opsiyonel/best-effort yapın).

---

## Faz 6-B — Vatandaş arıza ihbarı (uzun vade)

Değişmedi: belediye gerçekten talep ederse, moderasyon/spam koruması/KVKK süreçleriyle birlikte ayrı bir proje olarak ele alınmalı.

---

## Bilinçli olarak kapsam dışı bıraktıklarım (değişmedi)

Mikroservis mimarisine bölme, native mobil uygulama, çok kiracılı (multi-tenant) SaaS tasarımı, gamification/rozet sistemi, blockchain benzeri veri bütünlüğü çözümleri — bu ölçekteki bir sistem için gerekli değil, 2 haftalık pencerede zaman israfı olur.
