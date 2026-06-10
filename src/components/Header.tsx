"use client";

import Link from "next/link";
import { Scale, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();
  const isLoggedIn = !!session;

  return (
    <header className="sticky top-4 z-50 mx-4 sm:mx-6 lg:mx-8 mt-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-xl border border-border rounded-2xl px-6 py-3 shadow-sm">
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
            <Link href="/dashboard" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all duration-200 cursor-pointer">
              Geçmişim
            </Link>
            <Link href="/pricing" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all duration-200 cursor-pointer">
              Fiyatlandırma
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <span className="text-xs text-muted-foreground mr-2">{session.user?.email}</span>
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

        {mobileOpen && (
          <div className="md:hidden mt-2 bg-white/95 backdrop-blur-xl border border-border rounded-2xl p-4 shadow-lg space-y-1">
            <Link href="/" className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all duration-200 cursor-pointer" onClick={() => setMobileOpen(false)}>
              Ana Sayfa
            </Link>
            <Link href="/compare" className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all duration-200 cursor-pointer" onClick={() => setMobileOpen(false)}>
              Karşılaştır
            </Link>
            <Link href="/dashboard" className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all duration-200 cursor-pointer" onClick={() => setMobileOpen(false)}>
              Geçmişim
            </Link>
            <Link href="/pricing" className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all duration-200 cursor-pointer" onClick={() => setMobileOpen(false)}>
              Fiyatlandırma
            </Link>
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
          </div>
        )}
      </div>
    </header>
  );
}
