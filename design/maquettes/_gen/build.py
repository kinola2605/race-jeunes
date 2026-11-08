"""Génère les maquettes HTML statiques de design/maquettes/.

Usage :  python design/maquettes/_gen/build.py
Les fichiers .html générés sont versionnés ; modifier les fragments dans pages_*.py puis relancer.
Aucune dépendance externe.
"""
import re
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent

NAV = {
    "joueur": [
        ("03-joueur-accueil.html", "home", "Accueil"),
        ("04-classement.html", "trophy", "Classement"),
        ("05-mes-matchs.html", "list", "Matchs"),
        ("12a-saisie-match.html", "plus", "Saisir"),
        ("06-saisons-passees.html", "calendar", "Saisons"),
    ],
    "admin": [
        ("07-admin-suivi.html", "activity", "Suivi"),
        ("12b-validation.html", "ball", "Matchs"),
        ("08a-admin-joueurs.html", "users", "Joueurs"),
        ("09a-admin-saisons.html", "calendar", "Saisons"),
        ("13-admin-journal.html", "journal", "Journal"),
    ],
}
USER = {"joueur": ("AceDuMatin", "Joueur"), "admin": ("admin.club", "Admin")}


def icons(html: str) -> str:
    """{{i:nom}} ou {{i:nom:classe}} -> SVG du sprite."""
    def rep(m):
        name, cls = m.group(1), (m.group(2) or "")
        klass = ("ic " + cls).strip()
        return f'<svg class="{klass}" aria-hidden="true" focusable="false"><use href="#i-{name}"/></svg>'
    return re.sub(r"\{\{i:([a-z\-]+)(?::([a-z\- ]+))?\}\}", rep, html)


LOGOS = ('<img class="logo logo-on-dark" src="../assets/logo/logo.svg" alt="Mon club de tennis">'
         '<img class="logo logo-on-light" src="../assets/logo/logo.svg" alt="Mon club de tennis">')


def shell(page):
    role = page.get("role")
    title = page["title"]
    main_cls = page.get("main_cls", "")
    head = f"""<!doctype html>
<html lang="fr" data-dir="b" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex">
<title>{title} · Race jeunes (maquette)</title>
<link rel="stylesheet" href="css/tokens.css">
<link rel="stylesheet" href="css/app.css">
</head>
<body data-screen="{page['label']}">
<a class="skip" href="#main">Aller au contenu</a>
<div class="app">
"""
    top = ""
    nav = ""
    if role:
        pseudo, rlabel = USER[role]
        home = NAV[role][0][0]
        top = f"""<header class="topbar">
  <a class="brand" href="{home}">{LOGOS}<span class="brand-txt"><span class="caps">Race jeunes</span><span class="brand-name">Saison 2026-2027</span></span></a>
  <a class="user-chip" href="02-changement-mdp.html?volontaire=1" aria-label="Mon compte : {pseudo} ({rlabel})">{{{{i:user}}}}<span>{pseudo}</span>{'<span class="role-tag">Admin</span>' if role == 'admin' else ''}</a>
</header>
"""
        items = []
        for href, ic, label in NAV[role]:
            cur = ' aria-current="page"' if href == page.get("nav") else ""
            items.append(f'<li><a href="{href}"{cur}>{{{{i:{ic}}}}}<span>{label}</span></a></li>')
        nav = (f'<nav class="appnav" aria-label="Navigation principale">'
               f'<a class="nav-brand" href="{home}">{LOGOS}<span class="brand-txt"><span class="caps">Race jeunes</span><span class="brand-name">Mon club</span></span></a>'
               f'<ul>{"".join(items)}</ul></nav>\n')
    body = f'<main id="main" class="main {main_cls}">\n{page["main"]}\n</main>\n'
    foot = page.get("foot", "")
    end = """</div>
<script src="js/proto.js"></script>
</body>
</html>
"""
    return icons(head + top + nav + body + foot + end)


def main():
    from pages_acces import PAGES as P1
    from pages_joueur import PAGES as P2
    from pages_admin import PAGES as P3
    from pages_admin2 import PAGES as P4
    from pages_misc import PAGES as P5
    for page in P1 + P2 + P3 + P4 + P5:
        (OUT / page["file"]).write_text(shell(page), encoding="utf-8", newline="\n")
        print("ok", page["file"])


if __name__ == "__main__":
    import sys
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    main()
