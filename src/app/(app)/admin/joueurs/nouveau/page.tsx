import type { Metadata } from "next";
import Link from "next/link";
import { listTags } from "@/server/services/accounts";
import { db } from "@/server/db";
import { PageHead } from "@/components/ui";
import { NewPlayerForm } from "./new-player-form";

export const metadata: Metadata = { title: "Nouveau joueur" };

/** E08b — FR-020 */
export default async function NouveauJoueurPage() {
  const [tags, seasons] = await Promise.all([
    listTags(),
    db.season.findMany({ where: { status: { in: ["DRAFT", "OPEN"] } }, orderBy: { createdAt: "desc" }, select: { id: true, title: true, status: true } }),
  ]);
  return (
    <>
      <PageHead
        eyebrow={
          <>
            <Link className="link" href="/admin/joueurs">
              Joueurs
            </Link>{" "}
            / Nouveau
          </>
        }
        title="Nouveau joueur"
      />
      <NewPlayerForm tags={tags.map((t) => t.name)} seasons={seasons} />
    </>
  );
}
