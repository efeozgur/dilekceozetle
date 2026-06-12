"use client";

import Link from "next/link";
import { Scale, Menu, X, LogOut, Shield, User, ChevronDown, Crown } from "lucide-react";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "motion/react";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();
  const isLoggedIn = !!session;
  const isPro = session?.user?.subscription === "pro";
  const isAdmin = session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  const userInitial = session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || "?";

  return (
    <header className="sticky top-4 z-50 mx-4 sm:mx-6 lg:mx-8 mt-4">
      <div className="max-w-6xl mx-auto">
        <div className={`flex items-center justify-between bg-white/80 backdrop-blur-xl border rounded-2xl px-6 py-3 shadow-sm transition-all duration-500 ${
          isPro
            ? "border-amber-200/60 shadow-amber-200/20"
            : "border-border"
        }`}>
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg text-primary cursor-pointer">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-gradient-start to-gradient-end rounded-lg">
              <Scale className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="hidden sm:inline">Dilekçe Özeti</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link href="/" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all duration-200 cursor-pointer">
              Ana Sayfa
            </Link>
            <Link href="/compare" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all duration-200 cursor-pointer">
              Karşılaştır
            </Link>
            {isLoggedIn && (
              <Link href="/dashboard" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all duration-200 cursor-pointer">
                Geçmişim
              </Link>
            )}
            {!isPro && !isAdmin && (
              <Link href="/pricing" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all duration-200 cursor-pointer">
                Fiyatlandırma
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin" className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-xl transition-all duration-200 cursor-pointer">
                <Shield className="h-3.5 w-3.5" />
                Admin
              </Link>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <Link href="/account" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all duration-200 cursor-pointer">
                  <div className="relative w-7 h-7 bg-gradient-to-br from-gradient-start to-gradient-end rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {userInitial.toUpperCase()}
                    {isPro && (
                      <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-amber-400 rounded-full flex items-center justify-center ring-1 ring-white" style={{ animation: "pro-badge-pulse 2s ease-in-out infinite" }}>
                        <Crown className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </div>
                  <span className="hidden lg:inline">Hesabım</span>
                  {isPro && (
                    <span className="hidden lg:inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
                      PRO
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-xl transition-all duration-200 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Çıkış Yap
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-xl transition-all duration-200 cursor-pointer"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:bg-primary-dark transition-all duration-200 shadow-sm shadow-primary/25 cursor-pointer"
                >
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-xl hover:bg-muted transition-colors duration-200 cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menüyü aç/kapat"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden mt-2 bg-white/95 backdrop-blur-xl border border-border rounded-2xl p-4 shadow-lg space-y-1 overflow-hidden"
            >
              <Link href="/" className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all duration-200 cursor-pointer" onClick={() => setMobileOpen(false)}>
                Ana Sayfa
              </Link>
              <Link href="/compare" className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all duration-200 cursor-pointer" onClick={() => setMobileOpen(false)}>
                Karşılaştır
              </Link>
              {isLoggedIn && (
                <Link href="/dashboard" className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all duration-200 cursor-pointer" onClick={() => setMobileOpen(false)}>
                  Geçmişim
                </Link>
              )}
              {!isPro && !isAdmin && (
                <Link href="/pricing" className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all duration-200 cursor-pointer" onClick={() => setMobileOpen(false)}>
                  Fiyatlandırma
                </Link>
              )}
              {isLoggedIn && (
                <Link href="/account" className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all duration-200 cursor-pointer" onClick={() => setMobileOpen(false)}>
                  <div className="relative w-6 h-6 bg-gradient-to-br from-gradient-start to-gradient-end rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                    {userInitial.toUpperCase()}
                    {isPro && (
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full ring-1 ring-white" />
                    )}
                  </div>
                  Hesabım
                  {isPro && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
                      PRO
                    </span>
                  )}
                </Link>
              )}
              {isAdmin && (
                <Link href="/admin" className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-primary hover:bg-primary/10 rounded-xl transition-all duration-200 cursor-pointer" onClick={() => setMobileOpen(false)}>
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
              )}
              <div className="pt-2 border-t border-border flex flex-col gap-2">
                {isLoggedIn ? (
                  <button
                    onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/" }); }}
                    className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-xl transition-all duration-200 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Çıkış Yap
                  </button>
                ) : (
                  <>
                    <Link href="/auth/login" className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all duration-200 cursor-pointer" onClick={() => setMobileOpen(false)}>
                      Giriş Yap
                    </Link>
                    <Link href="/auth/register" className="px-4 py-3 text-sm font-medium bg-primary text-primary-foreground rounded-xl text-center hover:bg-primary-dark transition-all duration-200 cursor-pointer" onClick={() => setMobileOpen(false)}>
                      Kayıt Ol
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
