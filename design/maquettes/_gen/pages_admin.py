PII = '<p class="notice-pii">{{i:shield}}<span><strong>Ne saisissez aucune donnée personnelle</strong> (nom réel, etc.).</span></p>'

SUIVI = """
<div class="page-head">
  <span class="eyebrow">Tableau de bord · Race jeunes 2026-2027</span>
  <h1 class="page-title">Suivi</h1>
</div>

<div class="cases cases-4 stats">
  <a class="case" href="12b-validation.html" style="text-decoration:none"><span class="stat-label">Matchs à valider</span><span class="stat-value" style="color:var(--warning)">6</span><span class="small subtle">{{i:clock}} le plus ancien : 4 j</span></a>
  <a class="case" href="#anomalies" style="text-decoration:none"><span class="stat-label">Anomalies</span><span class="stat-value" style="color:var(--error)">2</span><span class="small subtle">{{i:alert}} à vérifier</span></a>
  <a class="case" href="#mdp" style="text-decoration:none"><span class="stat-label">Mdp temporaires</span><span class="stat-value">4</span><span class="small subtle">{{i:key}} jamais changés</span></a>
  <a class="case" href="#sans-match" style="text-decoration:none"><span class="stat-label">Sans match</span><span class="stat-value">5</span><span class="small subtle">{{i:users}} sur 23 engagés</span></a>
</div>

<div class="layout-2">
<section class="section" aria-labelledby="t-valider">
  <div class="row-between mb-4"><h2 class="section-title mb-0" id="t-valider">À valider</h2><a class="link small" href="12b-validation.html">Tout voir (6)</a></div>
  <ul class="list">
    <li><div class="item"><div class="item-main"><div class="item-title">Volée92 <span class="subtle small">30/4</span> <span class="subtle">vs</span> AceDuMatin <span class="subtle small">30/2</span></div><div class="item-meta">5 nov. · 2/6 5/7 · vainqueur AceDuMatin · saisi par AceDuMatin</div></div>
      <div class="row" style="gap:6px"><button class="btn btn-secondary btn-sm" type="button" aria-label="Valider le match Volée92 contre AceDuMatin">{{i:check}}Valider</button><button class="btn btn-ghost btn-sm" type="button" aria-label="Refuser">{{i:x}}</button></div></div></li>
    <li><div class="item"><div class="item-main"><div class="item-title">TopSpinou <span class="subtle small">30/2</span> <span class="subtle">vs</span> Ext. · TC voisin, interclubs <span class="subtle small">30/1</span></div><div class="item-meta">4 nov. · 6/4 3/6 10-8 · vainqueur TopSpinou · saisi par TopSpinou</div></div>
      <div class="row" style="gap:6px"><button class="btn btn-secondary btn-sm" type="button">{{i:check}}Valider</button><button class="btn btn-ghost btn-sm" type="button" aria-label="Refuser">{{i:x}}</button></div></div></li>
    <li><div class="item"><div class="item-main"><div class="item-title">SmashTonic <span class="subtle small">30</span> <span class="subtle">vs</span> LiftCroisé <span class="subtle small">15/5</span></div><div class="item-meta">3 nov. · 7/6 6/4 · vainqueur SmashTonic · saisi par admin.club</div></div>
      <div class="row" style="gap:6px"><button class="btn btn-secondary btn-sm" type="button">{{i:check}}Valider</button><button class="btn btn-ghost btn-sm" type="button" aria-label="Refuser">{{i:x}}</button></div></div></li>
  </ul>
</section>

<section class="section" id="anomalies" aria-labelledby="t-ano">
  <h2 class="section-title" id="t-ano">Anomalies</h2>
  <div class="stack" style="--gap:var(--s-3)">
    <div class="alert alert-ko">{{i:alert}}<div class="alert-body"><span class="alert-title">Doublon probable</span><p class="small">Revers2Feu vs PetitPont, 2 nov. : deux saisies (une par chaque joueur), scores identiques.</p><a class="link small" href="12b-validation.html">Fusionner ou refuser</a></div></div>
    <div class="alert alert-warn">{{i:alert}}<div class="alert-body"><span class="alert-title">Classement adversaire manquant</span><p class="small">Ext. « Tournoi des Érables » (saisi par AmortiZen le 30 oct.) : classement non renseigné, traité comme NC.</p><a class="link small" href="12b-validation.html">Compléter</a></div></div>
  </div>
</section>

<section class="section" id="mdp" aria-labelledby="t-mdp">
  <h2 class="section-title" id="t-mdp">Mots de passe temporaires jamais changés</h2>
  <ul class="list">
    <li><div class="item"><span class="badge badge-wait">{{i:key}}Temporaire</span><div class="item-main"><div class="item-title">FiletMignon</div><div class="item-meta">remis il y a 21 j · jamais connecté</div></div><a class="btn btn-ghost btn-sm" href="08c-admin-remise-mdp.html">{{i:refresh}}Réinitialiser</a></div></li>
    <li><div class="item"><span class="badge badge-wait">{{i:key}}Temporaire</span><div class="item-main"><div class="item-title">LigneDeFond</div><div class="item-meta">remis il y a 12 j</div></div><a class="btn btn-ghost btn-sm" href="08c-admin-remise-mdp.html">{{i:refresh}}Réinitialiser</a></div></li>
    <li><div class="item"><span class="badge badge-wait">{{i:key}}Temporaire</span><div class="item-main"><div class="item-title">JeuBlanc</div><div class="item-meta">remis il y a 3 j</div></div><a class="btn btn-ghost btn-sm" href="08c-admin-remise-mdp.html">{{i:refresh}}Réinitialiser</a></div></li>
    <li><div class="item"><span class="badge badge-wait">{{i:key}}Temporaire</span><div class="item-main"><div class="item-title">Chip&amp;Charge</div><div class="item-meta">remis hier</div></div><a class="btn btn-ghost btn-sm" href="08c-admin-remise-mdp.html">{{i:refresh}}Réinitialiser</a></div></li>
  </ul>
</section>

<section class="section" id="sans-match" aria-labelledby="t-sm">
  <h2 class="section-title" id="t-sm">Engagés sans match validé</h2>
  <div class="chips" style="flex-wrap:wrap">
    <span class="chip">FiletMignon · 40</span><span class="chip">LigneDeFond · 30/5</span><span class="chip">DoubleFaute · 30/4</span><span class="chip">JeuBlanc · NC</span><span class="chip">PassingShot · 30/3</span>
  </div>
</section>
</div>

<div class="actions"><a class="btn btn-secondary" href="#">{{i:download}}Exporter le classement (CSV)</a><a class="btn btn-secondary" href="#">{{i:download}}Exporter les matchs (CSV)</a></div>
"""

JOUEURS_ROWS = [
    ("AceDuMatin", "30/2", "Groupe B", "ok", "2"),
    ("AmortiZen", "30/1", "Groupe A", "ok", "3"),
    ("Chip&amp;Charge", "40", "—", "tmp", "1"),
    ("DoubleFaute", "30/4", "Groupe B", "ok", "2"),
    ("FiletMignon", "40", "—", "tmp", "1"),
    ("LiftCroisé", "15/5", "Groupe A", "ok", "3"),
    ("LobFantôme", "30/3", "—", "off", "2"),
    ("PetitPont", "30/3", "Groupe B", "ok", "1"),
]


def joueurs_table():
    rows = []
    for ps, cl, tag, st, n in JOUEURS_ROWS:
        badge = {"ok": '<span class="badge badge-ok">{{i:check}}Actif</span>',
                 "tmp": '<span class="badge badge-wait">{{i:key}}Mdp temporaire</span>',
                 "off": '<span class="badge badge-off">{{i:lock}}Désactivé</span>'}[st]
        act = ('<button class="btn btn-ghost btn-sm" type="button">Réactiver</button>' if st == "off"
               else '<a class="btn btn-ghost btn-sm" href="08c-admin-remise-mdp.html">{{i:refresh}}Mdp</a><button class="btn btn-ghost btn-sm" type="button">Désactiver</button>')
        tagh = f'<span class="badge badge-tag">{tag}</span>' if tag != "—" else '<span class="subtle">—</span>'
        rows.append(f'<tr{" class=\"is-off\"" if st=="off" else ""}><td class="strong">{ps}</td><td>{cl}</td><td>{tagh}</td><td>{badge}</td><td class="num">{n}</td>'
                    f'<td><div class="row" style="gap:4px;flex-wrap:nowrap"><a class="btn btn-ghost btn-sm" href="08b-admin-joueur-nouveau.html">{{{{i:edit}}}}<span class="sr-only">Modifier {ps}</span></a>{act}</div></td></tr>')
    return "\n".join(rows)


def joueurs_list():
    out = []
    for ps, cl, tag, st, n in JOUEURS_ROWS:
        badge = {"ok": "", "tmp": ' <span class="badge badge-wait">{{i:key}}Mdp temporaire</span>', "off": ' <span class="badge badge-off">{{i:lock}}Désactivé</span>'}[st]
        out.append(f'<li><a class="item" href="08b-admin-joueur-nouveau.html"><div class="item-main"><div class="item-title">{ps}{badge}</div><div class="item-meta">{cl} · {tag} · {n} saison(s)</div></div><span class="chev">{{{{i:chev-r}}}}</span></a></li>')
    return "\n".join(out)


JOUEURS = """
<div class="page-head">
  <span class="eyebrow">Comptes</span>
  <h1 class="page-title">Joueurs</h1>
  <p class="lead small">38 comptes · 34 actifs · 4 désactivés. Seul l'admin peut créer un compte.</p>
</div>
<div class="row mb-4">
  <a class="btn btn-primary" href="08b-admin-joueur-nouveau.html">{{i:plus}}Nouveau joueur</a>
  <a class="btn btn-secondary" href="08d-admin-import-csv.html">{{i:upload}}Importer un CSV</a>
</div>
<div class="toolbar">
  <div class="search"><label for="q" class="sr-only">Rechercher un pseudo</label>{{i:search}}<input class="input" id="q" type="search" placeholder="Rechercher un pseudo"></div>
</div>
<div class="chips mb-4" role="group" aria-label="Filtrer">
  <button class="chip" type="button" aria-pressed="true">Actifs (34)</button>
  <button class="chip" type="button" aria-pressed="false">{{i:key}}Mdp temporaire (4)</button>
  <button class="chip" type="button" aria-pressed="false">{{i:lock}}Désactivés (4)</button>
  <button class="chip" type="button" aria-pressed="false">{{i:tag}}Groupe A</button>
  <button class="chip" type="button" aria-pressed="false">{{i:tag}}Groupe B</button>
</div>
<ul class="list hide-tablet-up">
""" + joueurs_list() + """
</ul>
<div class="table-wrap hide-mobile">
<table class="table">
  <caption class="sr-only">Liste des joueurs</caption>
  <thead><tr><th>Pseudo</th><th>Classement</th><th>Étiquettes</th><th>Statut</th><th class="num">Saisons</th><th>Actions</th></tr></thead>
  <tbody>
""" + joueurs_table() + """
  </tbody>
</table>
</div>
<p class="small subtle mt-4">Un joueur ayant un historique ne peut pas être supprimé : il est désactivé (sessions coupées immédiatement, classements passés conservés).</p>
"""

NOUVEAU = """
<div class="page-head">
  <span class="eyebrow"><a class="link" href="08a-admin-joueurs.html">Joueurs</a> / Nouveau</span>
  <h1 class="page-title">Nouveau joueur</h1>
</div>
<div class="layout-main-side">
<form action="08c-admin-remise-mdp.html" method="get" novalidate>
  <div class="field">
    <label for="pseudo">Pseudo <span class="req" aria-hidden="true">*</span></label>
    <input class="input" id="pseudo" required aria-describedby="pseudo-ok pseudo-pii" value="PetitPont" autocapitalize="none" spellcheck="false">
    <p class="hint" id="pseudo-ok" style="color:var(--success)">{{i:check}} Disponible</p>
    <div id="pseudo-pii">""" + PII + """</div>
    <p class="hint">3 à 20 caractères, unique. Le joueur ne pourra pas le modifier.</p>
  </div>
  <div class="field">
    <label for="cl">Classement FFT <span class="req" aria-hidden="true">*</span></label>
    <select class="select" id="cl"><option>NC</option><option>40</option><option>30/5</option><option>30/4</option><option selected>30/3</option><option>30/2</option><option>30/1</option><option>30</option><option>15/5</option><option>15/4</option><option>15/3</option><option>15/2</option><option>15/1</option></select>
  </div>
  <fieldset>
    <legend>Étiquettes <span class="subtle small">(facultatif)</span></legend>
    <div class="chips" style="flex-wrap:wrap">
      <button class="chip" type="button" aria-pressed="false">Groupe A</button>
      <button class="chip" type="button" aria-pressed="true">Groupe B</button>
      <button class="chip" type="button" aria-pressed="false">Entraînement mercredi</button>
      <button class="chip" type="button">{{i:plus}}Nouvelle étiquette</button>
    </div>
    <p class="hint mt-2">Regroupements libres. Pas d'âge, pas de sexe, aucune donnée personnelle.</p>
  </fieldset>
  <fieldset>
    <legend>Engagement</legend>
    <label class="check"><input type="checkbox" checked> Engager dans « Race jeunes 2026-2027 » (classement de départ : 30/3)</label>
  </fieldset>
  <div class="alert alert-info">{{i:key}}<div class="alert-body"><span class="alert-title">Mot de passe temporaire</span><p class="small">Il sera généré automatiquement et affiché <strong>une seule fois</strong> à l'écran suivant. Le joueur devra le changer à sa première connexion.</p></div></div>
  <div class="actions"><button class="btn btn-primary" type="submit">Créer le compte</button><a class="btn btn-ghost" href="08a-admin-joueurs.html">Annuler</a></div>
</form>
<aside class="cases"><div class="case">
  <h2 class="case-title">Ce que l'application ne demande jamais</h2>
  <ul class="small muted" style="padding-left:1.2em;margin:0">
    <li>nom, prénom</li><li>e-mail, téléphone</li><li>date de naissance, âge, sexe</li><li>photo</li>
  </ul>
  <p class="small subtle mt-4 mb-0">La correspondance pseudo ↔ personne réelle est tenue par le club, hors de l'application.</p>
</div></aside>
</div>
"""

REMISE = """
<div class="no-print">
<div class="alert alert-ok mb-4" role="status">{{i:check}}<div class="alert-body"><span class="alert-title">Compte créé : PetitPont</span><p class="small">Classement 30/3 · Groupe B · engagé dans Race jeunes 2026-2027</p></div></div>
<div class="page-head">
  <span class="eyebrow">Remise du mot de passe</span>
  <h1 class="page-title">À transmettre maintenant</h1>
</div>

<div class="handover">
  <span class="stat-label">Pseudo</span>
  <p class="stat-value" style="font-size:var(--fs-2xl)">PetitPont</p>
  <span class="stat-label mt-4">Mot de passe temporaire</span>
  <p class="secret mt-2" id="secret" aria-live="polite">K7mQ-x4Rt-9pLw</p>
  <div class="row mt-4" style="justify-content:center">
    <button class="btn btn-secondary" type="button" data-copy="secret">{{i:copy}}<span class="lbl">Copier</span></button>
    <button class="btn btn-secondary" type="button" data-print>{{i:print}}Imprimer la fiche</button>
  </div>
</div>

<div class="alert alert-warn mt-6" role="alert">{{i:alert}}<div class="alert-body"><span class="alert-title">Affiché une seule fois</span><p class="small">Ce mot de passe n'est pas conservé en clair : il ne pourra plus être affiché. En cas de perte, utilisez « Réinitialiser ».</p></div></div>

<form action="08a-admin-joueurs.html" method="get">
  <label class="check mt-4"><input type="checkbox" required> J'ai remis ou imprimé le mot de passe</label>
  <div class="actions"><button class="btn btn-primary" type="submit">Terminer</button><a class="btn btn-ghost" href="08b-admin-joueur-nouveau.html">Créer un autre joueur</a></div>
</form>
</div>

<section class="print-sheet" aria-hidden="true">
  <div style="border:2px solid #000;padding:24px;max-width:520px;margin:0 auto;font-family:var(--font-sans)">
    <img src="../assets/logo/logo.svg" alt="" width="72" height="72">
    <h1 style="font-size:20px;margin:12px 0 4px">Race jeunes — vos identifiants</h1>
    <p style="margin:0 0 16px">Mon club de tennis</p>
    <p style="margin:0">Pseudo : <strong style="font-size:20px">PetitPont</strong></p>
    <p style="margin:8px 0 16px">Mot de passe temporaire : <strong style="font-family:var(--font-mono);font-size:20px;letter-spacing:.1em">K7mQ-x4Rt-9pLw</strong></p>
    <ol style="margin:0;padding-left:20px;font-size:14px">
      <li>Ouvrez l'application Race jeunes (adresse communiquée par le club).</li>
      <li>Connectez-vous avec ce pseudo et ce mot de passe.</li>
      <li>Choisissez immédiatement votre mot de passe personnel.</li>
    </ol>
    <p style="font-size:12px;margin:16px 0 0">Ne notez jamais votre nom réel dans l'application. Fiche à détruire après la première connexion.</p>
  </div>
</section>

<details class="disclose mt-8 no-print">
  <summary class="row"><span class="chev">{{i:chev-r}}</span><span class="strong">Aperçu de la fiche imprimable</span></summary>
  <div class="disclose-body">
    <div style="background:#fff;color:#000;padding:20px;border-radius:8px;max-width:420px">
      <img src="../assets/logo/logo.svg" alt="" width="56" height="56">
      <p style="font-weight:600;margin:8px 0 0">Race jeunes — vos identifiants</p>
      <p style="margin:8px 0 0">Pseudo : <strong>PetitPont</strong><br>Mot de passe temporaire : <strong style="font-family:var(--font-mono)">K7mQ-x4Rt-9pLw</strong></p>
      <p style="font-size:12px;margin:8px 0 0">Changement obligatoire à la première connexion. Fiche à détruire ensuite.</p>
    </div>
  </div>
</details>
"""

IMPORT = """
<div class="page-head">
  <span class="eyebrow"><a class="link" href="08a-admin-joueurs.html">Joueurs</a> / Import</span>
  <h1 class="page-title">Importer des joueurs</h1>
</div>
<div class="layout-2">
<section aria-labelledby="t-e1">
  <h2 class="section-title" id="t-e1">1. Fichier</h2>
  <div class="handover" style="border-style:dashed">
    {{i:upload:ic-xl}}
    <p class="strong mt-2 mb-0">Déposez un fichier CSV</p>
    <p class="small subtle">ou</p>
    <label class="btn btn-secondary" for="csv">Choisir un fichier<input class="sr-only" id="csv" type="file" accept=".csv,text/csv"></label>
    <p class="small subtle mt-4 mb-0">eleves-groupe-b.csv · 17 lignes</p>
  </div>
  <div class="field mt-6">
    <span class="label">Format attendu (2 colonnes uniquement)</span>
    <pre class="mono small" style="margin:0;padding:var(--s-3);background:var(--surface-sunken);border:1px solid var(--line-soft);border-radius:var(--r-sm);overflow:auto">pseudo;classement
Volée92;30/4
JeuBlanc;NC</pre>
    <p class="hint">Toute autre colonne est refusée (aucune donnée personnelle).</p>
  </div>
  <fieldset>
    <legend>Si le pseudo existe déjà</legend>
    <label class="check"><input type="radio" name="dup" checked> Ignorer la ligne</label>
    <label class="check"><input type="radio" name="dup"> Mettre à jour le classement (historisé)</label>
  </fieldset>
  <label class="check"><input type="checkbox" checked> Engager les nouveaux comptes dans « Race jeunes 2026-2027 »</label>
  <div class="actions"><button class="btn btn-primary" type="button">Vérifier le fichier</button></div>
</section>

<section aria-labelledby="t-e2">
  <h2 class="section-title" id="t-e2">2. Compte rendu</h2>
  <div class="cases cases-3 stats" style="grid-template-columns:repeat(3,1fr)">
    <div class="case"><span class="stat-label">Créés</span><span class="stat-value" style="color:var(--success)">14</span></div>
    <div class="case"><span class="stat-label">Ignorés</span><span class="stat-value">2</span></div>
    <div class="case"><span class="stat-label">Erreurs</span><span class="stat-value" style="color:var(--error)">1</span></div>
  </div>
  <div class="table-wrap mt-4">
  <table class="table">
    <caption class="sr-only">Lignes non importées</caption>
    <thead><tr><th class="num">Ligne</th><th>Pseudo</th><th>Résultat</th></tr></thead>
    <tbody>
      <tr><td class="num">4</td><td>AceDuMatin</td><td><span class="badge badge-off">{{i:ban}}Ignoré</span> pseudo existant</td></tr>
      <tr><td class="num">7</td><td>PetitPont</td><td><span class="badge badge-off">{{i:ban}}Ignoré</span> pseudo existant</td></tr>
      <tr><td class="num">9</td><td>RetourGagnant</td><td><span class="badge badge-ko">{{i:x}}Erreur</span> classement « 30-2 » invalide</td></tr>
    </tbody>
  </table>
  </div>
  <div class="alert alert-warn mt-6">{{i:alert}}<div class="alert-body"><span class="alert-title">Fiche des mots de passe : téléchargeable une seule fois</span><p class="small">14 mots de passe temporaires. Après téléchargement, ils ne seront plus jamais affichés.</p></div></div>
  <div class="actions">
    <button class="btn btn-primary" type="button">{{i:download}}Télécharger la fiche (PDF imprimable)</button>
    <button class="btn btn-secondary" type="button" disabled aria-disabled="true">{{i:check}}Déjà téléchargée</button>
  </div>
  <p class="small subtle">État « Déjà téléchargée » montré à droite pour la maquette.</p>
</section>
</div>
"""

PAGES = [
    {"file": "07-admin-suivi.html", "title": "Suivi", "label": "07 · Admin — tableau de bord de suivi", "role": "admin", "nav": "07-admin-suivi.html", "main": SUIVI},
    {"file": "08a-admin-joueurs.html", "title": "Joueurs", "label": "08a · Admin — liste des joueurs", "role": "admin", "nav": "08a-admin-joueurs.html", "main": JOUEURS},
    {"file": "08b-admin-joueur-nouveau.html", "title": "Nouveau joueur", "label": "08b · Admin — création d'un joueur", "role": "admin", "nav": "08a-admin-joueurs.html", "main": NOUVEAU},
    {"file": "08c-admin-remise-mdp.html", "title": "Remise du mot de passe", "label": "08c · Admin — remise unique du mot de passe temporaire", "role": "admin", "nav": "08a-admin-joueurs.html", "main": REMISE, "main_cls": "main-narrow"},
    {"file": "08d-admin-import-csv.html", "title": "Import CSV", "label": "08d · Admin — import CSV et compte rendu", "role": "admin", "nav": "08a-admin-joueurs.html", "main": IMPORT},
]
