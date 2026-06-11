import nodemailer from "nodemailer";

const SMTP_CONFIG = {
  host: process.env.SMTP_HOST!,
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_SECURE !== "false",
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
};

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@ozgurapp.com";
const NEXTAUTH_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";
const FROM_EMAIL = process.env.SMTP_USER || "bildirim@ozgurapp.com";
const FROM_NAME = "Dilekçe Özeti Bildirim";

let transporterSingleton: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporterSingleton) {
    transporterSingleton = nodemailer.createTransport(SMTP_CONFIG);
  }
  return transporterSingleton;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDateTR(d: Date): string {
  return d.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });
}

// Admin'e yeni ödeme talebi bildirimi
export async function sendAdminPaymentRequestEmail(args: {
  user: { id: string; email: string; name: string | null };
  request: {
    id: string;
    ibanLast4: string;
    amountTry: number;
    note: string | null;
    createdAt: Date;
  };
}): Promise<void> {
  const transporter = getTransporter();
  const { user, request } = args;

  const subject = `💰 Yeni Pro ödeme bildirimi: ${user.name || user.email}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
    <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 24px; color: white;">
      <h1 style="margin: 0; font-size: 20px;">💰 Yeni Pro Ödeme Talebi</h1>
      <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">Kullanıcı IBAN'a ödeme yaptığını bildirdi. Onaylamanızı bekliyor.</p>
    </div>

    <div style="padding: 24px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; width: 160px;">Kullanıcı adı:</td>
          <td style="padding: 8px 0; font-weight: 600;">${escapeHtml(user.name || "—")}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">E-posta:</td>
          <td style="padding: 8px 0; font-weight: 600;">${escapeHtml(user.email)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Talep ID:</td>
          <td style="padding: 8px 0; font-family: monospace; font-size: 12px;">${escapeHtml(request.id)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Bildirilen tutar:</td>
          <td style="padding: 8px 0; font-weight: 600; color: #059669;">${request.amountTry} TL</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">IBAN son 4 hane:</td>
          <td style="padding: 8px 0; font-family: monospace; font-size: 14px;">**** **** **** ${escapeHtml(request.ibanLast4)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Tarih:</td>
          <td style="padding: 8px 0;">${formatDateTR(request.createdAt)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; vertical-align: top;">Kullanıcı notu:</td>
          <td style="padding: 8px 0;">${request.note ? escapeHtml(request.note) : '<em style="color:#9ca3af;">— yok —</em>'}</td>
        </tr>
      </table>

      <div style="margin-top: 24px; padding: 16px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px;">
        <p style="margin: 0; font-size: 13px; color: #78350f;">
          <strong>⚠️ Kontrol edin:</strong> IBAN'a bu tutarın gerçekten yatıp yatmadığını banka ekranından doğrulayın.
          Kullanıcının IBAN son 4 hanesini ve ad-soyad bilgisini eşleştirin.
        </p>
      </div>

      <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
        <a href="${NEXTAUTH_URL}/admin/payments" style="display: inline-block; background: #6366f1; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
          Admin Panelini Aç →
        </a>
      </div>
    </div>

    <div style="background: #f9fafb; padding: 16px 24px; font-size: 11px; color: #6b7280; text-align: center;">
      Bu mail kullanıcının ödeme bildirimi sonrası otomatik gönderildi.
    </div>
  </div>
</body>
</html>
  `.trim();

  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: ADMIN_EMAIL,
    subject,
    html,
  });
}

// Kullanıcıya Pro onay maili
export async function sendUserPaymentApprovedEmail(args: {
  user: { email: string; name: string | null };
}): Promise<void> {
  const transporter = getTransporter();
  const { user } = args;

  const subject = "🎉 Pro üyeliğiniz aktif edildi!";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
    <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 24px; color: white;">
      <h1 style="margin: 0; font-size: 20px;">🎉 Hoş geldiniz!</h1>
      <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">Pro üyeliğiniz başarıyla aktif edildi.</p>
    </div>

    <div style="padding: 24px;">
      <p style="font-size: 15px; color: #111827; margin: 0 0 16px;">
        Merhaba ${escapeHtml(user.name || "")},
      </p>
      <p style="font-size: 14px; color: #374151; line-height: 1.6; margin: 0 0 16px;">
        Ödemeniz onaylandı ve Pro üyeliğiniz aktif edildi. Artık sınırsız özetleme, dilekçe karşılaştırma ve tüm Pro özelliklerinin keyfini çıkarabilirsiniz.
      </p>
      <p style="font-size: 14px; color: #374151; line-height: 1.6; margin: 0 0 24px;">
        Pro üyelik kapsamındaki özellikler:
      </p>
      <ul style="font-size: 14px; color: #374151; line-height: 1.8; padding-left: 20px; margin: 0 0 24px;">
        <li>Sınırsız özetleme</li>
        <li>Kısa, orta ve uzun özet seçenekleri</li>
        <li>Dilekçe karşılaştırma</li>
        <li>Özel prompt şablonları</li>
        <li>Özet geçmişi</li>
      </ul>

      <div style="text-align: center; margin: 24px 0 8px;">
        <a href="${NEXTAUTH_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
          Dashboard'a Git →
        </a>
      </div>
    </div>

    <div style="background: #f9fafb; padding: 16px 24px; font-size: 11px; color: #6b7280; text-align: center;">
      Sorularınız için <a href="mailto:destek@ozgurapp.com" style="color: #6366f1;">destek@ozgurapp.com</a> adresine yazabilirsiniz.
    </div>
  </div>
</body>
</html>
  `.trim();

  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: user.email,
    subject,
    html,
  });
}

// Kullanıcıya ödeme red maili
export async function sendUserPaymentRejectedEmail(args: {
  user: { email: string; name: string | null };
  reason: string;
}): Promise<void> {
  const transporter = getTransporter();
  const { user, reason } = args;

  const subject = "Ödeme talebiniz hakkında bilgilendirme";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
    <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 24px; color: white;">
      <h1 style="margin: 0; font-size: 20px;">Ödeme Talebi Reddedildi</h1>
      <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">Aşağıda red sebebini bulabilirsiniz.</p>
    </div>

    <div style="padding: 24px;">
      <p style="font-size: 15px; color: #111827; margin: 0 0 16px;">
        Merhaba ${escapeHtml(user.name || "")},
      </p>
      <p style="font-size: 14px; color: #374151; line-height: 1.6; margin: 0 0 16px;">
        Pro üyelik ödeme talebiniz incelendi ancak onaylanamadı.
      </p>
      <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0; font-size: 13px; color: #991b1b; font-weight: 600;">Red Sebebi:</p>
        <p style="margin: 8px 0 0; font-size: 14px; color: #7f1d1d; line-height: 1.5;">
          ${escapeHtml(reason)}
        </p>
      </div>
      <p style="font-size: 14px; color: #374151; line-height: 1.6; margin: 16px 0;">
        Sorularınız veya düzeltilmiş bir ödeme bildirimi için
        <a href="mailto:destek@ozgurapp.com" style="color: #6366f1; font-weight: 600;">destek@ozgurapp.com</a>
        adresine yazabilirsiniz.
      </p>
    </div>

    <div style="background: #f9fafb; padding: 16px 24px; font-size: 11px; color: #6b7280; text-align: center;">
      Bu mail otomatik gönderildi. Dilekçe Özeti ekibi tarafından talebiniz değerlendirilmiştir.
    </div>
  </div>
</body>
</html>
  `.trim();

  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: user.email,
    subject,
    html,
  });
}
