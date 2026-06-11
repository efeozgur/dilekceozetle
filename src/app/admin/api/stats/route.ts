import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import type { PrismaClient } from "@/generated/prisma/client";

export async function GET() {
  try {
    await requireAdmin();

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      proUsers,
      totalSummaries,
      pendingPayments,
      recentUsers,
      recentPayments,
      dailySummaries,
      dailyUsers,
      monthlyRevenue,
      totalTokens,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { subscription: "pro" } }),
      prisma.summary.count(),
      prisma.paymentRequest.count({ where: { status: "PENDING" } }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, email: true, name: true, subscription: true, createdAt: true },
      }),
      prisma.paymentRequest.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { user: { select: { email: true } } },
      }),
      getDailyCount(prisma, sevenDaysAgo, "summary"),
      getDailyCount(prisma, sevenDaysAgo, "user"),
      getMonthlyRevenue(prisma, sixMonthsAgo(now)),
      getTotalTokens(prisma, sevenDaysAgo),
    ]);

    const usersGrowth = await getGrowthPercentage(prisma, thirtyDaysAgo, "user");
    const summariesGrowth = await getGrowthPercentage(prisma, thirtyDaysAgo, "summary");

    return NextResponse.json({
      stats: {
        totalUsers,
        proUsers,
        totalSummaries,
        pendingPayments,
        usersGrowth,
        summariesGrowth,
      },
      recent: {
        users: recentUsers,
        payments: recentPayments.map((p) => ({
          id: p.id,
          amount: p.amountTry,
          status: p.status,
          email: p.user.email,
          createdAt: p.createdAt,
        })),
      },
      charts: {
        dailySummaries,
        dailyUsers,
        monthlyRevenue,
        totalTokens,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

function sixMonthsAgo(now: Date): Date[] {
  const months: Date[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d);
  }
  return months;
}

async function getDailyCount(
  db: PrismaClient,
  since: Date,
  type: "summary" | "user"
) {
  const results: { date: string; count: number }[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    const where = { createdAt: { gte: dayStart, lt: dayEnd } };
    const count =
      type === "summary"
        ? await db.summary.count({ where })
        : await db.user.count({ where });

    results.push({
      date: dayStart.toISOString().split("T")[0],
      count,
    });
  }
  return results;
}

async function getMonthlyRevenue(db: PrismaClient, months: Date[]) {
  const results: { month: string; revenue: number }[] = [];

  for (const monthStart of months) {
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
    const where = {
      status: "APPROVED",
      reviewedAt: { gte: monthStart, lt: monthEnd },
    };
    const result = await db.paymentRequest.aggregate({
      where,
      _sum: { amountTry: true },
    });

    results.push({
      month: `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, "0")}`,
      revenue: result._sum.amountTry || 0,
    });
  }
  return results;
}

async function getTotalTokens(db: PrismaClient, since: Date) {
  const result = await db.summary.aggregate({
    where: { createdAt: { gte: since } },
    _sum: { tokenEstimate: true },
  });
  return result._sum.tokenEstimate || 0;
}

async function getGrowthPercentage(
  db: PrismaClient,
  since: Date,
  type: "user" | "summary"
) {
  const now = new Date();
  const mid = new Date(since.getTime() + (now.getTime() - since.getTime()) / 2);

  const countRecent =
    type === "user"
      ? await db.user.count({ where: { createdAt: { gte: mid } } })
      : await db.summary.count({ where: { createdAt: { gte: mid } } });
  const countOld =
    type === "user"
      ? await db.user.count({
          where: { createdAt: { gte: since, lt: mid } },
        })
      : await db.summary.count({
          where: { createdAt: { gte: since, lt: mid } },
        });

  if (countOld === 0) return countRecent > 0 ? 100 : 0;
  return Math.round(((countRecent - countOld) / countOld) * 100);
}
