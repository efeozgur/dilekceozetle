# Dilekçe Özetle - Proje Geliştirme Notları

**Son güncelleme:** 2026-06-10
**Repo:** https://github.com/efeozgur/dilekceozetle
**Stack:** Next.js 16.2.9 (Turbopack) · React · Prisma + SQLite · NextAuth 5 (beta.31) · @nopeion/shopier · DeepSeek AI · Tailwind CSS

---

## 1. Proje Özeti

Türk hukuk sistemine yönelik bir SaaS uygulamasıdır. Kullanıcılar dilekçe/doküman metni yapıştırarak DeepSeek AI ile özet çıkarır. Free, Pro ve Kurumsal abonelik planları vardır. Ödeme altyapısı Shopier üzerinden, kimlik doğrulama NextAuth (Credentials) + Prisma ile sağlanır.

### Temel Özellikler
- Dilekçe özetleme (3 uzunluk: kısa / orta / uzun)
- Kullanıcı kayıt / giriş (bcrypt ile şifre hash)
- Abonelik sistemi (Free/Pro/Kurumsal)
- Shopier ile ödeme (callback doğrulama)
- Dashboard (özet geçmişi, istatistikler)
- **Dilekçe karşılaştırma** (yeni eklendi)

---

## 2. Veritabanı Şeması (Prisma)

| Model | Alanlar | Açıklama |
|-------|---------|----------|
| **User** | id, email, name, passwordHash, subscription, createdAt | Ana kullanıcı tablosu |
| **Summary** | id, userId, originalText, resultText, charCount, createdAt | Özet kayıtları, charCount: 0 ise Pro üyelik ödemesi placeholder'ı |

---

## 3. Tamamlanan İşler

### 3.1. Güvenlik (Kritik Düzeltme)
- **Sorun:** Şifreler `passwordHash` alanında plaintext saklanıyordu (TODO yorumu vardı), `auth.ts` raw string karşılaştırma yapıyordu.
- **Çözüm:**
  - `bcryptjs` + `@types/bcryptjs` eklendi
  - `src/app/api/auth/register/route.ts`: `bcrypt.hash(password, 12)` ile hash'leme
  - `src/lib/auth.ts`: `bcrypt.compare()` ile doğrulama

### 3.2. Fiyatlandırma Güncellemesi
- **Free:** 5 özet/ay → **3 özet/ay**
- **Pro:** 199 TL → **299 TL**
- **Kurumsal:** 499 TL → **799 TL**
- Pro özellikleri: "PDF dışa aktarma" → **"Dilekçe karşılaştırma"**
- Güncellenen dosyalar: `pricing/page.tsx`, `payment/page.tsx`, `api/payment/checkout/route.ts`

### 3.3. Free Kullanıcı Limitleri
- `src/app/api/summarize/route.ts` artık Free kullanıcıları kontrol ediyor:
  - Aylık max 3 özet (geçince 403 + Türkçe mesaj)
  - Sadece "medium" uzunlukta izin (kısa/uzun → 403)
- Pro ve Kurumsal sınırsız

### 3.4. Yeni: Dilekçe Karşılaştırma Özelliği
İki hukuki dilekçeyi yan yana yapıştırıp, DeepSeek AI ile aralarındaki farkları tespit eden yeni bir modül.

| Bileşen | Dosya | Açıklama |
|---------|-------|----------|
| API endpoint | `src/app/api/compare/route.ts` | POST: 2 metin alır, validate eder, DeepSeek'e gönderir |
| Sayfa | `src/app/compare/page.tsx` | Kullanıcı UI'ı |
| Form | `src/components/CompareForm.tsx` | 2 textarea, gönder butonu |
| Sonuç | `src/components/CompareResult.tsx` | Farkları kategorize gösterir |
| AI prompt | `src/lib/prompts.ts` → `COMPARE_SYSTEM_PROMPT` | Talepler, iddialar, olay örgüsü, hukuki dayanak farkları |
| AI fonksiyon | `src/lib/deepseek.ts` → `comparePetitions()` | |
| Header linki | `src/components/Header.tsx` | "Karşılaştır" navigasyon menüsünde |

**API validasyonları:**
- Her iki metin zorunlu
- Min 50 karakter
- Max 100.000 karakter
- DeepSeek API key kontrolü

### 3.5. UI İyileştirmeleri
- `src/components/SummaryResult.tsx`: İstatistikler collapsible (ChevronDown/Up), gradient arka plan, "ÖZET" badge, `showStats` state'i
- `src/components/Header.tsx`: Türkçe karakter düzeltmeleri (Dilekçe Özeti, Karşılaştır, Geçmişim, Fiyatlandırma, Giriş Yap, Kayıt Ol, Çıkış Yap, Menüyü aç/kapat)

### 3.6. Shopier SDK Tip Düzeltmeleri
Build sırasında çıkan tip hataları düzeltildi:
- `Currency.TRY` → `Currency.TL`
- `BuyerInfo.name` → `firstName` + `lastName`
- `verifyCallback(data as Parameters<...>[0])` → `data as any`
- `ProductType` enum import'u eklendi

### 3.7. Auth & Middleware Düzeltmeleri
- `src/lib/auth.ts` → `trustHost: true` eklendi (production için gerekli)
- `src/middleware.ts` → Hem `__Secure-authjs.session-token` hem `authjs.session-token` kontrol ediliyor
- `src/app/auth/login/page.tsx` → `router.push` yerine `window.location.href` (NextAuth v5'te daha güvenilir)

### 3.8. .gitignore İyileştirmesi
- `prisma/dev.db` ve `prisma/dev.db-journal` → ignore
- `*.sqlite`, `*.sqlite-journal` → ignore
- `/session-*.md` → ignore (kişisel AI oturum logları)
- `prisma/dev.db` zaten tracked olduğu için `git rm --cached` ile çıkarıldı

---

## 4. Deploy Süreci (Sunucu: 45.94.169.47, Ubuntu + Nginx + PM2)

### 4.1. Initial Sorunlar ve Çözümler

| Sorun | Çözüm |
|-------|-------|
| 502 Bad Gateway | PM2 yanlış portta → `pm2 show` ile doğrulandı |
| `Could not find a production build` | `rm -rf .next && npm run build` |
| `UntrustedHost` hatası | `auth.ts`'e `trustHost: true` + `.env`'e `NEXTAUTH_TRUST_HOST=true` |
| Giriş sonrası login sayfasında kalma | Cookie adı (`__Secure-authjs.session-token`) + `window.location.href` düzeltmesi |
| Login sonrası dashboard'a yönlenmeme | Login page redirect düzeltildi |
| `.env` push'a girmemesi | `.env*` zaten gitignore'da idi, sorun yok |

### 4.2. Sunucu Yapılandırması
- **URL:** https://dilekceozet.ozgurapp.com
- **PM2 process:** `dilekceozet` (id 14), script: `npm start`, port 3005
- **Nginx:** `/etc/nginx/sites-enabled/dilekceozet` → 3005 portuna reverse proxy
- **Database:** SQLite, `/var/www/dilekceozet/prisma/dev.db` (chmod 644)
- **Dizin:** `/var/www/dilekceozet` (chmod 755)

### 4.3. .env (Sunucu)
```env
DATABASE_URL="file:prisma/dev.db"
NEXTAUTH_SECRET="rvFXPYQCPCJVPU+CnQgfEAZx1Pq64Thg+Amu+mL3iqo="
NEXTAUTH_URL="https://dilekceozet.ozgurapp.com"
NEXTAUTH_TRUST_HOST=true
DEEPSEEK_API_KEY="sk-..."
SHOPIER_API_KEY="..."
SHOPIER_API_SECRET="..."
```

---

## 5. Devam Eden / Açık Sorunlar

### 5.1. Shopier Entegrasyonu (Kritik — Engellenmiş)
**Durum:** Shopier, sadece **Kişisel Erişim Anahtarı (PAT)** verdi. Eski `apiKey + apiSecret` sistemi için anahtar vermedi.

**Sorun:**
- `@nopeion/shopier` SDK hâlâ HMAC-SHA256 + apiKey/apiSecret çift yapısı kullanıyor
- Yeni Shopier Developer Portal (developer.shopier.com) OAuth 2.0 + PAT sistemine geçmiş
- SDK henüz yeni sistemi desteklemiyor

**Araştırılan:**
- developer.shopier.com/recipes → sayfa boş (sadece nav)
- developer.shopier.com/llms.txt → sadece TOC
- getting-started ve api-reference → 404
- Web search → sonuç yok

**Bekleyen aksiyon:** Shopier destek ekibine "eski API key+secret alabilir miyim?" diye yazıldı. Cevap gelene kadar ödeme devre dışı.

### 5.2. Bilinen Tutarsızlıklar
- `src/app/payment/page.tsx` Pro feature listesinde hâlâ "PDF dışa aktarma" yazıyor (pricing ile uyumsuz)
- `src/app/api/auth/register/route.ts`'de email format ve min-length validasyonu yok (UI 6 karakter istiyor, API kontrol etmiyor)
- Compare sonuçları veritabanına kaydedilmiyor → Dashboard'da görünmüyor
- Compare için abonelik/limit kontrolü yok (herkese açık)

### 5.3. Production İyileştirmeleri (Opsiyonel)
- `.env.example` dosyası yok
- Production'da `console.error` → Sentry/LogRocket entegrasyonu
- Rate limiting (özellikle `/api/summarize` ve `/api/compare`)

---

## 6. Git Geçmişi (Özet)

| Commit | Açıklama |
|--------|----------|
| `65f344f` | Initial: dilekçe özetleme SaaS (AI, Shopier, auth, dashboard, istatistikler) |
| `38cddda` | feat: dilekçe karşılaştırma, fiyat güncellemesi, güvenlik, UI iyileştirmeleri |
| (henüz push'lanmadı) | fix: login sonrası dashboard'a yönlendirme + production cookie adı |

---

## 7. Sonraki Adımlar (Öncelik Sırasına Göre)

1. **Shopier destek yanıtı** → API key/secret al ya da PAT için özel entegrasyon yaz
2. Compare sonuçlarını DB'ye kaydet (özet geçmişinde göster)
3. Compare için abonelik kontrolü (Pro özelliği olarak sınırla)
4. Register API validasyonu (email format + min length)
5. Payment page feature list tutarsızlığı düzelt
6. `.env.example` oluştur
7. Tüm bekleyen değişiklikleri commit + push
