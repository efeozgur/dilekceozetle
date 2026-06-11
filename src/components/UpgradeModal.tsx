"use client";

import { Crown, X } from "lucide-react";
import Link from "next/link";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-4 text-center space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg shadow-amber-500/25">
          <Crown className="h-8 w-8 text-white" />
        </div>

        <h2 className="text-xl font-bold text-foreground">
          Ücretsiz Kullanım Hakkınız Doldu
        </h2>

        <p className="text-sm text-muted-foreground leading-relaxed">
          5 ücretsiz özet hakkınızı kullandınız. Pro plana yükselterek
          sınırsız özet oluşturabilir, PDF/UDF dışa aktarma ve dosya yükleme
          özelliklerinden yararlanabilirsiniz.
        </p>

        <div className="flex items-center gap-3 justify-center">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-xl hover:bg-muted transition-all cursor-pointer"
          >
            Kapat
          </button>
          <Link
            href="/upgrade"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-gradient-start to-gradient-end rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all"
          >
            Pro&apos;ya Yükselt
          </Link>
        </div>
      </div>
    </div>
  );
}
