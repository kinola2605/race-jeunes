import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { emptyRuleSet } from "@/scoring";
import { db } from "@/server/db";
import { getSeason, ruleSetsOf } from "@/server/services/seasons";
import { parseRules } from "@/server/services/scoring";
import { Flash, PageHead, formatDateTime } from "@/components/ui";
import { RuleEditor } from "./rule-editor";

export const metadata: Metadata = { title: "Barème" };

/** E10 — FR-060 à FR-067 */
export default async function BaremePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ ok?: string; erreur?: string }> }) {
  const { slug } = await params;
  const sp = await searchParams;
  const season = await getSeason(slug);
  if (!season) notFound();
  const { published, draft, all } = await ruleSetsOf(season.id);
  const stale = published
    ? await db.pointsEntry.count({ where: { match: { seasonId: season.id, status: "VALIDATED" }, NOT: { ruleSetId: published.id } } })
    : 0;
  const writable = season.status === "DRAFT" || season.status === "OPEN";
  const base = draft ?? published;

  return (
    <>
      <PageHead
        eyebrow={
          <>
            <Link className="link" href="/admin/saisons">
              Saisons
            </Link>{" "}
            /{" "}
            <Link className="link" href={`/admin/saisons/${season.slug}`}>
              {season.slug}
            </Link>{" "}
            / Barème
          </>
        }
        title="Éditeur de barème"
        lead={
          <>
            En vigueur : <strong>{published ? `v${published.version}` : "aucune version publiée"}</strong>
            {published?.publishedAt ? ` (publiée le ${formatDateTime(published.publishedAt)})` : ""}
            {draft ? (
              <>
                {" "}
                · Brouillon : <strong>v{draft.version}</strong>
              </>
            ) : null}
            {!writable ? " · saison en lecture seule : barème verrouillé" : ""}
          </>
        }
      />
      <Flash ok={sp.ok} error={sp.erreur} />
      <RuleEditor
        seasonId={season.id}
        writable={writable}
        initial={base ? parseRules(base.rules) : emptyRuleSet()}
        published={published ? { version: published.version, rules: parseRules(published.rules) } : null}
        draft={draft ? { version: draft.version, rules: parseRules(draft.rules) } : null}
        staleEntries={stale}
        history={all.map((r) => ({ version: r.version, status: r.status, publishedAt: r.publishedAt?.toISOString() ?? null }))}
      />
    </>
  );
}
