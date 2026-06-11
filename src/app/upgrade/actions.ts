"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendAdminPaymentRequestEmail } from "@/lib/email";
import { getSystemSettings } from "@/lib/settings";

const MAX_NOTE_LENGTH = 500;

export type SubmitResult =
  | { ok: true }
  | { ok: false; error: string };

export async function submitPaymentRequest(input: {
  ibanLast4: string;
  amountTry: number;
  note: string | null;
}): Promise<SubmitResult> {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    return { ok: false, error: "Oturum bulunamadı. Lütfen tekrar giriş yapın." };
  }

  // Validation
  const ibanLast4 = String(input.ibanLast4 || "").trim();
  if (!/^\d{4}$/.test(ibanLast4)) {
    return { ok: false, error: "IBAN son 4 hane 4 rakam olmalıdır." };
  }

  const settings = await getSystemSettings();
  const proPrice = parseInt(settings.pro_price) || 299;

  const amountTry = Number(input.amountTry);
  if (!Number.isFinite(amountTry) || !Number.isInteger(amountTry)) {
    return { ok: false, error: "Tutar geçerli bir tam sayı olmalıdır." };
  }
  if (amountTry < proPrice) {
    return {
      ok: false,
      error: `Tutar en az ${proPrice} TL olmalıdır.`,
    };
  }

  let note: string | null = null;
  if (input.note) {
    const trimmed = String(input.note).trim();
    if (trimmed.length > MAX_NOTE_LENGTH) {
      return {
        ok: false,
        error: `Not en fazla ${MAX_NOTE_LENGTH} karakter olabilir.`,
      };
    }
    note = trimmed.length > 0 ? trimmed : null;
  }

  // Mükerrer engeli: aynı kullanıcının PENDING talebi varsa no-op
  const existing = await prisma.paymentRequest.findFirst({
    where: { userId: session.user.id, status: "PENDING" },
  });
  if (existing) {
    return {
      ok: false,
      error: "Bekleyen bir ödeme talebiniz zaten var. Onay geldikten sonra tekrar deneyin.",
    };
  }

  // Pro zaten aktifse uyar (admin onaylı kayıt zaten DB'de)
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { subscription: true, pendingPayment: true, email: true },
  });
  if (!currentUser) {
    // Session var ama User DB'de yok — genelde olmaz ama logla
    console.error(
      `[submitPaymentRequest] Session var ama User DB'de yok: sessionUserId=${session.user.id} sessionUserEmail=${session.user.email}`
    );
    return {
      ok: false,
      error: "Hesabınız doğrulanamadı. Lütfen tekrar giriş yapın.",
    };
  }
  if (currentUser.subscription === "pro") {
    return {
      ok: false,
      error: "Zaten Pro üyesiniz. Yeni bir talep gerekmiyor.",
    };
  }

  // Talep oluştur
  const request = await prisma.paymentRequest.create({
    data: {
      userId: session.user.id,
      plan: "pro",
      ibanLast4,
      amountTry,
      note,
      status: "PENDING",
    },
  });

  // User.pendingPayment flag'ı da güncelle (dashboard banner'ı için)
  await prisma.user.update({
    where: { id: session.user.id },
    data: { pendingPayment: true },
  });

  // Admin'e mail — hata olursa talep yine de DB'de, admin paneli kurtarır
  try {
    await sendAdminPaymentRequestEmail({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name ?? null,
      },
      request: {
        id: request.id,
        ibanLast4: request.ibanLast4,
        amountTry: request.amountTry,
        note: request.note,
        createdAt: request.createdAt,
      },
    });
  } catch (err) {
    console.error("[submitPaymentRequest] Admin notification email failed:", err);
  }

  revalidatePath("/upgrade");
  revalidatePath("/dashboard");
  return { ok: true };
}
