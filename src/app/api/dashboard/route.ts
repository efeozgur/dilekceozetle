import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Oturum bulunamadi." }, { status: 401 });
  }

  const summaries = await prisma.summary.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
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
  });

  return NextResponse.json({ summaries });
}
