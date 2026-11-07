import { hash, verify } from "@node-rs/argon2";
import { randomInt } from "node:crypto";

// argon2id (algorithme 2), paramètres OWASP 2024 : 19 Mio, 2 itérations, 1 fil.
const OPTIONS = { algorithm: 2, memoryCost: 19456, timeCost: 2, parallelism: 1 } as const;

export function hashPassword(password: string): Promise<string> {
  return hash(password, OPTIONS);
}

export async function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  try {
    return await verify(passwordHash, password);
  } catch {
    return false;
  }
}

/** Empreinte factice : vérifiée quand le pseudo n'existe pas, pour un temps de réponse comparable. */
let dummyHash: Promise<string> | undefined;
export async function burnPasswordCheck(password: string): Promise<void> {
  dummyHash ??= hashPassword("pseudo-inexistant-" + Math.random());
  await verifyPassword(await dummyHash, password);
}

// Sans caractères ambigus (0/O, 1/l/I).
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

/** Mot de passe temporaire lisible : 3 groupes de 4 caractères (~70 bits d'entropie). */
export function generateTemporaryPassword(): string {
  const group = () => Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  return `${group()}-${group()}-${group()}`;
}

export type PasswordCheck = { ok: true } | { ok: false; error: string };

/** Règles FR-006. */
export function checkNewPassword(pseudo: string, current: string, next: string): PasswordCheck {
  if (next.length < 10) return { ok: false, error: "Le mot de passe doit contenir au moins 10 caractères." };
  if (next.length > 200) return { ok: false, error: "Le mot de passe est trop long (200 caractères maximum)." };
  if (next === current) return { ok: false, error: "Le nouveau mot de passe doit être différent de l'actuel." };
  if (next.toLowerCase().includes(pseudo.toLowerCase())) {
    return { ok: false, error: "Le mot de passe ne doit pas contenir votre pseudo." };
  }
  return { ok: true };
}
