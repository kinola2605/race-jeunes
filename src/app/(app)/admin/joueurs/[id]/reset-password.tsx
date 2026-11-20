"use client";
import { useActionState, useState } from "react";
import { resetPasswordAction } from "@/app/actions/admin";
import { SubmitButton } from "@/components/forms";
import { Handover } from "@/components/handover";
import { Alert, Icon } from "@/components/ui";

/** FR-024 : nouveau mot de passe temporaire, affiché une seule fois. */
export function ResetPassword({ userId, pseudo }: { userId: string; pseudo: string }) {
  const [state, action] = useActionState(resetPasswordAction, undefined);
  // « Terminer » ferme la fenêtre : un lien vers la même page ne remonte pas le composant, l'état resterait affiché.
  const [closed, setClosed] = useState<typeof state>(undefined);
  if (state?.handover && closed !== state) {
    return (
      <div className="scrim" role="dialog" aria-modal="true" aria-label={`Nouveau mot de passe de ${pseudo}`}>
        <div className="dialog" style={{ maxHeight: "90vh", overflowY: "auto" }}>
          <Handover {...state.handover} onDone={() => setClosed(state)} />
        </div>
      </div>
    );
  }
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(`Réinitialiser le mot de passe de ${pseudo} ? Ses sessions seront coupées.`)) e.preventDefault();
      }}
    >
      {state?.error ? <Alert kind="ko" title={state.error} /> : null}
      <input type="hidden" name="userId" value={userId} />
      <SubmitButton className="btn btn-secondary">
        <Icon name="refresh" />
        Réinitialiser le mot de passe
      </SubmitButton>
    </form>
  );
}
