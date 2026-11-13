import { AVATAR_ICONS, shownAvatar, type AvatarColor, type AvatarIcon } from "@/avatar/avatar";

/**
 * Spec 007 — avatar de profil (pictogramme de la galerie ou initiale du pseudo), jamais une photo.
 * Décoratif : le pseudo est toujours écrit à côté (aria-hidden). Contenu SVG statique et interne.
 */
export function Avatar({ pseudo, avatar, size = "sm" }: { pseudo: string; avatar: string | null | undefined; size?: "sm" | "md" | "lg" }) {
  const a = shownAvatar(pseudo, avatar);
  return (
    <span className={`avatar avatar-${size} av-${a.color}`} aria-hidden="true">
      {a.kind === "icon" ? <AvatarGlyph icon={a.icon} /> : <span className="avatar-initial">{a.initial}</span>}
    </span>
  );
}

export function AvatarGlyph({ icon }: { icon: AvatarIcon }) {
  return <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true" dangerouslySetInnerHTML={{ __html: AVATAR_ICONS[icon].svg }} />;
}

export function AvatarSwatch({ color }: { color: AvatarColor }) {
  return <span className={`avatar avatar-sm av-${color}`} aria-hidden="true" />;
}
