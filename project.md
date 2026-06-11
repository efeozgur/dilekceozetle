# Dilekçe Özetle - Proje Geliştirme Notları

**Son güncelleme:** 2026-06-11
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
- `middleware.ts` → Hem `__Secure-authjs.session-token` hem `authjs.session-token` kontrolü

### 3.2. Kullanım Kontrol Sistemi
- **Kayıtsız kullanım yasak:** `/api/summarize` ve `/api/compare` 401 döndürür
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

### 3.10. DOMMatrix Hatası Düzeltmesi
- `pdfjs-dist` static import DOMMatrix hatası veriyordu
- Çözüm: `src/lib/fileParser.ts`'de dynamic import (`await import("pdfjs-dist")`)

---

## 4. Deploy Süreci (Sunucu: 45.94.169.47)

- **URL:** https://dilekceozet.ozgurapp.com
- **PM2:** `dilekceozet`, port 3005
- **Nginx:** Reverse proxy → 3005
- **Database:** SQLite `/var/www/dilekceozet/prisma/dev.db`

---

## 5. Açık Sorunlar

- Shopier entegrasyonu askıda (API key/secret bekleniyor)
- `payment/page.tsx` Pro feature listesinde tutarsızlık olabilir
- `.env.example` yok
- Rate limiting yok
- Compare sonuçları DB'ye kaydedilmiyor

---

## 6. Sonraki Adımlar

1. Shopier entegrasyonu çözümü
2. Rate limiting (özellikle `/api/summarize`)
3. `.env.example` oluştur
4. Compare sonuçlarını DB'ye kaydet
5. Register API validasyonu (email format + min length)
6. Production loglama (Sentry/LogRocket)
