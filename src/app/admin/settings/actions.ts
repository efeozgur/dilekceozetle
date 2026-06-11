"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { revalidatePath } from "next/cache";
import { logAdminAction } from "../actions";

export type ActionResult = { ok: true } | { ok: false; error: string };

const defaultSettings = [
  { key: "free_monthly_limit", value: "3", category: "pricing", label: "Free Aylık Limit" },
  { key: "pro_price", value: "299", category: "pricing", label: "Pro Fiyatı (₺)" },
  { key: "enterprise_price", value: "799", category: "pricing", label: "Kurumsal Fiyatı (₺)" },
  { key: "site_name", value: "Dilekçe Özeti", category: "general", label: "Site Adı" },
  { key: "iban_owner", value: "", category: "general", label: "IBAN Sahibi" },
  { key: "iban_number", value: "", category: "general", label: "IBAN Numarası" },
];

export async function initDefaultSettings() {
  try {
    await requireAdmin();

    for (const setting of defaultSettings) {
      await prisma.systemSetting.upsert({
        where: { key: setting.key },
        update: {},
        create: setting,
      });
    }

    return { ok: true };
  } catch (error) {
    console.error("Init settings error:", error);
    return { ok: false, error: "Ayarlar başlatılamadı" };
  }
}

export async function getSettings() {
  try {
    await requireAdmin();

    let settings = await prisma.systemSetting.findMany({
      orderBy: [{ category: "asc" }, { key: "asc" }],
    });

    if (settings.length === 0) {
      await initDefaultSettings();
      settings = await prisma.systemSetting.findMany({
        orderBy: [{ category: "asc" }, { key: "asc" }],
      });
    }

    return settings;
  } catch (error) {
    console.error("Get settings error:", error);
    return [];
  }
}

export async function updateSettings(
  settings: { key: string; value: string }[]
): Promise<ActionResult> {
  try {
    await requireAdmin();

    if (!Array.isArray(settings)) {
      return { ok: false, error: "Geçersiz veri" };
    }

    for (const setting of settings) {
      if (!setting.key || typeof setting.value !== "string") continue;
      await prisma.systemSetting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: {
          key: setting.key,
          value: setting.value,
          category: "general",
          label: setting.key,
        },
      });
    }

    await logAdminAction("update_settings", undefined, `updated: ${settings.map((s) => s.key).join(", ")}`);
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch (error) {
    console.error("Update settings error:", error);
    return { ok: false, error: "Ayarlar güncellenemedi" };
  }
}
