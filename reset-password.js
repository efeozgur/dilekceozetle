const bcrypt = require('bcryptjs');
const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

(async () => {
  const hash = await bcrypt.hash('Adalet1977*', 12);
  console.log('Uretilen hash:', hash);

  const dbPath = path.join(__dirname, 'prisma', 'dev.db');
  const sqlFile = path.join(__dirname, 'reset.sql');

  fs.writeFileSync(sqlFile, `UPDATE User SET passwordHash = '${hash}' WHERE email = 'admin@ozgurapp.com';\n`);

  try {
    execFileSync('sqlite3', [dbPath], {
      input: fs.readFileSync(sqlFile),
      stdio: ['pipe', 'inherit', 'inherit']
    });
    console.log('Sifre guncellendi!');

    const result = execFileSync('sqlite3', [dbPath, "SELECT passwordHash FROM User WHERE email = 'admin@ozgurapp.com'"], { encoding: 'utf-8' }).trim();
    const match = await bcrypt.compare('Adalet1977*', result);
    console.log('Dogrulama:', match ? 'BASARILI ✓' : 'BASARISIZ ✗');
  } catch (e) {
    console.error('Hata:', e.message);
  } finally {
    try { fs.unlinkSync(sqlFile); } catch {}
  }
})();
