# Le barème expliqué

Comment un match devient des points. Chaque saison a **son** barème, réglé par l'admin dans
**Saison → Barème** ([Guide de l'admin § Barème](guide-admin.md#4-barème)). Les valeurs ci-dessous sont celles
du **barème de démonstration** « Race jeunes 2026-2027 » : celles de votre club peuvent être différentes.

## 1. L'écart de classement

Tout part de l'**écart** entre les deux joueurs, compté en échelons sur l'échelle des classements FFT :

```
NC · 40 · 30/5 · 30/4 · 30/3 · 30/2 · 30/1 · 30 · 15/5 · 15/4 · 15/3 · 15/2 · 15/1 · 15 · 5/6 · 4/6 · 3/6 · 2/6 · 1/6 · 0 · -2/6 · -4/6 · -15 · -30
```

**Écart = échelon de l'adversaire − échelon du joueur.** Il est positif quand l'adversaire est mieux classé.

| Joueur | Adversaire | Écart |
|---|---|---|
| 30/2 | 30/1 | +1 |
| 30/2 | 30/2 | 0 |
| 30/2 | 30/4 | −2 |
| 30/2 | 15/4 | +4 ou plus |

Au-delà de 4 échelons, l'écart est ramené à « +4 ou plus » ou « −4 ou moins ».

Une **perf** est une victoire avec un écart positif : tu as battu mieux classé que toi.

## 2. La table de points

Deux lignes : ce que rapporte une **victoire** et ce que rapporte une **défaite**, selon l'écart.

| Écart | −4 ou moins | −3 | −2 | −1 | 0 | +1 | +2 | +3 | +4 ou plus |
|---|---|---|---|---|---|---|---|---|---|
| **Victoire** | 2 | 2 | 4 | 6 | 10 | 20 | 30 | 40 | 50 |
| **Défaite** | 0 | 0 | 0 | 0 | 1 | 2 | 2 | 2 | 2 |

*(barème de démonstration)*

Une défaite ne retire jamais de points. Ici, perdre contre mieux classé rapporte même 2 points : jouer
au-dessus de son niveau est encouragé.

Quand le match oppose deux engagés de la Race, **chacun** reçoit ses points, calculés de son point de vue.

## 3. Les cas particuliers

Ils se règlent dans les onglets « Table » et « Paramètres » de l'éditeur.

| Règle | Effet | Démonstration |
|---|---|---|
| **Table complète** (surcharge) | Une valeur fixée pour un couple précis, par exemple « victoire d'un 30/2 contre un 15/5 ». Elle remplace la valeur de la table par écart pour ce couple | aucune |
| **Non-classés** | Un NC est compté comme un 40, ou garde son propre échelon en dessous de 40 | comme 40 |
| **Victoire par forfait** | Points fixes pour le vainqueur ; le perdant a 0. Un forfait n'est jamais une perf | 0 |
| **Abandon** | Compté comme une victoire normale pour le vainqueur | — |
| **Plafond par match** | Les points d'un match sont ramenés à ce maximum | 60 |
| **Bonus d'assiduité** | +P points tous les N matchs validés | +5 tous les 5 matchs |
| **Bonus tournoi** | +P points par victoire à partir de la N-ième dans un même tournoi | +10 à partir de la 2e |

## 4. Dans quel ordre

Pour **un match** :

1. Forfait ? Le vainqueur reçoit les points « victoire par forfait », le perdant 0. Le calcul s'arrête là.
2. Sinon, existe-t-il une valeur dans la table complète pour ce couple de classements ? Elle s'applique.
3. Sinon, la table par écart s'applique.
4. Le résultat est ramené au plafond par match, s'il y en a un.

Pour **le total de la saison** :

> **Total = points des matchs validés + bonus d'assiduité + bonus tournoi**

Les deux bonus s'ajoutent au total : ils ne sont pas soumis au plafond par match.

## 5. Exemples

Avec le barème de démonstration.

**Une perf.** AceDuMatin (30/2) bat SliceMaster (30/1) 6/4 6/3. Écart +1 : AceDuMatin marque **20 points**.
SliceMaster perd avec un écart de −1 : **0 point**.

**Une victoire logique.** Un 30/2 bat un 30/4. Écart −2 : **4 points**.

**Une défaite contre plus fort.** Un 30/2 perd contre un 30. Écart +2 : **2 points** quand même.

**Un forfait.** Victoire par forfait : **0 point** dans ce barème, et pas de perf même si l'adversaire était
mieux classé.

**L'assiduité.** Au 5e match validé : **+5**. Au 10e : +5 encore, soit 10 points de bonus au total. Les
défaites comptent comme les victoires.

**Un tournoi.** Trois victoires dans le « Tournoi de Noël » : la 2e rapporte +10, la 3e +10, soit **20 points
de bonus**. Deux victoires : 10. Une seule : rien. Les victoires par forfait ne comptent pas. « Tournoi de
Noël », « tournoi de noel » et « TOURNOI  DE NOËL » sont le même tournoi : majuscules, accents et espaces sont
ignorés.

## 6. Le classement de référence

Quel classement utilise-t-on pour un joueur ? C'est un réglage de la saison :

- **Figé** (par défaut) : le classement du joueur le jour de son engagement, pour toute la saison ;
- **Évolutif** : son classement à la date du match.

Pour un adversaire extérieur, c'est le classement saisi dans la déclaration. Les classements utilisés sont
fixés au moment de la validation et conservés avec le match.

## 7. Départager les ex æquo

Points, puis nombre de **perfs**, puis nombre de **victoires**. Si tout est égal, les joueurs partagent le
même rang et le suivant saute une place (1er, 1er, 3e).

## 8. Quand le barème change en cours de saison

Chaque publication crée une **version**. Chaque match garde la version avec laquelle il a été calculé : on
peut toujours expliquer un total. Les matchs passés ne sont recalculés que si l'admin lance un **recalcul**,
après avoir vu son impact. Voir [Guide de l'admin § Barème](guide-admin.md#4-barème).

## 9. Vérifier un calcul

- **Joueur** : Matchs → ouvrir un match validé → détail du calcul.
- **Admin** : onglet **Simulateur** de l'éditeur de barème, ou le détail d'un joueur depuis le classement.

Référence : exigences FR-060 à FR-068 de la [spec 001](../specs/livrees/001-race-jeunes/spec.md) et
[spec 006](../specs/livrees/006-bonus-tournoi/spec.md) (bonus tournoi). Le calcul est fait par
`src/scoring/engine.ts`, couvert à 100 % par les tests.
