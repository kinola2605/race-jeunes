from pages_admin import PII

SAISONS = """
<div class="page-head">
  <span class="eyebrow">Configuration</span>
  <h1 class="page-title">Saisons</h1>
  <p class="lead small">Chaque saison a son propre barème. Une saison n'est pas liée à l'année civile.</p>
</div>
<div class="row mb-4"><a class="btn btn-primary" href="09b-admin-saison-nouvelle.html">{{i:plus}}Nouvelle saison</a></div>

<div class="cases cases-2">
  <article class="case">
    <div class="row-between"><h2 class="case-title mb-0">Race jeunes 2026-2027</h2><span class="badge badge-info">{{i:play}}Ouverte</span></div>
    <p class="small subtle mono">race-jeunes-2026-27</p>
    <p class="small muted">23 engagés · 112 matchs validés · 6 en attente · barème v3 (brouillon v4)</p>
    <div class="row mt-4">
      <a class="btn btn-secondary btn-sm" href="10-admin-bareme.html">{{i:sliders}}Barème</a>
      <a class="btn btn-secondary btn-sm" href="11-admin-engagements.html">{{i:users}}Engagements</a>
      <a class="btn btn-ghost btn-sm" href="09c-admin-saison-cloture.html">{{i:lock}}Clôturer…</a>
    </div>
  </article>
  <article class="case">
    <div class="row-between"><h2 class="case-title mb-0">Race de printemps 2027</h2><span class="badge badge-tag">{{i:edit}}Brouillon</span></div>
    <p class="small subtle mono">race-printemps-2027</p>
    <p class="small muted">0 engagé · barème dupliqué de race-jeunes-2026-27 v3</p>
    <div class="row mt-4">
      <a class="btn btn-secondary btn-sm" href="10-admin-bareme.html">{{i:sliders}}Barème</a>
      <a class="btn btn-secondary btn-sm" href="11-admin-engagements.html">{{i:users}}Engagements</a>
      <button class="btn btn-ghost btn-sm" type="button">{{i:play}}Ouvrir</button>
    </div>
  </article>
  <article class="case">
    <div class="row-between"><h2 class="case-title mb-0">Race jeunes 2025-2026</h2><span class="badge badge-off">{{i:lock}}Clôturée</span></div>
    <p class="small subtle mono">race-jeunes-2025-26</p>
    <p class="small muted">21 engagés · 164 matchs · barème v2 verrouillé · lecture seule</p>
    <div class="row mt-4">
      <a class="btn btn-secondary btn-sm" href="04-classement.html">Classement final</a>
      <button class="btn btn-ghost btn-sm" type="button">{{i:archive}}Archiver</button>
    </div>
  </article>
  <article class="case">
    <div class="row-between"><h2 class="case-title mb-0">Race d'été 2025</h2><span class="badge badge-off">{{i:archive}}Archivée</span></div>
    <p class="small subtle mono">race-ete-2025</p>
    <p class="small muted">12 engagés · 41 matchs · conservée pour l'historique</p>
    <div class="row mt-4"><a class="btn btn-secondary btn-sm" href="04-classement.html">Classement final</a></div>
  </article>
</div>
"""

NOUVELLE = """
<div class="page-head">
  <span class="eyebrow"><a class="link" href="09a-admin-saisons.html">Saisons</a> / Nouvelle</span>
  <h1 class="page-title">Nouvelle saison</h1>
</div>
<form class="layout-2" action="09a-admin-saisons.html" method="get" novalidate>
<div>
  <div class="field">
    <label for="titre">Titre <span class="req" aria-hidden="true">*</span></label>
    <input class="input" id="titre" value="Race de printemps 2027" aria-describedby="titre-pii">
    <div id="titre-pii">""" + PII + """</div>
  </div>
  <div class="field">
    <label for="slug">Identifiant <span class="req" aria-hidden="true">*</span></label>
    <input class="input mono" id="slug" value="race-printemps-2027" aria-describedby="slug-h" autocapitalize="none" spellcheck="false">
    <p class="hint" id="slug-h">Unique et stable : minuscules, chiffres et tirets. Non modifiable après l'ouverture.</p>
  </div>
  <div class="row" style="align-items:flex-start">
    <div class="field grow"><label for="d1">Début <span class="subtle small">(facultatif)</span></label><input class="input" id="d1" type="date" value="2027-03-01"></div>
    <div class="field grow"><label for="d2">Fin <span class="subtle small">(facultatif)</span></label><input class="input" id="d2" type="date" value="2027-06-30"></div>
  </div>
  <p class="hint" style="margin-top:-12px;margin-bottom:var(--s-5)">Dates purement informatives : elles ne bloquent pas la saisie.</p>
  <fieldset>
    <legend>Classement de référence des engagés</legend>
    <label class="check"><input type="radio" name="ref" checked> Figé à l'engagement</label>
    <label class="check"><input type="radio" name="ref"> Évolutif (suit les changements de classement en cours de saison)</label>
  </fieldset>
  <fieldset>
    <legend>Visibilité du classement</legend>
    <label class="check"><input type="radio" name="vis" checked> Visible par tous les joueurs connectés</label>
    <label class="check"><input type="radio" name="vis"> Visible uniquement par les engagés</label>
    <label class="check"><input type="radio" name="vis"> Masqué (chaque joueur ne voit que son rang)</label>
  </fieldset>
</div>
<div>
  <fieldset>
    <legend>Barème</legend>
    <label class="check"><input type="radio" name="bar" checked> Dupliquer le barème d'une saison existante</label>
    <div class="field" style="margin-left:34px">
      <label for="src" class="sr-only">Saison source</label>
      <select class="select" id="src"><option selected>race-jeunes-2026-27 — v3 (en vigueur)</option><option>race-jeunes-2025-26 — v2</option><option>race-ete-2025 — v1</option></select>
      <p class="hint">Copie indépendante : la modifier ne touchera jamais la saison source.</p>
    </div>
    <label class="check"><input type="radio" name="bar"> Partir d'un barème vide</label>
  </fieldset>
  <div class="cases"><div class="case">
    <h2 class="case-title">Aperçu du barème copié</h2>
    <div class="calc">
      <div class="calc-row"><span>Mode</span><span>par écart d'échelons</span></div>
      <div class="calc-row"><span>Victoire à classement égal</span><span class="num">10 pts</span></div>
      <div class="calc-row"><span>Perf +1 / +2 / +3 / +4 et plus</span><span class="num">20 / 30 / 40 / 50</span></div>
      <div class="calc-row"><span>Défaite contre mieux classé</span><span class="num">2 pts</span></div>
      <div class="calc-row"><span>Plafond par match</span><span class="num">60 pts</span></div>
    </div>
  </div></div>
  <div class="actions"><button class="btn btn-primary" type="submit">Créer en brouillon</button><a class="btn btn-ghost" href="09a-admin-saisons.html">Annuler</a></div>
  <p class="small subtle">Une saison brouillon n'est visible que des admins. Vous pourrez ajuster le barème et engager les joueurs avant de l'ouvrir.</p>
</div>
</form>
"""

CLOTURE = """
<div class="page-head">
  <span class="eyebrow"><a class="link" href="09a-admin-saisons.html">Saisons</a> / race-jeunes-2026-27</span>
  <h1 class="page-title">Race jeunes 2026-2027</h1>
</div>
<div class="cases cases-3 stats" aria-hidden="true">
  <div class="case"><span class="stat-label">Engagés</span><span class="stat-value">23</span></div>
  <div class="case"><span class="stat-label">Matchs validés</span><span class="stat-value">112</span></div>
  <div class="case"><span class="stat-label">En attente</span><span class="stat-value">6</span></div>
</div>

<div class="scrim">
  <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dlg-t" aria-describedby="dlg-d">
    <h2 id="dlg-t">Clôturer « Race jeunes 2026-2027 » ?</h2>
    <div id="dlg-d" class="small">
      <ul style="padding-left:1.2em;margin:0 0 var(--s-4)">
        <li>La saison passe en <strong>lecture seule</strong> : plus de saisie ni de validation.</li>
        <li>Son barème (v3) est <strong>verrouillé</strong>.</li>
        <li>Le classement actuel devient le <strong>classement final</strong>.</li>
      </ul>
    </div>
    <div class="alert alert-warn">{{i:alert}}<div class="alert-body"><span class="alert-title">6 matchs encore en attente</span><p class="small">Ils ne compteront pas. <a class="link" href="12b-validation.html">Les traiter d'abord</a></p></div></div>
    <div class="field mt-4">
      <label for="confirm">Pour confirmer, saisissez l'identifiant <span class="mono strong">race-jeunes-2026-27</span></label>
      <input class="input mono" id="confirm" autocomplete="off" autocapitalize="none" spellcheck="false" value="race-jeunes-2026-2">
    </div>
    <div class="actions" style="justify-content:flex-end">
      <a class="btn btn-ghost" href="09a-admin-saisons.html">Annuler</a>
      <button class="btn btn-danger" type="button" disabled aria-disabled="true">{{i:lock}}Clôturer définitivement</button>
    </div>
    <p class="small subtle mb-0">Correction après clôture : <span class="subtle">[à clarifier — réouverture exceptionnelle tracée dans le journal ?]</span></p>
  </div>
</div>
"""

ECH = ["NC", "40", "30/5", "30/4", "30/3", "30/2", "30/1", "30", "15/5", "15/4", "15/3", "15/2", "15/1"]
WIN = {-12: 0, -3: 2, -2: 4, -1: 6, 0: 10, 1: 20, 2: 30, 3: 40, 4: 50}


def pts(d):
    if d <= -3:
        return 2
    if d >= 4:
        return 50
    return WIN[d]


def matrix():
    rows_cl = ECH[1:]  # joueurs : 40 → 15/1
    head = '<tr><th scope="col">Joueur ↓<br>Adversaire →</th>' + "".join(f'<th scope="col">{c}</th>' for c in ECH) + "</tr>"
    body = []
    changed = {("30/2", "30/1"), ("30/3", "30/2")}
    for r in rows_cl:
        ri = ECH.index(r)
        cells = []
        for c in ECH:
            ci = ECH.index(c)
            cc = max(ci, 1)  # NC traité comme 40
            d = cc - ri
            v = pts(d)
            cls = []
            if r == c:
                cls.append("diag")
            if d > 0:
                cls.append("perf")
            if (r, c) in changed:
                cls.append("changed")
                v = 25
            if r == c == "15/1":
                cls.append("invalid")
                v = ""
            cl = f' class="{" ".join(cls)}"' if cls else ""
            cells.append(f'<td{cl}><input inputmode="numeric" value="{v}" aria-label="Victoire {r} contre {c} : points"></td>')
        body.append(f'<tr><th scope="row">{r}</th>{"".join(cells)}</tr>')
    return f'<table class="matrix"><thead>{head}</thead><tbody>{"".join(body)}</tbody></table>'


BAREME = """
<div class="page-head">
  <span class="eyebrow"><a class="link" href="09a-admin-saisons.html">Saisons</a> / race-jeunes-2026-27 / Barème</span>
  <h1 class="page-title">Éditeur de barème</h1>
  <p class="lead small">En vigueur : <strong>v3</strong> (publiée le 12 oct.) · Brouillon : <strong>v4</strong> — 2 cellules modifiées, non publié</p>
</div>

<div class="toolbar">
  <div class="seg" role="tablist" aria-label="Sections de l'éditeur">
    <button type="button" role="tab" data-tab="p-table" aria-selected="true">Table</button>
    <button type="button" role="tab" data-tab="p-params" aria-selected="false">Paramètres</button>
    <button type="button" role="tab" data-tab="p-sim" aria-selected="false">Simulateur</button>
    <button type="button" role="tab" data-tab="p-impact" aria-selected="false">Impact</button>
  </div>
</div>

<section id="p-table" role="tabpanel" aria-label="Table de points">
  <div class="row-between mb-4">
    <div class="seg" aria-label="Forme du barème">
      <button type="button" aria-pressed="false">Par écart d'échelons</button>
      <button type="button" aria-pressed="true">Table complète</button>
    </div>
    <div class="seg" aria-label="Résultat">
      <button type="button" aria-pressed="true">Victoire</button>
      <button type="button" aria-pressed="false">Défaite</button>
    </div>
  </div>
  <div class="table-wrap" style="max-height:440px;border:1px solid var(--line-soft)">
""" + matrix() + """
  </div>
  <div class="legend">
    <span><i class="sw" style="background:var(--surface-raised);box-shadow:inset 0 0 0 1px var(--text-subtle)"></i>Classement égal (diagonale)</span>
    <span><b style="color:var(--accent-2)">20</b> Perf (adversaire mieux classé)</span>
    <span><i class="sw" style="background:var(--highlight)"></i><u class="strong">25</u> Modifié dans le brouillon</span>
  </div>
  <div class="alert alert-ko mt-4">{{i:alert}}<div class="alert-body"><span class="alert-title">Validation : 1 erreur bloquante, 1 avertissement</span>
    <ul class="small" style="margin:0;padding-left:1.2em"><li><strong>Erreur</strong> — cellule 15/1 × 15/1 vide : une valeur est requise pour publier.</li><li><strong>Avertissement</strong> — 30/2 × 30/1 et 30/3 × 30/2 valent 25 alors que les autres perfs +1 valent 20 (autorisé, mais non homogène).</li></ul></div></div>
  <p class="small subtle mt-2">NC est traité comme 40 (paramètre). Barème fictif pour la maquette.</p>
</section>

<section id="p-params" role="tabpanel" aria-label="Paramètres" hidden>
  <div class="cases cases-2">
    <div class="case">
      <h2 class="case-title">Plafonds</h2>
      <div class="field"><label for="cap1">Plafond par match</label><input class="input" id="cap1" inputmode="numeric" value="60"></div>
      <div class="field"><label for="cap2">Plafond par mois <span class="subtle small">(vide = aucun)</span></label><input class="input" id="cap2" inputmode="numeric" value=""></div>
    </div>
    <div class="case">
      <h2 class="case-title">Cas particuliers</h2>
      <div class="field"><label for="nc">Adversaire non classé traité comme</label><select class="select" id="nc"><option selected>40</option><option>NC (échelon propre)</option></select></div>
      <div class="field"><label for="wo">Victoire par forfait (WO)</label><select class="select" id="wo"><option selected>0 pt</option><option>Points d'une victoire normale</option><option>Valeur fixe…</option></select></div>
      <div class="field"><label for="ab">Victoire par abandon</label><select class="select" id="ab"><option selected>Points d'une victoire normale</option><option>0 pt</option></select></div>
    </div>
    <div class="case">
      <h2 class="case-title">Bonus</h2>
      <label class="check"><input type="checkbox" checked> Assiduité : +5 pts tous les 5 matchs validés</label>
      <label class="check"><input type="checkbox"> Victoire en 2 sets secs : +2 pts</label>
      <button class="btn btn-ghost btn-sm" type="button">{{i:plus}}Ajouter un bonus</button>
    </div>
    <div class="case">
      <h2 class="case-title">Défaites</h2>
      <div class="field"><label for="d1">Défaite contre mieux classé</label><input class="input" id="d1" value="2"></div>
      <div class="field"><label for="d2">Défaite à classement égal</label><input class="input" id="d2" value="1"></div>
      <div class="field"><label for="d3">Défaite contre moins bien classé</label><input class="input" id="d3" value="0"></div>
    </div>
  </div>
</section>

<section id="p-sim" role="tabpanel" aria-label="Simulateur" hidden>
  <div class="layout-2">
    <div>
      <div class="field"><label for="s1">Classement du joueur</label><select class="select" id="s1"><option selected>30/2</option></select></div>
      <div class="field"><label for="s2">Classement de l'adversaire</label><select class="select" id="s2"><option selected>30/1</option></select></div>
      <fieldset><legend>Résultat</legend><div class="big-choice"><label><input type="radio" name="sr" checked><span>Victoire</span></label><label><input type="radio" name="sr"><span>Défaite</span></label></div></fieldset>
      <div class="field"><label for="s3">Barème</label><select class="select" id="s3"><option>v3 (en vigueur)</option><option selected>v4 (brouillon)</option></select></div>
    </div>
    <div>
      <div class="preview-points"><div><span class="stat-label">Points simulés (v4)</span><span class="stat-value">25</span></div><div class="right small">v3 : 20 pts<br><strong>+5</strong></div></div>
      <div class="calc mt-4">
        <div class="calc-row"><span>Écart</span><span>+1 échelon (perf)</span></div>
        <div class="calc-row"><span>Table · 30/2 × 30/1</span><span class="num">25</span></div>
        <div class="calc-row"><span>Plafond 60</span><span>non atteint</span></div>
        <div class="calc-row calc-total"><span>Total</span><span class="num">25 pts</span></div>
      </div>
    </div>
  </div>
</section>

<section id="p-impact" role="tabpanel" aria-label="Impact du recalcul" hidden>
  <div class="cases cases-3 stats" style="grid-template-columns:repeat(3,1fr)">
    <div class="case"><span class="stat-label">Matchs recalculés</span><span class="stat-value">37<small> / 112</small></span></div>
    <div class="case"><span class="stat-label">Joueurs impactés</span><span class="stat-value">14</span></div>
    <div class="case"><span class="stat-label">Changements de rang</span><span class="stat-value">5</span></div>
  </div>
  <div class="table-wrap mt-4">
  <table class="table">
    <caption class="sr-only">Changements de rang si v4 est publiée</caption>
    <thead><tr><th>Pseudo</th><th class="num">Points v3</th><th class="num">Points v4</th><th class="num">Rang v3</th><th class="num">Rang v4</th></tr></thead>
    <tbody>
      <tr><td class="strong">AceDuMatin</td><td class="num">186</td><td class="num">196</td><td class="num">4</td><td class="num"><span class="trend trend-up">{{i:up}}3</span></td></tr>
      <tr><td class="strong">SmashTonic</td><td class="num">200</td><td class="num">200</td><td class="num">3</td><td class="num"><span class="trend trend-down">{{i:down}}4</span></td></tr>
      <tr><td class="strong">Volée92</td><td class="num">131</td><td class="num">146</td><td class="num">8</td><td class="num"><span class="trend trend-up">{{i:up}}7</span></td></tr>
      <tr><td class="strong">AmortiZen</td><td class="num">140</td><td class="num">140</td><td class="num">7</td><td class="num"><span class="trend trend-down">{{i:down}}8</span></td></tr>
      <tr><td class="strong">PetitPont</td><td class="num">161</td><td class="num">171</td><td class="num">6</td><td class="num">6</td></tr>
    </tbody>
  </table>
  </div>
  <div class="alert alert-info mt-6">{{i:info}}<div class="alert-body"><span class="alert-title">Aucun recalcul silencieux</span><p class="small">Publier v4 n'applique rien aux matchs passés tant que vous ne lancez pas le recalcul. L'opération est enregistrée dans le journal d'audit (avant / après).</p></div></div>
  <div class="actions">
    <button class="btn btn-primary" type="button">{{i:refresh}}Publier v4 et recalculer 37 matchs</button>
    <button class="btn btn-secondary" type="button">Publier v4 pour les nouveaux matchs seulement</button>
    <button class="btn btn-ghost" type="button">Abandonner le brouillon</button>
  </div>
</section>
"""

ENG_ROWS = [
    ("AceDuMatin", "30/2", "Groupe B", True, "30/2"),
    ("AmortiZen", "30/1", "Groupe A", True, "30/1"),
    ("BalleNeuve", "40", "Groupe B", False, ""),
    ("CoupDroit", "30/5", "Groupe B", False, ""),
    ("DoubleFaute", "30/4", "Groupe B", True, "30/5"),
    ("LiftCroisé", "15/5", "Groupe A", True, "15/5"),
    ("PassingShot", "30/3", "Groupe A", False, ""),
    ("RetourGagnant", "30/2", "—", False, ""),
]


def eng_rows():
    out = []
    for ps, cl, tag, eng, dep in ENG_ROWS:
        sel = ' checked' if (not eng and tag == "Groupe B") else ''
        st = '<span class="badge badge-ok">{{i:check}}Engagé</span>' if eng else '<span class="subtle small">Non engagé</span>'
        depc = (f'<select class="select" style="min-height:40px;width:auto" aria-label="Classement de départ de {ps}"><option>{dep}</option></select>' if eng
                else f'<span class="subtle small">{cl} à l\'engagement</span>')
        chk = (f'<input type="checkbox" aria-label="Sélectionner {ps}"{sel} style="width:22px;height:22px;accent-color:var(--accent)">' if not eng else '<span class="sr-only">déjà engagé</span>')
        out.append(f'<tr{" class=\"is-selected\"" if sel else ""}><td>{chk}</td><td class="strong">{ps}</td><td>{cl}</td><td>{tag}</td><td>{st}</td><td>{depc}</td></tr>')
    return "\n".join(out)


def eng_list():
    out = []
    for ps, cl, tag, eng, dep in ENG_ROWS:
        sel = (not eng and tag == "Groupe B")
        if eng:
            lead = '<span class="res res-win" aria-hidden="true">{{i:check}}</span>'
            meta = f"Engagé · départ {dep} · {tag}"
        else:
            lead = f'<input type="checkbox" aria-label="Sélectionner {ps}"{" checked" if sel else ""} style="width:24px;height:24px;margin:4px;accent-color:var(--accent)">'
            meta = f"Non engagé · {cl} · {tag}"
        out.append(f'<li><label class="item"{" style=\"background:var(--highlight);color:var(--on-highlight)\"" if sel else ""}>{lead}<div class="item-main"><div class="item-title">{ps}</div><div class="item-meta"{" style=\"color:inherit\"" if sel else ""}>{meta}</div></div></label></li>')
    return "\n".join(out)


ENGAGEMENTS = """
<div class="page-head">
  <span class="eyebrow"><a class="link" href="09a-admin-saisons.html">Saisons</a> / race-jeunes-2026-27</span>
  <h1 class="page-title">Engagements</h1>
  <p class="lead small">23 engagés · classement de référence <strong>figé à l'engagement</strong> (paramètre de saison)</p>
</div>
<div class="toolbar">
  <div class="search"><label for="q" class="sr-only">Rechercher un pseudo</label>{{i:search}}<input class="input" id="q" type="search" placeholder="Rechercher un pseudo"></div>
</div>
<div class="row mb-4">
  <span class="small muted">Sélection rapide :</span>
  <button class="chip" type="button" aria-pressed="false">Tous les non engagés (15)</button>
  <button class="chip" type="button" aria-pressed="true">{{i:tag}}Groupe B (2)</button>
  <button class="chip" type="button" aria-pressed="false">{{i:tag}}Groupe A</button>
</div>
<ul class="list hide-tablet-up" aria-label="Joueurs actifs et leur engagement">
""" + eng_list() + """
</ul>
<div class="table-wrap hide-mobile">
<table class="table">
  <caption class="sr-only">Joueurs actifs et leur engagement</caption>
  <thead><tr><th><span class="sr-only">Sélection</span></th><th>Pseudo</th><th>Classement actuel</th><th>Étiquette</th><th>Statut</th><th>Classement de départ</th></tr></thead>
  <tbody>
""" + eng_rows() + """
  </tbody>
</table>
</div>
<div class="sticky-cta">
  <div class="row-between">
    <span class="strong">2 joueurs sélectionnés</span>
    <button class="btn btn-primary" type="button">{{i:plus}}Engager les 2 joueurs</button>
  </div>
</div>
<p class="small subtle">Retirer un engagé ayant des matchs validés est impossible : ses matchs restent comptés. Les comptes désactivés n'apparaissent pas ici.</p>
"""

PAGES = [
    {"file": "09a-admin-saisons.html", "title": "Saisons", "label": "09a · Admin — liste des saisons", "role": "admin", "nav": "09a-admin-saisons.html", "main": SAISONS},
    {"file": "09b-admin-saison-nouvelle.html", "title": "Nouvelle saison", "label": "09b · Admin — création d'une saison", "role": "admin", "nav": "09a-admin-saisons.html", "main": NOUVELLE},
    {"file": "09c-admin-saison-cloture.html", "title": "Clôture", "label": "09c · Admin — clôture avec confirmation", "role": "admin", "nav": "09a-admin-saisons.html", "main": CLOTURE},
    {"file": "10-admin-bareme.html", "title": "Barème", "label": "10 · Admin — éditeur de barème", "role": "admin", "nav": "09a-admin-saisons.html", "main": BAREME},
    {"file": "11-admin-engagements.html", "title": "Engagements", "label": "11 · Admin — engagement des joueurs", "role": "admin", "nav": "09a-admin-saisons.html", "main": ENGAGEMENTS},
]
