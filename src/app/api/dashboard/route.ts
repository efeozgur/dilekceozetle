import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Oturum bulunamadi." }, { status: 401 });
  }

  const [summaries, user, totalSummaries] = await Promise.all([
    prisma.summary.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        originalText: true,
        resultText: true,
        charCount: true,
        summaryCharCount: true,
        wordCount: true,
        summaryWordCount: true,
        sentenceCount: true,
        summarySentenceCount: true,
        readingTime: true,
        summaryReadingTime: true,
        tokenEstimate: true,
        createdAt: true,
      },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscription: true },
    }),
    prisma.summary.count({
      where: { userId: session.user.id },
    }),
  ]);

  return NextResponse.json({
    summaries,
    totalSummaries,
    subscription: user?.subscription ?? "free",
  });
}
