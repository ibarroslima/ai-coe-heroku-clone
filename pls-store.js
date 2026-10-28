const fs = require("fs");
const path = require("path");

const STATE_KEY = "pls_sessions_v1";
const DATA_FILE = path.join(__dirname, "data", "pls-sessions.json");
const MEDIA_DIR = path.join(__dirname, "public", "presales-learning", "media");
const MEDIA_PUBLIC = "/presales-learning/media";

const DEFAULT_SESSIONS = [
  {
    id: "s3",
    num: 3,
    title: "How to use the LATAM PS Dashboard",
    version: "FY27",
    hero: "img/hero-s3.jpg",
    preview: 50,
    copy: {
      es: {
        tagline: "Del pipeline de org62 a una decisión, en minutos",
        desc: "DSRs, Estimates, Resource Requests y Opportunities de org62, en una vista que se actualiza sola. Emmanuel Moreno te recorre cada pestaña del LATAM PS Pipeline Dashboard: dónde está cada deal, quién carga el trabajo, qué sigue sin asignar y qué DSRs hay que cerrar, más una rutina de tres pasos para mantener el pipeline limpio.",
        guideDesc: "Cada pestaña del dashboard, qué responde y cómo usarla: el encabezado y sus alertas, filtros y exportaciones, el heat score, los DSRs zombie y una rutina de tres pasos.",
        inside: ["Qué es y para qué sirve", "Empieza por el encabezado", "Las pestañas, una por una", "Comparte un deal en un clic", "Tu rutina, en tres pasos", "Preguntas frecuentes"],
      },
      pt: {
        tagline: "Do pipeline da org62 a uma decisão, em minutos",
        desc: "DSRs, Estimates, Resource Requests e Opportunities da org62, numa visão que atualiza sozinha. Emmanuel Moreno percorre cada aba do LATAM PS Pipeline Dashboard: onde está cada deal, quem carrega o trabalho, o que ainda está sem dono e quais DSRs fechar, mais uma rotina de três passos para manter o pipeline limpo.",
        guideDesc: "Cada aba do dashboard, o que ela responde e como usar: o cabeçalho e os alertas, filtros e exportações, o heat score, DSRs zumbi e uma rotina de três passos.",
        inside: ["O que é e para que serve", "Comece pelo cabeçalho", "As abas, uma por uma", "Compartilhe um deal em um clique", "Sua rotina, em três passos", "Perguntas frequentes"],
      },
      en: {
        tagline: "From the org62 pipeline to a decision, in minutes",
        desc: "DSRs, Estimates, Resource Requests and Opportunities from org62, in one view that refreshes on its own. Emmanuel Moreno walks you through every tab of the LATAM PS Pipeline Dashboard: where each deal stands, who carries the load, what is still unassigned and which DSRs to close, plus a three-step routine to keep your pipeline clean.",
        guideDesc: "Every tab of the dashboard, what each one answers and how to use it: the header and its alerts, filters and exports, the heat score, zombie DSRs and a three-step routine.",
        inside: ["What it is and what it's for", "Start with the header", "The tabs, one by one", "Share a deal in one click", "Your routine, in three steps", "FAQs"],
      },
    },
    videos: {
      es: { src: "videos/s3-dashboard-howto-es.mp4", thumb: "img/s3-es.jpg", dur: "3:24" },
      pt: { src: "videos/s3-dashboard-howto-pt.mp4", thumb: "img/s3-pt.jpg", dur: "3:29" },
      en: { src: "videos/s3-dashboard-howto-en.mp4", thumb: "img/s3-en.jpg", dur: "3:10" },
    },
    canvases: {
      es: {
        url: "https://salesforce.enterprise.slack.com/docs/T01G0063H29/F0CCE6FPSSJ",
        title: "Guía: Cómo usar el LATAM PS Dashboard",
        callout: "Del pipeline de org62 a una decisión, en minutos",
        sections: ["Qué es y para qué sirve", "Empieza por el encabezado", "Las pestañas, una por una", "Tu rutina, en tres pasos"],
      },
      pt: {
        url: "https://salesforce.enterprise.slack.com/docs/T01G0063H29/F0CCE6G44MU",
        title: "Guia: Como usar o LATAM PS Dashboard",
        callout: "Do pipeline da org62 a uma decisão, em minutos",
        sections: ["O que é e para que serve", "Comece pelo cabeçalho", "As abas, uma por uma", "Sua rotina, em três passos"],
      },
      en: {
        url: "https://salesforce.enterprise.slack.com/docs/T01G0063H29/F0CC9TJ6RAP",
        title: "Guide: How to use the LATAM PS Dashboard",
        callout: "From the org62 pipeline to a decision, in minutes",
        sections: ["What it is and what it's for", "Start with the header", "The tabs, one by one", "Your routine, in three steps"],
      },
    },
  },
  {
    id: "s2",
    num: 2,
    title: "From conversation to SPW",
    version: "v2.1",
    hero: "img/hero-s2.jpg",
    preview: 60,
    copy: {
      es: {
        tagline: "Tu estimate, del deal a Google Sheets, en minutos",
        desc: "Pasar lo que ya estimaste a un SPW tomaba de 1 a 3 horas interpretando y tipeando celda por celda. Conoce initiate-spw: combina la conversación del deal, la validación de delivery y las salidas de Cortex, SolutionIQ y Scopezilla en una matriz de esfuerzo estandarizada, aplica las reglas de PS LATAM y arma tu SPW en Google Sheets, en la carpeta del cliente en Deals LACA.",
        guideDesc: "De tus fuentes a tu primer SPW: setup, cada pregunta que hace el skill, la matriz estandarizada, las reglas de PS LATAM y dónde se guarda tu SPW en Deals LACA.",
        inside: ["Qué hay de nuevo en 2.1", "Instálalo en 3 pasos", "Cómo usarlo en 9 pasos", "Reglas PS LATAM de fábrica", "Lo que crea y lo que completas tú", "Preguntas frecuentes"],
      },
      pt: {
        tagline: "Seu estimate, do deal ao Google Sheets, em minutos",
        desc: "Transformar o que você já estimou em um SPW levava de 1 a 3 horas interpretando e digitando célula por célula. Conheça o initiate-spw: ele junta a conversa do deal, a validação de delivery e as saídas de Cortex, SolutionIQ e Scopezilla numa matriz de esforço padronizada, aplica as regras de PS LATAM e monta seu SPW no Google Sheets, na pasta do cliente em Deals LACA.",
        guideDesc: "Das suas fontes ao primeiro SPW: setup, cada pergunta que o skill faz, a matriz padronizada, as regras de PS LATAM e onde o SPW é salvo no Deals LACA.",
        inside: ["O que há de novo na 2.1", "Instale em 3 passos", "Como usar em 9 passos", "Regras PS LATAM de fábrica", "O que ele cria e o que você completa", "Perguntas frequentes"],
      },
      en: {
        tagline: "Your estimate, from the deal to Google Sheets, in minutes",
        desc: "Turning what you already estimated into an SPW used to take 1 to 3 hours of interpreting and typing cell by cell. Meet initiate-spw: it combines the deal conversation, delivery validation and the outputs of Cortex, SolutionIQ and Scopezilla into one standardized effort matrix, applies the PS LATAM rules and builds your SPW in Google Sheets, right in the customer folder in Deals LACA.",
        guideDesc: "From your sources to your first SPW: setup, every question the skill asks, the standardized matrix, the PS LATAM rules and where your SPW is saved in Deals LACA.",
        inside: ["What's new in 2.1", "Install in 3 steps", "How to use it in 9 steps", "PS LATAM rules by design", "What it creates, what you complete", "FAQs"],
      },
    },
    videos: {
      es: { src: "videos/s2-conversation-to-spw-es.mp4", thumb: "img/s2-es.jpg", dur: "3:35" },
      pt: { src: "videos/s2-conversation-to-spw-pt.mp4", thumb: "img/s2-pt.jpg", dur: "3:50" },
      en: { src: "videos/s2-conversation-to-spw-en.mp4", thumb: "img/s2-en.jpg", dur: "3:28" },
    },
    canvases: {
      es: {
        url: "https://salesforce.enterprise.slack.com/docs/T01G0063H29/F0CD78N2SGY",
        title: "Guía: De la conversación al SPW con el skill initiate-spw v2.1 en Claude Code",
        callout: "Crea un SPW real en tu Google Drive",
        sections: ["Qué es y para qué sirve", "Qué hay de nuevo en la versión 2.1", "Antes de empezar: qué necesitas", "Cómo usarlo"],
      },
      pt: {
        url: "https://salesforce.enterprise.slack.com/docs/T01G0063H29/F0CCAUJ22B0",
        title: "Guia: Da conversa ao SPW com o skill initiate-spw v2.1 no Claude Code",
        callout: "Cria um SPW real no seu Google Drive",
        sections: ["O que é e para que serve", "O que há de novo na versão 2.1", "Antes de começar: o que você precisa", "Como usar"],
      },
      en: {
        url: "https://salesforce.enterprise.slack.com/docs/T01G0063H29/F0CBXG868HM",
        title: "Guide: From conversation to SPW with the initiate-spw v2.1 skill in Claude Code",
        callout: "Creates a real SPW in your Google Drive",
        sections: ["What it is and what it does", "What's new in version 2.1", "Before you start: what you need", "How to use it"],
      },
    },
  },
  {
    id: "s1",
    num: 1,
    title: "SPW to Estimate",
    version: "v2.5",
    hero: "img/hero-s1.jpg",
    preview: 62,
    copy: {
      es: {
        tagline: "Del Excel SPW a org62, en minutos",
        desc: "Un gran deal significaba 1.5+ horas copiando roles, horas y tarifas a mano. Conoce el skill que arma tu Estimate en org62 directo desde el SPW, con Claude Code y los CLIs de Salesforce.",
        guideDesc: "De cero a tu primer Estimate: setup, cada pregunta que hace el skill, las reglas de org62 que sigue y lo que sigue siendo tuyo.",
        inside: ["Qué hay de nuevo en 2.5.1", "Instálalo en 8 pasos", "Cómo usarlo", "Lo que crea y lo que completas tú", "Modo Standard vs SWE", "Preguntas frecuentes"],
      },
      pt: {
        tagline: "Do Excel SPW para o org62, em minutos",
        desc: "Um big deal significava 1,5+ horas copiando roles, horas e rates na mão. Conheça o skill que monta seu Estimate no org62 direto do SPW, com Claude Code e os CLIs da Salesforce.",
        guideDesc: "Do zero ao seu primeiro Estimate: setup, cada pergunta que o skill faz, as regras do org62 que ele segue e o que continua com você.",
        inside: ["O que há de novo na 2.5.1", "Instale em 8 passos", "Como usar", "O que ele cria e o que você completa", "Modo Standard vs SWE", "Perguntas frequentes"],
      },
      en: {
        tagline: "From the SPW Excel to org62, in minutes",
        desc: "A big deal used to mean 1.5+ hours copying roles, hours and rates by hand. Meet the skill that builds your Estimate in org62 straight from the SPW, with Claude Code and the Salesforce CLIs.",
        guideDesc: "From zero to your first Estimate: setup, every question the skill asks, the org62 rules it follows and what is still on you.",
        inside: ["What's new in 2.5.1", "Install in 8 steps", "How to use it", "What it creates, what you complete", "Standard vs SWE mode", "FAQs"],
      },
    },
    videos: {
      es: { src: "videos/s1-spw-to-estimate-es.mp4", thumb: "img/s1-es.jpg", dur: "3:07" },
      pt: { src: "videos/s1-spw-to-estimate-pt.mp4", thumb: "img/s1-pt.jpg", dur: "3:14" },
      en: { src: "videos/s1-spw-to-estimate-en.mp4", thumb: "img/s1-en.jpg", dur: "3:06" },
    },
    canvases: {
      es: {
        url: "https://salesforce.enterprise.slack.com/docs/T01G0063H29/F0C9J45PTKL",
        title: "Guía: Instala el skill SPW to Estimate v2.5 en Claude Code",
        callout: "Crea registros reales en org62",
        sections: ["Qué es y para qué sirve", "Qué hay de nuevo en la versión 2.5.1", "Antes de empezar: qué necesitas", "Paso a paso"],
      },
      pt: {
        url: "https://salesforce.enterprise.slack.com/docs/T01G0063H29/F0CACMGJ856",
        title: "Guia: Instale o skill SPW to Estimate v2.5 no Claude Code",
        callout: "Cria registros reais na org62",
        sections: ["O que é e para que serve", "Novidades da versão 2.5.1", "Antes de começar: o que você precisa", "Passo a passo"],
      },
      en: {
        url: "https://salesforce.enterprise.slack.com/docs/T01G0063H29/F0C9GBQCML6",
        title: "Guide: Install the SPW to Estimate v2.5 skill in Claude Code",
        callout: "Creates real records in org62",
        sections: ["What it is and what it does", "What's new in version 2.5.1", "Before you start: what you need", "Step by step"],
      },
    },
  },
];

function ensureDirs() {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
}

function readLocalFile() {
  try {
    if (!fs.existsSync(DATA_FILE)) return null;
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    return Array.isArray(parsed) ? parsed : null;
  } catch (e) {
    return null;
  }
}

function writeLocalFile(sessions) {
  ensureDirs();
  fs.writeFileSync(DATA_FILE, JSON.stringify(sessions, null, 2));
}

function mergeCatalogSessions(stored) {
  const list = Array.isArray(stored) ? stored.slice() : [];
  const have = new Set(list.map((item) => String(item.id)));
  const missing = DEFAULT_SESSIONS.filter((item) => !have.has(String(item.id)));
  if (!missing.length) return list;
  const merged = [
    ...missing.map((item) => JSON.parse(JSON.stringify(item))),
    ...list,
  ];
  merged.sort((a, b) => (Number(b.num) || 0) - (Number(a.num) || 0));
  return merged;
}

async function loadSessions({ pool, hasDatabase }) {
  let stored = null;
  if (hasDatabase && pool) {
    try {
      const { rows } = await pool.query(
        "SELECT state_value FROM app_state WHERE state_key = $1",
        [STATE_KEY]
      );
      if (rows.length) {
        const value = rows[0].state_value;
        if (Array.isArray(value)) stored = value;
      }
    } catch (e) {}
  }
  if (!stored && fs.existsSync(DATA_FILE)) {
    const local = readLocalFile();
    if (Array.isArray(local)) stored = local;
  }
  if (!stored) stored = JSON.parse(JSON.stringify(DEFAULT_SESSIONS));
  const merged = mergeCatalogSessions(stored);
  const changed =
    merged.map((item) => item.id).join(",") !==
    stored.map((item) => item.id).join(",");
  if (changed) {
    try {
      await saveSessions(merged, { pool, hasDatabase });
    } catch (e) {}
  }
  return merged;
}

async function saveSessions(sessions, { pool, hasDatabase }) {
  const list = Array.isArray(sessions) ? sessions : [];
  writeLocalFile(list);
  if (hasDatabase && pool) {
    await pool.query(
      `INSERT INTO app_state (state_key, state_value, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (state_key)
       DO UPDATE SET state_value = EXCLUDED.state_value, updated_at = NOW()`,
      [STATE_KEY, JSON.stringify(list)]
    );
  }
  return list;
}

function publicPathFor(file) {
  if (!file || !file.filename) return "";
  return `${MEDIA_PUBLIC}/${file.filename}`;
}

function nextNum(sessions) {
  return sessions.reduce((max, item) => Math.max(max, Number(item.num) || 0), 0) + 1;
}

module.exports = {
  STATE_KEY,
  MEDIA_DIR,
  DEFAULT_SESSIONS,
  ensureDirs,
  loadSessions,
  saveSessions,
  publicPathFor,
  nextNum,
};
