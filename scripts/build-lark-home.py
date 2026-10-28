#!/usr/bin/env python3
"""Assemble public/index.html from the LARK mockup + live wiring."""
from pathlib import Path

MOCKUP = Path("/Users/ibarroslima/Downloads/LARK_mockup.html")
DEST = Path("/Users/ibarroslima/ai-coe-heroku-clone/public/index.html")

CSS = r"""
.flag-cloud{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:#d7ecff;font-size:22px;overflow:hidden;flex:none;line-height:1}
.flag-cloud .cloud-img{width:22px;height:22px;object-fit:contain;display:block}
.admin-only{display:none!important}
body.is-admin .admin-only, .admin-only.show{display:inline-flex!important}
.btn.danger{border-color:#ffd0d8;color:#b60554;background:#fff}
.drawer-admin{display:flex;gap:8px;align-items:center}
.res-admin,.learn-admin{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 0}
.link-admin{display:inline-flex;gap:6px;margin-left:auto}
.link-admin button{border:0;background:none;color:var(--blue);font-size:12px;font-weight:600;padding:0}
.users-list{list-style:none;padding:0;margin:0;display:grid;gap:8px}
.users-list li{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:8px 0;border-bottom:1px solid var(--line)}
.users-list button{border:0;background:none;color:#b60554;font-weight:600}
footer a.classic{font-weight:600}
.top .tools{flex-wrap:wrap;justify-content:flex-end}
"""

ADMIN_BTNS = """
      <button class="btn ghost admin-only" type="button" id="exportCsvBtn" data-t="csvBtn">CSV</button>
      <button class="btn ghost admin-only" type="button" id="translateAllBtn" data-t="translateBtn">Traducir</button>
      <button class="btn ghost admin-only" type="button" id="manageUsersBtn" data-t="usersBtn">Usuarios</button>
      <a class="btn ghost admin-only" href="/presales-learning/" data-t="plsAdminBtn">Learning</a>
      <button class="btn ghost" type="button" id="authBtn" data-t="adminBtn">Admin</button>
"""

EXTRA_FIELDS = """
      <div class="fld2">
        <label class="fld"><span data-t="fAuthor"></span><select name="author" id="fAuthor" required></select></label>
        <label class="fld"><span data-t="fCreated"></span><input required name="created" id="fCreated"></label>
      </div>
      <div class="fld2">
        <label class="fld"><span data-t="fPhase"></span><input name="phase" data-tp="fPhase"></label>
        <label class="fld"><span data-t="fTheme"></span><input name="theme" data-tp="fTheme"></label>
      </div>
      <div class="fld2">
        <label class="fld"><span data-t="fStatus"></span>
          <select name="status">
            <option value="in_progress">WIP</option>
            <option value="completed">OK</option>
          </select>
        </label>
        <label class="fld"><span data-t="fTags"></span><input name="tags"></label>
      </div>
"""

EXTRA_MODALS = r"""
<div class="modal" id="authModal" role="dialog" aria-modal="true">
  <div class="modal-box">
    <header><div><h2 data-t="authTitle"></h2><p data-t="authSub"></p></div><button class="icon-btn" type="button" data-close-extra aria-label="Cerrar"><svg class="ico"><use href="#i-x"/></svg></button></header>
    <form id="authForm">
      <label class="fld"><span data-t="authPass"></span><input id="authPass" type="password" required autocomplete="current-password"></label>
      <div class="actions"><button class="btn ghost" type="button" data-close-extra data-t="cancel"></button><button class="btn primary" type="submit" data-t="authGo"></button></div>
    </form>
  </div>
</div>
<div class="modal" id="usersModal" role="dialog" aria-modal="true">
  <div class="modal-box">
    <header><div><h2 data-t="usersTitle"></h2></div><button class="icon-btn" type="button" data-close-extra aria-label="Cerrar"><svg class="ico"><use href="#i-x"/></svg></button></header>
    <form id="usersForm">
      <label class="fld"><span data-t="usersName"></span><input id="userName" required></label>
      <div class="actions"><button class="btn primary" type="submit" data-t="usersAdd"></button><button class="btn ghost" type="button" data-close-extra data-t="usersClose"></button></div>
    </form>
    <ul class="users-list" id="usersList" style="padding:0 26px 26px"></ul>
  </div>
</div>
<div class="modal" id="linkModal" role="dialog" aria-modal="true">
  <div class="modal-box">
    <header><div><h2 data-t="addLink"></h2></div><button class="icon-btn" type="button" data-close-extra aria-label="Cerrar"><svg class="ico"><use href="#i-x"/></svg></button></header>
    <form id="linkForm">
      <label class="fld"><span data-t="linkTitle"></span><input name="title" required></label>
      <label class="fld"><span data-t="linkUrl"></span><input name="url" type="url" required></label>
      <div class="fld2">
        <label class="fld"><span data-t="linkKind"></span><input name="kind" placeholder="Google Docs"></label>
        <label class="fld"><span data-t="linkGroup"></span><select name="group" id="linkGroup"></select></label>
      </div>
      <div class="actions"><button class="btn ghost" type="button" data-close-extra data-t="cancel"></button><button class="btn primary" type="submit" data-t="saveLink"></button></div>
    </form>
  </div>
</div>
<div class="modal" id="keyModal" role="dialog" aria-modal="true">
  <div class="modal-box">
    <header><div><h2 data-t="addKey"></h2></div><button class="icon-btn" type="button" data-close-extra aria-label="Cerrar"><svg class="ico"><use href="#i-x"/></svg></button></header>
    <form id="keyForm">
      <label class="fld"><span data-t="keyName"></span><input name="name" required></label>
      <label class="fld"><span data-t="keyDesc"></span><input name="desc"></label>
      <label class="fld"><span data-t="linkUrl"></span><input name="url" type="url" required></label>
      <div class="actions"><button class="btn ghost" type="button" data-close-extra data-t="cancel"></button><button class="btn primary" type="submit" data-t="saveLink"></button></div>
    </form>
  </div>
</div>
"""

CASES_BLOCK_OLD = """const CASES = DATA.cases, BYID = Object.fromEntries(CASES.map(c=>[c.id,c]));
const favs = new Set(JSON.parse(localStorage.getItem("lark.favs")||"[]"));
const saveFavs = ()=>localStorage.setItem("lark.favs",JSON.stringify([...favs]));
const AUTHORS = Object.entries(CASES.reduce((a,c)=>(a[c.author]=(a[c.author]||0)+1,a),{})).sort((a,b)=>b[1]-a[1]);
const LINKS = DATA.groups.flatMap(g=>g.links.map(l=>({...l,g})));
"""

CASES_BLOCK_NEW = """let CASES = DATA.cases, BYID = Object.fromEntries(CASES.map(c=>[c.id,c]));
const favs = new Set(JSON.parse(localStorage.getItem("lark.favs")||"[]"));
const saveFavs = ()=>localStorage.setItem("lark.favs",JSON.stringify([...favs]));
let AUTHORS = Object.entries(CASES.reduce((a,c)=>(a[c.author]=(a[c.author]||0)+1,a),{})).sort((a,b)=>b[1]-a[1]);
let LINKS = DATA.groups.flatMap(g=>g.links.map(l=>({...l,g})));
function rebuildDerived(){
  CASES = DATA.cases;
  BYID = Object.fromEntries(CASES.map(c=>[c.id,c]));
  AUTHORS = Object.entries(CASES.reduce((a,c)=>(a[c.author]=(a[c.author]||0)+1,a),{})).sort((a,b)=>b[1]-a[1]);
  LINKS = DATA.groups.flatMap(g=>g.links.map(l=>({...l,g})));
}
"""

def replace_once(text, old, new, label):
    if old not in text:
        raise SystemExit(f"missing snippet: {label}")
    return text.replace(old, new, 1)


def main():
    text = MOCKUP.read_text(encoding="utf-8")

    text = replace_once(text, "</style>", CSS + "\n</style>", "css")

    text = replace_once(
        text,
        '<a class="brand" href="#/" aria-label="LARK, inicio">',
        '<a class="brand" href="#/" aria-label="LARK, inicio">\n      <div id="flagCloud" class="flag-cloud" aria-hidden="true">🇧🇷</div>',
        "flag cloud",
    )

    text = replace_once(
        text,
        '      <button class="btn primary" type="button" data-contrib><svg class="ico"><use href="#i-plus"/></svg><span class="lbl" data-t="share"></span></button>',
        ADMIN_BTNS
        + '      <button class="btn primary" type="button" data-contrib><svg class="ico"><use href="#i-plus"/></svg><span class="lbl" data-t="share"></span></button>',
        "admin buttons",
    )

    text = replace_once(
        text,
        '    <span class="proto" data-t="proto"></span>',
        '    <a class="classic" href="/classic/" data-t="classic">LARK clásico</a>\n    <span class="proto" data-t="proto"></span>',
        "classic footer",
    )

    text = replace_once(
        text,
        '      <label class="fld"><span data-t="fLink"></span><input name="u" type="url" placeholder="https://"></label>',
        EXTRA_FIELDS
        + '      <label class="fld"><span data-t="fLink"></span><input name="u" type="url" placeholder="https://"></label>',
        "contrib fields",
    )

    text = replace_once(text, '<div class="toast" id="toast"', EXTRA_MODALS + '\n<div class="toast" id="toast"', "modals")

    text = replace_once(
        text,
        'proto:"Mockup de propuesta con datos reales"',
        'proto:"LARK · PS LATAM"',
        "proto es",
    )
    text = replace_once(
        text,
        'proto:"Mockup de proposta com dados reais"',
        'proto:"LARK · PS LATAM"',
        "proto pt",
    )
    text = replace_once(
        text,
        'proto:"Proposal mockup with real data"',
        'proto:"LARK · PS LATAM"',
        "proto en",
    )

    text = replace_once(
        text,
        "const fmtDate = d => {const [y,m,dd]=d.split(\"-\");return `${+dd} ${t(\"months\")[+m-1]} ${y}`};",
        'const fmtDate = d => {const m=String(d||"").match(/^(\\d{4})-(\\d{2})-(\\d{2})/); if(!m) return d||"–"; return `${+m[3]} ${t("months")[+m[2]-1]} ${m[1]}`};',
        "fmtDate",
    )

    text = replace_once(text, CASES_BLOCK_OLD, CASES_BLOCK_NEW, "cases lets")

    learn_anchor = '        <div class="keys">${DATA.keys.slice(0,4).map(keyCard).join("")}</div>\n      </div>\n    </section>\n    <section class="sec">\n      <div class="card learn">'
    learn_end = '      </div>\n    </section>\n    <section class="sec">\n      <div class="sec-h"><div><h2>${t("people")}</h2>'
    start = text.find(learn_anchor)
    end = text.find(learn_end)
    if start < 0 or end < 0 or end < start:
        raise SystemExit("learn section bounds")
    text = (
        text[:start]
        + '        <div class="keys">${DATA.keys.slice(0,4).map(keyCard).join("")}</div>\n      </div>\n    </section>\n    ${homeLearnHtml()}\n    <section class="sec">\n      <div class="sec-h"><div><h2>${t("people")}</h2>'
        + text[end + len(learn_end) :]
    )

    text = replace_once(
        text,
        "/* ---------------- Home ---------------- */\nfunction viewHome(){\n  const recent=CASES.slice(0,6);\n  const s=DATA.sessions[0], sc=s.copy[lang]||s.copy.es;",
        """/* ---------------- Home ---------------- */
function homeLearnHtml(){
  const s=DATA.sessions[0];
  if(!s || !s.title) return "";
  const sc=s.copy[lang]||s.copy.es||{tag:"",inside:[]};
  const vid=(s.videos&&(s.videos[lang]||s.videos.es))||{u:"#/learning"};
  const inside=Array.isArray(sc.inside)?sc.inside:[];
  return `
    <section class="sec">
      <div class="card learn">
        <div class="img" style="background-image:url('${s.hero||IMG.learn}')" role="img" aria-label="${esc(s.title)}"><a class="play" href="${vid.u}" target="_blank" rel="noopener" aria-label="${t("watch")}">${ico("play")}</a></div>
        <div class="txt">
          <span class="tagline">${t("learnNew")}</span>
          <h3>${esc(s.title)}</h3>
          <p class="meta" style="margin:0">${esc(sc.tag||"")}</p>
          <ul>${inside.slice(1,5).map(i=>`<li>${ico("check")}<span>${esc(i)}</span></li>`).join("")}</ul>
          <div class="vlangs"><a class="btn primary sm" href="${vid.u}" target="_blank" rel="noopener">${ico("play")} ${t("watch")}</a><a class="btn ghost sm" href="#/learning">${t("navLearn")}</a></div>
        </div>
      </div>
    </section>`;
}
function viewHome(){
  const recent=CASES.slice(0,6);
  const s=DATA.sessions[0]; const sc=s?(s.copy[lang]||s.copy.es||{tag:"",inside:[]}):{tag:"",inside:[]};""",
        "home session helper",
    )

    text = replace_once(
        text,
        '  if(f){ e.stopPropagation(); const id=+f.dataset.fav; favs.has(id)?favs.delete(id):favs.add(id); saveFavs();\n    $$(`[data-fav="${id}"]`).forEach(b=>{const on=favs.has(id);b.setAttribute("aria-pressed",on);b.setAttribute("aria-label",on?t("unfav"):t("fav")); if(b.classList.contains("icon-btn")) b.style.color=on?"var(--yellow)":"var(--navy)"});\n    if($("#facets")) drawFacets(); toast(favs.has(id)?t("fav"):t("unfav")); return; }',
        "  if(f){ e.stopPropagation(); const id=+f.dataset.fav; if(window.toggleFav){ window.toggleFav(id); return; }\n    favs.has(id)?favs.delete(id):favs.add(id); saveFavs();\n    $$(`[data-fav=\"${id}\"]`).forEach(b=>{const on=favs.has(id);b.setAttribute(\"aria-pressed\",on);b.setAttribute(\"aria-label\",on?t(\"unfav\"):t(\"fav\")); if(b.classList.contains(\"icon-btn\")) b.style.color=on?\"var(--yellow)\":\"var(--navy)\"});\n    if($(\"#facets\")) drawFacets(); toast(favs.has(id)?t(\"fav\"):t(\"unfav\")); return; }",
        "fav click",
    )

    text = replace_once(
        text,
        '$("#contribForm").addEventListener("submit",e=>{e.preventDefault();$("#modal").classList.remove("show");e.target.reset();toast(t("published"))});',
        "// contrib submit handled by /lark-live.js",
        "contrib submit",
    )

    text = replace_once(
        text,
        '        <div class="vids">${["es","pt","en"].map(l=>`<a class="vid" href="${s.videos[l].u}" target="_blank" rel="noopener"><div class="th" data-dur="${s.videos[l].dur}" style="background-image:url(\'${IMG.s1[l]}\')"></div>${{es:"Español",pt:"Português",en:"English"}[l]}</a>`).join("")}</div>',
        '        <div class="vids">${["es","pt","en"].map(l=>{const v=s.videos&&s.videos[l]||{}; const thumb=v.thumb||(IMG.s1&&IMG.s1[l])||IMG.learn; return `<a class="vid" href="${v.u||"/presales-learning/"}" target="_blank" rel="noopener"><div class="th" data-dur="${v.dur||""}" style="background-image:url(\'${thumb}\')"></div>${{es:"Español",pt:"Português",en:"English"}[l]}</a>`;}).join("")}</div>',
        "learn thumbs",
    )

    text = replace_once(
        text,
        "setLang(lang);\n</script>",
        'setLang(lang);\n</script>\n<script src="/lark-live.js"></script>',
        "live script",
    )

    DEST.write_text(text, encoding="utf-8")
    print(f"wrote {DEST} ({DEST.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
