"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith("/auth");
  const isAdminRoute = pathname.startsWith("/admin");
  const showNavigation = !isAuthRoute && !isAdminRoute;

  return (
    <div className="min-h-screen bg-background">
      {showNavigation && <Sidebar />}

      <div className={`flex flex-col min-h-screen ${showNavigation ? "lg:ml-[260px]" : ""}`}>
        <main className={`flex-1 ${showNavigation ? "pb-20 lg:pb-0" : ""}`}>
          {children}
        </main>
      </div>

      {showNavigation && <MobileNav />}
    </div>
  );
}
