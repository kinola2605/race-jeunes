import { describe, expect, it } from "vitest";
import { buildPersonalData, countsOf, exportFileName, summarize, type RawMatch, type RawPersonalData } from "./personal-data";

const d = (s: string) => new Date(s);

function match(over: Partial<RawMatch>): RawMatch {
  return {
    id: "m1",
    playedOn: d("2026-10-03T00:00:00Z"),
    season: { slug: "race-2026", title: "Race 2026" },
    playerAId: "me",
    playerA: { pseudo: "AceDuMatin" },
    playerBId: "other",
    playerB: { pseudo: "Lob" },
    externalLabel: null,
    externalRanking: null,
    winner: "A",
    score: "6/4 3/6 10-8",
    kind: "NORMAL",
    tournament: null,
    status: "VALIDATED",
    refusalReason: null,
    rankingA: "30/2",
    rankingB: "30/1",
    createdAt: d("2026-10-03T18:00:00Z"),
    validatedAt: d("2026-10-04T09:00:00Z"),
    entries: [{ userId: "me", points: 30, gap: 1, isPerf: true, won: true, breakdown: [{ label: "Victoire", value: "30 pts" }], ruleSet: { version: 2 } }],
    ...over,
  };
}

const raw: RawPersonalData = {
  account: {
    id: "me",
    pseudo: "AceDuMatin",
    role: "PLAYER",
    status: "ACTIVE",
    mustChangePassword: false,
    ranking: "30/2",
    avatar: "etoile:ciel",
    createdAt: d("2026-09-01T10:00:00Z"),
    passwordChangedAt: null,
  },
  tags: ["Groupe compétition", "Avancés"],
  rankingChanges: [{ from: null, to: "30/2", effectiveAt: d("2026-09-01T10:00:00Z") }],
  enrollments: [{ startingRanking: "30/2", matchGoal: 10, createdAt: d("2026-09-02T10:00:00Z"), season: { slug: "race-2026", title: "Race 2026", status: "OPEN" } }],
  matches: [
    match({}),
    // déclaré par l'adversaire : le joueur est côté B
    match({
      id: "m2",
      playerAId: "other",
      playerA: { pseudo: "Lob" },
      playerBId: "me",
      playerB: { pseudo: "AceDuMatin" },
      winner: "A",
      score: "6/2 7-5",
      rankingA: "30/1",
      rankingB: "30/2",
      status: "REFUSED",
      refusalReason: "Doublon",
      validatedAt: null,
      entries: [],
    }),
    match({ id: "m3", playerBId: null, playerB: null, externalLabel: "Club voisin", externalRanking: "30", rankingB: null, score: null, kind: "WALKOVER", tournament: "Open d'automne", entries: [] }),
  ],
  audit: [{ at: d("2026-09-01T10:00:00Z"), actorPseudo: "admin.demo", type: "Compte", action: "Compte créé", target: "AceDuMatin" }],
  sessions: [{ createdAt: d("2026-11-10T08:00:00Z"), expiresAt: d("2026-12-10T08:00:00Z") }],
};

describe("buildPersonalData (FR-802, FR-803)", () => {
  const out = buildPersonalData(raw, d("2026-11-13T12:00:00Z"));

  it("décrit le compte sans aucun secret", () => {
    expect(out.compte).toEqual({
      pseudo: "AceDuMatin",
      role: "joueur",
      statut: "actif",
      classement_actuel: "30/2",
      avatar: "etoile:ciel",
      cree_le: "2026-09-01T10:00:00.000Z",
      mot_de_passe_change_le: null,
      mot_de_passe_temporaire: false,
    });
    const text = JSON.stringify(out);
    for (const secret of ["passwordHash", "hash", "token", "jeton_", "\"id\""]) expect(text).not.toContain(secret);
    expect(out.genere_le).toBe("2026-11-13T12:00:00.000Z");
  });

  it("trie les étiquettes et reprend historique, saisons, journal et sessions", () => {
    expect(out.etiquettes).toEqual(["Avancés", "Groupe compétition"]);
    expect(out.historique_classement).toEqual([{ date: "2026-09-01T10:00:00.000Z", avant: null, apres: "30/2" }]);
    expect(out.saisons[0]).toMatchObject({ saison: "Race 2026", classement_depart: "30/2", objectif_matchs: 10 });
    expect(out.journal).toEqual([{ date: "2026-09-01T10:00:00.000Z", auteur: "admin.demo", type: "Compte", action: "Compte créé", cible: "AceDuMatin" }]);
    expect(out.sessions).toEqual([{ ouverte_le: "2026-11-10T08:00:00.000Z", expire_le: "2026-12-10T08:00:00.000Z" }]);
  });

  it("présente un match côté A avec ses points", () => {
    expect(out.matchs[0]).toMatchObject({
      cote: "A",
      adversaire: "Lob",
      adversaire_exterieur: false,
      resultat: "victoire",
      score: "6/4 3/6 10-8",
      type: "normal",
      statut: "validé",
      mon_classement: "30/2",
      classement_adversaire: "30/1",
      valide_le: "2026-10-04T09:00:00.000Z",
      points: { points: 30, ecart_echelons: 1, perf: true, victoire: true, version_bareme: 2, detail: [{ label: "Victoire", value: "30 pts" }] },
    });
  });

  it("présente un match côté B du point de vue du joueur", () => {
    expect(out.matchs[1]).toMatchObject({
      cote: "B",
      adversaire: "Lob",
      resultat: "défaite",
      score: "2/6 5-7",
      statut: "refusé",
      motif_refus: "Doublon",
      mon_classement: "30/2",
      classement_adversaire: "30/1",
      valide_le: null,
      points: null,
    });
  });

  it("présente un adversaire extérieur, un forfait et un tournoi", () => {
    expect(out.matchs[2]).toMatchObject({ adversaire: "Club voisin", adversaire_exterieur: true, classement_adversaire: "30", score: null, type: "forfait", tournoi: "Open d'automne" });
  });

  it("libelle admin, compte désactivé, abandon et statuts restants", () => {
    const o = buildPersonalData(
      {
        ...raw,
        account: { ...raw.account, role: "ADMIN", status: "DISABLED", passwordChangedAt: d("2026-10-01T00:00:00Z") },
        matches: [match({ kind: "RETIREMENT", status: "PENDING", winner: "B" }), match({ status: "CANCELLED" })],
      },
      d("2026-11-13T12:00:00Z"),
    );
    expect(o.compte).toMatchObject({ role: "admin", statut: "désactivé", mot_de_passe_change_le: "2026-10-01T00:00:00.000Z" });
    expect(o.matchs.map((m) => [m.type, m.statut, m.resultat])).toEqual([
      ["abandon", "en attente", "défaite"],
      ["normal", "annulé", "victoire"],
    ]);
  });
});

describe("summarize (FR-800)", () => {
  it("compte chaque catégorie", () => {
    expect(Object.fromEntries(summarize(countsOf(raw)).map((c) => [c.label, c.count]))).toEqual({
      Compte: 1,
      "Étiquettes": 2,
      "Historique du classement": 1,
      Saisons: 1,
      Matchs: 3,
      "Points attribués": 1,
      "Actions au journal": 1,
      "Sessions ouvertes": 1,
    });
  });
});

describe("exportFileName (FR-801)", () => {
  it("garde les caractères sûrs", () => {
    expect(exportFileName("AceDuMatin", d("2026-11-13T12:00:00Z"))).toBe("mes-donnees-AceDuMatin-2026-11-13.json");
    expect(exportFileName("élise/../x y", d("2026-11-13T12:00:00Z"))).toBe("mes-donnees-elise_.._x_y-2026-11-13.json");
    expect(exportFileName("", d("2026-11-13T12:00:00Z"))).toBe("mes-donnees-compte-2026-11-13.json");
  });
});
