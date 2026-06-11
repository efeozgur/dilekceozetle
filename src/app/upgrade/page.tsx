import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSystemSettings } from "@/lib/settings";
import { ArrowLeft, Banknote, ShieldCheck, Clock, CheckCircle2, AlertCircle } from "lucide-react";
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
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard&apos;a dön
        </Link>

        <div className="bg-white border border-border rounded-3xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gradient-start to-gradient-end px-8 py-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <Banknote className="h-5 w-5" />
              <h1 className="text-lg font-bold">Pro Plana Yükselt</h1>
            </div>
            <p className="text-sm text-white/80">
              IBAN ile güvenli manuel ödeme
            </p>
          </div>

          <div className="px-8 py-5 border-b border-border bg-muted/20">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold text-foreground">
                {proPrice}
              </span>
              <span className="text-muted-foreground">TL / ay</span>
            </div>
          </div>

          <div className="px-8 py-6 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Banknote className="h-4 w-4" />
              Ödeme Bilgileri
            </h2>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-5 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Hesap Sahibi</p>
                <p className="text-sm font-semibold text-foreground">
                  {settings.iban_owner}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">IBAN</p>
                <p className="text-base font-mono font-semibold text-foreground tracking-wide break-all">
                  {settings.iban_number}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Tutar</p>
                <p className="text-lg font-bold text-emerald-600">
                  {proPrice} TL
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              Lütfen IBAN&apos;a <strong>{proPrice} TL</strong> gönderdikten
              sonra aşağıdaki formu doldurun. Ödemeniz onaylandığında Pro
              üyeliğiniz otomatik olarak aktif edilecek.
            </p>
          </div>

          <div className="px-8 py-6">
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

          <div className="px-8 py-6 bg-muted/20 border-t border-border">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Pro özellikleri:
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Sınırsız özetleme
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Kısa ve uzun özet seçenekleri
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Dilekçe karşılaştırma
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Özet geçmişi
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Özel prompt şablonları
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          Sorularınız için{" "}
          <a
            href="mailto:destek@ozgurapp.com"
            className="font-semibold text-foreground hover:text-primary"
          >
            destek@ozgurapp.com
          </a>
          .
        </div>
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
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900 mb-1">
              Talebiniz alındı, onay bekleniyor
            </p>
            <p className="text-xs text-amber-700 leading-relaxed">
              Ödeme bildiriminiz admin&apos;e iletildi. IBAN&apos;a gönderdiğiniz tutar
              doğrulandıktan sonra Pro üyeliğiniz otomatik olarak aktif
              edilecek. Onay genellikle birkaç saat içinde gelir.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-muted/30 border border-border rounded-2xl p-4 text-xs space-y-1.5">
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

      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <p>
          Aynı anda yalnızca bir bekleyen talebiniz olabilir. Yeni bir talep
          göndermek için mevcut talebinizin sonuçlanmasını bekleyin.
        </p>
      </div>
    </div>
  );
}
