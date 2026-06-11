"use server";

import { prisma } from "@/lib/prisma";

export async function logAdminAction(
  action: string,
  targetId?: string,
  details?: string
) {
  try {
    await prisma.adminLog.create({
      data: {
        action,
        targetId: targetId || null,
        details: details || null,
      },
    });
  } catch (error) {
    console.error("Failed to log admin action:", error);
  }
}
