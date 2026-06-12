"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Scale, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
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

    // Client-side validation
    const errors: { name?: string; email?: string; password?: string } = {};
    if (!name.trim()) errors.name = "Ad Soyad gerekli";
    if (!email.trim()) errors.email = "E-posta adresi gerekli";
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

      // Auto-login after registration
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-gradient-start to-gradient-end rounded-2xl mb-5 shadow-lg shadow-primary/20">
            <Scale className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Kayıt Ol</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Ücretsiz hesap oluşturun ve hemen başlayın
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white border border-border rounded-3xl shadow-sm p-8"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700 font-medium flex items-start gap-3"
            >
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                className={`w-full px-4 py-3 text-sm border rounded-xl bg-muted/30 focus:outline-none focus:ring-2 transition-all duration-200 ${
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
                className={`w-full px-4 py-3 text-sm border rounded-xl bg-muted/30 focus:outline-none focus:ring-2 transition-all duration-200 ${
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
                  className={`w-full px-4 py-3 text-sm border rounded-xl bg-muted/30 focus:outline-none focus:ring-2 transition-all duration-200 pr-11 ${
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
                  aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
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
                <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                  En az 6 karakter
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gradient-start to-gradient-end text-white py-3 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 transition-all duration-300 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Kayıt yapılıyor...
                </>
              ) : (
                "Kayıt Ol"
              )}
            </button>
          </form>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-sm text-muted-foreground mt-6"
        >
          Zaten hesabınız var mı?{" "}
          <Link href="/auth/login" className="font-semibold text-primary hover:text-primary-dark transition-colors duration-200 cursor-pointer">
            Giriş Yap
          </Link>
        </motion.p>
      </div>
    </motion.div>
  );
}
