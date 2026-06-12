"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Scale,
  Home,
  GitCompare,
  History,
  User,
  LogOut,
  Shield,
  Crown,
  Sparkles,
  Zap,
  FileText,
  TrendingUp,
} from "lucide-react";
import { useState, useEffect } from "react";

interface UsageStats {
  totalSummaries: number;
  subscription: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<UsageStats | null>(null);

  const isAdminRoute = pathname.startsWith("/admin");
  const isAuthRoute = pathname.startsWith("/auth");

  useEffect(() => {
    if (session) {
      fetch("/api/usage")
        .then((res) => res.ok ? res.json() : null)
        .then((data) => data && setStats(data))
        .catch(() => {});
    }
  }, [session]);

  if (isAdminRoute || isAuthRoute || status === "loading") {
    return null;
  }

  const isPro = session?.user?.subscription === "pro" || stats?.subscription === "pro";
  const isAdmin = session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isLoggedIn = !!session;
  const userInitial =
    session?.user?.name?.charAt(0) ||
    session?.user?.email?.charAt(0) ||
    "?";

  if (!isLoggedIn) {
    return null;
  }

  const navItems = [
    { href: "/", label: "Ana Sayfa", icon: Home, description: "Özetleme" },
    { href: "/compare", label: "Karşılaştır", icon: GitCompare, description: "2 dilekçe" },
    { href: "/dashboard", label: "Geçmişim", icon: History, description: "Özetlerim" },
    { href: "/account", label: "Hesabım", icon: User, description: "Profil" },
  ];

  if (isAdmin) {
    navItems.push({ href: "/admin", label: "Admin Panel", icon: Shield, description: "Yönetim" });
  }

  if (!isPro && !isAdmin) {
    navItems.push({ href: "/pricing", label: "Pro'ya Geç", icon: Sparkles, description: "Sınırsız" });
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const totalSummaries = stats?.totalSummaries ?? 0;

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[280px] bg-white border-r border-border flex-col z-40">
      {/* Branding Header */}
      <div className="px-5 py-5 border-b border-border">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-gradient-start to-gradient-end rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
            <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-gradient-start to-gradient-end rounded-xl shadow-lg shadow-primary/20">
              <Scale className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-foreground text-base leading-tight">
              Dilekçe Özeti
            </span>
            <span className="text-[11px] text-muted-foreground leading-tight flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary" />
              AI Destekli Özetleme
            </span>
          </div>
        </Link>
      </div>

      {/* Quick Stats Card */}
      <div className="px-4 py-4">
        <div className={`rounded-xl p-4 ${
          isPro 
            ? "bg-gradient-to-br from-primary/5 via-violet-50 to-primary/5 border border-primary/15" 
            : "bg-muted/50 border border-border"
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground">Bugünkü Kullanım</span>
            {isPro && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                <Crown className="h-2.5 w-2.5" />
                PRO
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-bold text-foreground">{totalSummaries}</span>
            <span className="text-xs text-muted-foreground">
              {isPro ? "sınırsız" : "/ 5 özet"}
            </span>
          </div>
          {!isPro && (
            <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-gradient-start to-gradient-end rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totalSummaries / 5) * 100)}%` }}
              />
            </div>
          )}
          {isPro && (
            <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
              <Zap className="h-3 w-3" />
              Sınırsız kullanım aktif
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="px-3 py-2">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Menü
          </span>
        </div>
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          const isPricing = item.href === "/pricing";
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                active
                  ? "bg-gradient-to-r from-primary/10 to-violet-500/5 text-primary shadow-sm"
                  : isPricing
                  ? "bg-gradient-to-r from-primary/5 to-violet-500/5 text-primary hover:from-primary/10 hover:to-violet-500/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-gradient-to-b from-gradient-start to-gradient-end rounded-r-full" />
              )}
              <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
                active 
                  ? "bg-primary/10" 
                  : isPricing
                  ? "bg-primary/10"
                  : "bg-muted/50 group-hover:bg-muted"
              }`}>
                <Icon className={`h-4 w-4 ${
                  active 
                    ? "text-primary" 
                    : isPricing
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground"
                }`} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="truncate">{item.label}</span>
                <span className={`text-[10px] ${active ? "text-primary/60" : "text-muted-foreground/60"}`}>
                  {item.description}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Pro Upgrade Card (for free users) */}
      {!isPro && !isAdmin && (
        <div className="px-4 py-3">
          <Link
            href="/pricing"
            className="block relative overflow-hidden rounded-xl bg-gradient-to-br from-gradient-start to-gradient-end p-4 group hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-5 w-5 text-white" />
                <span className="text-sm font-bold text-white">Pro'ya Yükselt</span>
              </div>
              <p className="text-xs text-white/80 leading-relaxed">
                Sınırsız özet, PDF/UDF desteği ve daha fazlası
              </p>
              <div className="flex items-center gap-1 mt-3 text-xs font-medium text-white">
                <span>Planları Gör</span>
                <Zap className="h-3 w-3" />
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* User Profile Footer */}
      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-gradient-start to-gradient-end rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md shadow-primary/20">
              {userInitial.toUpperCase()}
            </div>
            {isPro && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm">
                <Crown className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {session?.user?.name || "Kullanıcı"}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              {session?.user?.email}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="p-2 text-muted-foreground/50 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 shrink-0 cursor-pointer"
            title="Çıkış Yap"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
