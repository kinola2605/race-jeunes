// Spec 008 — espace RGPD : mise en forme des données personnelles d'un compte (accès, portabilité).
// Bibliothèque pure : aucune dépendance à la base ni au framework. Les secrets ne sont jamais lus ici :
// les types d'entrée ne les contiennent pas (FR-803).

import { invertScore } from "@/scoring/score";

export interface RawAccount {
  id: string;
  pseudo: string;
  role: "PLAYER" | "ADMIN";
  status: "ACTIVE" | "DISABLED";
  mustChangePassword: boolean;
  ranking: string | null;
  avatar: string | null;
  createdAt: Date;
  passwordChangedAt: Date | null;
}

export interface RawRankingChange {
  from: string | null;
  to: string;
  effectiveAt: Date;
}

export interface RawEnrollment {
  startingRanking: string;
  matchGoal: number | null;
  createdAt: Date;
  season: { slug: string; title: string; status: string };
}

export interface RawPointsEntry {
  userId: string;
  points: number;
  gap: number;
  isPerf: boolean;
  won: boolean;
  breakdown: unknown;
  ruleSet: { version: number };
}

export interface RawMatch {
  id: string;
  playedOn: Date;
  season: { slug: string; title: string };
  playerAId: string;
  playerA: { pseudo: string };
  playerBId: string | null;
  playerB: { pseudo: string } | null;
  externalLabel: string | null;
  externalRanking: string | null;
  winner: "A" | "B";
  score: string | null;
  kind: "NORMAL" | "WALKOVER" | "RETIREMENT";
  tournament: string | null;
  status: "PENDING" | "VALIDATED" | "REFUSED" | "CANCELLED";
  refusalReason: string | null;
  rankingA: string | null;
  rankingB: string | null;
  createdAt: Date;
  validatedAt: Date | null;
  entries: RawPointsEntry[];
}

export interface RawAuditEntry {
  at: Date;
  actorPseudo: string;
  type: string;
  action: string;
  target: string | null;
}

export interface RawSession {
  createdAt: Date;
  expiresAt: Date;
}

export interface RawPersonalData {
  account: RawAccount;
  tags: string[];
  rankingChanges: RawRankingChange[];
  enrollments: RawEnrollment[];
  matches: RawMatch[];
  audit: RawAuditEntry[];
  sessions: RawSession[];
}

const KIND = { NORMAL: "normal", WALKOVER: "forfait", RETIREMENT: "abandon" } as const;
const STATUS = { PENDING: "en attente", VALIDATED: "validé", REFUSED: "refusé", CANCELLED: "annulé" } as const;

const day = (d: Date) => d.toISOString().slice(0, 10);
const iso = (d: Date | null) => (d ? d.toISOString() : null);

/** FR-802, FR-803 : document exporté (clés en français, valeurs lisibles), du point de vue du compte. */
export function buildPersonalData(raw: RawPersonalData, generatedAt: Date) {
  const { account } = raw;
  const me = account.id;
  return {
    format: "race-jeunes/donnees-personnelles",
    version: 1,
    genere_le: generatedAt.toISOString(),
    avertissement:
      "Données pseudonymes enregistrées par l'application de la Race jeunes pour ce compte. Ni mot de passe, ni jeton de session, ni donnée d'un autre joueur.",
    compte: {
      pseudo: account.pseudo,
      role: account.role === "ADMIN" ? "admin" : "joueur",
      statut: account.status === "ACTIVE" ? "actif" : "désactivé",
      classement_actuel: account.ranking,
      avatar: account.avatar,
      cree_le: account.createdAt.toISOString(),
      mot_de_passe_change_le: iso(account.passwordChangedAt),
      mot_de_passe_temporaire: account.mustChangePassword,
    },
    etiquettes: [...raw.tags].sort((a, b) => a.localeCompare(b, "fr")),
    historique_classement: raw.rankingChanges.map((c) => ({ date: c.effectiveAt.toISOString(), avant: c.from, apres: c.to })),
    saisons: raw.enrollments.map((e) => ({
      saison: e.season.title,
      code: e.season.slug,
      statut: e.season.status,
      classement_depart: e.startingRanking,
      objectif_matchs: e.matchGoal,
      engage_le: e.createdAt.toISOString(),
    })),
    matchs: raw.matches.map((m) => {
      const side = m.playerAId === me ? "A" : "B";
      const mine = m.entries.find((e) => e.userId === me);
      return {
        date: day(m.playedOn),
        saison: m.season.title,
        cote: side,
        adversaire: side === "A" ? (m.playerB?.pseudo ?? m.externalLabel) : m.playerA.pseudo,
        adversaire_exterieur: side === "A" && !m.playerBId,
        resultat: m.winner === side ? "victoire" : "défaite",
        score: m.score ? (side === "A" ? m.score : invertScore(m.score)) : null,
        type: KIND[m.kind],
        tournoi: m.tournament,
        statut: STATUS[m.status],
        motif_refus: m.refusalReason,
        mon_classement: side === "A" ? m.rankingA : m.rankingB,
        classement_adversaire: side === "A" ? (m.rankingB ?? m.externalRanking) : m.rankingA,
        declare_le: m.createdAt.toISOString(),
        valide_le: iso(m.validatedAt),
        points: mine
          ? {
              points: mine.points,
              ecart_echelons: mine.gap,
              perf: mine.isPerf,
              victoire: mine.won,
              version_bareme: mine.ruleSet.version,
              detail: mine.breakdown,
            }
          : null,
      };
    }),
    journal: raw.audit.map((a) => ({ date: a.at.toISOString(), auteur: a.actorPseudo, type: a.type, action: a.action, cible: a.target })),
    sessions: raw.sessions.map((s) => ({ ouverte_le: s.createdAt.toISOString(), expire_le: s.expiresAt.toISOString() })),
  };
}

export type PersonalData = ReturnType<typeof buildPersonalData>;

export interface DataCounts {
  tags: number;
  rankingChanges: number;
  enrollments: number;
  matches: number;
  points: number;
  audit: number;
  sessions: number;
}

/** Nombres par catégorie d'un jeu de données chargé. */
export function countsOf(raw: RawPersonalData): DataCounts {
  return {
    tags: raw.tags.length,
    rankingChanges: raw.rankingChanges.length,
    enrollments: raw.enrollments.length,
    matches: raw.matches.length,
    points: raw.matches.filter((m) => m.entries.some((e) => e.userId === raw.account.id)).length,
    audit: raw.audit.length,
    sessions: raw.sessions.length,
  };
}

/** FR-800 : catégories affichées sur la carte « Mes données », avec leur nombre. */
export function summarize(c: DataCounts) {
  return [
    { label: "Compte", count: 1 },
    { label: "Étiquettes", count: c.tags },
    { label: "Historique du classement", count: c.rankingChanges },
    { label: "Saisons", count: c.enrollments },
    { label: "Matchs", count: c.matches },
    { label: "Points attribués", count: c.points },
    { label: "Actions au journal", count: c.audit },
    { label: "Sessions ouvertes", count: c.sessions },
  ];
}

/** FR-801 : nom du fichier, réduit aux caractères sûrs. */
export function exportFileName(pseudo: string, at: Date): string {
  const safe = pseudo.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9._-]/g, "_") || "compte";
  return `mes-donnees-${safe}-${day(at)}.json`;
}
