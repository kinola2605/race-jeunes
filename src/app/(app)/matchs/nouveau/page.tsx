import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/server/auth/session";
import { matchFormSeasons, todayIso } from "@/server/services/match-form-data";
import { MatchForm } from "@/components/match-form";
import { EmptyState, Flash, Icon, PageHead } from "@/components/ui";

export const metadata: Metadata = { title: "Déclarer un match" };

/** E12a (joueur) */
export default async function NouveauMatchPage({ searchParams }: { searchParams: Promise<{ erreur?: string; ok?: string }> }) {
  const user = await requireUser();
  if (user.role === "ADMIN") redirect("/admin/matchs/nouveau");
  const sp = await searchParams;
  const seasons = await matchFormSeasons(user);
  return (
    <div className="main-narrow" style={{ margin: "0 auto" }}>
      {/* sur mobile, la barre d'onglets est masquée pendant la saisie (spec 010) : ce lien permet d'en sortir */}
      <Link className="back-link" href="/accueil">
        <Icon name="chev-l" />
        Accueil
      </Link>
      <PageHead eyebrow={seasons[0]?.title ?? "Race jeunes"} title="Déclarer un match" />
      <Flash ok={sp.ok} error={sp.erreur} />
      {seasons.length === 0 ? (
        <EmptyState icon="calendar" title="Aucune saison ouverte">
          <p>Vous n&apos;êtes engagé·e dans aucune saison ouverte pour le moment.</p>
        </EmptyState>
      ) : (
        <MatchForm seasons={seasons} meId={user.id} admin={false} today={todayIso()} />
      )}
    </div>
  );
}
