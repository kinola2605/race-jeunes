"use client";
import { useActionState, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { loginAction } from "@/app/actions/auth";
import { SubmitButton } from "@/components/forms";
import { Alert, Icon } from "@/components/ui";

type Missing = { pseudo?: boolean; password?: boolean };

/** Spec 017 — FR-1704 à FR-1707. Sans JavaScript, le formulaire s'envoie tel quel et le serveur vérifie tout. */
export function LoginForm() {
  const [state, action] = useActionState(loginAction, undefined);
  const [missing, setMissing] = useState<Missing>({});
  const [show, setShow] = useState(false);
  const [caps, setCaps] = useState(false);
  const pseudoRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // FR-1707 : focus initial seulement avec souris et clavier (pas de clavier virtuel qui masque la page).
  useEffect(() => {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) pseudoRef.current?.focus();
  }, []);

  // FR-1704 : après un échec, le pseudo est conservé et l'on retape directement le mot de passe.
  useEffect(() => {
    if (!state?.error) return;
    if (state.pseudo) passwordRef.current?.focus();
    else pseudoRef.current?.focus();
  }, [state]);

  // FR-1705 : un champ vide est signalé sur place, sans requête (donc sans échec compté).
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    const m: Missing = { pseudo: !pseudoRef.current?.value.trim(), password: !passwordRef.current?.value };
    setMissing(m);
    if (m.pseudo || m.password) {
      e.preventDefault();
      (m.pseudo ? pseudoRef : passwordRef).current?.focus();
    }
  }

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => setCaps(e.getModifierState("CapsLock"));
  const passwordHints = [missing.password ? "password-e" : null, caps ? "password-caps" : null].filter(Boolean).join(" ");

  return (
    <form className="court" action={action} onSubmit={onSubmit} noValidate>
      {state?.error ? (
        <div className="mb-4">
          <Alert kind="ko" title={state.error} />
        </div>
      ) : null}
      <div className={`field${missing.pseudo ? " field-invalid" : ""}`}>
        <label htmlFor="pseudo">Pseudo</label>
        <input
          ref={pseudoRef}
          className="input"
          id="pseudo"
          name="pseudo"
          key={state?.pseudo ?? ""}
          defaultValue={state?.pseudo}
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="next"
          required
          maxLength={40}
          aria-invalid={missing.pseudo || undefined}
          aria-describedby={missing.pseudo ? "pseudo-e" : undefined}
          onChange={() => missing.pseudo && setMissing((m) => ({ ...m, pseudo: false }))}
        />
        {missing.pseudo ? (
          <p className="field-error" id="pseudo-e">
            <Icon name="alert" />
            <span>Saisissez votre pseudo.</span>
          </p>
        ) : null}
      </div>
      <div className={`field${missing.password ? " field-invalid" : ""}`}>
        <label htmlFor="password">Mot de passe</label>
        <div className="input-wrap">
          <input
            ref={passwordRef}
            className="input"
            id="password"
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            enterKeyHint="go"
            required
            maxLength={200}
            aria-invalid={missing.password || undefined}
            aria-describedby={passwordHints || undefined}
            onChange={() => missing.password && setMissing((m) => ({ ...m, password: false }))}
            onKeyDown={onKey}
            onKeyUp={onKey}
            onBlur={() => setCaps(false)}
          />
          <button
            className="icon-btn"
            type="button"
            aria-pressed={show}
            aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            onClick={() => setShow((s) => !s)}
          >
            <Icon name={show ? "eye-off" : "eye"} />
          </button>
        </div>
        {missing.password ? (
          <p className="field-error" id="password-e">
            <Icon name="alert" />
            <span>Saisissez votre mot de passe.</span>
          </p>
        ) : null}
        {caps ? (
          <p className="field-warn" id="password-caps" role="status">
            <Icon name="alert" />
            <span>Verrouillage des majuscules activé</span>
          </p>
        ) : null}
      </div>
      <SubmitButton className="btn btn-primary btn-block" pendingLabel="Connexion…">
        Se connecter
      </SubmitButton>
    </form>
  );
}
