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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Hesabım</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Hesap bilgilerinizi ve kullanım istatistiklerinizi görüntüleyin
        </p>
      </div>

      {/* Kullanıcı Bilgileri */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm mb-6 hover:shadow-md transition-all duration-300">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-gradient-start via-primary to-gradient-end rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary/30 animate-pulse transition-all duration-700">
              {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {user.name || "İsimsiz Kullanıcı"}
              </h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {user.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isPro ? (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border"
                style={{
                  background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)",
                  borderColor: "rgba(245, 158, 11, 0.4)",
                  color: "#92400e",
                  animation: "pro-badge-pulse 2s ease-in-out infinite",
                }}
              >
                <Crown className="h-3.5 w-3.5" />
                PRO
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted border border-border text-muted-foreground rounded-full text-xs font-semibold">
                Free Üye
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all duration-200">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-xl">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Üyelik Tarihi</p>
              <p className="text-sm font-medium">
                {new Date(user.createdAt).toLocaleDateString("tr-TR")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all duration-200">
            <div className="flex items-center justify-center w-10 h-10 bg-emerald-50 rounded-xl">
              <Clock className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Gün Sayısı</p>
              <p className="text-sm font-medium">{daysSinceRegistration} gün</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all duration-200">
            <div className="flex items-center justify-center w-10 h-10 bg-violet-50 rounded-xl">
              <FileText className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Toplam Özet</p>
              <p className="text-sm font-medium">{user._count.summaries}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all duration-200">
            <div className="flex items-center justify-center w-10 h-10 bg-amber-50 rounded-xl">
              <Zap className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Token Kullanımı</p>
              <p className="text-sm font-medium">
                {(summaryStats._sum.tokenEstimate || 0).toLocaleString("tr-TR")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Abonelik Durumu - Premium Card */}
      <div
        className={`border rounded-2xl p-6 shadow-sm mb-6 transition-all duration-500 hover:shadow-md relative overflow-hidden ${
          isPro
            ? "border-amber-200/60"
            : "bg-white border-border"
        }`}
      >
        {isPro && (
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 25%, #fde68a 50%, #fef3c7 75%, #fffbeb 100%)",
              backgroundSize: "200% 200%",
              animation: "pro-gradient-flow 6s ease-in-out infinite",
            }}
          />
        )}

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                {isPro ? (
                  <Crown className="h-5 w-5 text-amber-600" style={{ animation: "pro-crown-glow 2s ease-in-out infinite" }} />
                ) : null}
                Abonelik Durumu
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {isPro
                  ? "Pro üyeliğiniz aktif. Tüm özelliklere erişiminiz var."
                  : "Free plan kullanıyorsunuz. Pro'ya yükselterek sınırsız erişim kazanın."}
              </p>
            </div>
            {!isPro && (
              <Link
                href="/upgrade"
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-gradient-start to-gradient-end text-white rounded-xl hover:opacity-90 transition-all shadow-sm shadow-primary/25"
              >
                <Crown className="h-4 w-4" />
                Pro&apos;ya Yükselt
              </Link>
            )}
          </div>

          {isPro && user.proActivatedAt && (
            <div className="mt-5 pt-5 border-t border-amber-200/50 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3.5 border border-amber-100/50">
                <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide">Son Aktivasyon</p>
                <p className="text-sm font-bold text-amber-900 mt-1">
                  {new Date(user.proActivatedAt).toLocaleDateString("tr-TR")}
                </p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3.5 border border-amber-100/50">
                <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide">Yükseltme</p>
                <p className="text-sm font-bold text-amber-900 mt-1">{user.proUpgradeCount} kez</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3.5 border border-amber-100/50">
                <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide">Toplam Özet</p>
                <p className="text-sm font-bold text-amber-900 mt-1">{user._count.summaries}</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3.5 border border-amber-100/50">
                <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide">Üyelik Süresi</p>
                <p className="text-sm font-bold text-amber-900 mt-1">{daysSinceRegistration} gün</p>
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
              <div className="flex items-center gap-2 text-amber-700 text-sm">
                <Clock className="h-4 w-4" />
                <span>Bekleyen ödeme talebiniz var. Onay bekleniyor.</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* İstatistikler */}
      <div className={`border rounded-2xl p-6 shadow-sm mb-6 hover:shadow-md transition-all duration-300 ${
        isPro ? "bg-white border-amber-200/40" : "bg-white border-border"
      }`}>
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
          <TrendingUp className={`h-5 w-5 ${isPro ? "text-amber-600" : "text-primary"}`} />
          Kullanım İstatistikleri
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className={`rounded-xl p-4 hover:shadow-sm hover:scale-[1.02] transition-all duration-200 cursor-default ${
            isPro
              ? "bg-amber-50/50 border border-amber-100/50"
              : "bg-muted/30 hover:bg-muted/60"
          }`}>
            <p className="text-xs text-muted-foreground">Toplam Karakter</p>
            <p className={`text-lg font-bold mt-1 ${isPro ? "text-amber-900" : "text-foreground"}`}>
              {(summaryStats._sum.charCount || 0).toLocaleString("tr-TR")}
            </p>
          </div>
          <div className={`rounded-xl p-4 hover:shadow-sm hover:scale-[1.02] transition-all duration-200 cursor-default ${
            isPro
              ? "bg-amber-50/50 border border-amber-100/50"
              : "bg-muted/30 hover:bg-muted/60"
          }`}>
            <p className="text-xs text-muted-foreground">Ortalama Özet Uzunluğu</p>
            <p className={`text-lg font-bold mt-1 ${isPro ? "text-amber-900" : "text-foreground"}`}>
              {Math.round(summaryStats._avg.charCount || 0).toLocaleString("tr-TR")}
            </p>
          </div>
          <div className={`rounded-xl p-4 hover:shadow-sm hover:scale-[1.02] transition-all duration-200 cursor-default ${
            isPro
              ? "bg-amber-50/50 border border-amber-100/50"
              : "bg-muted/30 hover:bg-muted/60"
          }`}>
            <p className="text-xs text-muted-foreground">Toplam Token</p>
            <p className={`text-lg font-bold mt-1 ${isPro ? "text-amber-900" : "text-foreground"}`}>
              {(summaryStats._sum.tokenEstimate || 0).toLocaleString("tr-TR")}
            </p>
          </div>
        </div>
      </div>

      {/* Son Özetler */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Son Özetler</h3>
          <Link
            href="/dashboard"
            className="text-sm text-primary hover:text-primary-dark font-medium inline-flex items-center gap-1"
          >
            Tümünü Gör
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="space-y-1">
          {recentSummaries.map((s) => (
            <Link
              key={s.id}
              href="/dashboard"
              className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-muted/50 transition-all duration-200 group -mx-3"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center group-hover:bg-primary/5 group-hover:text-primary transition-all duration-200">
                  <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-all duration-200" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-all duration-200">
                    {s.charCount.toLocaleString("tr-TR")} karakter
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(s.createdAt).toLocaleDateString("tr-TR")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {s.summaryCharCount && (
                  <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full group-hover:bg-emerald-100 transition-all duration-200">
                    {s.summaryCharCount.toLocaleString("tr-TR")} karakter özet
                  </span>
                )}
                <ArrowUpRight className="h-4 w-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-all duration-200" />
              </div>
            </Link>
          ))}
          {recentSummaries.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              Henüz özet oluşturmadınız
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
