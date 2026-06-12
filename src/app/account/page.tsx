import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Calendar, FileText, Zap, Crown, Clock, TrendingUp, Mail, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { UsageBar } from "@/components/UsageBar";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/account");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      name: true,
      subscription: true,
      proActivatedAt: true,
      proUpgradeCount: true,
      createdAt: true,
      pendingPayment: true,
      _count: {
        select: {
          summaries: true,
          paymentRequests: true,
        },
      },
    },
  });

  if (!user) redirect("/auth/login");

  const summaryStats = await prisma.summary.aggregate({
    where: { userId: session.user.id },
    _sum: {
      charCount: true,
      tokenEstimate: true,
    },
    _avg: {
      charCount: true,
      tokenEstimate: true,
    },
  });

  const recentSummaries = await prisma.summary.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      charCount: true,
      summaryCharCount: true,
      createdAt: true,
    },
  });

  const isPro = user.subscription === "pro";
  const now = new Date();
  const daysSinceRegistration = Math.floor(
    (now.getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Hesabım</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Hesap bilgilerinizi ve kullanım istatistiklerinizi görüntüleyin
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white border border-border rounded-xl p-5 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-gradient-start to-gradient-end rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-md shadow-primary/20">
            {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-foreground truncate">
                {user.name || "İsimsiz Kullanıcı"}
              </h2>
              {isPro ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-primary bg-primary/5 border border-primary/15">
                  <Crown className="h-3 w-3" />
                  PRO
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted border border-border text-muted-foreground rounded-md text-[10px] font-medium">
                  Free
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <Mail className="h-3 w-3" />
              {user.email}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-50 rounded-lg">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Üyelik</p>
              <p className="text-xs font-medium">
                {new Date(user.createdAt).toLocaleDateString("tr-TR")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 bg-emerald-50 rounded-lg">
              <Clock className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Süre</p>
              <p className="text-xs font-medium">{daysSinceRegistration} gün</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 bg-violet-50 rounded-lg">
              <FileText className="h-4 w-4 text-violet-600" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Özet</p>
              <p className="text-xs font-medium">{user._count.summaries}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 bg-amber-50 rounded-lg">
              <Zap className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Token</p>
              <p className="text-xs font-medium">
                {(summaryStats._sum.tokenEstimate || 0).toLocaleString("tr-TR")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-white border border-border rounded-xl p-5 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              {isPro && <Crown className="h-4 w-4 text-primary" />}
              Abonelik Durumu
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {isPro
                ? "Pro üyeliğiniz aktif. Tüm özelliklere erişiminiz var."
                : "Free plan kullanıyorsunuz. Pro'ya yükselterek sınırsız erişim kazanın."}
            </p>
          </div>
          {!isPro && (
            <Link
              href="/upgrade"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-gradient-to-r from-gradient-start to-gradient-end text-white rounded-lg hover:shadow-md hover:shadow-primary/20 transition-all"
            >
              <Crown className="h-3.5 w-3.5" />
              Pro&apos;ya Geç
            </Link>
          )}
        </div>

        {isPro && user.proActivatedAt && (
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-3">
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-[10px] font-medium text-muted-foreground">Aktivasyon</p>
              <p className="text-xs font-bold text-foreground mt-0.5">
                {new Date(user.proActivatedAt).toLocaleDateString("tr-TR")}
              </p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-[10px] font-medium text-muted-foreground">Yükseltme</p>
              <p className="text-xs font-bold text-foreground mt-0.5">{user.proUpgradeCount} kez</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-[10px] font-medium text-muted-foreground">Toplam Özet</p>
              <p className="text-xs font-bold text-foreground mt-0.5">{user._count.summaries}</p>
            </div>
          </div>
        )}

        {!isPro && (
          <div className="mt-4 pt-4 border-t border-border">
            <UsageBar
              used={user._count.summaries}
              total={5}
              subscription={user.subscription}
            />
          </div>
        )}

        {user.pendingPayment && !isPro && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-amber-700 text-xs">
              <Clock className="h-3.5 w-3.5" />
              <span>Bekleyen ödeme talebiniz var. Onay bekleniyor.</span>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="bg-white border border-border rounded-xl p-5 mb-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-primary" />
          Kullanım İstatistikleri
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-muted/20 rounded-lg p-3">
            <p className="text-[10px] text-muted-foreground">Toplam Karakter</p>
            <p className="text-sm font-bold mt-0.5">
              {(summaryStats._sum.charCount || 0).toLocaleString("tr-TR")}
            </p>
          </div>
          <div className="bg-muted/20 rounded-lg p-3">
            <p className="text-[10px] text-muted-foreground">Ort. Özet</p>
            <p className="text-sm font-bold mt-0.5">
              {Math.round(summaryStats._avg.charCount || 0).toLocaleString("tr-TR")}
            </p>
          </div>
          <div className="bg-muted/20 rounded-lg p-3">
            <p className="text-[10px] text-muted-foreground">Toplam Token</p>
            <p className="text-sm font-bold mt-0.5">
              {(summaryStats._sum.tokenEstimate || 0).toLocaleString("tr-TR")}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Summaries */}
      <div className="bg-white border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Son Özetler</h3>
          <Link
            href="/dashboard"
            className="text-[11px] text-primary hover:text-primary-dark font-medium inline-flex items-center gap-1"
          >
            Tümünü Gör
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="space-y-0.5">
          {recentSummaries.map((s) => (
            <Link
              key={s.id}
              href="/dashboard"
              className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-muted/40 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                  <FileText className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">
                    {s.charCount.toLocaleString("tr-TR")} karakter
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(s.createdAt).toLocaleDateString("tr-TR")}
                  </p>
                </div>
              </div>
              {s.summaryCharCount && (
                <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded">
                  {s.summaryCharCount.toLocaleString("tr-TR")} kr özet
                </span>
              )}
            </Link>
          ))}
          {recentSummaries.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-5">
              Henüz özet oluşturmadınız
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
