"use client";

import Link from "next/link";
import { Crown } from "lucide-react";

interface UsageBarProps {
  used: number;
  total: number;
  subscription: string;
  compact?: boolean;
}

export function UsageBar({ used, total, subscription, compact = false }: UsageBarProps) {
  const isPro = subscription === "pro";
  const remaining = Math.max(0, total - used);
  const percentage = Math.min(100, (used / total) * 100);
  const isFull = remaining === 0 && !isPro;

  if (isPro) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/5 via-violet-50/50 to-primary/5 border border-primary/10 rounded-xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 bg-gradient-to-br from-gradient-start to-gradient-end rounded-lg shadow-sm">
            <Crown className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <span className="text-xs font-semibold text-foreground">Sınırsız Kullanım</span>
            <p className="text-[10px] text-muted-foreground">Pro üyelik aktif</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/5 border border-primary/15 px-2 py-0.5 rounded-md">
          <Crown className="h-2.5 w-2.5" />
          PRO
        </span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-white border border-border rounded-xl px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-muted-foreground">Ücretsiz Kullanım</span>
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-bold ${isFull ? "text-red-500" : "text-foreground"}`}>
              {used}/{total}
            </span>
            {isFull && (
              <Link
                href="/upgrade"
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-white bg-gradient-to-r from-gradient-start to-gradient-end px-2 py-0.5 rounded-md hover:opacity-90 transition-all"
              >
                <Crown className="h-2.5 w-2.5" />
                Yükselt
              </Link>
            )}
          </div>
        </div>
        <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
              isFull
                ? "bg-red-400"
                : percentage >= 60
                ? "bg-amber-400"
                : "bg-primary"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {!isFull && (
          <p className="text-[10px] text-muted-foreground mt-1">
            {remaining} hakkınız kaldı
          </p>
        )}
        {isFull && (
          <p className="text-[10px] text-red-500 font-medium mt-1">
            Hakkınız dolmuştur. Pro&apos;ya yükselterek sınırsız kullanın.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-foreground">Ücretsiz Kullanım Hakkı</h4>
        <span className={`text-xs font-bold ${isFull ? "text-red-500" : "text-foreground"}`}>
          {used} / {total}
        </span>
      </div>

      <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-3">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
            isFull
              ? "bg-red-400"
              : percentage >= 60
              ? "bg-amber-400"
              : "bg-primary"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          {isFull ? (
            <p className="text-xs text-red-500 font-medium">
              Hakkınız dolmuştur
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{remaining}</span> hakkınız kaldı
            </p>
          )}
        </div>
        <Link
          href="/upgrade"
          className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all ${
            isFull
              ? "text-white bg-gradient-to-r from-gradient-start to-gradient-end hover:shadow-md hover:shadow-primary/20"
              : "text-primary hover:text-primary-dark border border-primary/15 hover:bg-primary/5"
          }`}
        >
          <Crown className="h-3 w-3" />
          {isFull ? "Pro'ya Yükselt" : "Sınırsız Kullan"}
        </Link>
      </div>
    </div>
  );
}
