/**
 * Spec 009 — message d'identifiants pré-rempli pour la messagerie de l'admin (lien `mailto:`).
 *
 * Constitution III : l'application ne demande, ne reçoit et ne stocke aucune adresse e-mail et n'appelle
 * aucun service d'envoi. Le lien est ouvert localement par le navigateur ; l'admin saisit le destinataire
 * dans sa propre messagerie. Fonction pure (aucune dépendance au navigateur ni au serveur).
 */
export type CredentialsMail = {
  appName: string;
  clubName?: string;
  pseudo: string;
  password: string;
  /** Adresse de l'application (origine du site), ex. https://race.example.org */
  appUrl: string;
};

export function credentialsMailSubject({ appName }: Pick<CredentialsMail, "appName">): string {
  return `${appName} — vos identifiants`;
}

export function credentialsMailBody({ appName, clubName, pseudo, password, appUrl }: CredentialsMail): string {
  const lines = [
    "Bonjour,",
    "",
    `Voici vos identifiants pour l'application ${appName}${clubName ? ` (${clubName})` : ""}.`,
    "",
    `Adresse : ${appUrl}`,
    `Pseudo : ${pseudo}`,
    `Mot de passe temporaire : ${password}`,
    "",
    "1. Ouvrez l'application et connectez-vous avec ce pseudo et ce mot de passe.",
    "2. Choisissez immédiatement votre mot de passe personnel : le mot de passe temporaire ne fonctionnera plus ensuite.",
    "",
    "Ne notez jamais votre nom réel dans l'application. Supprimez ce message après votre première connexion.",
  ];
  return lines.join("\r\n");
}

/** Lien `mailto:` sans destinataire : l'adresse est choisie dans la messagerie de l'admin, jamais par l'app. */
export function credentialsMailto(mail: CredentialsMail): string {
  const q = (s: string) => encodeURIComponent(s);
  return `mailto:?subject=${q(credentialsMailSubject(mail))}&body=${q(credentialsMailBody(mail))}`;
}
