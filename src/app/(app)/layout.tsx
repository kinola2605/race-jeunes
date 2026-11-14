import Link from "next/link";
import { requireUser } from "@/server/auth/session";
import { AppNav } from "@/components/nav";
import { BrandMark } from "@/components/brand";
import { Avatar } from "@/components/avatar";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const home = user.role === "ADMIN" ? "/admin" : "/accueil";
  // Spec 010 : même puce dans la barre du haut (mobile) et en bas de la barre latérale (grand écran).
  const account = (
    <Link className="user-chip" href="/compte" aria-label={`Mon compte : ${user.pseudo}`}>
      <Avatar pseudo={user.pseudo} avatar={user.avatar} />
      <span className="user-name">{user.pseudo}</span>
      {user.role === "ADMIN" ? <span className="role-tag">Admin</span> : null}
    </Link>
  );
  return (
    <div className="app">
      <header className="topbar">
        <Link className="brand" href={home}>
          <BrandMark />
        </Link>
        {account}
      </header>
      <AppNav role={user.role} account={account} />
      <main id="main" className="main">
        {children}
      </main>
    </div>
  );
}
