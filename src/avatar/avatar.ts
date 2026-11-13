// Spec 007 — avatars de profil (alternative compatible avec la constitution III : aucune photo).
// Un avatar est un pictogramme choisi dans une galerie fermée + une couleur de la charte.
// Bibliothèque pure : aucune dépendance à la base ni au framework.

/** FR-701 : pictogrammes au trait (24 × 24), embarqués (aucune ressource tierce). */
export const AVATAR_ICONS = {
  balle: { label: "Balle", svg: '<circle cx="12" cy="12" r="9"/><path d="M5.5 5.8c3 2.5 3 9.9 0 12.4M18.5 5.8c-3 2.5-3 9.9 0 12.4"/>' },
  raquette: {
    label: "Raquette",
    svg: '<ellipse cx="10" cy="9" rx="5.5" ry="6.5" transform="rotate(-45 10 9)"/><path d="M14.2 13.2l6.3 6.3M7.5 6.5l5 5M5.8 10l4 4M10 5.8l4 4"/>',
  },
  trophee: {
    label: "Trophée",
    svg: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4"/><path d="M12 13v4M8 21h8M9 17h6"/>',
  },
  etoile: { label: "Étoile", svg: '<path d="M12 3l2.8 5.8 6.2.9-4.5 4.4 1 6.2L12 17.3l-5.5 3 1-6.2L3 9.7l6.2-.9z"/>' },
  eclair: { label: "Éclair", svg: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>' },
  flamme: { label: "Flamme", svg: '<path d="M12 22a7 7 0 0 0 7-7c0-5-5-7-5-12-3 2-5 5-5 8-1-1-1.6-2-2-3.5C5.5 9.5 5 12 5 15a7 7 0 0 0 7 7z"/>' },
  couronne: { label: "Couronne", svg: '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>' },
  fusee: {
    label: "Fusée",
    svg: '<path d="M12 2c4 3 5 8 4 13H8C7 10 8 5 12 2z"/><circle cx="12" cy="9" r="2"/><path d="M8 13l-3 4v2h3M16 13l3 4v2h-3M10 19l2 3 2-3"/>',
  },
  soleil: {
    label: "Soleil",
    svg: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9L7 7M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
  },
  coeur: { label: "Cœur", svg: '<path d="M12 20s-8-5-8-11a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 6-8 11-8 11z"/>' },
} as const;

/** FR-702 : couleurs de fond (tokens `color.avatar.*`, pictogramme ≥ 4,5:1 sur chacune). */
export const AVATAR_COLORS = {
  terre: "Terre battue",
  sable: "Sable",
  brique: "Brique",
  soleil: "Jaune balle",
  gazon: "Gazon",
  ciel: "Ciel",
  violet: "Court dur",
  marine: "Bleu marine",
} as const;

export type AvatarIcon = keyof typeof AVATAR_ICONS;
export type AvatarColor = keyof typeof AVATAR_COLORS;
export interface Avatar {
  icon: AvatarIcon;
  color: AvatarColor;
}
/** Avatar affiché : choisi par le joueur, ou par défaut (initiale du pseudo). */
export type ShownAvatar = { kind: "icon"; icon: AvatarIcon; color: AvatarColor } | { kind: "initial"; initial: string; color: AvatarColor };

export const ICON_KEYS = Object.keys(AVATAR_ICONS) as AvatarIcon[];
export const COLOR_KEYS = Object.keys(AVATAR_COLORS) as AvatarColor[];

const isIcon = (v: string): v is AvatarIcon => (ICON_KEYS as string[]).includes(v);
const isColor = (v: string): v is AvatarColor => (COLOR_KEYS as string[]).includes(v);

/** FR-704 : seules les valeurs de la galerie sont acceptées (« icône:couleur »). */
export function parseAvatar(raw: string | null | undefined): Avatar | null {
  if (!raw) return null;
  const [icon, color, extra] = raw.split(":");
  if (extra !== undefined || !icon || !color || !isIcon(icon) || !isColor(color)) return null;
  return { icon, color };
}

export function checkAvatar(icon: string, color: string): Avatar | null {
  return isIcon(icon) && isColor(color) ? { icon, color } : null;
}

export function formatAvatar(a: Avatar): string {
  return `${a.icon}:${a.color}`;
}

/** FR-703 : avatar par défaut, stable pour un pseudo donné (sans distinction de casse). */
export function defaultAvatar(pseudo: string): ShownAvatar {
  const key = pseudo.toLocaleLowerCase("fr");
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.codePointAt(0)!) >>> 0;
  const first = [...pseudo.trim()][0];
  return { kind: "initial", initial: first ? first.toLocaleUpperCase("fr") : "?", color: COLOR_KEYS[h % COLOR_KEYS.length]! };
}

export function shownAvatar(pseudo: string, stored: string | null | undefined): ShownAvatar {
  const a = parseAvatar(stored);
  return a ? { kind: "icon", ...a } : defaultAvatar(pseudo);
}
