# Spécification — Évolutions demandées par le club (rendez-vous responsable Race)

**Branche** `002-evolutions-club` (à créer) · **Créée** 2026-11-13 · **Statut** Brouillon — préparation du
rendez-vous · **Entrées** : rendez-vous avec le responsable de la Race du club (date : _à compléter_),
v1.2.0 en service.

> Ce document sert **pendant** le rendez-vous (questions, fiches à remplir) puis **après** (base du
> découpage en fonctionnalités `003-…`, `004-…`). Il ne contient aucun choix technique.
> Tout point non tranché est marqué `[NEEDS CLARIFICATION]`. Les exigences de la v1 sont dans
> `specs/livrees/001-race-jeunes/spec.md` (références `FR-xxx`) ; la constitution reste la règle
> (`.specify/memory/constitution.md`).

## 1. Objectifs du rendez-vous

1. **Valider** (ou corriger) les décisions prises par défaut en v1 (§3).
2. **Recueillir** les évolutions souhaitées, en partant du besoin et non de la solution (§4, §5).
3. **Prioriser** et dater par rapport au calendrier sportif (§6).
4. **Repérer tôt** les demandes en conflit avec les principes du projet (§7).

## 2. Ce qui existe aujourd'hui (rappel à montrer)

| Domaine | En production (v1.2.0) |
|---|---|
| Accès | Connexion par pseudo, mot de passe temporaire à changer, aucune inscription libre |
| Comptes | Création unitaire ou par CSV (`pseudo`, `classement`), réinitialisation, désactivation, étiquettes |
| Saisons | Brouillon → Ouverte → Clôturée → Archivée, plusieurs saisons ouvertes possibles |
| Barème | Points par écart d'échelons + surcharges par couple, forfait, plafond, bonus d'assiduité, simulateur, impact avant recalcul |
| Matchs | Déclaration par le joueur, saisie par l'admin, validation / refus avec motif, doublons signalés |
| Classement | Points → perfs → victoires, filtres par étiquette et par série, détail du calcul par match |
| Suivi | Tableau de bord admin, export CSV, journal d'audit |
| Appli | PWA installable, thème sombre / clair, marque blanche (nom et logo du club) |

**Questions de contexte** (pour dimensionner) :

- C-01 · Combien de joueurs engagés par saison ? combien d'admins / enseignants ? `[NEEDS CLARIFICATION]`
- C-02 · Calendrier de la Race : date d'ouverture, date de clôture, temps forts (remise des prix…) ? `[NEEDS CLARIFICATION]`
- C-03 · La Race actuelle tourne-t-elle déjà dans l'appli, ou encore sur le suivi manuel ? `[NEEDS CLARIFICATION]`
- C-04 · Le barème réel de la saison est-il défini ? Qui le saisit ? `[NEEDS CLARIFICATION]`

## 3. Décisions v1 à valider

Décisions prises par défaut (spec 001, §8). Pour chacune : ✅ conservée / ✏️ modifiée (préciser) / ❓ à revoir.

| ID | Décision actuelle | Alternative possible | Verdict | Remarque |
|---|---|---|---|---|
| D-01 | Le joueur déclare, **seul l'admin valide** (FR-100, FR-103) | Rôle « saisisseur » (enseignant qui saisit sans être admin) ; validation par l'adversaire | | |
| D-02 | Classement de référence **figé** à l'engagement par défaut (FR-106) | Évolutif (classement à la date du match) | | |
| D-03 | Classement visible par **tous les joueurs connectés** par défaut (FR-123) | Engagés seulement ; chacun ne voit que son rang | | |
| D-04 | Un joueur **ne voit pas les matchs des autres** (FR-127) | Matchs validés visibles de tous (score, date) | | |
| D-05 | Forfait = **0 point** par défaut, jamais une perf ; abandon = victoire normale | Points de forfait > 0 ; abandon compté différemment | | |
| D-06 | Départage : points → perfs → victoires, sinon **rang partagé** (FR-120) | Autre critère (moins de matchs joués, confrontation directe…) | | |
| D-07 | Mots de passe temporaires **sans expiration** | Expiration après N jours | | |
| D-08 | Pas de saisie hors ligne : page d'information seulement (FR-160) | File de saisie hors ligne | | |
| D-09 | Logo du club utilisé sous réserve d'accord ; licence « tous droits réservés » | Accord formel du club ; choix de licence | | |
| D-10 | Correction après clôture = **réouverture exceptionnelle** tracée (FR-041) | Correction directe sur saison clôturée | | |

## 4. Évolutions déjà identifiées (P3 de la v1)

À présenter pour savoir si elles intéressent le club. Remplir une fiche (§5) pour chaque évolution retenue.

| ID | Évolution | Intérêt club (oui / non / plus tard) |
|---|---|---|
| EV-01 | Rôle **« saisisseur »** : saisit et/ou valide des matchs sans accès à l'administration complète | |
| EV-02 | **Plafond de points par période** (ex. par mois) | |
| EV-03 | **Saisie hors ligne** au bord du court, envoyée au retour du réseau | |
| EV-04 | **Doubles** et/ou **matchs par équipes** | |
| EV-05 | **Expiration** des mots de passe temporaires | |

## 5. Fiches d'évolution (à remplir pendant le rendez-vous)

Une fiche par demande. Recopier le modèle autant que nécessaire (EV-06, EV-07…).

### Modèle

> **EV-xx · Titre court**
>
> - **Besoin / problème à régler** (dans les mots du responsable) :
> - **Qui l'utilise** : ☐ joueur ☐ admin ☐ enseignant / saisisseur ☐ parents ☐ autre :
> - **Sur quel support** : ☐ téléphone au club ☐ ordinateur ☐ les deux
> - **Fréquence** : ☐ à chaque match ☐ chaque semaine ☐ ponctuelle (début / fin de saison)
> - **Comment c'est fait aujourd'hui** (contournement actuel) :
> - **Exemple concret** (un cas réel, avec des pseudos) :
> - **Critère de réussite** (« c'est bon quand… ») :
> - **Échéance** : ☐ avant une date précise : ____ ☐ saison prochaine ☐ quand possible
> - **Priorité ressentie** : ☐ bloquant ☐ important ☐ confort
> - **Effet sur la saison en cours** : ☐ aucun ☐ touche les matchs déjà validés ☐ touche le barème ☐ touche les comptes
> - **Conflit avec un principe (§7)** : ☐ non ☐ oui → lequel :
> - **Questions ouvertes** :

### EV-06 · Logo

- **Spec** : `specs/livrees/003-logo/spec.md`
- **Besoin** : pouvoir configurer un logo côté admin pour remplacer le logo par défaut.

### EV-07 · Couleurs du site

- **Spec** : `specs/livrees/004-couleurs-site/spec.md`
- **Besoin** : possibilité de configurer les deux couleurs principales (thème noir et thème clair) depuis l'interface admin.

### EV-08 · Objectif du nombre de matchs à jouer par saison et par tranche d'âge

- **Spec** : `specs/livrees/005-objectif-matchs/spec.md`
- **Besoin** : objectif du nombre de matchs à jouer par saison et par tranche d'âge — juste un tableau
  côté admin à remplir et un indicateur de suivi pour le joueur.

### EV-09 · Bonus gain tournoi

- **Spec** : `specs/006-bonus-tournoi/spec.md`
- **Besoin** : bonus gain tournoi à prévoir. Plusieurs victoires dans un même tournoi = des points gagnés.

### EV-10 · Photos de profil

- **Spec** : `specs/007-photos-profil/spec.md`
- **Besoin** : prévoir des photos de profil.

### EV-11 · Espace RGPD par joueur

- **Spec** : `specs/008-espace-rgpd/spec.md`
- **Besoin** : espace RGPD par joueur pour récupérer ses données.

### EV-12 · Envoi du mot de passe par e-mail

- **Spec** : `specs/009-envoi-mot-de-passe-email/spec.md`
- **Besoin** : pouvoir envoyer le mot de passe par e-mail à la création du joueur.

### EV-13 · _à compléter_

- **Besoin** :
- **Qui** :
- **Support** :
- **Fréquence** :
- **Aujourd'hui** :
- **Exemple** :
- **Critère de réussite** :
- **Échéance** :
- **Priorité** :
- **Effet sur la saison en cours** :
- **Conflit §7** :
- **Questions ouvertes** :

## 6. Priorisation

À remplir en fin de rendez-vous.

| ID | Évolution | Priorité (bloquant / important / confort) | Échéance | Effort pressenti (S / M / L) | Ordre |
|---|---|---|---|---|---|
| EV-06 | Logo | | | | |
| EV-07 | Couleurs du site | | | | |
| EV-08 | Objectif du nombre de matchs par saison et par tranche d'âge | | | | |
| EV-09 | Bonus gain tournoi | | | | |
| EV-10 | Photos de profil | | | | |
| EV-11 | Espace RGPD par joueur | | | | |
| EV-12 | Envoi du mot de passe par e-mail | | | | |
| | | | | | |

L'effort est estimé **après** le rendez-vous ; ne pas s'engager sur un délai en séance.

## 7. Demandes probables qui heurtent un principe du projet

Demandes fréquentes dans un club, à reconnaître en séance pour proposer tout de suite une alternative
compatible plutôt qu'un refus sec.

| Demande probable | Principe concerné | Alternative compatible |
|---|---|---|
| Classement par **catégorie d'âge** (U10, U12…) | III — pas d'âge ni de date de naissance | Étiquettes libres posées par l'admin (« Groupe U12 ») + filtre existant (FR-121) |
| **Notifications** par e-mail ou SMS | III — pas d'e-mail ni de téléphone | Indicateurs dans l'appli (badge « match validé », « match refusé ») ; notifications push PWA sans donnée personnelle `[NEEDS CLARIFICATION]` |
| **Import automatique** des résultats / classements FFT | III — aucun envoi vers un service externe ; données nominatives côté FFT | Import CSV manuel par l'admin (comme FR-026) |
| **Inscription libre** des joueurs ou lien d'invitation | IV — comptes créés par l'admin uniquement | Import CSV + fiche imprimable des mots de passe (existant) |
| **Photos**, noms réels, profils | III | Pseudo seul ; avatar générique ou couleur choisie |
| **Compte parent** qui suit son enfant | III et IV | Le parent utilise le compte du joueur ; ou rôle « lecture seule » créé par l'admin, sans donnée personnelle `[NEEDS CLARIFICATION]` |
| **Modifier un barème** sans recalcul visible | V — aucun recalcul silencieux | Publication + aperçu d'impact + recalcul explicite (existant) |

## 8. Suites du rendez-vous

1. Compléter ce document à chaud (même en vrac) et lever les `[NEEDS CLARIFICATION]`.
2. Reporter les décisions §3 modifiées dans `specs/livrees/001-race-jeunes/spec.md` (§8 Clarifications) si elles
   changent un comportement existant.
3. **Découper** les évolutions retenues en fonctionnalités indépendantes (`specs/003-…`, `004-…`), chacune
   avec sa spec, son plan et ses tâches, dans l'ordre du §6.
4. Pour une demande en conflit avec la constitution, décider explicitement : alternative compatible, ou
   amendement de la constitution (version mineure ou majeure, tracé).

## 9. Notes libres du rendez-vous

_Tout ce qui ne rentre pas dans les fiches._

-
