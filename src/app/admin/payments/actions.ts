"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, AdminAuthError } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import {
  sendUserPaymentApprovedEmail,
  sendUserPaymentRejectedEmail,
} from "@/lib/email";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function approvePayment(requestId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AdminAuthError) {
      return { ok: false, error: "Yetkiniz yok." };
    }
    return { ok: false, error: "Beklenmeyen bir hata oluştu." };
  }

  if (!requestId || typeof requestId !== "string") {
    return { ok: false, error: "Geçersiz talep." };
  }

  const req = await prisma.paymentRequest.findUnique({
    where: { id: requestId },
    include: { user: true },
  });

  if (!req) {
    return { ok: false, error: "Talep bulunamadı." };
  }

  // Defensive: user relation DB'de olmalı (FK onDelete: Cascade zaten
  // user silinirse talebi de siler, ama orphan kalma ihtimaline karşı).
  if (!req.user) {
    console.error(
      `[approvePayment] PaymentRequest var ama user relation yok: requestId=${requestId}`
    );
    return { ok: false, error: "Kullanıcı kaydı bulunamadı." };
  }

  // Idempotent: zaten işlenmişse no-op
  if (req.status !== "PENDING") {
    return { ok: true };
  }

  const now = new Date();

  // Transaction: request update + user update atomik
  await prisma.$transaction([
    prisma.paymentRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED", reviewedAt: now },
    }),
    prisma.user.update({
      where: { id: req.userId },
      data: {
        subscription: "pro",
        pendingPayment: false,
        proActivatedAt: now,
        proUpgradeCount: { increment: 1 },
      },
    }),
  ]);

  // Kullanıcıya approval maili
  try {
    await sendUserPaymentApprovedEmail({
      user: { email: req.user.email, name: req.user.name },
    });
  } catch (err) {
    console.error("[approvePayment] User email failed:", err);
  }

  revalidatePath("/admin/payments");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function rejectPayment(
  requestId: string,
  reason: string
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AdminAuthError) {
      return { ok: false, error: "Yetkiniz yok." };
    }
    return { ok: false, error: "Beklenmeyen bir hata oluştu." };
  }

  if (!requestId || typeof requestId !== "string") {
    return { ok: false, error: "Geçersiz talep." };
  }

  const trimmedReason = String(reason || "").trim();
  if (trimmedReason.length < 5) {
    return { ok: false, error: "Red nedeni en az 5 karakter olmalıdır." };
  }
  if (trimmedReason.length > 500) {
    return { ok: false, error: "Red nedeni en fazla 500 karakter olabilir." };
  }

  const req = await prisma.paymentRequest.findUnique({
    where: { id: requestId },
    include: { user: true },
  });

  if (!req) {
    return { ok: false, error: "Talep bulunamadı." };
  }

  if (req.status !== "PENDING") {
    return { ok: true };
  }

  const now = new Date();

  await prisma.paymentRequest.update({
    where: { id: requestId },
    data: {
      status: "REJECTED",
      reviewedAt: now,
      rejectReason: trimmedReason,
    },
  });

  // Kullanıcının başka PENDING talebi yoksa pendingPayment flag'ı kapat
  const otherPending = await prisma.paymentRequest.count({
    where: { userId: req.userId, status: "PENDING" },
  });
  if (otherPending === 0) {
    await prisma.user.update({
      where: { id: req.userId },
      data: { pendingPayment: false },
    });
  }

  // Kullanıcıya rejection maili
  try {
    await sendUserPaymentRejectedEmail({
      user: { email: req.user.email, name: req.user.name },
      reason: trimmedReason,
    });
  } catch (err) {
    console.error("[rejectPayment] User email failed:", err);
  }

  revalidatePath("/admin/payments");
  revalidatePath("/dashboard");
  return { ok: true };
}
