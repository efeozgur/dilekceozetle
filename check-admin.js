const bcrypt = require('bcryptjs');
const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

(async () => {
  const dbPath = path.join(__dirname, 'prisma', 'dev.db');

  try {
    const hash = execFileSync('sqlite3', [dbPath, "SELECT passwordHash FROM User WHERE email = 'admin@ozgurapp.com'"], { encoding: 'utf-8' }).trim();
    console.log('Mevcut hash:', hash);

    if (!hash) {
      console.log('Kullanici bulunamadi!');
      return;
    }

    const ok = await bcrypt.compare('Adalet1977*', hash);
    console.log('Hash dogrulama:', ok ? 'OK' : 'FAIL');

    if (!ok) {
      console.log('Hash guncelleniyor...');
      const newHash = await bcrypt.hash('Adalet1977*', 12);
      console.log('Yeni hash:', newHash);
      execFileSync('sqlite3', [dbPath, "UPDATE User SET passwordHash = '" + newHash + "' WHERE email = 'admin@ozgurapp.com'"], { encoding: 'utf-8' });

      const check = execFileSync('sqlite3', [dbPath, "SELECT passwordHash FROM User WHERE email = 'admin@ozgurapp.com'"], { encoding: 'utf-8' }).trim();
      const ok2 = await bcrypt.compare('Adalet1977*', check);
      console.log('Guncelleme dogrulama:', ok2 ? 'OK' : 'FAIL');
    }
  } catch (e) {
    console.error('Hata:', e.message);
  }
})();
