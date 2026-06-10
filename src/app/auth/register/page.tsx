"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Scale, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Kayit sirasinda bir hata olustu.");
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
      setError("Kayit sirasinda bir hata olustu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-gradient-start to-gradient-end rounded-2xl mb-5 shadow-lg shadow-primary/20">
            <Scale className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Kayit Ol</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Ucretsiz hesap olusturun ve hemen baslayin
          </p>
        </div>

        <div className="bg-white border border-border rounded-3xl shadow-sm p-8">
          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700 font-medium">
              {error}
            </div>
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
                onChange={(e) => setName(e.target.value)}
                placeholder="Adiniz Soyadiniz"
                required
                className="w-full px-4 py-3 text-sm border border-border rounded-xl bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-200"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                E-posta
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                required
                className="w-full px-4 py-3 text-sm border border-border rounded-xl bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-200"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Sifre
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-3 text-sm border border-border rounded-xl bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-200"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gradient-start to-gradient-end text-white py-3 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 transition-all duration-300 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Kayit yapiliyor...
                </>
              ) : (
                "Kayit Ol"
              )}
            </button>
          </form>


        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Zaten hesabiniz var mi?{" "}
          <Link href="/auth/login" className="font-semibold text-primary hover:text-primary-dark transition-colors duration-200 cursor-pointer">
            Giris Yap
          </Link>
        </p>
      </div>
    </div>
  );
}
