import { NextResponse } from "next/server";
import { Shopier, Currency, ProductType } from "@nopeion/shopier";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const shopier = new Shopier({
  apiKey: process.env.SHOPIER_API_KEY!,
  apiSecret: process.env.SHOPIER_API_SECRET!,
});

export async function POST() {
  const session = await auth();

  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: "Oturum bulunamadi." }, { status: 401 });
  }

  // Create a pending order to use as platform_order_id
  const order = await prisma.summary.create({
    data: {
      userId: session.user.id,
      originalText: "Pro uyelik odemesi",
      resultText: "Pro uyelik",
      charCount: 0,
    },
  });

  const nameParts = (session.user.name || "Kullanici").split(" ");
  const firstName = nameParts[0] || "Kullanici";
  const lastName = nameParts.slice(1).join(" ") || "Kullanici";

  try {
    const result = shopier.createPayment({
      amount: 299,
      currency: Currency.TL,
      maxInstallment: 0,
      buyer: {
        id: session.user.id,
        platformOrderId: order.id,
        productName: "Dilekce Ozeti Pro - 1 Ay",
        productType: ProductType.DOWNLOADABLE_VIRTUAL,
        firstName,
        lastName,
        email: session.user.email,
        phone: "5300000000",
      },
    });

    return NextResponse.json({
      actionUrl: result.actionUrl,
      hiddenInputs: result.hiddenInputs,
    });
  } catch (error) {
    console.error("Shopier checkout error:", error);
    return NextResponse.json(
      { error: "Odeme olusturulamadi." },
      { status: 500 }
    );
  }
}
