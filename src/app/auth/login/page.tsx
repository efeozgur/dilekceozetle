"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Scale, Loader2, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { motion } from "motion/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) errors.email = "E-posta adresi gerekli";
    if (!password) errors.password = "Şifre gerekli";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("E-posta veya şifre hatalı.");
        setFieldErrors({ email: " ", password: " " });
      } else {
        window.location.href = "/dashboard";
      }
    } catch {
      setError("Giriş sırasında bir hata oluştu.");
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
            Hoş geldiniz<br />
            <span className="text-white/80">tekrar!</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-white/70 leading-relaxed max-w-md mb-10"
          >
            Hesabınıza giriş yapın ve dilekçelerinizi yapay zeka ile özetlemeye devam edin.
          </motion.p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-4"
          >
            {[
              "Sınırsız özetleme (Pro)",
              "PDF/UDF dosya desteği",
              "Dilekçe karşılaştırma",
            ].map((feature, i) => (
              <div key={feature} className="flex items-center gap-3 text-sm text-white/80">
                <div className="flex items-center justify-center w-6 h-6 bg-white/10 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
                {feature}
              </div>
            ))}
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
            <h1 className="text-2xl font-bold text-foreground mb-2">Giriş Yap</h1>
            <p className="text-sm text-muted-foreground">
              Hesabınıza erişmek için bilgilerinizi girin
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
              {fieldErrors.email && fieldErrors.email.trim() && (
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
              {fieldErrors.password && fieldErrors.password.trim() && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-md border-2 transition-all duration-200 flex items-center justify-center ${
                  remember
                    ? "bg-primary border-primary"
                    : "border-border group-hover:border-primary/40"
                }`}>
                  {remember && (
                    <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  Beni hatırla
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gradient-start to-gradient-end text-white py-3.5 rounded-xl text-sm font-semibold hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 transition-all duration-300 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Giriş yapılıyor...
                </>
              ) : (
                <>
                  Giriş Yap
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            Hesabınız yok mu?{" "}
            <Link href="/auth/register" className="font-semibold text-primary hover:text-primary-dark transition-colors cursor-pointer">
              Kayıt Ol
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
