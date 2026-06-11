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
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Crown className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-semibold text-amber-800">Sınırsız Kullanım</span>
        </div>
        <span className="text-xs text-amber-600">Pro Üye</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-white border border-border rounded-2xl px-5 py-3.5">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-medium text-muted-foreground">Ücretsiz Kullanım</span>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${isFull ? "text-red-500" : "text-foreground"}`}>
              {used}/{total}
            </span>
            {isFull && (
              <Link
                href="/upgrade"
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-white bg-gradient-to-r from-gradient-start to-gradient-end px-2.5 py-1 rounded-lg hover:opacity-90 transition-all"
              >
                <Crown className="h-3 w-3" />
                Yükselt
              </Link>
            )}
          </div>
        </div>
        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
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
          <p className="text-[10px] text-muted-foreground mt-1.5">
            {remaining} hakkınız kaldı
          </p>
        )}
        {isFull && (
          <p className="text-[10px] text-red-500 font-medium mt-1.5">
            Hakkınız dolmuştur. Pro&apos;ya yükselterek sınırsız kullanın.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-foreground">Ücretsiz Kullanım Hakkı</h4>
        <span className={`text-sm font-bold ${isFull ? "text-red-500" : "text-foreground"}`}>
          {used} / {total}
        </span>
      </div>

      <div className="relative h-3 bg-muted rounded-full overflow-hidden mb-4">
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
            <p className="text-sm text-red-500 font-medium">
              Hakkınız dolmuştur
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{remaining}</span> hakkınız kaldı
            </p>
          )}
        </div>
        {isFull ? (
          <Link
            href="/upgrade"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-gradient-start to-gradient-end px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all"
          >
            <Crown className="h-3.5 w-3.5" />
            Pro&apos;ya Yükselt
          </Link>
        ) : (
          <Link
            href="/upgrade"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-dark border border-primary/20 px-3 py-1.5 rounded-xl hover:bg-primary/5 transition-all"
          >
            <Crown className="h-3.5 w-3.5" />
            Sınırsız Kullan
          </Link>
        )}
      </div>
    </div>
  );
}
