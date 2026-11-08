import Link from "next/link";
import { requireUser } from "@/server/auth/session";
import { AppNav } from "@/components/nav";
import { BrandMark } from "@/components/brand";
import { Icon } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const home = user.role === "ADMIN" ? "/admin" : "/accueil";
  return (
    <div className="app">
      <header className="topbar">
        <Link className="brand" href={home}>
          <BrandMark />
        </Link>
        <Link className="user-chip" href="/compte" aria-label={`Mon compte : ${user.pseudo}`}>
          <Icon name="user" />
          <span>{user.pseudo}</span>
          {user.role === "ADMIN" ? <span className="role-tag">Admin</span> : null}
        </Link>
      </header>
      <AppNav role={user.role} />
      <main id="main" className="main">
        {children}
      </main>
    </div>
  );
}
