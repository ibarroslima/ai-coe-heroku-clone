const fs = require("fs");
const path = require("path");

const STATE_KEY = "pls_sessions_v1";
const DATA_FILE = path.join(__dirname, "data", "pls-sessions.json");
const MEDIA_DIR = path.join(__dirname, "public", "presales-learning", "media");
const MEDIA_PUBLIC = "/presales-learning/media";

const DEFAULT_SESSIONS = [
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

async function loadSessions({ pool, hasDatabase }) {
  if (hasDatabase && pool) {
    try {
      const { rows } = await pool.query(
        "SELECT state_value FROM app_state WHERE state_key = $1",
        [STATE_KEY]
      );
      if (rows.length) {
        const value = rows[0].state_value;
        if (Array.isArray(value)) return value;
      }
    } catch (e) {}
  }
  if (fs.existsSync(DATA_FILE)) {
    const local = readLocalFile();
    if (Array.isArray(local)) return local;
  }
  return JSON.parse(JSON.stringify(DEFAULT_SESSIONS));
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
