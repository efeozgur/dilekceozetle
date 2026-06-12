"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Scale, Loader2, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle2, Sparkles, Crown } from "lucide-react";
import { motion } from "motion/react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const errors: { name?: string; email?: string; password?: string } = {};
    if (!name.trim()) errors.name = "Ad Soyad gerekli";
    if (!email.trim()) errors.email = "E-posta adresi gerekli";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Geçerli bir e-posta adresi giriniz";
    if (!password) errors.password = "Şifre gerekli";
    else if (password.length < 6) errors.password = "Şifre en az 6 karakter olmalıdır";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Kayıt sırasında bir hata oluştu.");
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        router.push("/auth/login");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Kayıt sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Branding Panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-gradient-start via-primary to-gradient-end">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-morph" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-morph" style={{ animationDelay: "4s" }} />
        
        {/* Floating shapes */}
        <div className="absolute top-1/4 right-1/4 w-20 h-20 border border-white/20 rounded-2xl rotate-12 animate-float" />
        <div className="absolute bottom-1/3 left-1/4 w-16 h-16 border border-white/20 rounded-full animate-float" style={{ animationDelay: "1s" }} />

        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 mb-12"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">Dilekçe Özeti</span>
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-bold leading-tight mb-6"
          >
            Ücretsiz<br />
            <span className="text-white/80">başlayın!</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-white/70 leading-relaxed max-w-md mb-10"
          >
            Hesap oluşturun ve yapay zeka destekli dilekçe özetleme ile tanışın.
          </motion.p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-4"
          >
            {[
              "5 ücretsiz özet hakkı",
              "Kredi kartı gerektirmez",
              "Anında başlayın",
            ].map((feature, i) => (
              <div key={feature} className="flex items-center gap-3 text-sm text-white/80">
                <div className="flex items-center justify-center w-6 h-6 bg-white/10 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
                {feature}
              </div>
            ))}
          </motion.div>

          {/* Pro hint */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-4 w-4 text-amber-300" />
              <span className="text-sm font-semibold">Pro&apos;ya istediğiniz zaman geçin</span>
            </div>
            <p className="text-xs text-white/60">
              Sınırsız özet, PDF/UDF desteği ve daha fazlası
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="flex items-center justify-center w-11 h-11 bg-gradient-to-br from-gradient-start to-gradient-end rounded-xl shadow-lg shadow-primary/20">
              <Scale className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-foreground text-xl">Dilekçe Özeti</span>
          </div>

          {/* Heading */}
          <div className="text-center lg:text-left mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">Kayıt Ol</h1>
            <p className="text-sm text-muted-foreground">
              Ücretsiz hesap oluşturun ve hemen başlayın
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium flex items-start gap-3"
            >
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Ad Soyad
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setFieldErrors((prev) => ({ ...prev, name: undefined })); }}
                placeholder="Adınız Soyadınız"
                required
                className={`w-full px-4 py-3 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 transition-all duration-200 ${
                  fieldErrors.name
                    ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                    : "border-border focus:ring-primary/20 focus:border-primary/40"
                }`}
              />
              {fieldErrors.name && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {fieldErrors.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                E-posta
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors((prev) => ({ ...prev, email: undefined })); }}
                placeholder="ornek@email.com"
                required
                className={`w-full px-4 py-3 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 transition-all duration-200 ${
                  fieldErrors.email
                    ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                    : "border-border focus:ring-primary/20 focus:border-primary/40"
                }`}
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Şifre
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors((prev) => ({ ...prev, password: undefined })); }}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className={`w-full px-4 py-3 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 transition-all duration-200 pr-11 ${
                    fieldErrors.password
                      ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                      : "border-border focus:ring-primary/20 focus:border-primary/40"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {fieldErrors.password}
                </p>
              )}
              {!fieldErrors.password && password.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1.5">
                  En az 6 karakter
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gradient-start to-gradient-end text-white py-3.5 rounded-xl text-sm font-semibold hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 transition-all duration-300 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Kayıt yapılıyor...
                </>
              ) : (
                <>
                  Ücretsiz Kayıt Ol
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            Zaten hesabınız var mı?{" "}
            <Link href="/auth/login" className="font-semibold text-primary hover:text-primary-dark transition-colors cursor-pointer">
              Giriş Yap
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
