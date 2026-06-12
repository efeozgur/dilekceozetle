import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

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
      <body suppressHydrationWarning className="h-full bg-background text-foreground antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
