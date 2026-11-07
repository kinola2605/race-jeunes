# Quickstart — validation manuelle de la v1

Prérequis : `docker compose up --build` (démo chargée) puis <http://localhost:3000>.

1. **Accès fermé (US1)** : la page de connexion ne propose aucun lien d'inscription. Saisir un pseudo
   inconnu puis `admin.demo` avec un mauvais mot de passe : même message. Se connecter `admin.demo` /
   `demo-admin-2026`.
2. **Compte (US2)** : Joueurs → Nouveau joueur → pseudo `Essai1`, 30/2, engagé dans « Race jeunes 2026-2027 ».
   Noter le mot de passe affiché une seule fois (copier / imprimer la fiche).
3. **Première connexion** : dans une fenêtre privée, se connecter `Essai1` avec ce mot de passe → changement
   obligatoire → tableau de bord.
4. **Match (US5)** : Saisir → adversaire `SliceMaster` (30/1), victoire 6/4 6/3 → estimation +20 (perf) →
   Envoyer. Côté admin : Matchs → Valider. Côté joueur : Matchs → détail du calcul (barème v1).
5. **Barème (US3)** : Saisons → Race jeunes 2026-2027 → Barème → passer « +1 » de 20 à 25 → Enregistrer le
   brouillon → Simulateur (25 vs 20) → Impact (matchs et rangs impactés) → Publier et recalculer. Vérifier
   l'entrée « Recalcul appliqué » dans le Journal. Le barème de « Race jeunes 2025-2026 » est inchangé.
6. **Saison (US3)** : Nouvelle saison en dupliquant le barème de 2026-2027 → Engagements → sélection rapide
   « Groupe B » → Engager → Ouvrir. Clôturer une saison : saisie de l'identifiant exigée.
7. **Suivi (US7)** : tableau de bord admin, exports CSV, journal filtrable.
8. **PWA (US8)** : Mon compte → thème clair ; installer l'application depuis le navigateur mobile.
