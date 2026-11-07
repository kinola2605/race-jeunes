LOGO_BIG = ('<img class="logo-on-dark" src="../assets/logo/logo.svg" alt="" width="120" height="120" style="margin:0 auto">'
            '<img class="logo-on-light" src="../assets/logo/logo.svg" alt="" width="120" height="120" style="margin:0 auto">')

CONNEXION = f"""
<div class="center" style="margin:var(--s-6) 0 var(--s-8)">
  {LOGO_BIG}
  <span class="eyebrow mt-4">Mon club de tennis</span>
  <h1 class="page-title">Race jeunes</h1>
</div>

<form class="court" action="03-joueur-accueil.html" method="get" novalidate>
  <div class="field">
    <label for="pseudo">Pseudo</label>
    <input class="input" id="pseudo" name="pseudo" autocomplete="username" autocapitalize="none" spellcheck="false" required value="AceDuMatin">
  </div>
  <div class="field">
    <label for="mdp">Mot de passe</label>
    <div class="input-wrap">
      <input class="input" id="mdp" name="mdp" type="password" autocomplete="current-password" required value="motdepasse">
      <button class="icon-btn" type="button" data-toggle-pw="mdp" aria-pressed="false" aria-label="Afficher le mot de passe">{{{{i:eye}}}}</button>
    </div>
  </div>
  <button class="btn btn-primary btn-block" type="submit">Se connecter</button>
</form>

<div class="stack mt-8 small muted" style="--gap:var(--s-3)">
  <p class="row" style="flex-wrap:nowrap;align-items:flex-start">{{{{i:info}}}}<span><strong class="strong" style="color:var(--text)">Pas encore de compte ?</strong> Les comptes sont créés uniquement par le club. Adressez-vous à votre enseignant·e.</span></p>
  <p class="row" style="flex-wrap:nowrap;align-items:flex-start">{{{{i:key}}}}<span><strong class="strong" style="color:var(--text)">Mot de passe oublié ?</strong> Demandez une réinitialisation à l'administrateur du club.</span></p>
</div>
"""

CONNEXION_FOOT = """<footer class="foot">Aucune donnée personnelle collectée · aucun cookie de suivi · <a class="link" href="14-etats.html">Confidentialité</a></footer>"""

CHANGEMENT = """
<div class="page-head">
  <span class="eyebrow">Première connexion · AceDuMatin</span>
  <h1 class="page-title">Choisissez votre mot de passe</h1>
  <p class="lead">Le mot de passe remis par le club est temporaire. Vous devez le remplacer pour continuer.</p>
</div>

<form action="03-joueur-accueil.html" method="get" novalidate>
  <div class="field">
    <label for="old">Mot de passe temporaire</label>
    <div class="input-wrap">
      <input class="input mono" id="old" type="password" autocomplete="current-password" value="K7mQ-x4Rt-9pLw">
      <button class="icon-btn" type="button" data-toggle-pw="old" aria-pressed="false" aria-label="Afficher le mot de passe">{{i:eye}}</button>
    </div>
  </div>
  <div class="field">
    <label for="new">Nouveau mot de passe</label>
    <div class="input-wrap">
      <input class="input" id="new" type="password" autocomplete="new-password" aria-describedby="rules" value="revers-lifte-2026">
      <button class="icon-btn" type="button" data-toggle-pw="new" aria-pressed="false" aria-label="Afficher le mot de passe">{{i:eye}}</button>
    </div>
    <div class="meter" aria-hidden="true"><span style="width:80%"></span></div>
    <ul class="pw-rules" id="rules" aria-label="Règles du mot de passe">
      <li class="ok">{{i:check}}<span>Au moins 10 caractères</span></li>
      <li class="ok">{{i:check}}<span>Différent du mot de passe temporaire</span></li>
      <li class="ok">{{i:check}}<span>Ne contient pas votre pseudo</span></li>
      <li class="todo">{{i:clock}}<span>Conseil : une phrase de 3-4 mots est plus simple à retenir</span></li>
    </ul>
  </div>
  <div class="field field-invalid">
    <label for="confirm">Confirmer le nouveau mot de passe</label>
    <input class="input" id="confirm" type="password" autocomplete="new-password" aria-invalid="true" aria-describedby="confirm-err" value="revers-lifte-2025">
    <p class="error-msg" id="confirm-err">{{i:alert}}<span>Les deux mots de passe ne correspondent pas.</span></p>
  </div>
  <div class="actions-stack">
    <button class="btn btn-primary btn-block" type="submit">Enregistrer et continuer</button>
    <a class="btn btn-ghost btn-block" href="01-connexion.html">Se déconnecter</a>
  </div>
</form>
"""

PAGES = [
    {"file": "01-connexion.html", "title": "Connexion", "label": "01 · Connexion", "main": CONNEXION, "main_cls": "main-narrow", "foot": CONNEXION_FOOT},
    {"file": "02-changement-mdp.html", "title": "Nouveau mot de passe", "label": "02 · Changement de mot de passe obligatoire", "main": CHANGEMENT, "main_cls": "main-narrow"},
]
