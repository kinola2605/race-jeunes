from pages_admin import PII

SAISIE = """
<div class="page-head">
  <span class="eyebrow">Race jeunes 2026-2027</span>
  <h1 class="page-title">Déclarer un match</h1>
</div>
<form class="court" action="05-mes-matchs.html" method="get" novalidate>
  <div class="field"><label for="date">Date du match</label><input class="input" id="date" type="date" value="2026-11-07"></div>

  <fieldset>
    <legend>Adversaire</legend>
    <div class="seg mb-4" role="tablist" aria-label="Type d'adversaire">
      <button type="button" role="tab" data-tab="adv-club" aria-selected="true">{{i:users}}Joueur du club</button>
      <button type="button" role="tab" data-tab="adv-ext" aria-selected="false">Extérieur</button>
    </div>
    <div id="adv-club" role="tabpanel">
      <div class="search"><label for="adv" class="sr-only">Rechercher un engagé</label>{{i:search}}<input class="input" id="adv" type="search" value="sli" autocomplete="off"></div>
      <ul class="list mt-2" role="listbox" aria-label="Engagés correspondants">
        <li role="option" aria-selected="true"><div class="item" style="min-height:var(--touch-court)"><span class="res" style="color:var(--accent)">{{i:check}}</span><div class="item-main"><div class="item-title">SliceMaster</div><div class="item-meta">30/1</div></div><span class="badge badge-perf">{{i:perf}}Perf possible</span></div></li>
        <li role="option" aria-selected="false"><div class="item" style="min-height:var(--touch-court)"><span class="res" style="color:var(--text-subtle);border-style:dashed"></span><div class="item-main"><div class="item-title">SlicedBread</div><div class="item-meta">30/3</div></div></div></li>
      </ul>
    </div>
    <div id="adv-ext" role="tabpanel" hidden>
      <div class="field"><label for="lib">Libellé de l'adversaire</label><input class="input" id="lib" placeholder="ex. Tournoi des Tilleuls, tableau 13 ans" aria-describedby="lib-pii"><div id="lib-pii">""" + PII + """</div></div>
      <div class="field"><label for="clx">Classement de l'adversaire</label><select class="select" id="clx"><option>NC</option><option>40</option><option selected>30/2</option></select></div>
    </div>
  </fieldset>

  <fieldset>
    <legend>Résultat</legend>
    <div class="big-choice">
      <label><input type="radio" name="res" checked><span>{{i:up:ic-lg}}J'ai gagné</span></label>
      <label><input type="radio" name="res"><span>{{i:down:ic-lg}}J'ai perdu</span></label>
    </div>
  </fieldset>

  <fieldset>
    <legend>Score <span class="subtle small">(jeux par set, vous d'abord)</span></legend>
    <div class="sets">
      <div class="set-row"><span class="strong">Set 1</span>
        <div class="stepper" role="group" aria-label="Set 1, vos jeux"><button type="button" data-step="-" aria-label="Moins">−</button><output>6</output><button type="button" data-step="+" aria-label="Plus">+</button></div>
        <div class="stepper" role="group" aria-label="Set 1, jeux adverses"><button type="button" data-step="-" aria-label="Moins">−</button><output>4</output><button type="button" data-step="+" aria-label="Plus">+</button></div></div>
      <div class="set-row"><span class="strong">Set 2</span>
        <div class="stepper" role="group" aria-label="Set 2, vos jeux"><button type="button" data-step="-" aria-label="Moins">−</button><output>6</output><button type="button" data-step="+" aria-label="Plus">+</button></div>
        <div class="stepper" role="group" aria-label="Set 2, jeux adverses"><button type="button" data-step="-" aria-label="Moins">−</button><output>3</output><button type="button" data-step="+" aria-label="Plus">+</button></div></div>
      <button class="btn btn-ghost" type="button">{{i:plus}}Ajouter un 3e set / super tie-break</button>
    </div>
    <label class="check mt-2"><input type="checkbox"> Abandon ou forfait</label>
  </fieldset>

  <div class="preview-points" role="status">
    <div><span class="stat-label">Points estimés</span><span class="stat-value">+20</span></div>
    <div class="right small"><strong>Perf</strong> : +1 échelon<br>30/2 bat 30/1</div>
  </div>
  <p class="small subtle mt-2">Le match sera <strong>validé par le club</strong> avant d'être compté.</p>

  <div class="sticky-cta"><button class="btn btn-primary btn-block" type="submit">Envoyer le match</button></div>
</form>
"""

def card(a, acl, b, bcl, date, score, winner, by, pts, extra=""):
    return f"""<li><div class="item" style="align-items:flex-start">
  <input type="checkbox" aria-label="Sélectionner le match {a} contre {b}" style="width:22px;height:22px;margin-top:4px;accent-color:var(--accent)">
  <div class="item-main">
    <div class="item-title">{a} <span class="subtle small">{acl}</span> <span class="subtle">vs</span> {b} <span class="subtle small">{bcl}</span></div>
    <div class="item-meta">{date} · {score} · vainqueur <strong>{winner}</strong> · saisi par {by}</div>
    <div class="item-meta">Points prévus : {pts}</div>
    {extra}
    <div class="row mt-2" style="gap:6px">
      <button class="btn btn-secondary btn-sm" type="button">{{{{i:check}}}}Valider</button>
      <button class="btn btn-ghost btn-sm" type="button">{{{{i:x}}}}Refuser…</button>
      <button class="btn btn-ghost btn-sm" type="button">{{{{i:edit}}}}Corriger</button>
    </div>
  </div>
</div></li>"""


VALIDATION = """
<div class="page-head">
  <span class="eyebrow">Matchs · Race jeunes 2026-2027</span>
  <h1 class="page-title">File de validation</h1>
  <p class="lead small">6 matchs en attente · du plus ancien au plus récent</p>
</div>
<div class="row mb-4">
  <a class="btn btn-primary" href="12a-saisie-match.html">{{i:plus}}Saisir un match</a>
  <button class="btn btn-secondary" type="button">{{i:check}}Valider la sélection (2)</button>
</div>
<div class="chips mb-4" role="group" aria-label="Filtrer">
  <button class="chip" type="button" aria-pressed="true">En attente (6)</button>
  <button class="chip" type="button" aria-pressed="false">{{i:alert}}Anomalies (2)</button>
  <button class="chip" type="button" aria-pressed="false">Validés</button>
  <button class="chip" type="button" aria-pressed="false">Refusés</button>
</div>
<ul class="list">
""" + card("Revers2Feu", "30/1", "PetitPont", "30/3", "Dim. 2 nov.", "6/3 6/2", "Revers2Feu", "Revers2Feu", "Revers2Feu +6 · PetitPont +0",
           '<div class="alert alert-ko mt-2" style="padding:var(--s-2) var(--s-3)">{{i:alert}}<div class="alert-body small"><strong>Doublon probable</strong> : même match saisi aussi par PetitPont. <a class="link" href="#">Fusionner</a></div></div>') + \
    card("SmashTonic", "30", "LiftCroisé", "15/5", "Lun. 3 nov.", "7/6 6/4", "SmashTonic", "admin.club", "SmashTonic +20 (perf) · LiftCroisé +0") + \
    card("TopSpinou", "30/2", "Ext. · TC voisin, interclubs", "30/1", "Mar. 4 nov.", "6/4 3/6 10-8", "TopSpinou", "TopSpinou", "TopSpinou +20 (perf)") + \
    card("Volée92", "30/4", "AceDuMatin", "30/2", "Mer. 5 nov.", "2/6 5/7", "AceDuMatin", "AceDuMatin", "AceDuMatin +4 · Volée92 +2") + """
</ul>

<div class="scrim" style="position:static;background:none;padding:0;margin-top:var(--s-8);place-items:start">
  <div class="dialog" role="dialog" aria-labelledby="ref-t">
    <h2 id="ref-t">Refuser le match SmashTonic vs LiftCroisé</h2>
    <div class="field"><label for="motif">Motif (visible par le joueur)</label>
      <select class="select" id="motif"><option>Score incomplet ou invalide</option><option>Match non joué / non confirmé</option><option>Doublon</option><option>Autre…</option></select></div>
    <div class="field"><label for="note">Note <span class="subtle small">(facultatif)</span></label><textarea class="textarea" id="note" aria-describedby="note-pii">Merci de ressaisir avec le 2e set.</textarea><div id="note-pii">""" + PII + """</div></div>
    <div class="actions" style="justify-content:flex-end"><button class="btn btn-ghost" type="button">Annuler</button><button class="btn btn-danger" type="button">{{i:x}}Refuser</button></div>
  </div>
</div>
<p class="small subtle mt-2">Exemple de dialogue de refus, affiché sous la liste pour la maquette.</p>
"""

AUDIT_ROWS = [
    ("07/11 18:02", "admin.club", "Compte", "Mot de passe réinitialisé", "PetitPont", "Nouveau mot de passe temporaire remis"),
    ("07/11 17:55", "admin.club", "Compte", "Compte créé", "PetitPont", "30/3 · Groupe B · engagé race-jeunes-2026-27"),
    ("06/11 21:14", "admin.club", "Barème", "Recalcul appliqué", "race-jeunes-2026-27", "v2 → v3 · 37 matchs · 14 joueurs (avant/après joint)"),
    ("06/11 21:10", "admin.club", "Barème", "Version publiée", "race-jeunes-2026-27 v3", "2 cellules modifiées"),
    ("06/11 19:40", "admin.club", "Match", "Match validé", "M-0112", "Revers2Feu vs AmortiZen · +6 / +2"),
    ("06/11 19:39", "admin.club", "Match", "Match refusé", "M-0109", "Motif : score incomplet"),
    ("05/11 08:12", "système", "Sécurité", "Verrouillage temporaire", "connexion", "5 échecs · 15 min (pseudo non journalisé)"),
    ("04/11 20:30", "admin.club", "Compte", "Compte désactivé", "LobFantôme", "Sessions révoquées"),
    ("03/11 18:00", "admin.club", "Import", "Import CSV", "eleves-groupe-b.csv", "14 créés · 2 ignorés · 1 erreur"),
    ("01/10 09:00", "admin.club", "Saison", "Saison ouverte", "race-jeunes-2026-27", "Barème v1"),
]


def audit_rows():
    return "\n".join(
        f'<tr><td class="num" style="white-space:nowrap">{d}</td><td>{who}</td><td><span class="badge badge-tag">{t}</span></td><td class="strong">{a}</td><td class="mono small">{tgt}</td><td class="muted">{det}</td></tr>'
        for d, who, t, a, tgt, det in AUDIT_ROWS)


def audit_list():
    return "\n".join(
        f'<li><div class="item" style="align-items:flex-start"><div class="item-main"><div class="item-title">{a} <span class="badge badge-tag">{t}</span></div><div class="item-meta"><span class="mono">{tgt}</span> · {det}</div><div class="item-meta">{d} · {who}</div></div></div></li>'
        for d, who, t, a, tgt, det in AUDIT_ROWS)


JOURNAL = """
<div class="page-head">
  <span class="eyebrow">Traçabilité</span>
  <h1 class="page-title">Journal d'audit</h1>
  <p class="lead small">Lecture seule · non modifiable · aucune donnée personnelle</p>
</div>
<div class="toolbar">
  <div class="search"><label for="q" class="sr-only">Rechercher</label>{{i:search}}<input class="input" id="q" type="search" placeholder="Pseudo, saison, n° de match…"></div>
  <a class="btn btn-secondary" href="#">{{i:download}}Exporter (CSV)</a>
</div>
<div class="chips mb-4" role="group" aria-label="Filtrer par type">
  <button class="chip" type="button" aria-pressed="true">Tout</button>
  <button class="chip" type="button" aria-pressed="false">Comptes</button>
  <button class="chip" type="button" aria-pressed="false">Saisons</button>
  <button class="chip" type="button" aria-pressed="false">Barèmes</button>
  <button class="chip" type="button" aria-pressed="false">Matchs</button>
  <button class="chip" type="button" aria-pressed="false">Sécurité</button>
</div>
<ul class="list hide-tablet-up">
""" + audit_list() + """
</ul>
<div class="table-wrap hide-mobile">
<table class="table">
  <caption class="sr-only">Journal d'audit</caption>
  <thead><tr><th>Date</th><th>Auteur</th><th>Type</th><th>Action</th><th>Cible</th><th>Détail</th></tr></thead>
  <tbody>
""" + audit_rows() + """
  </tbody>
</table>
</div>
<p class="center mt-6"><button class="btn btn-secondary" type="button">Charger les entrées précédentes</button></p>
"""

ETATS = """
<div class="page-head">
  <span class="eyebrow">Transverse</span>
  <h1 class="page-title">États et messages</h1>
  <p class="lead small">Catalogue des états vides, erreurs, chargements et avertissements.</p>
</div>

<section class="section" aria-labelledby="t-vide">
  <h2 class="section-title" id="t-vide">États vides</h2>
  <div class="cases cases-3">
    <div class="case"><div class="empty">{{i:trophy:ic-xl}}<h3>Pas encore de classement</h3><p>Aucun match validé pour cette saison. Le classement apparaîtra après la première validation.</p></div></div>
    <div class="case"><div class="empty">{{i:list:ic-xl}}<h3>Aucun match pour l'instant</h3><p>Déclarez votre premier match après l'avoir joué.</p><a class="btn btn-primary" href="12a-saisie-match.html">{{i:plus}}Déclarer un match</a></div></div>
    <div class="case"><div class="empty">{{i:calendar:ic-xl}}<h3>Vous n'êtes engagé·e dans aucune saison ouverte</h3><p>Le club vous engagera dans la prochaine Race. Vos saisons passées restent consultables.</p></div></div>
    <div class="case"><div class="empty">{{i:check:ic-xl}}<h3>Rien à valider</h3><p>Tous les matchs déclarés ont été traités.</p></div></div>
    <div class="case"><div class="empty">{{i:users:ic-xl}}<h3>Aucun joueur engagé</h3><p>Engagez des joueurs pour ouvrir la saison.</p><a class="btn btn-primary" href="11-admin-engagements.html">Engager des joueurs</a></div></div>
    <div class="case"><div class="empty">{{i:search:ic-xl}}<h3>Aucun résultat</h3><p>Aucun pseudo ne correspond à « zzz ».</p></div></div>
  </div>
</section>

<section class="section" aria-labelledby="t-err">
  <h2 class="section-title" id="t-err">Erreurs</h2>
  <div class="stack" style="--gap:var(--s-3)">
    <div class="alert alert-ko" role="alert">{{i:alert}}<div class="alert-body"><span class="alert-title">Pseudo ou mot de passe incorrect.</span><p class="small">Message identique que le pseudo existe ou non.</p></div></div>
    <div class="alert alert-ko" role="alert">{{i:lock}}<div class="alert-body"><span class="alert-title">Trop de tentatives.</span><p class="small">Réessayez dans 15 minutes. <span class="subtle">(même message pour tout pseudo)</span></p></div></div>
    <div class="alert alert-ko" role="alert">{{i:lock}}<div class="alert-body"><span class="alert-title">Ce compte est désactivé.</span><p class="small">Adressez-vous au club. <span class="subtle">(affiché uniquement après un mot de passe correct)</span></p></div></div>
    <div class="alert alert-warn" role="alert">{{i:clock}}<div class="alert-body"><span class="alert-title">Session expirée</span><p class="small">Reconnectez-vous pour continuer. Votre saisie en cours est conservée sur cet appareil.</p><a class="btn btn-secondary btn-sm mt-2" href="01-connexion.html">Se reconnecter</a></div></div>
    <div class="alert alert-info" role="status">{{i:offline}}<div class="alert-body"><span class="alert-title">Hors connexion</span><p class="small">Vous consultez les dernières données chargées (6 nov., 21 h 14). La saisie de match sera envoyée au retour du réseau. <span class="subtle">[file d'attente hors ligne : à clarifier]</span></p></div></div>
    <div class="alert alert-ko" role="alert">{{i:ban}}<div class="alert-body"><span class="alert-title">Accès refusé</span><p class="small">Cette page est réservée aux administrateurs.</p></div></div>
    <div class="alert alert-ko" role="alert">{{i:lock}}<div class="alert-body"><span class="alert-title">Saison clôturée</span><p class="small">« Race jeunes 2025-2026 » est en lecture seule : aucune saisie ni modification possible.</p></div></div>
    <div class="cases"><div class="case"><div class="empty">{{i:alert:ic-xl}}<h3>Page introuvable</h3><p>Le lien est peut-être ancien.</p><a class="btn btn-secondary" href="03-joueur-accueil.html">Retour à l'accueil</a></div></div></div>
  </div>
</section>

<section class="section" aria-labelledby="t-load">
  <h2 class="section-title" id="t-load">Chargement</h2>
  <div class="layout-2">
    <div aria-busy="true" aria-label="Chargement du classement">
      <div class="rank-row"><span class="sk" style="height:24px;width:24px;margin:auto"></span><div><span class="sk" style="height:16px;width:60%"></span><span class="sk mt-2" style="height:12px;width:40%"></span></div><span class="sk" style="height:20px;width:44px"></span></div>
      <div class="rank-row"><span class="sk" style="height:24px;width:24px;margin:auto"></span><div><span class="sk" style="height:16px;width:50%"></span><span class="sk mt-2" style="height:12px;width:35%"></span></div><span class="sk" style="height:20px;width:44px"></span></div>
      <div class="rank-row"><span class="sk" style="height:24px;width:24px;margin:auto"></span><div><span class="sk" style="height:16px;width:70%"></span><span class="sk mt-2" style="height:12px;width:30%"></span></div><span class="sk" style="height:20px;width:44px"></span></div>
    </div>
    <div class="stack">
      <button class="btn btn-primary btn-block" type="button" aria-busy="true" disabled><span class="spinner" style="width:18px;height:18px;border-width:2px;border-top-color:currentColor"></span>Envoi en cours…</button>
      <div class="row"><span class="spinner" role="status" aria-label="Recalcul en cours"></span><span class="small muted">Recalcul de 37 matchs… ne fermez pas la page.</span></div>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="t-pii">
  <h2 class="section-title" id="t-pii">Données personnelles</h2>
  <div class="layout-2">
    <div>
      <div class="field"><label for="ex1">Libellé de l'adversaire extérieur</label><input class="input" id="ex1" value="Tournoi des Tilleuls" aria-describedby="ex1-pii"><div id="ex1-pii">""" + PII + """</div></div>
      <div class="field"><label for="ex2">Note</label><input class="input" id="ex2" value="Contre Jean Dupont" aria-describedby="ex2-w">
        <p class="error-msg" id="ex2-w" style="color:var(--warning)">{{i:alert}}<span>Ce texte ressemble à un nom réel. Utilisez un pseudo ou un libellé neutre.</span></p></div>
    </div>
    <div class="cases"><div class="case">
      <h3 class="case-title">{{i:shield}} Confidentialité</h3>
      <p class="small muted">Cette application n'enregistre ni nom, ni prénom, ni e-mail, ni date de naissance, ni téléphone, ni photo. Vous êtes identifié·e uniquement par un pseudo attribué par le club.</p>
      <p class="small muted mb-0">Aucun cookie de suivi, aucun outil de statistiques, aucune ressource chargée depuis un service externe.</p>
    </div></div>
  </div>
</section>

<section class="section" aria-labelledby="t-ok">
  <h2 class="section-title" id="t-ok">Confirmations</h2>
  <div class="stack" style="--gap:var(--s-3)">
    <div class="alert alert-ok" role="status">{{i:check}}<div class="alert-body"><span class="alert-title">Match envoyé</span><p class="small">Il apparaîtra dans votre classement après validation par le club.</p></div></div>
    <div class="alert alert-ok" role="status">{{i:check}}<div class="alert-body"><span class="alert-title">Mot de passe modifié</span><p class="small">Vos autres sessions ont été déconnectées.</p></div></div>
  </div>
</section>
"""

PAGES = [
    {"file": "12a-saisie-match.html", "title": "Déclarer un match", "label": "12a · Saisie d'un match (bord de court)", "role": "joueur", "nav": "12a-saisie-match.html", "main": SAISIE, "main_cls": "main-narrow"},
    {"file": "12b-validation.html", "title": "Validation", "label": "12b · Admin — file de validation", "role": "admin", "nav": "12b-validation.html", "main": VALIDATION},
    {"file": "13-admin-journal.html", "title": "Journal d'audit", "label": "13 · Admin — journal d'audit", "role": "admin", "nav": "13-admin-journal.html", "main": JOURNAL},
    {"file": "14-etats.html", "title": "États", "label": "14 · États vides, erreurs, chargement, données personnelles", "role": "joueur", "nav": "", "main": ETATS},
]
