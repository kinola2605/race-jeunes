ACCUEIL = """
<div class="page-head">
  <span class="eyebrow">Race jeunes 2026-2027 · en cours</span>
  <h1 class="page-title">Bonjour AceDuMatin</h1>
</div>

<section class="hero" aria-label="Ma position">
  <div class="cases cases-2 only-a">
    <div class="case case-center">
      <span class="stat-label">Rang</span>
      <span class="stat-value stat-big">4<small>e / 23</small></span>
      <span class="trend trend-up">{{i:up}}+2 places cette semaine</span>
    </div>
    <div class="case case-center">
      <span class="stat-label">Points</span>
      <span class="stat-value stat-big">186</span>
      <span class="small subtle">14 pts derrière le 3e</span>
    </div>
  </div>
  <div class="only-b">
    <div class="row-between" style="align-items:flex-end">
      <div>
        <span class="stat-label">Rang</span>
        <span class="stat-value stat-big">4<small style="color:inherit">e</small></span>
        <span class="small">sur 23 engagés · {{i:up}}+2 places</span>
      </div>
      <div class="right">
        <span class="stat-label">Points</span>
        <span class="stat-value" style="font-size:44px">186</span>
        <span class="small">−14 pts du 3e</span>
      </div>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="t-bilan">
  <h2 class="section-title" id="t-bilan">Mon bilan</h2>
  <div class="cases cases-4 stats">
    <div class="case"><span class="stat-label">Victoires</span><span class="stat-value" style="color:var(--success)">9</span></div>
    <div class="case"><span class="stat-label">Défaites</span><span class="stat-value" style="color:var(--error)">4</span></div>
    <div class="case"><span class="stat-label">Perfs</span><span class="stat-value stat-perf">3</span></div>
    <div class="case"><span class="stat-label">Classement</span><span class="stat-value">30/2</span></div>
  </div>
</section>

<div class="alert alert-warn mt-6" role="status">
  {{i:clock}}
  <div class="alert-body"><span class="alert-title">1 match en attente de validation</span><p class="small">Contre Volée92 le 5 nov. — les points seront ajoutés après validation par le club.</p></div>
</div>

<section class="section" aria-labelledby="t-dernier">
  <h2 class="section-title" id="t-dernier">Dernier match validé</h2>
  <div class="cases"><div class="case">
    <div class="item" style="padding:0">
      <span class="res res-win" aria-hidden="true">V</span>
      <div class="item-main">
        <div class="item-title"><span class="sr-only">Victoire contre</span>SliceMaster <span class="subtle small">30/1</span> <span class="badge badge-perf">{{i:perf}}Perf</span></div>
        <div class="item-meta">Sam. 1 nov. · 6/4 6/3</div>
      </div>
      <div class="item-end"><span class="stat-value" style="font-size:var(--fs-2xl);color:var(--accent-2)">+20</span><span class="small subtle">pts</span></div>
    </div>
    <div class="actions" style="margin-top:var(--s-4)">
      <a class="btn btn-secondary" href="05-mes-matchs.html#m1">Voir le détail du calcul</a>
      <a class="btn btn-ghost" href="04-classement.html">Classement {{i:chev-r}}</a>
    </div>
  </div></div>
</section>

<a class="btn btn-primary btn-block mt-8 only-b" href="12a-saisie-match.html">{{i:plus}} Déclarer un match</a>
"""

RANK_ROWS = [
    (1, "TieBreakeuse", "15/4", "Groupe A", "14 V · 2 D", 264, "up", "+1"),
    (2, "LiftCroisé", "15/5", "Groupe A", "12 V · 3 D", 231, "down", "−1"),
    (3, "SmashTonic", "30", "Groupe A", "11 V · 5 D", 200, "", ""),
    (4, "AceDuMatin", "30/2", "Groupe B", "9 V · 4 D", 186, "up", "+2"),
    (5, "Revers2Feu", "30/1", "Groupe B", "10 V · 6 D", 178, "down", "−1"),
    (6, "PetitPont", "30/3", "Groupe B", "8 V · 3 D", 161, "down", "−1"),
    (7, "AmortiZen", "30/1", "Groupe A", "7 V · 6 D", 140, "", ""),
    (8, "Volée92", "30/4", "Groupe B", "7 V · 5 D", 131, "up", "+3"),
    (9, "TopSpinou", "30/2", "Groupe B", "6 V · 7 D", 118, "", ""),
    (10, "SliceMaster", "30/1", "Groupe A", "5 V · 6 D", 97, "down", "−2"),
]


def rank_list():
    out = []
    for pos, ps, cl, tag, vd, pts, tr, d in RANK_ROWS:
        me = ps == "AceDuMatin"
        trend = ""
        if tr:
            trend = f' <span class="trend trend-{tr}">{{{{i:{tr}}}}}<span class="sr-only">{"monte de" if tr=="up" else "descend de"}</span>{d.replace("+","").replace("−","")}</span>'
        badge = ' <span class="badge badge-me">Vous</span>' if me else ""
        out.append(
            f'<li class="rank-row{" is-me" if me else ""}"{" aria-current=\"true\"" if me else ""}>'
            f'<span class="rank-pos">{pos}</span>'
            f'<div class="item-main"><div class="item-title">{ps}{badge}{trend}</div>'
            f'<div class="item-meta">{cl} · {vd} · {tag}</div></div>'
            f'<span class="rank-pts">{pts}<small>pts</small></span></li>')
    return "\n".join(out)


def rank_table():
    rows = []
    for pos, ps, cl, tag, vd, pts, tr, d in RANK_ROWS:
        me = ps == "AceDuMatin"
        v, dd = vd.replace(" V", "").replace(" D", "").split(" · ")
        perfs = {"TieBreakeuse": 5, "LiftCroisé": 4, "SmashTonic": 4, "AceDuMatin": 3, "Revers2Feu": 3, "PetitPont": 3, "AmortiZen": 1, "Volée92": 2, "TopSpinou": 1, "SliceMaster": 0}[ps]
        rows.append(
            f'<tr{" class=\"is-selected\" aria-current=\"true\"" if me else ""}><td class="num strong">{pos}</td>'
            f'<td class="strong">{ps}{" <span class=\"badge badge-me\">Vous</span>" if me else ""}</td>'
            f'<td>{cl}</td><td><span class="badge badge-tag">{tag}</span></td>'
            f'<td class="num">{int(v)+int(dd)}</td><td class="num">{v}</td><td class="num">{dd}</td><td class="num">{perfs}</td>'
            f'<td class="num strong">{pts}</td><td><a class="link" href="#detail">Détail</a></td></tr>')
    return "\n".join(rows)


CLASSEMENT = """
<div class="page-head">
  <span class="eyebrow">Classement de la Race</span>
  <h1 class="page-title">Race jeunes 2026-2027</h1>
  <p class="lead small">23 engagés · mis à jour le 6 nov. à 21 h 14 · seuls les matchs validés comptent</p>
</div>

<div class="toolbar">
  <div class="field mb-0 grow" style="min-width:220px">
    <label for="saison" class="sr-only">Saison</label>
    <select class="select" id="saison">
      <option selected>Race jeunes 2026-2027 — ouverte</option>
      <option>Race jeunes 2025-2026 — clôturée</option>
      <option>Race d'été 2025 — archivée</option>
    </select>
  </div>
  <div class="field mb-0" style="min-width:160px">
    <label for="cl" class="sr-only">Filtrer par classement</label>
    <select class="select" id="cl"><option>Tous classements</option><option>15/x</option><option>30/x</option><option>40 et NC</option></select>
  </div>
</div>
<div class="chips mb-4" role="group" aria-label="Filtrer par étiquette">
  <button class="chip" type="button" aria-pressed="true">Tous</button>
  <button class="chip" type="button" aria-pressed="false">{{i:tag}}Groupe A</button>
  <button class="chip" type="button" aria-pressed="false">{{i:tag}}Groupe B</button>
  <button class="chip" type="button" aria-pressed="false">{{i:tag}}Entraînement mercredi</button>
</div>

<div class="hide-tablet-up">
<ol class="rank" aria-label="Classement, 10 premiers sur 23">
""" + rank_list() + """
</ol>
</div>
<div class="table-wrap hide-mobile">
<table class="table">
  <caption class="sr-only">Classement de la Race jeunes 2026-2027</caption>
  <thead><tr><th class="num">Rang</th><th>Pseudo</th><th>Classement</th><th>Étiquette</th><th class="num">Matchs</th><th class="num">V</th><th class="num">D</th><th class="num">Perfs</th><th class="num">Points</th><th><span class="sr-only">Actions</span></th></tr></thead>
  <tbody>
""" + rank_table() + """
  </tbody>
</table>
</div>
<p class="center mt-4"><button class="btn btn-secondary" type="button">Afficher les 13 suivants</button></p>

<section class="section" id="detail" aria-labelledby="t-detail">
  <h2 class="section-title" id="t-detail">Détail du calcul — TieBreakeuse</h2>
  <div class="cases cases-2">
    <div class="case">
      <div class="calc">
        <div class="calc-row"><span>Victoires simples (×6)</span><span class="num">60</span></div>
        <div class="calc-row"><span>Perfs +1 échelon (×3)</span><span class="num">60</span></div>
        <div class="calc-row"><span>Perfs +2 échelons (×2)</span><span class="num">60</span></div>
        <div class="calc-row"><span>Victoires contre moins bien classé (×3)</span><span class="num">12</span></div>
        <div class="calc-row"><span>Défaites contre mieux classé (×2)</span><span class="num">4</span></div>
        <div class="calc-row"><span>Bonus assiduité (16 matchs validés)</span><span class="num">15</span></div>
        <div class="calc-row"><span>Plafond 60 pts / match</span><span class="num">0</span></div>
        <div class="calc-row calc-total"><span>Total</span><span class="num">264 pts</span></div>
      </div>
    </div>
    <div class="case">
      <p class="small muted">Barème appliqué : <strong>Race jeunes 2026-2027 · version 3</strong> (publiée le 12 oct.). Classement de référence figé au début de la saison.</p>
      <p class="small muted mb-0">Le détail match par match est visible par chaque joueur dans « Mes matchs ». <span class="subtle">[Visibilité des matchs des autres : à clarifier]</span></p>
    </div>
  </div>
</section>
"""

MES_MATCHS = """
<div class="page-head">
  <span class="eyebrow">Mes matchs</span>
  <h1 class="page-title">Race jeunes 2026-2027</h1>
  <p class="lead small">13 matchs · 9 V · 4 D · 3 perfs · 186 pts</p>
</div>

<div class="toolbar">
  <div class="seg" role="tablist" aria-label="Filtrer">
    <button type="button" role="tab" aria-selected="true">Tous</button>
    <button type="button" role="tab" aria-selected="false">Victoires</button>
    <button type="button" role="tab" aria-selected="false">Défaites</button>
    <button type="button" role="tab" aria-selected="false">En attente</button>
  </div>
  <a class="btn btn-secondary btn-sm" href="06-saisons-passees.html">{{i:calendar}} Autre saison</a>
</div>

<ul class="list" aria-label="Liste des matchs">
  <li>
    <div class="item">
      <span class="res res-win" aria-hidden="true">V</span>
      <div class="item-main"><div class="item-title"><span class="sr-only">Victoire contre</span>Volée92 <span class="subtle small">30/4</span></div><div class="item-meta">Mer. 5 nov. · 6/2 7/5</div></div>
      <div class="item-end"><span class="badge badge-wait">{{i:clock}}En attente</span><div class="small subtle">≈ +4 pts</div></div>
    </div>
  </li>
  <li id="m1">
    <details class="disclose" open>
      <summary class="item">
        <span class="res res-win" aria-hidden="true">V</span>
        <div class="item-main"><div class="item-title"><span class="sr-only">Victoire contre</span>SliceMaster <span class="subtle small">30/1</span> <span class="badge badge-perf">{{i:perf}}Perf</span></div><div class="item-meta">Sam. 1 nov. · 6/4 6/3 · <span class="badge badge-ok">{{i:check}}Validé</span></div></div>
        <div class="item-end strong" style="color:var(--accent-2)">+20</div>
        <span class="chev">{{i:chev-r}}</span>
      </summary>
      <div class="disclose-body">
        <div class="cases"><div class="case">
          <h3 class="case-title">Comment ces 20 points sont calculés</h3>
          <div class="calc">
            <div class="calc-row"><span>Mon classement de référence</span><span>30/2 <span class="subtle">(figé au 1er oct.)</span></span></div>
            <div class="calc-row"><span>Classement de l'adversaire</span><span>30/1</span></div>
            <div class="calc-row"><span>Écart</span><span>+1 échelon → <strong>perf</strong></span></div>
            <div class="calc-row"><span>Barème « Race jeunes 2026-2027 » v3 · Victoire +1</span><span class="num">20</span></div>
            <div class="calc-row"><span>Bonus</span><span class="num">0</span></div>
            <div class="calc-row"><span>Plafond 60 pts / match</span><span>non atteint</span></div>
            <div class="calc-row calc-total"><span>Points gagnés</span><span class="num">+20 pts</span></div>
          </div>
          <p class="small subtle mt-4 mb-0">Saisi par AceDuMatin le 1 nov. · validé par admin.club le 2 nov.</p>
        </div></div>
      </div>
    </details>
  </li>
  <li>
    <div class="item">
      <span class="res res-loss" aria-hidden="true">D</span>
      <div class="item-main"><div class="item-title"><span class="sr-only">Défaite contre</span>TieBreakeuse <span class="subtle small">15/4</span></div><div class="item-meta">Mer. 29 oct. · 3/6 2/6 · <span class="badge badge-ok">{{i:check}}Validé</span></div></div>
      <div class="item-end strong">+2</div><span class="chev">{{i:chev-r}}</span>
    </div>
  </li>
  <li>
    <div class="item">
      <span class="res res-win" aria-hidden="true">V</span>
      <div class="item-main"><div class="item-title"><span class="sr-only">Victoire contre</span>Ext. · Tournoi des Tilleuls, tableau 13 ans <span class="subtle small">30/2</span></div><div class="item-meta">Dim. 26 oct. · 6/3 4/6 10-7 · <span class="badge badge-ok">{{i:check}}Validé</span></div></div>
      <div class="item-end strong">+10</div><span class="chev">{{i:chev-r}}</span>
    </div>
  </li>
  <li>
    <div class="item">
      <span class="res res-wo" aria-hidden="true">WO</span>
      <div class="item-main"><div class="item-title"><span class="sr-only">Victoire par forfait contre</span>PetitPont <span class="subtle small">30/3</span></div><div class="item-meta">Mer. 22 oct. · forfait adverse · <span class="badge badge-ok">{{i:check}}Validé</span></div></div>
      <div class="item-end strong">+0</div><span class="chev">{{i:chev-r}}</span>
    </div>
  </li>
  <li>
    <div class="item">
      <span class="res res-loss" aria-hidden="true">D</span>
      <div class="item-main"><div class="item-title"><span class="sr-only">Défaite contre</span>LiftCroisé <span class="subtle small">15/5</span></div><div class="item-meta">Sam. 18 oct. · 4/6 6/7 · <span class="badge badge-ko">{{i:x}}Refusé</span> <span class="small">« Score incomplet, à ressaisir »</span></div></div>
      <div class="item-end subtle">—</div><span class="chev">{{i:chev-r}}</span>
    </div>
  </li>
  <li>
    <div class="item">
      <span class="res res-wo" aria-hidden="true">—</span>
      <div class="item-main"><div class="item-title" style="text-decoration:line-through"><span class="sr-only">Match annulé contre</span>AmortiZen</div><div class="item-meta">Mer. 15 oct. · pluie · <span class="badge badge-off">{{i:ban}}Annulé</span></div></div>
      <div class="item-end subtle">—</div><span class="chev">{{i:chev-r}}</span>
    </div>
  </li>
</ul>
<p class="center mt-6"><button class="btn btn-secondary" type="button">Voir les 6 matchs plus anciens</button></p>
"""

SAISONS = """
<div class="page-head">
  <span class="eyebrow">Historique</span>
  <h1 class="page-title">Mes saisons</h1>
  <p class="lead small">Les saisons clôturées et archivées sont consultables en lecture seule.</p>
</div>

<div class="cases cases-2">
  <article class="case">
    <div class="row-between"><h2 class="case-title mb-0">Race jeunes 2026-2027</h2><span class="badge badge-info">{{i:play}}Ouverte</span></div>
    <p class="small subtle">race-jeunes-2026-27 · sept. 2026 → juin 2027</p>
    <div class="stats mt-4">
      <div><span class="stat-label">Rang</span><span class="stat-value">4<small>e / 23</small></span></div>
      <div><span class="stat-label">Points</span><span class="stat-value">186</span></div>
    </div>
    <p class="small muted mt-4">9 V · 4 D · 3 perfs</p>
    <a class="btn btn-secondary" href="03-joueur-accueil.html">Saison en cours {{i:chev-r}}</a>
  </article>
  <article class="case">
    <div class="row-between"><h2 class="case-title mb-0">Race jeunes 2025-2026</h2><span class="badge badge-off">{{i:lock}}Clôturée</span></div>
    <p class="small subtle">race-jeunes-2025-26 · barème v2</p>
    <div class="stats mt-4">
      <div><span class="stat-label">Rang final</span><span class="stat-value">7<small>e / 21</small></span></div>
      <div><span class="stat-label">Points</span><span class="stat-value">142</span></div>
    </div>
    <p class="small muted mt-4">8 V · 6 D · 2 perfs · classement de départ 30/3</p>
    <div class="row"><a class="btn btn-secondary" href="04-classement.html">Classement</a><a class="btn btn-ghost" href="05-mes-matchs.html">Mes matchs</a></div>
  </article>
  <article class="case">
    <div class="row-between"><h2 class="case-title mb-0">Race d'été 2025</h2><span class="badge badge-off">{{i:archive}}Archivée</span></div>
    <p class="small subtle">race-ete-2025 · barème « été » v1</p>
    <div class="stats mt-4">
      <div><span class="stat-label">Rang final</span><span class="stat-value">2<small>e / 12</small></span></div>
      <div><span class="stat-label">Points</span><span class="stat-value">96</span></div>
    </div>
    <p class="small muted mt-4">6 V · 1 D · 2 perfs</p>
    <div class="row"><a class="btn btn-secondary" href="04-classement.html">Classement</a><a class="btn btn-ghost" href="05-mes-matchs.html">Mes matchs</a></div>
  </article>
  <article class="case">
    <div class="row-between"><h2 class="case-title mb-0">Race jeunes 2024-2025</h2><span class="badge badge-off">{{i:archive}}Archivée</span></div>
    <p class="small subtle">race-jeunes-2024-25</p>
    <p class="muted mt-4 mb-0">Vous n'étiez pas engagé·e dans cette saison.</p>
  </article>
</div>
"""

PAGES = [
    {"file": "03-joueur-accueil.html", "title": "Accueil", "label": "03 · Joueur — tableau de bord", "role": "joueur", "nav": "03-joueur-accueil.html", "main": ACCUEIL},
    {"file": "04-classement.html", "title": "Classement", "label": "04 · Joueur — classement de la Race", "role": "joueur", "nav": "04-classement.html", "main": CLASSEMENT},
    {"file": "05-mes-matchs.html", "title": "Mes matchs", "label": "05 · Joueur — historique et détail du calcul", "role": "joueur", "nav": "05-mes-matchs.html", "main": MES_MATCHS},
    {"file": "06-saisons-passees.html", "title": "Mes saisons", "label": "06 · Joueur — saisons passées", "role": "joueur", "nav": "06-saisons-passees.html", "main": SAISONS},
]
