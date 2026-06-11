import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Sifre", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(credentials.password as string, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        // İlk girişte DB'den pro statüsünü çek
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            subscription: true,
            pendingPayment: true,
            proActivatedAt: true,
          },
        });
        if (dbUser) {
          token.subscription = dbUser.subscription;
          token.pendingPayment = dbUser.pendingPayment;
          token.proActivatedAt = dbUser.proActivatedAt?.toISOString() ?? null;
        }
      }
      // Session güncellemelerinde (örn. update()) DB'den taze veri çek
      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            subscription: true,
            pendingPayment: true,
            proActivatedAt: true,
          },
        });
        if (dbUser) {
          token.subscription = dbUser.subscription;
          token.pendingPayment = dbUser.pendingPayment;
          token.proActivatedAt = dbUser.proActivatedAt?.toISOString() ?? null;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
      }
      session.user.subscription = (token.subscription as string) ?? "free";
      session.user.pendingPayment = (token.pendingPayment as boolean) ?? false;
      session.user.proActivatedAt = (token.proActivatedAt as string | null) ?? null;

      // recentPro: son 5 dakika içinde Pro aktif olduysa
      if (token.proActivatedAt) {
        const activatedAt = new Date(token.proActivatedAt as string);
        const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
        session.user.recentPro = activatedAt > fiveMinAgo;
      } else {
        session.user.recentPro = false;
      }

      return session;
    },
  },
});
