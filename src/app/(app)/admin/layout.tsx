import { requireAdmin } from "@/server/auth/session";

/** Toute la zone /admin exige un admin, vérifié côté serveur (constitution VI). */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <>{children}</>;
}
