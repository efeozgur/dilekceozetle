import { NextResponse } from "next/server";
import { comparePetitions } from "@/lib/deepseek";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Kullanıcı girişi gereklidir. Lütfen giriş yapın veya kayıt olun." },
        { status: 401 }
      );
    }

    const { text1, text2 } = await req.json();

    if (!text1 || typeof text1 !== "string" || !text2 || typeof text2 !== "string") {
      return NextResponse.json(
        { error: "İki metin de gereklidir." },
        { status: 400 }
      );
    }

    if (text1.trim().length < 50 || text2.trim().length < 50) {
      return NextResponse.json(
        { error: "Her iki metin de en az 50 karakter olmalıdır." },
        { status: 400 }
      );
    }

    if (text1.length > 100000 || text2.length > 100000) {
      return NextResponse.json(
        { error: "Metinler çok uzun. Maksimum 100.000 karakter girebilirsiniz." },
        { status: 400 }
      );
    }

    const result = await comparePetitions(text1, text2);

    return NextResponse.json({ result });
  } catch (error: unknown) {
    console.error("Compare error:", error);

    if (!process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY === "sk-your-deepseek-api-key") {
      return NextResponse.json(
        { error: "DeepSeek API anahtarı tanımlanmamış. Lütfen .env dosyasındaki DEEPSEEK_API_KEY değerini ayarlayın." },
        { status: 500 }
      );
    }

    const message = error instanceof Error ? error.message : "Bilinmeyen hata";
    return NextResponse.json(
      { error: `Karşılaştırma sırasında bir hata oluştu: ${message}` },
      { status: 500 }
    );
  }
}
