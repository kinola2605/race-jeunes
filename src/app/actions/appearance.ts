"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/server/auth/session";
import { clearLogo, resetColors, setColors, setLogo } from "@/server/services/appearance";
import { UserError } from "@/server/services/common";
import { COLOR_KEYS, type ColorKey } from "@/appearance/colors";
import { run, str } from "./util";

const PATH = "/admin/apparence";

/** Spec 003 — FR-300, FR-304 */
export async function uploadLogoAction(fd: FormData): Promise<void> {
  const admin = await requireAdmin();
  await run(PATH, async () => {
    const file = fd.get("logo");
    if (!(file instanceof File) || file.size === 0) throw new UserError("Choisissez un fichier de logo.");
    await setLogo(admin, new Uint8Array(await file.arrayBuffer()));
    revalidatePath("/", "layout");
    return "Logo enregistré : il est affiché partout dans l'application.";
  });
}

/** Spec 003 — FR-303 */
export async function clearLogoAction(): Promise<void> {
  const admin = await requireAdmin();
  await run(PATH, async () => {
    await clearLogo(admin);
    revalidatePath("/", "layout");
    return "Logo par défaut rétabli.";
  });
}

/** Spec 004 — FR-310 à FR-312 */
export async function saveColorsAction(fd: FormData): Promise<void> {
  const admin = await requireAdmin();
  await run(PATH, async () => {
    const input = Object.fromEntries(COLOR_KEYS.map((k) => [k, str(fd, k)])) as Record<ColorKey, string>;
    await setColors(admin, input);
    revalidatePath("/", "layout");
    return "Couleurs enregistrées.";
  });
}

/** Spec 004 — FR-314 */
export async function resetColorsAction(): Promise<void> {
  const admin = await requireAdmin();
  await run(PATH, async () => {
    await resetColors(admin);
    revalidatePath("/", "layout");
    return "Couleurs par défaut rétablies.";
  });
}
