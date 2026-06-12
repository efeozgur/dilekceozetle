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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-4 text-center space-y-4">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gradient-start to-gradient-end rounded-xl shadow-lg shadow-primary/20">
          <Crown className="h-6 w-6 text-white" />
        </div>

        <h2 className="text-lg font-bold text-foreground">
          Ücretsiz Kullanım Hakkınız Doldu
        </h2>

        <p className="text-sm text-muted-foreground leading-relaxed">
          5 ücretsiz özet hakkınızı kullandınız. Pro plana yükselterek
          sınırsız özet oluşturabilir, PDF/UDF dışa aktarma ve dosya yükleme
          özelliklerinden yararlanabilirsiniz.
        </p>

        <div className="flex items-center gap-2 justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted transition-all cursor-pointer"
          >
            Kapat
          </button>
          <Link
            href="/upgrade"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-gradient-start to-gradient-end rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all"
          >
            Pro&apos;ya Yükselt
          </Link>
        </div>
      </div>
    </div>
  );
}
