import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-guard";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { MobileAdminNav } from "@/components/admin/MobileAdminNav";
import { SummaryActions } from "./SummaryActions";
import { ArrowLeft, FileText, Hash, Clock, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSummaryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await isAdmin();
  if (!admin) redirect("/dashboard?error=forbidden");

  const { id } = await params;

  const summary = await prisma.summary.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, name: true } },
    },
  });

  if (!summary) notFound();

  return (
    <div className="space-y-6">
      <MobileAdminNav />

      <div className="flex items-center gap-4">
        <Link
          href="/admin/summaries"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Özetlere Dön
        </Link>
      </div>

      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Özet Detayı</h1>
            <p className="text-sm text-muted-foreground mt-1">
              <Link
                href={`/admin/users/${summary.user.id}`}
                className="text-primary hover:text-primary-dark"
              >
                {summary.user.email}
              </Link>
              {" "} - {new Date(summary.createdAt).toLocaleDateString("tr-TR")}
            </p>
          </div>
          <SummaryActions summaryId={summary.id} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg">
              <Hash className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Orijinal</p>
              <p className="text-sm font-medium">{summary.charCount} karakter</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Özet</p>
              <p className="text-sm font-medium">{summary.summaryCharCount || "-"} karakter</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Okuma Süresi</p>
              <p className="text-sm font-medium">{summary.readingTime || "-"} dk</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg">
              <Zap className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Token</p>
              <p className="text-sm font-medium">{summary.tokenEstimate || "-"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">Orijinal Metin</h2>
          <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
            {summary.originalText}
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">Özet</h2>
          <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
            {summary.resultText}
          </div>
        </div>
      </div>
    </div>
  );
}
