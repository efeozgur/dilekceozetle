import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSystemSettings } from "@/lib/settings";
import { PricingClient } from "./PricingClient";

export default async function PricingPage() {
  const session = await auth();
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscription: true },
    });
    if (user?.subscription === "pro") {
      redirect("/account");
    }
  }

  const settings = await getSystemSettings();

  return (
    <PricingClient
      proPrice={settings.pro_price}
      enterprisePrice={settings.enterprise_price}
    />
  );
}
