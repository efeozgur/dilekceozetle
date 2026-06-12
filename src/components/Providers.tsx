"use client";

import { SessionProvider } from "next-auth/react";
import { AppShell } from "./layout/AppShell";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AppShell>{children}</AppShell>
    </SessionProvider>
  );
}
