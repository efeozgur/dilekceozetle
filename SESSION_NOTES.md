# Admin Şifre Sıfırlama - Devam Eden Sorun

**Tarih:** 2026-06-11
**Sunucu:** 45.94.169.47
**Dizin:** /var/www/dilekceozet
**DB:** /var/www/dilekceozet/prisma/dev.db

## Sorun
Admin şifresi (`admin@ozgurapp.com`) unutuldu. `Adalet1977*` olarak güncellenmeye çalışılıyor ama başarılı olunamadı.

## Mevcut Durum
- Veritabanındaki hash bozuk: `$2b$12$` yerine `b2.jvJCfi` ile başlıyor
- Geçerli hash: `$2b$12$.Sk1TJCPzCDtuxLohsn3zOVC5AMrXV5Rg7bUKhh3AT5q9kD58HZBu` (bu `Adalet1977*` içindir)
- `reset-password.js` dosyası proje kökünde hazır, scp ile sunucuya yüklendi

## Çözüm Adımları (İşyerinde Devam)

### Yöntem 1: Script ile
```bash
ssh root@45.94.169.47
cd /var/www/dilekceozet
node reset-password.js
```

### Yöntem 2: Direkt sqlite3 (hash doğrudan)
```bash
sqlite3 /var/www/dilekceozet/prisma/dev.db
```
sqlite3 içine:
```sql
.headers on
.mode column
SELECT email, passwordHash FROM User WHERE email = 'admin@ozgurapp.com';
UPDATE User SET passwordHash = '$2b$12$.Sk1TJCPzCDtuxLohsn3zOVC5AMrXV5Rg7bUKhh3AT5q9kD58HZBu' WHERE email = 'admin@ozgurapp.com';
.quit
```

### Yöntem 3: Hash doğrulama
```bash
cd /var/www/dilekceozet
node -e "const bcrypt = require('bcryptjs'); bcrypt.compare('Adalet1977*', process.argv[1]).then(r => console.log(r));" '$2b$12$.Sk1TJCPzCDtuxLohsn3zOVC5AMrXV5Rg7bUKhh3AT5q9kD58HZBu'
```
`true` dönerse hash doğru demektir.

## Olası Sorunlar
- `$` işaretleri terminal tarafından yutuluyor olabilir
- `sqlite3` komutu PATH'te olmayabilir → `apt install sqlite3`
- `bcryptjs` modülü node_modules'de olmayabilir → `npm install bcryptjs`
- `better-sqlite3` native modülü compile edilmemiş olabilir → `npm rebuild better-sqlite3`

## Giriş Bilgileri (Hash düzeldikten sonra)
- Email: `admin@ozgurapp.com`
- Şifre: `Adalet1977*`
