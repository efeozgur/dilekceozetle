"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Home, GitCompare, History, User } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isAdminRoute = pathname.startsWith("/admin");
  const isAuthRoute = pathname.startsWith("/auth");

  if (isAdminRoute || isAuthRoute || !session) {
    return null;
  }

  const items = [
    { href: "/", label: "Ana Sayfa", icon: Home },
    { href: "/compare", label: "Karşılaştır", icon: GitCompare },
    { href: "/dashboard", label: "Geçmiş", icon: History },
    { href: "/account", label: "Hesap", icon: User },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-border z-50 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-1.5">
        {items.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[56px] ${
                active
                  ? "text-primary"
                  : "text-muted-foreground/50 hover:text-muted-foreground"
              }`}
            >
              <div className={`p-1 rounded-lg transition-all duration-200 ${active ? "bg-primary/10" : ""}`}>
                <Icon className={`h-[18px] w-[18px] ${active ? "text-primary" : ""}`} />
              </div>
              <span className={`text-[10px] font-medium ${active ? "text-primary font-semibold" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
