import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/server/auth/session";
import { matchFormSeasons, todayIso } from "@/server/services/match-form-data";
import { MatchForm } from "@/components/match-form";
import { EmptyState, Flash, PageHead } from "@/components/ui";

export const metadata: Metadata = { title: "Saisir un match" };

/** E12a (admin) — FR-101 */
export default async function AdminNouveauMatchPage({ searchParams }: { searchParams: Promise<{ erreur?: string; ok?: string }> }) {
  const admin = await requireAdmin();
  const sp = await searchParams;
  const seasons = await matchFormSeasons(admin);
  return (
    <div className="main-narrow" style={{ margin: "0 auto" }}>
      <PageHead
        eyebrow={
          <>
            <Link className="link" href="/admin/matchs">
              Matchs
            </Link>{" "}
            / Saisie
          </>
        }
        title="Saisir un match"
      />
      <Flash ok={sp.ok} error={sp.erreur} />
      {seasons.length === 0 ? (
        <EmptyState icon="calendar" title="Aucune saison ouverte" />
      ) : (
        <MatchForm seasons={seasons} meId={null} admin today={todayIso()} />
      )}
    </div>
  );
}
