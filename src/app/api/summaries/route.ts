import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Oturum bulunamadi." }, { status: 401 });
  }

  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "ID gereklidir." }, { status: 400 });
  }

  // Make sure the summary belongs to the user
  const summary = await prisma.summary.findUnique({ where: { id } });

  if (!summary || summary.userId !== session.user.id) {
    return NextResponse.json({ error: "Ozet bulunamadi." }, { status: 404 });
  }

  await prisma.summary.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
