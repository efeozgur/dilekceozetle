import { auth } from "./auth";

export class AdminAuthError extends Error {
  constructor(public reason: "UNAUTHORIZED" | "FORBIDDEN") {
    super(reason);
    this.name = "AdminAuthError";
  }
}

function getAdminEmail(): string {
  return (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    throw new AdminAuthError("UNAUTHORIZED");
  }
  const adminEmail = getAdminEmail();
  if (!adminEmail) {
    throw new AdminAuthError("FORBIDDEN");
  }
  if (session.user.email.toLowerCase() !== adminEmail) {
    throw new AdminAuthError("FORBIDDEN");
  }
  return session;
}

export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.email) return false;
  const adminEmail = getAdminEmail();
  if (!adminEmail) return false;
  return session.user.email.toLowerCase() === adminEmail;
}
