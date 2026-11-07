"use client";
import { useActionState } from "react";
import { resetPasswordAction } from "@/app/actions/admin";
import { SubmitButton } from "@/components/forms";
import { Handover } from "@/components/handover";
import { Alert, Icon } from "@/components/ui";

/** FR-024 : nouveau mot de passe temporaire, affiché une seule fois. */
export function ResetPassword({ userId, pseudo }: { userId: string; pseudo: string }) {
  const [state, action] = useActionState(resetPasswordAction, undefined);
  if (state?.handover) {
    return (
      <div className="scrim" role="dialog" aria-modal="true" aria-label={`Nouveau mot de passe de ${pseudo}`}>
        <div className="dialog" style={{ maxHeight: "90vh", overflowY: "auto" }}>
          <Handover {...state.handover} doneHref={`/admin/joueurs/${userId}`} />
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
