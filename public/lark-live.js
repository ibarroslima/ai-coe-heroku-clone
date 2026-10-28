/* Live LARK: APIs, admin, flag carousel. Loaded after the mockup shell. */
(() => {
  const EXTRA = {
    es: {
      proto: "LARK · PS LATAM",
      classic: "LARK clásico",
      adminBtn: "Admin",
      logoutBtn: "Salir",
      csvBtn: "Exportar CSV",
      translateBtn: "Traducir todo",
      usersBtn: "Usuarios",
      resAdminBtn: "Editar recursos",
      plsAdminBtn: "Editar Learning",
      authTitle: "Entrar como admin",
      authSub: "La misma contraseña de las tres secciones.",
      authPass: "Contraseña",
      authGo: "Entrar",
      authErr: "Contraseña inválida.",
      fAuthor: "Autor",
      fCreated: "Creado por",
      fPhase: "Fase",
      fTheme: "Tema",
      fStatus: "Estado",
      fTags: "Tags",
      editCase: "Editar",
      delCase: "Eliminar",
      delConfirm: "¿Eliminar este caso?",
      saved: "Guardado.",
      deleted: "Eliminado.",
      translating: "Traduciendo…",
      translated: "Traducción lista.",
      usersTitle: "Gestionar usuarios (autores)",
      usersAdd: "Agregar",
      usersClose: "Cerrar",
      usersName: "Nombre",
      linkTitle: "Título",
      linkUrl: "URL",
      linkKind: "Tipo",
      linkGroup: "Grupo",
      addLink: "Agregar enlace",
      saveLink: "Guardar enlace",
      delLink: "Eliminar",
      addKey: "Agregar recurso clave",
      keyName: "Nombre",
      keyDesc: "Descripción",
    },
    pt: {
      proto: "LARK · PS LATAM",
      classic: "LARK clássico",
      adminBtn: "Admin",
      logoutBtn: "Sair",
      csvBtn: "Exportar CSV",
      translateBtn: "Traduzir tudo",
      usersBtn: "Usuários",
      resAdminBtn: "Editar recursos",
      plsAdminBtn: "Editar Learning",
      authTitle: "Entrar como admin",
      authSub: "A mesma senha das três seções.",
      authPass: "Senha",
      authGo: "Entrar",
      authErr: "Senha inválida.",
      fAuthor: "Autor",
      fCreated: "Criado por",
      fPhase: "Fase",
      fTheme: "Tema",
      fStatus: "Status",
      fTags: "Tags",
      editCase: "Editar",
      delCase: "Excluir",
      delConfirm: "Excluir este caso?",
      saved: "Salvo.",
      deleted: "Excluído.",
      translating: "Traduzindo…",
      translated: "Tradução concluída.",
      usersTitle: "Gerenciar usuários (autores)",
      usersAdd: "Adicionar",
      usersClose: "Fechar",
      usersName: "Nome",
      linkTitle: "Título",
      linkUrl: "URL",
      linkKind: "Tipo",
      linkGroup: "Grupo",
      addLink: "Adicionar link",
      saveLink: "Salvar link",
      delLink: "Excluir",
      addKey: "Adicionar recurso-chave",
      keyName: "Nome",
      keyDesc: "Descrição",
    },
    en: {
      proto: "LARK · PS LATAM",
      classic: "Classic LARK",
      adminBtn: "Admin",
      logoutBtn: "Log out",
      csvBtn: "Export CSV",
      translateBtn: "Translate all",
      usersBtn: "Users",
      resAdminBtn: "Edit resources",
      plsAdminBtn: "Edit Learning",
      authTitle: "Admin sign-in",
      authSub: "Same password as all LARK sections.",
      authPass: "Password",
      authGo: "Sign in",
      authErr: "Invalid password.",
      fAuthor: "Author",
      fCreated: "Created by",
      fPhase: "Phase",
      fTheme: "Theme",
      fStatus: "Status",
      fTags: "Tags",
      editCase: "Edit",
      delCase: "Delete",
      delConfirm: "Delete this case?",
      saved: "Saved.",
      deleted: "Deleted.",
      translating: "Translating…",
      translated: "Translation complete.",
      usersTitle: "Manage users (authors)",
      usersAdd: "Add",
      usersClose: "Close",
      usersName: "Name",
      linkTitle: "Title",
      linkUrl: "URL",
      linkKind: "Kind",
      linkGroup: "Group",
      addLink: "Add link",
      saveLink: "Save link",
      delLink: "Delete",
      addKey: "Add key resource",
      keyName: "Name",
      keyDesc: "Description",
    },
  };

  Object.keys(T).forEach((l) => Object.assign(T[l], EXTRA[l] || {}));
  $$("[data-t]").forEach((el) => {
    const v = t(el.dataset.t);
    if (typeof v === "string") el.textContent = v;
  });
  $$("[data-tp]").forEach((el) => {
    const v = t(el.dataset.tp);
    if (typeof v === "string") el.placeholder = v;
  });

  const FALLBACK_GROUPS = JSON.parse(JSON.stringify(DATA.groups || []));
  const FALLBACK_KEYS = JSON.parse(JSON.stringify(DATA.keys || []));
  const FALLBACK_CASES = JSON.parse(JSON.stringify(DATA.cases || []));
  const FALLBACK_SESSIONS = JSON.parse(JSON.stringify(DATA.sessions || []));

  const AUTHORS_STORAGE_KEY = "ai_coe_authors_v1";
  const CLIENT_ID_STORAGE_KEY = "ai_coe_client_id_v1";
  const CREATOR_NAME_STORAGE_KEY = "ai_coe_creator_name_v1";
  const DEFAULT_AUTHORS = [
    "Alejandra Acuña", "Amanda Basilio", "Christian Salazar", "Diego Castro",
    "Diego da Fonseca", "Egberto Peretti", "Emmanuel Moreno", "Fabio Tamaki",
    "Igor Lima", "Irineu Silva", "Ixchel Saucedo", "Juan Schunck", "Julio Carmo",
    "Israel Hernandez", "Luis M. Pacheco", "Luis Resende", "Nelson Stebulatis",
    "Regina Garrido", "Sandro Thomas", "Thais Ishii",
  ];
  const FLAG_SEQUENCE = [
    { icon: "🇧🇷" },
    { icon: "☁", color: "#00A1E0" },
    { icon: "🇦🇷" },
    { icon: "🤖" },
    { icon: "🇲🇽" },
    { icon: "🌐" },
    { icon: "🇨🇴" },
    { image: "/assets/slack.png" },
    { icon: "🇵🇪" },
    { image: "/assets/cursor-cube.png" },
    { icon: "🇨🇱" },
    { image: "/assets/gemini.png" },
  ];

  let isAdmin = false;
  let editCaseId = null;
  let bookmarkState = {};
  let managedAuthors = loadAuthors();
  const clientId = getOrCreateClientId();

  function getOrCreateClientId() {
    const fromStorage = localStorage.getItem(CLIENT_ID_STORAGE_KEY);
    if (fromStorage) return fromStorage;
    const generated = (crypto.randomUUID && crypto.randomUUID()) || `c-${Date.now()}`;
    localStorage.setItem(CLIENT_ID_STORAGE_KEY, generated);
    return generated;
  }

  function loadAuthors() {
    try {
      const raw = JSON.parse(localStorage.getItem(AUTHORS_STORAGE_KEY) || "[]");
      const extra = Array.isArray(raw) ? raw.map((n) => String(n || "").trim()).filter(Boolean) : [];
      return Array.from(new Set([...DEFAULT_AUTHORS, ...extra]));
    } catch {
      return [...DEFAULT_AUTHORS];
    }
  }

  function saveAuthors() {
    localStorage.setItem(AUTHORS_STORAGE_KEY, JSON.stringify(managedAuthors));
  }

  function initials(name) {
    const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "?";
    const first = parts[0][0] || "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : (parts[0][1] || "");
    return (first + last).toUpperCase();
  }

  function inferType(row) {
    const raw = String(row.category || "").trim().toLowerCase();
    if (["asset", "setup", "tool", "value"].includes(raw)) return raw;
    if (/reusable asset|activo reutilizable|ativo reutil/.test(raw)) return "asset";
    if (/initial setting|setup|config/.test(raw)) return "setup";
    if (/tool|herramienta|ferramenta/.test(raw)) return "tool";
    if (/value|valor|pricing|strategy|business/.test(raw)) return "value";
    return "asset";
  }

  function isoDate(value) {
    if (!value) return new Date().toISOString().slice(0, 10);
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      const m = String(value).match(/^(\d{4}-\d{2}-\d{2})/);
      return m ? m[1] : String(value).slice(0, 10);
    }
    return d.toISOString().slice(0, 10);
  }

  function kindFromUrl(url, fallback) {
    const u = String(url || "").toLowerCase();
    if (fallback && KIND[fallback]) return fallback;
    if (u.includes("notebooklm")) return "NotebookLM";
    if (u.includes("docs.google.com/presentation") || u.includes("slides")) return "Google Slides";
    if (u.includes("docs.google.com/document")) return "Google Docs";
    if (u.includes("docs.google.com/spreadsheets") || u.includes("sheets")) return "Google Sheets";
    if (u.includes("drive.google.com")) return "Google Drive";
    if (u.includes("slack.com")) return "Slack Canvas";
    if (u.includes("quip.com")) return "Quip";
    if (u.includes("github.com") || u.includes("git.soma")) return "Git";
    if (u.includes("org62") || u.includes("lightning.force")) return "org62";
    if (u.includes("salesforce.com") || u.includes("sfdc.co")) return "Salesforce";
    if (u.includes("vidyard") || u.includes("youtube") || u.includes("vimeo")) return "Vidyard";
    if (u.includes("basecamp")) return "Basecamp";
    return fallback || "App web";
  }

  function parseAttachments(row) {
    const raw = row.attachments_data ?? row.attachments;
    if (!raw) return [];
    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function linksFromRow(row) {
    const links = [];
    const seen = new Set();
    const push = (u, l) => {
      const url = String(u || "").trim();
      if (!url || seen.has(url)) return;
      seen.add(url);
      links.push({ u: url, l: kindFromUrl(url, l) });
    };
    parseAttachments(row).forEach((a) => {
      const url = a.data || a.url || "";
      if (/^https?:\/\//i.test(url)) push(url, a.name || a.type);
    });
    if (row.video_url) push(row.video_url, "Vidyard");
    const blob = [row.description, row.description_es, row.description_pt, row.description_en]
      .filter(Boolean)
      .join("\n");
    (blob.match(/https?:\/\/[^\s)>\],"]+/gi) || []).forEach((u) => push(u.replace(/[.,;]+$/, ""), "Link"));
    return links;
  }

  function mapCase(row) {
    const author = row.author_name || row.author || "";
    return {
      id: Number(row.id),
      type: inferType(row),
      tech: String(row.technology || "")
        .split(/[,;/|]+/)
        .map((s) => s.trim())
        .filter(Boolean),
      phase: row.phase || "",
      theme: row.theme || "",
      author,
      ini: initials(author),
      status: row.status === "completed" ? "completed" : "in_progress",
      date: isoDate(row.created_at || row.date),
      tags: Array.isArray(row.tags) ? row.tags : [],
      links: Array.isArray(row.links) && row.links.length ? row.links : linksFromRow(row),
      is_favorite: Boolean(row.is_favorite),
      created_by: row.created_by_name || row.created_by || "",
      skill: row.skill_name || "",
      category: row.category || inferType(row),
      source_language: row.source_language || lang || "es",
      i18n: {
        es: { t: row.title_es || row.title || "", d: row.description_es || row.description || "" },
        pt: { t: row.title_pt || row.title || "", d: row.description_pt || row.description || "" },
        en: { t: row.title_en || row.title || "", d: row.description_en || row.description || "" },
      },
    };
  }

  function mediaUrl(src) {
    const value = String(src || "").trim();
    if (!value) return "";
    if (/^(https?:)?\/\//i.test(value) || value.startsWith("/") || value.startsWith("data:")) return value;
    return `/presales-learning/${value.replace(/^\.\//, "")}`;
  }

  function mapSession(s) {
    const copy = {};
    ["es", "pt", "en"].forEach((l) => {
      const c = (s.copy && s.copy[l]) || {};
      copy[l] = { tag: c.tagline || c.tag || "", d: c.desc || c.d || "", inside: c.inside || [] };
    });
    const videos = {};
    ["es", "pt", "en"].forEach((l) => {
      const v = (s.videos && s.videos[l]) || {};
      videos[l] = {
        u: mediaUrl(v.src || v.u) || "/presales-learning/",
        dur: v.dur || "",
        thumb: mediaUrl(v.thumb) || mediaUrl(s.hero) || (typeof IMG !== "undefined" ? IMG.learn : ""),
      };
    });
    return {
      id: s.id,
      num: s.num,
      title: s.title,
      version: s.version || "",
      hero: mediaUrl(s.hero) || (typeof IMG !== "undefined" ? IMG.learn : ""),
      copy,
      videos,
    };
  }

  async function api(url, options = {}) {
    const headers = { "x-client-id": clientId, ...(options.headers || {}) };
    if (options.body && !(options.body instanceof FormData) && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
    const response = await fetch(url, { credentials: "include", ...options, headers });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    return data;
  }

  function applyBookmarkState(state) {
    bookmarkState = state || {};
    const deletes = new Set((bookmarkState.bookmark_link_deletes_v1 || []).map(String));
    const overrides = bookmarkState.bookmark_link_overrides_v1 || {};
    const custom = Array.isArray(bookmarkState.bookmark_custom_links_v1)
      ? bookmarkState.bookmark_custom_links_v1
      : [];
    const groupMeta = Array.isArray(bookmarkState.bookmark_groups_v1)
      ? bookmarkState.bookmark_groups_v1
      : [];
    const metaByN = Object.fromEntries(groupMeta.map((g) => [Number(g.group), g]));

    const groups = FALLBACK_GROUPS.map((g) => {
      const meta = metaByN[g.n] || {};
      const title = String(meta.title || "").trim();
      const links = g.links
        .map((l, i) => {
          const id = `s-${g.n}-${i + 1}`;
          if (deletes.has(id)) return null;
          const o = overrides[id] || {};
          return {
            id,
            t: o.title || l.t,
            u: o.url || l.u,
            k: o.kind || l.k,
            gid: Number(o.group || g.n),
          };
        })
        .filter(Boolean);
      return {
        ...g,
        es: title || g.es,
        pt: title || g.pt,
        en: title || g.en,
        links,
      };
    });

    custom.forEach((item) => {
      const id = String(item.id || "");
      if (!id || deletes.has(id)) return;
      const groupN = Number(item.group);
      const g = groups.find((x) => Number(x.n) === groupN);
      if (!g) return;
      g.links.push({
        id,
        t: item.title,
        u: item.url,
        k: item.kind || kindFromUrl(item.url, "App web"),
        custom: true,
      });
    });

    groups.forEach((g) => {
      const moved = [];
      g.links = g.links.filter((l) => {
        if (l.gid && Number(l.gid) !== Number(g.n)) {
          moved.push(l);
          return false;
        }
        return true;
      });
      moved.forEach((l) => {
        const dest = groups.find((x) => Number(x.n) === Number(l.gid));
        if (dest) dest.links.push(l);
        else g.links.push(l);
      });
    });

    DATA.groups = groups;

    const customKeys = Array.isArray(bookmarkState.bookmark_key_resources_v1)
      ? bookmarkState.bookmark_key_resources_v1
      : [];
    DATA.keys = [
      ...FALLBACK_KEYS,
      ...customKeys
        .map((k) => ({
          id: k.id || k.name,
          name: k.name,
          icon: "flag",
          u: k.url || k.u,
          es: k.desc || k.es || "",
          pt: k.desc || k.pt || "",
          en: k.desc || k.en || "",
          date: k.date || "",
          custom: true,
        }))
        .filter((k) => k.name && k.u),
    ];
  }

  async function saveBookmarkKey(key, value) {
    bookmarkState[key] = value;
    await api(`/api/bookmark-state/${key}`, {
      method: "PUT",
      body: JSON.stringify({ value }),
    });
  }

  function setAdmin(on) {
    isAdmin = Boolean(on);
    document.body.classList.toggle("is-admin", isAdmin);
    $$(".admin-only").forEach((el) => el.classList.toggle("show", isAdmin));
    const authBtn = $("#authBtn");
    if (authBtn) authBtn.textContent = isAdmin ? t("logoutBtn") : t("adminBtn");
  }

  window.toggleFav = async function toggleFav(id) {
    const num = Number(id);
    try {
      const res = await api(`/api/use-cases/${num}/favorite`, { method: "POST" });
      if (res.is_favorite) favs.add(num);
      else favs.delete(num);
    } catch {
      if (favs.has(num)) favs.delete(num);
      else favs.add(num);
    }
    saveFavs();
    $$(`[data-fav="${num}"]`).forEach((b) => {
      const on = favs.has(num);
      b.setAttribute("aria-pressed", on);
      b.setAttribute("aria-label", on ? t("unfav") : t("fav"));
      if (b.classList.contains("icon-btn")) b.style.color = on ? "var(--yellow)" : "var(--navy)";
    });
    if ($("#facets")) drawFacets();
    toast(favs.has(num) ? t("fav") : t("unfav"));
  };

  const origOpenDrawer = openDrawer;
  window.openDrawer = async function openDrawerLive(c) {
    origOpenDrawer(c);
    try {
      const detail = await api(`/api/use-cases/${c.id}`);
      const mapped = mapCase(detail);
      const idx = DATA.cases.findIndex((x) => Number(x.id) === Number(c.id));
      if (idx >= 0) DATA.cases[idx] = mapped;
      rebuildDerived();
      origOpenDrawer(mapped);
      c = mapped;
    } catch {
      /* keep list payload */
    }
    const d = $("#drawer");
    if (!d || !isAdmin) return;
    const header = d.querySelector("header");
    if (!header || header.querySelector("[data-edit-case]")) return;
    const sp = header.querySelector(".sp");
    const tools = document.createElement("span");
    tools.className = "drawer-admin";
    tools.innerHTML = `
      <button class="btn ghost sm" type="button" data-edit-case="${c.id}">${esc(t("editCase"))}</button>
      <button class="btn ghost sm" type="button" data-del-case="${c.id}">${esc(t("delCase"))}</button>`;
    header.insertBefore(tools, sp ? sp.nextSibling : header.firstChild);
  };

  const origViewLearn = viewLearn;
  window.viewLearn = function viewLearnLive() {
    origViewLearn();
    const page = $("#app .page-h");
    if (page) {
      const bar = document.createElement("p");
      bar.className = "learn-admin";
      bar.innerHTML = `<a class="btn ghost sm" href="/presales-learning/">${esc(t("plsAdminBtn"))}</a>`;
      page.appendChild(bar);
    }
    $$(".sess").forEach((article, i) => {
      const s = DATA.sessions[i];
      if (!s) return;
      const img = article.querySelector(".img");
      if (img && s.hero) img.style.backgroundImage = `url('${s.hero}')`;
      article.querySelectorAll(".vids a.vid").forEach((a, idx) => {
        const l = ["es", "pt", "en"][idx];
        const v = s.videos?.[l];
        if (!v) return;
        a.href = v.u || "/presales-learning/";
        if ((v.u || "").endsWith(".mp4") || (v.u || "").includes("/presales-learning/")) {
          a.removeAttribute("target");
        }
        const th = a.querySelector(".th");
        if (th && v.thumb) th.style.backgroundImage = `url('${v.thumb}')`;
        if (th && v.dur) th.dataset.dur = v.dur;
      });
    });
  };

  const origViewRes = viewRes;
  window.viewRes = function viewResLive(r) {
    origViewRes(r);
    if (!isAdmin) return;
    const tools = $("#app .res-tools");
    if (!tools) return;
    const admin = document.createElement("div");
    admin.className = "res-admin admin-only show";
    admin.innerHTML = `
      <button class="btn ghost sm" type="button" data-add-link>${esc(t("addLink"))}</button>
      <button class="btn ghost sm" type="button" data-add-key>${esc(t("addKey"))}</button>`;
    tools.appendChild(admin);
    $$("#groups li a").forEach((a) => {
      const li = a.closest("li");
      if (!li) return;
      const title = a.querySelector("span")?.textContent || a.textContent;
      const url = a.getAttribute("href");
      const groupEl = a.closest(".group");
      const groupTitle = groupEl?.querySelector("h3")?.childNodes[1]?.textContent || "";
      const g = DATA.groups.find((x) => [x.es, x.pt, x.en].includes(groupTitle.trim()) || x[lang] === groupTitle.trim());
      const link = g?.links.find((l) => l.u === url || l.t === title);
      if (!link) return;
      const btns = document.createElement("span");
      btns.className = "link-admin";
      btns.innerHTML = `
        <button type="button" data-edit-link="${esc(link.id || "")}">${esc(t("editCase"))}</button>
        <button type="button" data-del-link="${esc(link.id || "")}">${esc(t("delLink"))}</button>`;
      li.appendChild(btns);
    });
  };

  const origViewHome = viewHome;
  window.viewHome = function viewHomeLive() {
    origViewHome();
    const s = DATA.sessions[0];
    const img = $("#app .card.learn .img");
    if (img && s?.hero) img.style.backgroundImage = `url('${s.hero}')`;
  };
  VIEWS.home = window.viewHome;
  VIEWS.recursos = window.viewRes;
  VIEWS.learning = window.viewLearn;

  function fillAuthorSelect(sel, selected) {
    if (!sel) return;
    const names = Array.from(new Set([...managedAuthors, ...CASES.map((c) => c.author)].filter(Boolean))).sort();
    sel.innerHTML = names.map((n) => `<option ${n === selected ? "selected" : ""}>${esc(n)}</option>`).join("");
  }

  const origOpenModal = openModal;
  window.openModal = function openModalLive(caseObj) {
    origOpenModal();
    const form = $("#contribForm");
    const authorSel = $("#fAuthor");
    const createdInp = $("#fCreated");
    fillAuthorSelect(authorSel, caseObj?.author || "");
    const storedCreator = localStorage.getItem(CREATOR_NAME_STORAGE_KEY) || "";
    if (createdInp) createdInp.value = caseObj?.created_by || storedCreator;
    if (caseObj) {
      editCaseId = caseObj.id;
      form.t.value = L(caseObj).t;
      form.type.value = caseObj.type;
      form.tech.value = (caseObj.tech || []).join(", ");
      form.d.value = L(caseObj).d;
      form.u.value = caseObj.links?.[0]?.u || "";
      if (form.phase) form.phase.value = caseObj.phase || "";
      if (form.theme) form.theme.value = caseObj.theme || "";
      if (form.status) form.status.value = caseObj.status || "in_progress";
      if (form.tags) form.tags.value = (caseObj.tags || []).join(", ");
      $("#mTitle").textContent = t("editCase");
    } else {
      editCaseId = null;
      form.reset();
      fillAuthorSelect(authorSel, "");
      if (createdInp) createdInp.value = storedCreator;
      $("#mTitle").textContent = t("mTitle");
    }
  };

  async function submitCase(form) {
    const title = form.t.value.trim();
    const description = form.d.value.trim();
    const technology = form.tech.value.trim();
    const authorName = ($("#fAuthor")?.value || form.author?.value || "").trim();
    const createdBy = ($("#fCreated")?.value || "").trim() || authorName;
    if (!title || !description || !technology || !authorName || !createdBy) {
      toast(t("fTitle"));
      return;
    }
    localStorage.setItem(CREATOR_NAME_STORAGE_KEY, createdBy);
    const url = (form.u.value || "").trim();
    const payload = {
      title,
      category: form.type.value || "asset",
      area: "",
      technology,
      phase: form.phase?.value || "",
      theme: form.theme?.value || "",
      authorName,
      createdBy,
      skillName: "",
      description,
      tags: String(form.tags?.value || "")
        .split(/[,;]+/)
        .map((x) => x.trim())
        .filter(Boolean),
      status: form.status?.value || "in_progress",
      sourceLanguage: lang,
      attachments: url ? [{ name: "Link", type: "link", data: url }] : [],
    };
    const item = editCaseId
      ? await api(`/api/use-cases/${editCaseId}`, { method: "PUT", body: JSON.stringify(payload) })
      : await api("/api/use-cases", { method: "POST", body: JSON.stringify(payload) });
    const mapped = mapCase(item);
    if (editCaseId) {
      DATA.cases = DATA.cases.map((c) => (Number(c.id) === Number(editCaseId) ? mapped : c));
    } else {
      DATA.cases = [mapped, ...DATA.cases];
    }
    rebuildDerived();
    $("#modal").classList.remove("show");
    form.reset();
    editCaseId = null;
    toast(t("published"));
    render();
  }

  function openAuth() {
    $("#authModal")?.classList.add("show");
    setTimeout(() => $("#authPass")?.focus(), 20);
  }

  async function login(password) {
    await api("/api/auth/login", { method: "POST", body: JSON.stringify({ password }) });
    setAdmin(true);
    $("#authModal")?.classList.remove("show");
    render();
  }

  async function logout() {
    try {
      await api("/api/auth/logout", { method: "POST", body: "{}" });
    } catch {
      /* ignore */
    }
    setAdmin(false);
    render();
  }

  function renderUsers() {
    const list = $("#usersList");
    if (!list) return;
    list.innerHTML = managedAuthors
      .map(
        (n) =>
          `<li><span>${esc(n)}</span>${
            DEFAULT_AUTHORS.includes(n)
              ? ""
              : `<button type="button" data-del-user="${esc(n)}">${esc(t("delLink"))}</button>`
          }</li>`
      )
      .join("");
  }

  function findLink(id) {
    for (const g of DATA.groups) {
      const link = g.links.find((l) => String(l.id) === String(id));
      if (link) return { link, group: g };
    }
    return null;
  }

  function openLinkModal(existing) {
    const form = $("#linkForm");
    const groupSel = $("#linkGroup");
    groupSel.innerHTML = DATA.groups
      .map((g) => `<option value="${g.n}">${esc(g[lang] || g.es)}</option>`)
      .join("");
    form.dataset.linkId = existing?.id || "";
    form.title.value = existing?.t || "";
    form.url.value = existing?.u || "";
    form.kind.value = existing?.k || "App web";
    if (existing) groupSel.value = String(existing.gid || findLink(existing.id)?.group.n || DATA.groups[0]?.n);
    $("#linkModal")?.classList.add("show");
  }

  async function saveLink(form) {
    const id = form.dataset.linkId;
    const title = form.title.value.trim();
    const url = form.url.value.trim();
    const kind = form.kind.value.trim() || kindFromUrl(url);
    const group = Number(form.group.value);
    if (!title || !url) return;
    const found = id ? findLink(id) : null;
    if (found && !found.link.custom) {
      const overrides = { ...(bookmarkState.bookmark_link_overrides_v1 || {}) };
      overrides[id] = { title, url, kind, group };
      await saveBookmarkKey("bookmark_link_overrides_v1", overrides);
    } else {
      const custom = [...(bookmarkState.bookmark_custom_links_v1 || [])];
      if (found) {
        const idx = custom.findIndex((x) => String(x.id) === String(id));
        if (idx >= 0) custom[idx] = { ...custom[idx], title, url, kind, group };
      } else {
        custom.push({ id: `c-${Date.now()}`, title, url, kind, group });
      }
      await saveBookmarkKey("bookmark_custom_links_v1", custom);
    }
    applyBookmarkState(bookmarkState);
    rebuildDerived();
    $("#linkModal")?.classList.remove("show");
    toast(t("saved"));
    render();
  }

  async function deleteLink(id) {
    const found = findLink(id);
    if (!found) return;
    if (found.link.custom) {
      const custom = (bookmarkState.bookmark_custom_links_v1 || []).filter((x) => String(x.id) !== String(id));
      await saveBookmarkKey("bookmark_custom_links_v1", custom);
    } else {
      const deletes = Array.from(new Set([...(bookmarkState.bookmark_link_deletes_v1 || []), String(id)]));
      await saveBookmarkKey("bookmark_link_deletes_v1", deletes);
    }
    applyBookmarkState(bookmarkState);
    rebuildDerived();
    toast(t("deleted"));
    render();
  }

  function openKeyModal() {
    $("#keyForm")?.reset();
    $("#keyModal")?.classList.add("show");
  }

  async function saveKey(form) {
    const item = {
      id: `key-${Date.now()}`,
      name: form.name.value.trim(),
      desc: form.desc.value.trim(),
      url: form.url.value.trim(),
      date: new Date().toISOString().slice(0, 10),
    };
    if (!item.name || !item.url) return;
    const keys = [...(bookmarkState.bookmark_key_resources_v1 || []), item];
    await saveBookmarkKey("bookmark_key_resources_v1", keys);
    applyBookmarkState(bookmarkState);
    rebuildDerived();
    $("#keyModal")?.classList.remove("show");
    toast(t("saved"));
    render();
  }

  function startFlagCarousel() {
    const el = $("#flagCloud");
    if (!el) return;
    let i = 0;
    const draw = () => {
      const item = FLAG_SEQUENCE[i % FLAG_SEQUENCE.length];
      if (item.image) el.innerHTML = `<img class="cloud-img" src="${item.image}" alt="">`;
      else el.textContent = item.icon;
      el.style.color = item.color || "#0089ff";
      i += 1;
    };
    draw();
    setInterval(draw, 1500);
  }

  async function boot() {
    startFlagCarousel();
    try {
      const [cases, pls, auth, bookmarks] = await Promise.all([
        api("/api/use-cases").catch(() => null),
        api("/api/pls/sessions").catch(() => null),
        api("/api/auth/status").catch(() => ({ authenticated: false })),
        api("/api/bookmark-state").catch(() => ({ state: {} })),
      ]);
      if (Array.isArray(cases) && cases.length) {
        DATA.cases = cases.map(mapCase);
        cases.forEach((row) => {
          if (row.is_favorite) favs.add(Number(row.id));
        });
        saveFavs();
      } else if (!DATA.cases?.length) {
        DATA.cases = FALLBACK_CASES;
      }
      if (pls && Array.isArray(pls.sessions)) {
        DATA.sessions = pls.sessions.map(mapSession);
      } else if (!DATA.sessions?.length) {
        DATA.sessions = FALLBACK_SESSIONS.map(mapSession);
      } else {
        DATA.sessions = (DATA.sessions || []).map(mapSession);
      }
      applyBookmarkState(bookmarks.state || {});
      setAdmin(Boolean(auth.authenticated || pls?.authenticated));
      rebuildDerived();
      render();
    } catch (error) {
      console.warn("LARK boot fallback", error);
      applyBookmarkState({});
      rebuildDerived();
      render();
    }
  }

  $("#contribForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    submitCase(e.target).catch((err) => toast(err.message || t("authErr")));
  });

  $("#authForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const password = $("#authPass")?.value || "";
    login(password).catch(() => toast(t("authErr")));
  });

  $("#usersForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#userName")?.value.trim();
    if (!name) return;
    if (!managedAuthors.includes(name)) managedAuthors.push(name);
    saveAuthors();
    $("#userName").value = "";
    renderUsers();
  });

  $("#linkForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    saveLink(e.target).catch((err) => toast(err.message));
  });

  $("#keyForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    saveKey(e.target).catch((err) => toast(err.message));
  });

  document.addEventListener("click", (e) => {
    const authBtn = e.target.closest("#authBtn");
    if (authBtn) {
      e.preventDefault();
      if (isAdmin) logout();
      else openAuth();
      return;
    }
    if (e.target.closest("#exportCsvBtn")) {
      window.location.href = "/api/use-cases/export.csv";
      return;
    }
    if (e.target.closest("#translateAllBtn")) {
      toast(t("translating"));
      api("/api/use-cases/translate-all", { method: "POST", body: "{}" })
        .then(() => api("/api/use-cases"))
        .then((rows) => {
          DATA.cases = rows.map(mapCase);
          rebuildDerived();
          render();
          toast(t("translated"));
        })
        .catch((err) => toast(err.message));
      return;
    }
    if (e.target.closest("#manageUsersBtn")) {
      renderUsers();
      $("#usersModal")?.classList.add("show");
      return;
    }
    const delUser = e.target.closest("[data-del-user]");
    if (delUser) {
      managedAuthors = managedAuthors.filter((n) => n !== delUser.dataset.delUser);
      saveAuthors();
      renderUsers();
      return;
    }
    const editCase = e.target.closest("[data-edit-case]");
    if (editCase) {
      const c = BYID[editCase.dataset.editCase];
      if (c) openModal(c);
      return;
    }
    const delCase = e.target.closest("[data-del-case]");
    if (delCase) {
      if (!confirm(t("delConfirm"))) return;
      api(`/api/use-cases/${delCase.dataset.delCase}`, { method: "DELETE" })
        .then(() => {
          DATA.cases = DATA.cases.filter((c) => String(c.id) !== String(delCase.dataset.delCase));
          rebuildDerived();
          closeDrawer();
          render();
          toast(t("deleted"));
        })
        .catch((err) => toast(err.message));
      return;
    }
    if (e.target.closest("[data-add-link]")) {
      openLinkModal();
      return;
    }
    if (e.target.closest("[data-add-key]")) {
      openKeyModal();
      return;
    }
    const editLink = e.target.closest("[data-edit-link]");
    if (editLink) {
      const found = findLink(editLink.dataset.editLink);
      if (found) openLinkModal(found.link);
      return;
    }
    const delLink = e.target.closest("[data-del-link]");
    if (delLink) {
      if (!confirm(t("delConfirm"))) return;
      deleteLink(delLink.dataset.delLink).catch((err) => toast(err.message));
      return;
    }
    if (e.target.closest("[data-close-extra]")) {
      e.target.closest(".modal")?.classList.remove("show");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    ["authModal", "usersModal", "linkModal", "keyModal"].forEach((id) =>
      $(`#${id}`)?.classList.remove("show")
    );
  });

  boot();
})();
