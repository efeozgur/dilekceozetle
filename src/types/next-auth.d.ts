import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      subscription?: string;
      pendingPayment?: boolean;
      proActivatedAt?: string | null;
      recentPro?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    subscription?: string;
    pendingPayment?: boolean;
    proActivatedAt?: string | null;
  }
}
