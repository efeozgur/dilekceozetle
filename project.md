# Dilekçe Özetle - Proje Geliştirme Notları

**Son güncelleme:** 2026-06-12 (Pro UI premium iyileştirmeleri + PDF Türkçe karakter fix)
**Repo:** https://github.com/efeozgur/dilekceozetle
**Stack:** Next.js 16.2.9 (Turbopack) · React 19 · Prisma + SQLite · NextAuth 5 · DeepSeek AI · Tailwind CSS

---

## 1. Proje Özeti

Türk hukuk sistemine yönelik bir SaaS uygulamasıdır. Kullanıcılar dilekçe/doküman metni yapıştırarak DeepSeek AI ile özet çıkarır. Free ve Pro abonelik planları vardır.

### Temel Özellikler
- Dilekçe özetleme (3 uzunluk: kısa / orta / uzun)
- Kullanıcı kayıt / giriş (bcrypt ile şifre hash)
- Abonelik sistemi (Free / Pro)
- Dashboard (özet geçmişi, istatistikler)
- Dilekçe karşılaştırma
- PDF / UDF dışa aktarma (Pro)
- PDF / UDF dosya yükleme (Pro)
- Admin paneli (tek kullanıcı)
- Kullanım limiti takibi (5 ücretsiz özet)

---

## 2. Veritabanı Şeması (Prisma)

| Model | Alanlar | Açıklama |
|-------|---------|----------|
| **User** | id, email, name, passwordHash, subscription, pendingPayment, proActivatedAt, proUpgradeCount, bannedAt, banReason, createdAt | Ana kullanıcı tablosu |
| **Summary** | id, userId, originalText, resultText, charCount, summaryCharCount, wordCount, summaryWordCount, sentenceCount, summarySentenceCount, readingTime, summaryReadingTime, tokenEstimate, createdAt | Özet kayıtları |
| **PaymentRequest** | id, userId, amount, status, shopierId, createdAt | Ödeme talepleri |
| **SystemSetting** | id, key, value, label, category, type, createdAt | Admin paneli ayarları |
| **AdminLog** | id, action, targetType, targetId, details, adminEmail, createdAt | Admin işlem logları |
| **Account, Session, VerificationToken** | NextAuth adapter tabloları | |

---

## 3. Tamamlanan İşler

### 3.1. Güvenlik
- Şifreler `bcryptjs` ile hash'leniyor
- `auth.ts` → `trustHost: true` (production için gerekli)
- `middleware.ts` → Cookie tabanlı kontrol, `/auth/*` sayfalarına redirect yok (kullanıcı her zaman login/register sayfasına erişebilir)
- `.env.local` → Local development için `AUTH_URL=http://localhost:3000` (gitignored)

### 3.2. Kullanım Kontrol Sistemi
- **Kayıtsız kullanım:** Ana sayfada form yerine login prompt gösterilir (`src/app/page.tsx`)
- **API koruması:** `/api/summarize` ve `/api/compare` 401 döndürür
- **Free kullanıcılar:** Toplam 5 özet, sadece "orta" uzunluk
- **Pro kullanıcılar:** Sınırsız özet, tüm uzunluklar
- **Limit dolduğunda:** Blur arka planlı UpgradeModal gösterilir

| Dosya | Açıklama |
|-------|----------|
| `src/app/api/summarize/route.ts` | Auth zorunlu + 5 toplam limit |
| `src/app/api/compare/route.ts` | Auth zorunlu |
| `src/components/UpgradeModal.tsx` | Limit dolduğunda gösterilen modal |
| `src/components/SummaryForm.tsx` | `onUpgradeRequired` prop'u |

### 3.3. Kullanım Göstergesi (UsageBar)
Free kullanıcıların kalan haklarını şık bir şekilde görmesini sağlayan progress bar bileşeni.

| Dosya | Açıklama |
|-------|----------|
| `src/components/UsageBar.tsx` | Progress bar (compact + full varyant) |
| `src/app/api/usage/route.ts` | Hafif API: `totalSummaries` + `subscription` |
| `src/app/page.tsx` | Ana sayfada textarea üstünde compact bar |
| `src/app/dashboard/page.tsx` | Geçmiş sayfasında compact bar |
| `src/app/account/page.tsx` | Hesabım sayfasında full bar |

- 0-60%: primary renk (mavi)
- 60-99%: amber renk
- 100%: kırmızı + "Hakkınız dolmuştur" + Pro'ya Yükselt butonu
- Pro üyeler: "Sınırsız Kullanım" amber banner'ı

### 3.4. Dilekçe Karşılaştırma
- `src/app/api/compare/route.ts` — Auth zorunlu
- `src/app/compare/page.tsx` — Karşılaştırma sayfası
- `src/components/CompareForm.tsx` — 2 textarea + dosya yükleme
- `src/components/CompareResult.tsx` — Farkları kategorize gösterir

### 3.5. PDF / UDF Dışa Aktarma (Pro)
| Format | Kütüphane | Dosya |
|--------|-----------|-------|
| PDF | jsPDF | `src/lib/export.ts` → `exportSummaryAsPDF()` |
| UDF | JSZip | `src/lib/export.ts` → `exportSummaryAsUDF()` |

- `src/components/ExportMenu.tsx` — Dropdown menü, Pro-gated
- `src/components/SummaryResult.tsx` — Sonuç ekranında dışa aktarma butonları
- `src/app/dashboard/page.tsx` — Modal içinde dışa aktarma

### 3.6. PDF / UDF Dosya Yükleme (Pro)
| Kütüphane | Dosya |
|-----------|-------|
| pdfjs-dist | `src/lib/fileParser.ts` → `parsePDF()` (dynamic import ile DOMMatrix hatası çözüldü) |
| JSZip | `src/lib/fileParser.ts` → `parseUDF()` |

- `src/components/FileUpload.tsx` — Drag-and-drop, Pro-gated
- `src/components/SummaryForm.tsx` — Textarea altında dosya yükleme alanı
- `src/components/CompareForm.tsx` — Her iki textarea altında dosya yükleme

### 3.7. Admin Paneli
Tek kullanıcı admin sistemi (`ADMIN_EMAIL` env var).

| Sayfa | Dosya | Açıklama |
|-------|-------|----------|
| Dashboard | `src/app/admin/page.tsx` | İstatistikler, recharts grafikler |
| Kullanıcılar | `src/app/admin/users/page.tsx` | Liste, arama, filtreleme |
| Kullanıcı Detayı | `src/app/admin/users/[id]/page.tsx` | Ban/unban, detay |
| Ödemeler | `src/app/admin/payments/page.tsx` | Ödeme yönetimi |
| Özetler | `src/app/admin/summaries/page.tsx` | Özet listesi |
| Özet Detayı | `src/app/admin/summaries/[id]/page.tsx` | Özet görüntüleme |
| Ayarlar | `src/app/admin/settings/page.tsx` | Fiyat, IBAN, site ayarları |

| Dosya | Açıklama |
|-------|----------|
| `src/lib/admin-guard.ts` | `requireAdmin()` + `isAdmin()` |
| `src/lib/settings.ts` | `getSystemSettings()` — DB'den ayar okuma |
| `src/app/admin/layout.tsx` | Sidebar menü |
| `src/app/admin/api/stats/route.ts` | Dashboard istatistik API |

- `SystemSetting` tablosu: Fiyatlar, IBAN, site adı gibi ayarlar DB'de saklanır
- `AdminLog` tablosu: Tüm admin işlemleri loglanır
- `src/app/upgrade/page.tsx` ve `src/app/pricing/page.tsx` — Fiyatları DB'den okur

### 3.8. Hesabım Sayfası
- `src/app/account/page.tsx` — Üyelik bilgileri, istatistikler, son özetler
- Kullanım barı (full varyant), abonelik durumu, Pro bilgileri

### 3.9. UI İyileştirmeleri
- `SummaryResult.tsx`: İstatistikler collapsible, gradient arka plan, "ÖZET" badge
- `Header.tsx`: Pro kullanıcılar için "Fiyatlandırma" gizli, admin linki, hesabım linki
- Ana sayfa CTA: "Ücretsiz başlayın, hemen kayıt olun"
- `ProActivatedOverlay.tsx`: Ödeme onayı sonrası 1 kez gösterilen tam ekran kutlama animasyonu — kral tacı SVG + 16 yıldız parçacığı + genişleyen halkalar + shimmer + glow efekti, 4 sn sonra auto-close, sessionStorage ile tekrar göstermeme
- Ana sayfa giriş kontrolü: Session yoksa form yerine "Giriş Yap / Kayıt Ol" prompt'u

### 3.10. DOMMatrix Hatası Düzeltmesi
- `pdfjs-dist` static import DOMMatrix hatası veriyordu
- Çözüm: `src/lib/fileParser.ts`'de dynamic import (`await import("pdfjs-dist")`)

### 3.11. Pro UI Premium İyileştirmeleri
Pro kullanıcıların arayüzde premium hissini alması için yapılan görsel iyileştirmeler:

| Bileşen | Değişiklik |
|---------|-----------|
| `Header.tsx` | Avatar üzerinde crown badge + "PRO" etiketi, amber border glow |
| `UsageBar.tsx` | Shimmer animasyonlu gradient banner, crown glow, "PRO" badge |
| `page.tsx` (Home) | Pro kullanıcıya amber border glow kart, "PRO" badge ve bilgi satırı |
| `SummaryForm.tsx` | Textarea amber focus ring, amber gradient length selector, amber "Özetle" butonu |
| `dashboard/page.tsx` | Özet kartlarında amber border, her kartta "PRO" badge |
| `account/page.tsx` | Animasyonlu hareketli gradient kart, premium istatistik kutuları, pulse badge |
| `FileUpload.tsx` | Amber border glow drag efekti |
| `ExportMenu.tsx` | Amber temalı dropdown menü |
| `globals.css` | Yeni animasyonlar: `pro-gradient-flow`, `pro-crown-glow`, `pro-card-shimmer`, `pro-border-glow`, `pro-badge-pulse`, `pro-upload-glow` |

### 3.12. PDF Export Türkçe Karakter Desteği
- **Sorun:** `turkishToAscii` fonksiyonu `ş`→`s`, `ı`→`i` dönüşümü yapıyor, "sık sık" → "sik sik" gibi anlam bozulmalarına yol açıyordu
- **Çözüm:**
  - `turkishToAscii` fonksiyonu tamamen silindi
  - `public/fonts/NotoSans-Regular.ttf` eklendi (GitHub'dan indirilen orijinal Noto Sans TTF)
  - `loadUnicodeFont` güncellendi: önce yerel font dene, sonra CDN, en son Helvetica
  - Helvetica fallback'te dahi Türkçe karakterler olduğu gibi gönderilir (kutucuk çıksa bile yanlış kelime olmaz)
  - Font uyarı mesajı kaldırıldı

---

## 4. Deploy & Local Dev

## 4. Deploy & Local Dev

### Production (Sunucu: 45.94.169.47)
- **URL:** https://dilekceozet.ozgurapp.com
- **PM2:** `dilekceozet`, port 3005
- **Nginx:** Reverse proxy → 3005
- **Database:** SQLite `/var/www/dilekceozet/prisma/dev.db`
- **Env:** Production ortam değişkenleri sunucuda `.env` veya platform env vars ile set edilir

### Local Development
- `.env` → Production URL'leri (gitignored, sadece sunucuda kullanılır)
- `.env.local` → Local override: `AUTH_URL=http://localhost:3000` (gitignored, `.env.local` > `.env` override eder)
- **Önemli:** `.env*` gitignored, push edilmez. Sunucu kendi env değişkenlerini kullanır.

---

## 5. Açık Sorunlar

- Shopier entegrasyonu askıda (API key/secret bekleniyor)
- `payment/page.tsx` Pro feature listesinde tutarsızlık olabilir
- Rate limiting yok
- Compare sonuçları DB'ye kaydedilmiyor
- Register API validasyonu eksik (email format + min length kontrolü yok)
- Production loglama (Sentry/LogRocket) yok
- Stale session cookie temizleme — middleware cookie geçerliliğini kontrol etmiyor (sadece varlığına bakar)

---

## 6. Sonraki Adımlar

1. Shopier entegrasyonu çözümü
2. Rate limiting (özellikle `/api/summarize`)
3. Compare sonuçlarını DB'ye kaydet
4. Register API validasyonu (email format + min length)
5. Production loglama (Sentry/LogRocket)
6. Middleware'de JWT validasyonu (stale cookie sorunu için)
