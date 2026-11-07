"use client";
import { useFormStatus } from "react-dom";
import { useState, type ReactNode } from "react";
import { Icon } from "./ui";

export function SubmitButton({ children, className = "btn btn-primary", pendingLabel, ...rest }: { children: ReactNode; className?: string; pendingLabel?: string; name?: string; value?: string; formAction?: (fd: FormData) => void; disabled?: boolean; "aria-label"?: string }) {
  const { pending } = useFormStatus();
  return (
    <button className={className} type="submit" disabled={pending || rest.disabled} aria-busy={pending || undefined} {...rest}>
      {pending ? (pendingLabel ?? "Patientez…") : children}
    </button>
  );
}

export function PasswordInput({ id, name, autoComplete, describedBy, invalid, onValueChange }: { id: string; name: string; autoComplete: string; describedBy?: string; invalid?: boolean; onValueChange?: (v: string) => void }) {
  const [show, setShow] = useState(false);
  return (
    <div className="input-wrap">
      <input
        className="input"
        id={id}
        name={name}
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        required
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        maxLength={200}
        onChange={onValueChange ? (e) => onValueChange(e.target.value) : undefined}
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
  );
}

/** Bouton de confirmation : le formulaire n'est soumis qu'après confirmation explicite. */
export function ConfirmButton({ children, message, className = "btn btn-ghost btn-sm" }: { children: ReactNode; message: string; className?: string }) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}

export function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      className="btn btn-secondary"
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } finally {
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        }
      }}
    >
      <Icon name="copy" />
      <span aria-live="polite">{done ? "Copié" : "Copier"}</span>
    </button>
  );
}

export function PrintButton({ label = "Imprimer la fiche" }: { label?: string }) {
  return (
    <button className="btn btn-secondary" type="button" onClick={() => window.print()}>
      <Icon name="print" />
      {label}
    </button>
  );
}
