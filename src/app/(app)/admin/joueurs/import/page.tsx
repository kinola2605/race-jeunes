import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/server/db";
import { PageHead } from "@/components/ui";
import { ImportForm } from "./import-form";

export const metadata: Metadata = { title: "Import CSV" };

/** E08d — FR-026 */
export default async function ImportPage() {
  const seasons = await db.season.findMany({ where: { status: { in: ["DRAFT", "OPEN"] } }, orderBy: { createdAt: "desc" }, select: { id: true, title: true } });
  return (
    <>
      <PageHead
        eyebrow={
          <>
            <Link className="link" href="/admin/joueurs">
              Joueurs
            </Link>{" "}
            / Import
          </>
        }
        title="Importer des joueurs"
      />
      <ImportForm seasons={seasons} />
    </>
  );
}
