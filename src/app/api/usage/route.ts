import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ totalSummaries: 0, subscription: "free" });
  }

  const [user, totalSummaries] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscription: true },
    }),
    prisma.summary.count({
      where: { userId: session.user.id },
    }),
  ]);

  return NextResponse.json({
    totalSummaries,
    subscription: user?.subscription ?? "free",
  });
}
