"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { revalidatePath } from "next/cache";
import { logAdminAction } from "../actions";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function deleteSummary(summaryId: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    if (!summaryId || typeof summaryId !== "string") {
      return { ok: false, error: "Geçersiz özet ID" };
    }

    const summary = await prisma.summary.findUnique({ where: { id: summaryId } });
    if (!summary) return { ok: false, error: "Özet bulunamadı" };

    await prisma.summary.delete({ where: { id: summaryId } });

    await logAdminAction("delete_summary", summaryId, `userId: ${summary.userId}`);
    revalidatePath("/admin/summaries");
    return { ok: true };
  } catch (error) {
    console.error("Delete summary error:", error);
    return { ok: false, error: "İşlem başarısız" };
  }
}
