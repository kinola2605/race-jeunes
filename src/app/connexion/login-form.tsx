"use client";
import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import { PasswordInput, SubmitButton } from "@/components/forms";
import { Alert } from "@/components/ui";

export function LoginForm() {
  const [state, action] = useActionState(loginAction, undefined);
  return (
    <form className="court" action={action} noValidate>
      {state?.error ? (
        <div className="mb-4">
          <Alert kind="ko" title={state.error} />
        </div>
      ) : null}
      <div className="field">
        <label htmlFor="pseudo">Pseudo</label>
        <input className="input" id="pseudo" name="pseudo" autoComplete="username" autoCapitalize="none" spellCheck={false} required maxLength={40} />
      </div>
      <div className="field">
        <label htmlFor="password">Mot de passe</label>
        <PasswordInput id="password" name="password" autoComplete="current-password" />
      </div>
      <SubmitButton className="btn btn-primary btn-block" pendingLabel="Connexion…">
        Se connecter
      </SubmitButton>
    </form>
  );
}
