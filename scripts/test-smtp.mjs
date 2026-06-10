// SMTP bağlantısını ve basit bir mail gönderimini test eder.
// Kullanım: npx tsx scripts/test-smtp.mjs <alıcı@adres.com>
import "dotenv/config";
import nodemailer from "nodemailer";

const TO = process.argv[2] || process.env.ADMIN_EMAIL || "admin@ozgurapp.com";

const config = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "465", 10),
  secure: process.env.SMTP_SECURE !== "false",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

console.log("=== SMTP Test ===");
console.log("Host:    ", config.host);
console.log("Port:    ", config.port);
console.log("Secure:  ", config.secure);
console.log("User:    ", config.auth.user);
console.log("Pass set:", config.auth.pass ? `YES (${config.auth.pass.length} chars)` : "NO (empty)");
console.log("To:      ", TO);
console.log("---");

if (!config.host || !config.auth.user || !config.auth.pass) {
  console.error("\n❌ SMTP ayarları eksik. .env dosyasını kontrol edin.");
  process.exit(1);
}

const transporter = nodemailer.createTransport(config);

// 1) Bağlantı testi
console.log("\n[1/2] SMTP bağlantısı doğrulanıyor...");
try {
  await transporter.verify();
  console.log("✓ Bağlantı başarılı!");
} catch (err) {
  console.error("❌ Bağlantı hatası:");
  console.error("  Code:   ", err.code);
  console.error("  Message:", err.message);
  if (err.code === "EAUTH" || err.responseCode === 535) {
    console.error("\n  → Kullanıcı adı veya şifre hatalı. Gmail ise App Password kullanın.");
  } else if (err.code === "ECONNREFUSED" || err.code === "ETIMEDOUT") {
    console.error("\n  → SMTP sunucusuna bağlanılamıyor. Host/port veya firewall sorunu.");
  } else if (err.code === "ESOCKET" || err.code === "EPROTO") {
    console.error("\n  → SSL/TLS hatası. SMTP_SECURE değerini veya portu kontrol edin (465=true, 587=false).");
  }
  process.exit(1);
}

// 2) Mail gönder
console.log("\n[2/2] Test maili gönderiliyor...");
try {
  const info = await transporter.sendMail({
    from: `"Dilekçe Özeti Test" <${config.auth.user}>`,
    to: TO,
    subject: "Mimo SMTP test maili",
    text: `Bu bir test mailidir. SMTP ayarları doğru çalışıyor.\nGönderim zamanı: ${new Date().toISOString()}`,
    html: `
      <h2>Mimo SMTP Test</h2>
      <p>Bu bir test mailidir. SMTP ayarları doğru çalışıyor.</p>
      <p style="color:#6b7280;font-size:12px;">Gönderim zamanı: ${new Date().toISOString()}</p>
    `,
  });
  console.log("✓ Mail gönderildi!");
  console.log("  Message ID:", info.messageId);
  console.log("  Accepted:  ", info.accepted);
  console.log("  Rejected:  ", info.rejected);
  if (info.pending) console.log("  Pending:   ", info.pending);
} catch (err) {
  console.error("❌ Mail gönderim hatası:");
  console.error("  Code:   ", err.code);
  console.error("  Message:", err.message);
  if (err.response) console.error("  Response:", err.response);
  process.exit(1);
}
