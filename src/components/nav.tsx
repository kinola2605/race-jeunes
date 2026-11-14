"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Icon } from "./ui";
import { BrandMark } from "./brand";
import type { IconName } from "./icons";

const NAV: Record<"PLAYER" | "ADMIN", { href: string; icon: IconName; label: string; exact?: boolean; cta?: boolean }[]> = {
  // Spec 010, FR-1000 : « Saisir », action principale du joueur, est au centre de la barre.
  PLAYER: [
    { href: "/accueil", icon: "home", label: "Accueil" },
    { href: "/classement", icon: "trophy", label: "Classement" },
    { href: "/matchs/nouveau", icon: "plus", label: "Saisir", cta: true },
    { href: "/matchs", icon: "list", label: "Matchs", exact: true },
    { href: "/saisons", icon: "calendar", label: "Saisons" },
  ],
  ADMIN: [
    { href: "/admin", icon: "activity", label: "Suivi", exact: true },
    { href: "/admin/matchs", icon: "ball", label: "Matchs" },
    { href: "/admin/joueurs", icon: "users", label: "Joueurs" },
    { href: "/admin/saisons", icon: "calendar", label: "Saisons" },
    { href: "/admin/journal", icon: "journal", label: "Journal" },
  ],
};

export function AppNav({ role, account }: { role: "PLAYER" | "ADMIN"; account?: ReactNode }) {
  const path = usePathname();
  const items = NAV[role];
  const home = items[0]!.href;
  return (
    <nav className="appnav" aria-label="Navigation principale">
      <Link className="nav-brand" href={home}>
        <BrandMark />
      </Link>
      <ul>
        {items.map((item) => {
          const current = item.exact ? path === item.href : path === item.href || path.startsWith(item.href + "/");
          return (
            <li key={item.href} className={item.cta ? "nav-cta-li" : undefined}>
              <Link href={item.href} className={item.cta ? "nav-cta" : undefined} aria-current={current ? "page" : undefined}>
                {item.cta ? (
                  <span className="nav-cta-ic">
                    <Icon name={item.icon} />
                  </span>
                ) : (
                  <Icon name={item.icon} />
                )}
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      {account ? <div className="nav-account">{account}</div> : null}
    </nav>
  );
}
