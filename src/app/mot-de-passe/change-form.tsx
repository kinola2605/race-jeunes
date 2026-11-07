"use client";
import { useActionState, useState } from "react";
import { changePasswordAction } from "@/app/actions/auth";
import { PasswordInput, SubmitButton } from "@/components/forms";
import { Alert, Icon } from "@/components/ui";

export function ChangePasswordForm({ pseudo, forced }: { pseudo: string; forced: boolean }) {
  const [state, action] = useActionState(changePasswordAction, undefined);
  const [value, setValue] = useState("");
  const rules = [
    { ok: value.length >= 10, label: "Au moins 10 caractères" },
    { ok: value.length > 0 && !value.toLowerCase().includes(pseudo.toLowerCase()), label: "Ne contient pas votre pseudo" },
  ];
  return (
    <form action={action} noValidate>
      {state?.error ? <div className="mb-4"><Alert kind="ko" title={state.error} /></div> : null}
      {state?.ok ? <div className="mb-4"><Alert kind="ok" title={state.ok} /></div> : null}
      <div className="field">
        <label htmlFor="current">{forced ? "Mot de passe temporaire" : "Mot de passe actuel"}</label>
        <PasswordInput id="current" name="current" autoComplete="current-password" />
      </div>
      <div className="field">
        <label htmlFor="next">Nouveau mot de passe</label>
        <PasswordInput id="next" name="next" autoComplete="new-password" describedBy="rules" onValueChange={setValue} />
        <ul className="pw-rules" id="rules" aria-label="Règles du mot de passe">
          {rules.map((r) => (
            <li key={r.label} className={r.ok ? "ok" : "todo"}>
              <Icon name={r.ok ? "check" : "clock"} />
              <span>{r.label}</span>
            </li>
          ))}
          <li className="todo">
            <Icon name="info" />
            <span>Différent de l&apos;actuel. Conseil : une phrase de 3-4 mots est plus simple à retenir.</span>
          </li>
        </ul>
      </div>
      <div className="field">
        <label htmlFor="confirm">Confirmer le nouveau mot de passe</label>
        <PasswordInput id="confirm" name="confirm" autoComplete="new-password" />
      </div>
      <SubmitButton className="btn btn-primary btn-block">{forced ? "Enregistrer et continuer" : "Enregistrer"}</SubmitButton>
    </form>
  );
}
