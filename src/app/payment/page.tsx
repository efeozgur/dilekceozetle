"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CreditCard, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function PaymentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Odeme olusturulamadi.");
        setLoading(false);
        return;
      }

      // Create auto-submit form to redirect to Shopier
      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.actionUrl;

      // Parse hidden inputs and add to form
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.hiddenInputs, "text/html");
      const inputs = doc.querySelectorAll("input");
      inputs.forEach((input) => {
        const hidden = document.createElement("input");
        hidden.type = "hidden";
        hidden.name = input.getAttribute("name") || "";
        hidden.value = input.getAttribute("value") || "";
        form.appendChild(hidden);
      });

      document.body.appendChild(form);
      form.submit();
    } catch {
      alert("Sunucuyla baglanti kurulamadi.");
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    router.push("/auth/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-lg mx-auto">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Fiyatlandirmaya don
        </Link>

        <div className="bg-white border border-border rounded-3xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gradient-start to-gradient-end px-8 py-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <CreditCard className="h-5 w-5" />
              <h1 className="text-lg font-bold">Pro Plana Yükselt</h1>
            </div>
            <p className="text-sm text-white/80">
              Kredi karti veya banka karti ile guvenli odeme
            </p>
          </div>

          {/* Price */}
          <div className="px-8 py-5 border-b border-border bg-muted/20">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold text-foreground">299</span>
              <span className="text-muted-foreground">TL / ay</span>
            </div>
          </div>

          {/* Features */}
          <div className="px-8 py-6 space-y-3">
            <h3 className="text-sm font-semibold text-foreground mb-3">Pro ozellikleri:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Sinirsiz ozetleme</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Gelistirilmis ozet kalitesi</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Ozet gecmisi</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-500" /> PDF disa aktarma</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Ozel prompt sablonlari</li>
            </ul>
          </div>

          {/* Pay Button */}
          <div className="px-8 pb-8">
            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gradient-start to-gradient-end text-white py-3.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Yonlendiriliyor...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  299 TL Ode
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-muted-foreground mt-3">
              Shopier uzerinden guvenli odeme. Kart bilgileriniz sunucularimizda saklanmaz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
