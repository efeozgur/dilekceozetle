"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { revalidatePath } from "next/cache";
import { logAdminAction } from "../actions";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function updateUserSubscription(
  userId: string,
  subscription: string
): Promise<ActionResult> {
  try {
    await requireAdmin();

    if (!userId || typeof userId !== "string") {
      return { ok: false, error: "Geçersiz kullanıcı ID" };
    }
    if (!["free", "pro"].includes(subscription)) {
      return { ok: false, error: "Geçersiz abonelik türü" };
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { ok: false, error: "Kullanıcı bulunamadı" };

    await prisma.user.update({
      where: { id: userId },
      data: {
        subscription,
        ...(subscription === "pro" ? { proActivatedAt: new Date() } : {}),
      },
    });

    await logAdminAction("update_user_subscription", userId, `subscription: ${subscription}`);
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    return { ok: true };
  } catch (error) {
    console.error("Update user subscription error:", error);
    return { ok: false, error: "İşlem başarısız" };
  }
}

export async function banUser(userId: string, reason: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    if (!userId || typeof userId !== "string") {
      return { ok: false, error: "Geçersiz kullanıcı ID" };
    }
    if (!reason || reason.trim().length < 5) {
      return { ok: false, error: "Yasaklama nedeni en az 5 karakter olmalı" };
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { ok: false, error: "Kullanıcı bulunamadı" };
    if (user.bannedAt) return { ok: false, error: "Kullanıcı zaten yasaklı" };

    await prisma.user.update({
      where: { id: userId },
      data: {
        bannedAt: new Date(),
        banReason: reason.trim(),
      },
    });

    await logAdminAction("ban_user", userId, `reason: ${reason.trim()}`);
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    return { ok: true };
  } catch (error) {
    console.error("Ban user error:", error);
    return { ok: false, error: "İşlem başarısız" };
  }
}

export async function unbanUser(userId: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    if (!userId || typeof userId !== "string") {
      return { ok: false, error: "Geçersiz kullanıcı ID" };
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { ok: false, error: "Kullanıcı bulunamadı" };
    if (!user.bannedAt) return { ok: false, error: "Kullanıcı zaten aktif" };

    await prisma.user.update({
      where: { id: userId },
      data: {
        bannedAt: null,
        banReason: null,
      },
    });

    await logAdminAction("unban_user", userId);
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    return { ok: true };
  } catch (error) {
    console.error("Unban user error:", error);
    return { ok: false, error: "İşlem başarısız" };
  }
}

export async function deleteUser(userId: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    if (!userId || typeof userId !== "string") {
      return { ok: false, error: "Geçersiz kullanıcı ID" };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { _count: { select: { summaries: true, paymentRequests: true } } },
    });
    if (!user) return { ok: false, error: "Kullanıcı bulunamadı" };

    await prisma.user.delete({ where: { id: userId } });

    await logAdminAction("delete_user", userId, `deleted: ${user.email}, summaries: ${user._count.summaries}, payments: ${user._count.paymentRequests}`);
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (error) {
    console.error("Delete user error:", error);
    return { ok: false, error: "İşlem başarısız" };
  }
}
