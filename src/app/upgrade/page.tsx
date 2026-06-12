import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSystemSettings } from "@/lib/settings";
import { ArrowLeft, Banknote, ShieldCheck, Clock, CheckCircle2, AlertCircle, Crown } from "lucide-react";
import Link from "next/link";
import { UpgradeForm } from "./UpgradeForm";

export default async function UpgradePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/upgrade");
  }

  const settings = await getSystemSettings();
  const proPrice = parseInt(settings.pro_price) || 299;

  const pending = await prisma.paymentRequest.findFirst({
    where: { userId: session.user.id, status: "PENDING" },
    select: {
      id: true,
      amountTry: true,
      ibanLast4: true,
      createdAt: true,
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { subscription: true },
  });
  const isPro = user?.subscription === "pro";

  if (isPro) {
    redirect("/account");
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-5 cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Dashboard&apos;a dön
      </Link>

      <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-gradient-start to-gradient-end px-6 py-5 text-white">
          <div className="flex items-center gap-2.5 mb-2">
            <Crown className="h-5 w-5" />
            <h1 className="text-base font-bold">Pro Plana Yükselt</h1>
          </div>
          <p className="text-sm text-white/70">
            IBAN ile güvenli manuel ödeme
          </p>
        </div>

        <div className="px-6 py-4 border-b border-border bg-muted/10">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-bold text-foreground">
              {proPrice}
            </span>
            <span className="text-muted-foreground text-sm">TL / ay</span>
          </div>
        </div>

        <div className="px-6 py-5 border-b border-border">
          <h2 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
            <Banknote className="h-4 w-4" />
            Ödeme Bilgileri
          </h2>
          <div className="bg-muted/20 border border-border rounded-xl p-4 space-y-2.5">
            <div>
              <p className="text-[10px] text-muted-foreground">Hesap Sahibi</p>
              <p className="text-sm font-semibold text-foreground">
                {settings.iban_owner}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">IBAN</p>
              <p className="text-sm font-mono font-semibold text-foreground tracking-wide break-all">
                {settings.iban_number}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Tutar</p>
              <p className="text-base font-bold text-emerald-600">
                {proPrice} TL
              </p>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
            IBAN&apos;a <strong>{proPrice} TL</strong> gönderdikten
            sonra formu doldurun. Ödemeniz onaylandığında Pro üyeliğiniz aktif edilecek.
          </p>
        </div>

        <div className="px-6 py-5">
          {pending ? (
            <PendingStatus
              amount={pending.amountTry}
              ibanLast4={pending.ibanLast4}
              createdAt={pending.createdAt}
            />
          ) : (
            <UpgradeForm expectedAmount={proPrice} />
          )}
        </div>

        <div className="px-6 py-5 bg-muted/10 border-t border-border">
          <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Pro özellikleri:
          </h3>
          <ul className="space-y-2 text-xs text-muted-foreground">
            {[
              "Sınırsız özetleme",
              "Kısa ve uzun özet seçenekleri",
              "PDF / UDF dışa aktarma ve yükleme",
              "Dilekçe karşılaştırma",
              "Sınırsız özet geçmişi",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-5 text-center text-[11px] text-muted-foreground">
        Sorularınız için{" "}
        <a
          href="mailto:destek@ozgurapp.com"
          className="font-semibold text-foreground hover:text-primary"
        >
          destek@ozgurapp.com
        </a>
      </div>
    </div>
  );
}

function PendingStatus({
  amount,
  ibanLast4,
  createdAt,
}: {
  amount: number;
  ibanLast4: string;
  createdAt: Date;
}) {
  return (
    <div className="space-y-3">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-2.5">
          <Clock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-900 mb-1">
              Talebiniz alındı, onay bekleniyor
            </p>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              Ödeme bildiriminiz admin&apos;e iletildi. Doğrulama sonrası Pro üyeliğiniz aktif edilecek.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-muted/20 border border-border rounded-xl p-3 text-[11px] space-y-1">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Bildirilen tutar:</span>
          <span className="font-semibold text-foreground">{amount} TL</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">IBAN son 4:</span>
          <span className="font-mono font-semibold text-foreground">
            **** {ibanLast4}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Bildirim zamanı:</span>
          <span className="font-medium text-foreground">
            {new Date(createdAt).toLocaleString("tr-TR", {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </span>
        </div>
      </div>

      <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
        <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
        <p>
          Aynı anda yalnızca bir bekleyen talebiniz olabilir.
        </p>
      </div>
    </div>
  );
}
