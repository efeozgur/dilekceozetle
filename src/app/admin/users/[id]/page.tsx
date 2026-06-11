import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-guard";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { MobileAdminNav } from "@/components/admin/MobileAdminNav";
import { UserActions } from "./UserActions";
import { ArrowLeft, Mail, Calendar, FileText, CreditCard } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await isAdmin();
  if (!admin) redirect("/dashboard?error=forbidden");

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      summaries: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          charCount: true,
          summaryCharCount: true,
          tokenEstimate: true,
          createdAt: true,
        },
      },
      paymentRequests: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          plan: true,
          amountTry: true,
          status: true,
          createdAt: true,
        },
      },
      _count: { select: { summaries: true, paymentRequests: true } },
    },
  });

  if (!user) notFound();

  const totalTokens = user.summaries.reduce((acc, s) => acc + (s.tokenEstimate || 0), 0);

  return (
    <div className="space-y-6">
      <MobileAdminNav />

      <div className="flex items-center gap-4">
        <Link
          href="/admin/users"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kullanıcılara Dön
        </Link>
      </div>

      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{user.email}</h1>
            {user.name && (
              <p className="text-muted-foreground mt-1">{user.name}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge
              label={user.subscription === "pro" ? "Pro" : "Free"}
              variant={user.subscription === "pro" ? "info" : "default"}
            />
            {user.bannedAt && (
              <StatusBadge label="Yasaklı" variant="danger" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg">
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Kayıt Tarihi</p>
              <p className="text-sm font-medium">
                {new Date(user.createdAt).toLocaleDateString("tr-TR")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Toplam Özet</p>
              <p className="text-sm font-medium">{user._count.summaries}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ödeme Sayısı</p>
              <p className="text-sm font-medium">{user._count.paymentRequests}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg">
              <Mail className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Token Kullanımı</p>
              <p className="text-sm font-medium">{totalTokens.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <UserActions
            userId={user.id}
            currentSubscription={user.subscription}
            isBanned={!!user.bannedAt}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">Son Özetler</h2>
          <div className="space-y-3">
            {user.summaries.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(s.createdAt).toLocaleDateString("tr-TR")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {s.charCount} karakter → {s.summaryCharCount || "?"} karakter
                  </p>
                </div>
                <Link
                  href={`/admin/summaries/${s.id}`}
                  className="text-primary hover:text-primary-dark text-xs font-medium"
                >
                  Görüntüle
                </Link>
              </div>
            ))}
            {user.summaries.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Henüz özet yok</p>
            )}
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">Son Ödemeler</h2>
          <div className="space-y-3">
            {user.paymentRequests.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(p.createdAt).toLocaleDateString("tr-TR")}
                  </p>
                  <p className="font-medium">₺{p.amountTry} - {p.plan}</p>
                </div>
                <StatusBadge
                  label={p.status === "APPROVED" ? "Onaylandı" : p.status === "REJECTED" ? "Reddedildi" : "Bekliyor"}
                  variant={p.status === "APPROVED" ? "success" : p.status === "REJECTED" ? "danger" : "warning"}
                />
              </div>
            ))}
            {user.paymentRequests.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Henüz ödeme yok</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
