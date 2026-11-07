"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const STATUS: Record<string, string> = { DRAFT: "brouillon", OPEN: "ouverte", CLOSED: "clôturée", ARCHIVED: "archivée" };

/** Sélecteur de saison (navigation par paramètre ?saison=). */
export function SeasonPicker({ seasons, current }: { seasons: { slug: string; title: string; status: string }[]; current: string | null }) {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  return (
    <div className="field mb-0 grow" style={{ minWidth: 220 }}>
      <label htmlFor="saison" className="sr-only">
        Saison
      </label>
      <select
        className="select"
        id="saison"
        value={current ?? ""}
        onChange={(e) => {
          const next = new URLSearchParams(params.toString());
          next.set("saison", e.target.value);
          router.push(`${path}?${next.toString()}`);
        }}
      >
        {seasons.map((s) => (
          <option key={s.slug} value={s.slug}>
            {s.title} — {STATUS[s.status]}
          </option>
        ))}
      </select>
    </div>
  );
}
