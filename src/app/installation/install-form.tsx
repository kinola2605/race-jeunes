"use client";
import { useActionState, useState } from "react";
import { installAction } from "@/app/actions/install";
import { PasswordInput, SubmitButton } from "@/components/forms";
import { Alert, Icon, PiiNotice } from "@/components/ui";

export function InstallForm() {
  const [state, action] = useActionState(installAction, undefined);
  const values = state?.values;
  const [pseudo, setPseudo] = useState("");
  const [password, setPassword] = useState("");
  const rules = [
    { ok: password.length >= 10, label: "Au moins 10 caractères" },
    { ok: password.length > 0 && (!pseudo || !password.toLowerCase().includes(pseudo.toLowerCase())), label: "Ne contient pas votre pseudo" },
  ];
  return (
    <form action={action} noValidate key={JSON.stringify(values ?? null) + (state?.error ?? "")}>
      {state?.error ? (
        <div className="mb-4">
          <Alert kind="ko" title={state.error} />
        </div>
      ) : null}

      <h2 className="section-title">1. Code d&apos;installation</h2>
      <div className="field">
        <label htmlFor="code">Code d&apos;installation</label>
        <PasswordInput id="code" name="code" autoComplete="off" describedBy="code-h" />
        <p className="hint" id="code-h">
          Le code choisi au moment du déploiement (variable <code>INSTALL_CODE</code> dans Vercel).
        </p>
      </div>

      <h2 className="section-title">2. Votre club</h2>
      <div className="field">
        <label htmlFor="clubName">Nom du club</label>
        <input className="input" id="clubName" name="clubName" defaultValue={values?.clubName} required maxLength={80} autoComplete="organization" aria-describedby="clubName-h" />
        <p className="hint" id="clubName-h">
          Affiché sur la page de connexion et les fiches. Modifiable ensuite dans Admin → Apparence.
        </p>
      </div>
      <div className="field">
        <label htmlFor="clubShortName">Sigle (facultatif)</label>
        <input className="input" id="clubShortName" name="clubShortName" defaultValue={values?.clubShortName} maxLength={12} aria-describedby="clubShortName-h" />
        <p className="hint" id="clubShortName-h">
          Quelques lettres affichées en haut de chaque page (12 caractères maximum).
        </p>
      </div>

      <h2 className="section-title">3. Votre compte administrateur</h2>
      <div className="field">
        <label htmlFor="pseudo">Pseudo</label>
        <input
          className="input"
          id="pseudo"
          name="pseudo"
          defaultValue={values?.pseudo}
          required
          maxLength={20}
          autoComplete="username"
          aria-describedby="pseudo-h pseudo-pii"
          onChange={(e) => setPseudo(e.target.value)}
        />
        <p className="hint" id="pseudo-h">
          3 à 20 caractères : lettres, chiffres, _ . - &amp; (par exemple <code>admin.club</code>).
        </p>
        <PiiNotice id="pseudo-pii" />
      </div>
      <div className="field">
        <label htmlFor="password">Mot de passe</label>
        <PasswordInput id="password" name="password" autoComplete="new-password" describedBy="rules" onValueChange={setPassword} />
        <ul className="pw-rules" id="rules" aria-label="Règles du mot de passe">
          {rules.map((r) => (
            <li key={r.label} className={r.ok ? "ok" : "todo"}>
              <Icon name={r.ok ? "check" : "clock"} />
              <span>{r.label}</span>
            </li>
          ))}
          <li className="todo">
            <Icon name="info" />
            <span>Conseil : une phrase de 3-4 mots est plus simple à retenir.</span>
          </li>
        </ul>
      </div>
      <div className="field">
        <label htmlFor="confirm">Confirmer le mot de passe</label>
        <PasswordInput id="confirm" name="confirm" autoComplete="new-password" />
      </div>
      <SubmitButton className="btn btn-primary btn-block" pendingLabel="Installation…">
        <Icon name="check" />
        Installer et me connecter
      </SubmitButton>
    </form>
  );
}
