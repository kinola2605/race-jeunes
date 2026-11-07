import "server-only";
import { redirect } from "next/navigation";
import { UserError } from "@/server/services/common";

/** Exécute une action ; une erreur métier redirige avec un message (?erreur=), le succès avec ?ok=. */
export async function run(path: string, fn: () => Promise<string | void>): Promise<never> {
  let ok: string | void;
  try {
    ok = await fn();
  } catch (e) {
    if (e instanceof UserError) redirect(withParam(path, "erreur", e.message));
    throw e;
  }
  redirect(ok ? withParam(path, "ok", ok) : path);
}

function withParam(path: string, key: string, value: string): string {
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}${key}=${encodeURIComponent(value)}`;
}

/** Pour les actions à état (useActionState) : renvoie l'erreur au lieu de rediriger. */
export async function attempt<T>(fn: () => Promise<T>): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    if (e instanceof UserError) return { ok: false, error: e.message };
    throw e;
  }
}

export function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}
