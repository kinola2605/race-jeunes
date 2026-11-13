"use client";
import { useState } from "react";
import { AVATAR_COLORS, AVATAR_ICONS, COLOR_KEYS, ICON_KEYS, parseAvatar, type AvatarColor, type AvatarIcon } from "@/avatar/avatar";
import { Avatar, AvatarGlyph } from "@/components/avatar";
import { setAvatarAction } from "@/app/actions/avatar";

/** Spec 007 — FR-705 : galerie fermée de pictogrammes et de couleurs, aperçu immédiat. */
export function AvatarPicker({ pseudo, avatar }: { pseudo: string; avatar: string | null }) {
  const current = parseAvatar(avatar);
  const [icon, setIcon] = useState<AvatarIcon>(current?.icon ?? "balle");
  const [color, setColor] = useState<AvatarColor>(current?.color ?? "terre");
  return (
    <form action={setAvatarAction} className="avatar-picker">
      <div className="avatar-preview">
        <Avatar pseudo={pseudo} avatar={`${icon}:${color}`} size="lg" />
        <p className="small muted mb-0" aria-live="polite">
          Aperçu : {AVATAR_ICONS[icon].label}, {AVATAR_COLORS[color].toLocaleLowerCase("fr")}
        </p>
      </div>
      <fieldset className="avatar-set">
        <legend className="label">Pictogramme</legend>
        <div className="avatar-grid">
          {ICON_KEYS.map((k) => (
            <label key={k} className="avatar-opt">
              <input className="sr-only" type="radio" name="icon" value={k} checked={icon === k} onChange={() => setIcon(k)} />
              <span className={`avatar avatar-md av-${color}`} aria-hidden="true">
                <AvatarGlyph icon={k} />
              </span>
              <span className="sr-only">{AVATAR_ICONS[k].label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="avatar-set">
        <legend className="label">Couleur</legend>
        <div className="avatar-grid">
          {COLOR_KEYS.map((k) => (
            <label key={k} className="avatar-opt">
              <input className="sr-only" type="radio" name="color" value={k} checked={color === k} onChange={() => setColor(k)} />
              <span className={`avatar avatar-md av-${k}`} aria-hidden="true" />
              <span className="sr-only">{AVATAR_COLORS[k]}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="row">
        <button className="btn btn-primary" type="submit">
          Enregistrer mon avatar
        </button>
        {current ? (
          <button className="btn btn-ghost" type="submit" name="reset" value="1">
            Revenir à l&apos;avatar par défaut
          </button>
        ) : null}
      </div>
    </form>
  );
}
