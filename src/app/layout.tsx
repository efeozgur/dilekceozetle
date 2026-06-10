import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dilekce Ozeti - Hukuki Dilekce Ozetleme Araci",
  description:
    "Dilekceleri inceleyerek kisa, yogun ve nesnel ozetler hazirlayan yapay zeka destekli hukuki ozetleme araci.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${inter.variable} h-full`}>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <Providers>
          <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border bg-white/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <p>Dilekce Ozeti &copy; 2026. Tüm haklari saklidir.</p>
              <div className="flex items-center gap-6">
                <a href="#" className="hover:text-foreground transition-colors duration-200 cursor-pointer">Gizlilik Politikasi</a>
                <a href="#" className="hover:text-foreground transition-colors duration-200 cursor-pointer">Kullanim Sartlari</a>
                <a href="#" className="hover:text-foreground transition-colors duration-200 cursor-pointer">Iletisim</a>
              </div>
            </div>
          </div>
        </footer>
        </Providers>
      </body>
    </html>
  );
}
