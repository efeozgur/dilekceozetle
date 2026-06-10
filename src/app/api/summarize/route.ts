import { NextResponse } from "next/server";
import { summarizePetition, estimateTokens } from "@/lib/deepseek";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { SummaryLength } from "@/lib/prompts";

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function countSentences(text: string): number {
  return text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
}

function estimateReadingTime(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 200));
}

export async function POST(req: Request) {
  try {
    const { text, length = "medium" } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Dilekçe metni gereklidir." },
        { status: 400 }
      );
    }

    if (text.trim().length < 50) {
      return NextResponse.json(
        { error: "Metin çok kısa. En az 50 karakter giriniz." },
        { status: 400 }
      );
    }

    if (text.length > 100000) {
      return NextResponse.json(
        { error: "Metin çok uzun. Maksimum 100.000 karakter girebilirsiniz." },
        { status: 400 }
      );
    }

    if (!["short", "medium", "long"].includes(length)) {
      return NextResponse.json(
        { error: "Geçersiz uzunluk seçimi." },
        { status: 400 }
      );
    }

    // Check subscription and usage limits
    const session = await auth();
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { subscription: true },
      });

      if (user) {
        // Free users: only medium length allowed
        if (user.subscription === "free" && length !== "medium") {
          return NextResponse.json(
            { error: "Ücretsiz planlarda sadece 'Orta' uzunluk kullanılabilir. Kısa ve uzun özetler için Pro plana yükseltin." },
            { status: 403 }
          );
        }

        // Free users: max 3 summaries per month
        if (user.subscription === "free") {
          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const monthlyCount = await prisma.summary.count({
            where: {
              userId: session.user.id,
              createdAt: { gte: startOfMonth },
            },
          });

          if (monthlyCount >= 3) {
            return NextResponse.json(
              { error: "Bu ayki ücretsiz özet hakkınız (3) dolmuştur. Pro plana yükselterek sınırsız özet oluşturabilirsiniz." },
              { status: 403 }
            );
          }
        }
      }
    }

    const summary = await summarizePetition(text, length as SummaryLength);

    const originalWordCount = countWords(text);
    const summaryWordCount = countWords(summary);
    const originalSentenceCount = countSentences(text);
    const summarySentenceCount = countSentences(summary);
    const tokenEstimate = estimateTokens(text);
    const readingTime = estimateReadingTime(originalWordCount);
    const summaryReadingTime = estimateReadingTime(summaryWordCount);

    // Save to database if user is logged in
    if (session?.user?.id) {
      await prisma.summary.create({
        data: {
          userId: session.user.id,
          originalText: text,
          resultText: summary,
          charCount: text.length,
          summaryCharCount: summary.length,
          wordCount: originalWordCount,
          summaryWordCount,
          sentenceCount: originalSentenceCount,
          summarySentenceCount,
          readingTime,
          summaryReadingTime,
          tokenEstimate,
        },
      });
    }

    return NextResponse.json({
      summary,
      charCount: text.length,
      summaryCharCount: summary.length,
      tokenEstimate,
      wordCount: originalWordCount,
      summaryWordCount,
      sentenceCount: originalSentenceCount,
      summarySentenceCount,
      readingTime,
      summaryReadingTime,
    });
  } catch (error: unknown) {
    console.error("Summarize error:", error);

    if (!process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY === "sk-your-deepseek-api-key") {
      return NextResponse.json(
        { error: "DeepSeek API anahtarı tanımlanmamış. Lütfen .env dosyasındaki DEEPSEEK_API_KEY değerini ayarlayın." },
        { status: 500 }
      );
    }

    const message = error instanceof Error ? error.message : "Bilinmeyen hata";
    return NextResponse.json(
      { error: `Özetleme sırasında bir hata oluştu: ${message}` },
      { status: 500 }
    );
  }
}
