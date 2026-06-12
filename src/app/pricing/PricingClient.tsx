"use client";

import { Check, Zap, Crown, Sparkles, ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

interface PricingClientProps {
  proPrice: string;
  enterprisePrice: string;
}

export function PricingClient({ proPrice }: PricingClientProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const plans = [
    {
      name: "Ücretsiz",
      price: "0",
      description: "Başlamak için ideal",
      features: [
        "5 özet hakkı (toplam)",
        "Orta uzunlukta özet",
        "Metin kopyalama",
        "Temel istatistikler",
      ],
      cta: "Ücretsiz Başla",
      ctaHref: "/auth/register",
      popular: false,
      gradient: "from-gray-500 to-slate-600",
    },
    {
      name: "Pro",
      price: proPrice,
      period: "/ay",
      description: "Profesyonel kullanıcılar için",
      features: [
        "Sınırsız özetleme",
        "Kısa, orta ve uzun özet seçenekleri",
        "Sınırsız özet geçmişi",
        "Dilekçe karşılaştırma",
        "PDF / UDF dışa aktarma",
        "PDF / UDF dosya yükleme",
        "Öncelikli destek",
      ],
      cta: "Pro'ya Geç",
      ctaHref: "/upgrade",
      popular: true,
      gradient: "from-gradient-start to-gradient-end",
    },
  ];

  const handleCtaClick = (plan: (typeof plans)[number]) => {
    if (plan.ctaHref === "/upgrade" && !session) {
      router.push("/auth/login?callbackUrl=/upgrade");
      return;
    }
    router.push(plan.ctaHref);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      {/* Header */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-primary/5 border border-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6"
        >
          <Sparkles className="h-4 w-4" />
          Fiyatlandırma
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4"
        >
          İhtiyacınıza uygun{" "}
          <span className="text-gradient">planı seçin</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg text-muted-foreground max-w-xl mx-auto"
        >
          Ücretsiz plan ile başlayın, ihtiyaç duydukça yükseltin.
        </motion.p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`relative group ${plan.popular ? "md:-mt-4" : ""}`}
          >
            {/* Glow effect for popular */}
            {plan.popular && (
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-violet-500/30 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
            )}
            
            <div
              className={`relative h-full bg-white border rounded-2xl p-8 transition-all duration-300 ${
                plan.popular
                  ? "border-primary/30 shadow-2xl shadow-primary/10"
                  : "border-border hover:shadow-xl hover:border-primary/10"
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-gradient-start to-gradient-end text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg shadow-primary/20">
                    <Crown className="h-3.5 w-3.5" />
                    En Popüler
                  </div>
                </div>
              )}

              {/* Plan header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex items-center justify-center w-10 h-10 bg-gradient-to-br ${plan.gradient} rounded-xl shadow-lg`}>
                    {plan.popular ? (
                      <Crown className="h-5 w-5 text-white" />
                    ) : (
                      <Zap className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-foreground tracking-tight">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground text-lg">{plan.period}</span>
                  )}
                  {plan.price !== "0" && (
                    <span className="text-muted-foreground text-lg ml-1">TL</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-3">{plan.description}</p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className={`flex items-center justify-center w-5 h-5 rounded-full mt-0.5 ${
                      plan.popular ? "bg-primary/10" : "bg-emerald-50"
                    }`}>
                      <Check className={`h-3 w-3 ${plan.popular ? "text-primary" : "text-emerald-500"}`} />
                    </div>
                    <span className="text-sm text-foreground/80">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => handleCtaClick(plan)}
                className={`group w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 ${
                  plan.popular
                    ? "bg-gradient-to-r from-gradient-start to-gradient-end text-white hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
                    : "border-2 border-border text-foreground hover:bg-muted hover:border-primary/20"
                }`}
              >
                {plan.cta}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* FAQ or additional info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-16 text-center"
      >
        <p className="text-sm text-muted-foreground">
          Sorularınız için{" "}
          <a href="mailto:destek@ozgurapp.com" className="text-primary font-medium hover:underline">
            destek@ozgurapp.com
          </a>
          {" "}adresine yazabilirsiniz.
        </p>
      </motion.div>
    </div>
  );
}
