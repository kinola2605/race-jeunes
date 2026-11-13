/**
 * Contrôle du logo déposé par l'admin (spec 003) : type reconnu d'après le contenu, taille bornée.
 * Module pur, testable sans serveur.
 */
export const LOGO_MAX_BYTES = 512 * 1024;

export type LogoType = "image/png" | "image/jpeg" | "image/webp" | "image/svg+xml";

const startsWith = (b: Uint8Array, sig: number[], offset = 0) => sig.every((v, i) => b[offset + i] === v);

/** Type réel du fichier d'après ses premiers octets ; null si non reconnu. */
export function sniffLogoType(bytes: Uint8Array): LogoType | null {
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8))
    return "image/webp";
  // SVG : texte UTF-8 dont la racine est <svg> (prologue XML, commentaires et doctype tolérés ;
  // TextDecoder retire lui-même une éventuelle marque d'ordre des octets).
  const head = new TextDecoder("utf-8", { fatal: false }).decode(bytes.subarray(0, 4096));
  const body = head.replace(/^\s*(<\?xml[\s\S]*?\?>\s*)?((<!--[\s\S]*?-->|<!DOCTYPE[^>]*>)\s*)*/i, "");
  if (/^<svg[\s>]/i.test(body)) return "image/svg+xml";
  return null;
}

export type LogoCheck = { ok: true; type: LogoType } | { ok: false; error: string };

export function checkLogo(bytes: Uint8Array): LogoCheck {
  if (bytes.length === 0) return { ok: false, error: "Choisissez un fichier de logo." };
  if (bytes.length > LOGO_MAX_BYTES)
    return { ok: false, error: `Logo trop lourd (${Math.ceil(bytes.length / 1024)} Ko) : 512 Ko au plus.` };
  const type = sniffLogoType(bytes);
  if (!type) return { ok: false, error: "Format non reconnu : PNG, JPEG, WebP ou SVG attendu." };
  return { ok: true, type };
}
