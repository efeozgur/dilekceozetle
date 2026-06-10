"use client";

import { Check, Zap } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const plans = [
  {
    name: "Ucretsiz",
    price: "0",
    period: "",
    description: "Basmaya baslamak icin ideal",
    features: [
      "Ayda 5 ozet",
      "Temel ozetleme",
      "Metin kopyalama",
    ],
    cta: "Basla",
    ctaHref: "/auth/register",
    popular: false,
  },
  {
    name: "Pro",
    price: "199",
    period: "/ay",
    description: "Profesyonel kullanicilar icin",
    features: [
      "Sinirsiz ozetleme",
      "Gelistirilmis ozet kalitesi",
      "Ozet gecmisi",
      "PDF disa aktarma",
      "Ozel prompt sablonlari",
    ],
    cta: "Pro'ya Gec",
    ctaHref: "/payment",
    popular: true,
  },
  {
    name: "Kurumsal",
    price: "499",
    period: "/ay",
    description: "Ekipler ve kurumlar icin",
    features: [
      "Tum Pro ozellikleri",
      "API erisimi",
      "Toplu ozetleme",
      "Oncelikli destek",
      "Ozel entegrasyon",
      "Fatura ile odeme",
    ],
    cta: "Iletisime Gec",
    ctaHref: "mailto:info@dilekceozeti.com",
    popular: false,
  },
];

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleCtaClick = (plan: typeof plans[number]) => {
    if (plan.ctaHref === "/payment" && !session) {
      router.push("/auth/login");
      return;
    }
    if (plan.ctaHref.startsWith("mailto:")) {
      window.location.href = plan.ctaHref;
      return;
    }
    router.push(plan.ctaHref);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-semibold mb-6 tracking-wide uppercase">
          <Zap className="h-3.5 w-3.5" />
          Fiyatlandirma
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
          Ihtiyaciniza uygun plani secin
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-base">
          Tum planlar 14 gunluk ucretsiz deneme suresi icerir.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative bg-white border rounded-3xl p-8 transition-all duration-300 ${
              plan.popular
                ? "border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20 scale-[1.02]"
                : "border-border hover:shadow-md hover:border-primary/10"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-gradient-start to-gradient-end text-white text-xs font-semibold px-4 py-1 rounded-full shadow-md shadow-primary/25">
                En Populer
              </div>
            )}
            <div className="mb-7">
              <h3 className="font-semibold text-foreground text-lg">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-5xl font-bold text-foreground tracking-tight">{plan.price}</span>
                {plan.period && (
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                )}
                {plan.price !== "0" && (
                  <span className="text-muted-foreground text-sm ml-1">TL</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2.5">{plan.description}</p>
            </div>

            <ul className="space-y-3.5 mb-8">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm">
                  <Check className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            {plan.popular ? (
              <button
                onClick={() => handleCtaClick(plan)}
                className="w-full py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-gradient-start to-gradient-end text-white hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 cursor-pointer"
              >
                {plan.cta}
              </button>
            ) : (
              <button
                onClick={() => handleCtaClick(plan)}
                className="w-full py-3 rounded-xl text-sm font-semibold border border-border text-foreground hover:bg-muted hover:border-primary/20 transition-all duration-300 cursor-pointer"
              >
                {plan.cta}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
