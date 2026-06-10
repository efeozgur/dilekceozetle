import { NextResponse } from "next/server";
import { Shopier } from "@nopeion/shopier";
import { prisma } from "@/lib/prisma";

const shopier = new Shopier({
  apiKey: process.env.SHOPIER_API_KEY!,
  apiSecret: process.env.SHOPIER_API_SECRET!,
});

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const params = new URLSearchParams(body);
    const data: Record<string, string> = {};
    params.forEach((value, key) => {
      data[key] = value;
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = shopier.verifyCallback(data as any);

    if (result.success) {
      const order = await prisma.summary.findUnique({
        where: { id: result.orderId },
      });

      // Prefer the original order relation; the callback email is not always reliable.
      if (order) {
        await prisma.user.update({
          where: { id: order.userId },
          data: { subscription: "pro" },
        });
      } else {
        // Fallback for older/partial flows that may not have the pending order row.
        const userEmail = data["customer_email"] || data["buyer_email"];
        if (userEmail) {
          await prisma.user.updateMany({
            where: { email: userEmail },
            data: { subscription: "pro" },
          });
        }
      }
    }

    // Shopier expects a specific response
    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Shopier callback error:", error);
    return new NextResponse("OK", { status: 200 });
  }
}

export async function GET() {
  return NextResponse.redirect(new URL("/dashboard?payment=success", process.env.NEXTAUTH_URL || "http://localhost:3000"));
}
