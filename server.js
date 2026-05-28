const path = require("path");
const https = require("https");
const express = require("express");
const session = require("express-session");
const multer = require("multer");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || (isProduction ? "" : "admin123");
const SESSION_SECRET = process.env.SESSION_SECRET || (isProduction ? "" : "change-me");
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

if (isProduction && (!ADMIN_PASSWORD || !SESSION_SECRET)) {
  throw new Error(
    "Missing required environment variables in production: ADMIN_PASSWORD and SESSION_SECRET."
  );
}

const hasDatabase = Boolean(process.env.DATABASE_URL);
const pool = hasDatabase
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : null;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
});

let memoryCases = [];
let memoryId = 1;

app.set("trust proxy", 1);
app.disable("etag");
app.use(express.json());
app.use("/api", (_req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  next();
});
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: "auto",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);
app.use(express.static(path.join(__dirname, "public")));

function requireAuth(req, res, next) {
  if (req.session && req.session.isAuthenticated) return next();
  return res.status(401).json({ error: "Nao autorizado." });
}

async function ensureSchema() {
  if (!hasDatabase) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS use_cases (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT DEFAULT '',
      area TEXT DEFAULT '',
      technology TEXT DEFAULT '',
      phase TEXT DEFAULT '',
      theme TEXT DEFAULT '',
      author_name TEXT DEFAULT '',
      skill_name TEXT DEFAULT '',
      description TEXT DEFAULT '',
      tags TEXT[] DEFAULT ARRAY[]::TEXT[],
      image_data TEXT DEFAULT '',
      video_url TEXT DEFAULT '',
      is_favorite BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await pool.query(`
    ALTER TABLE use_cases
    ADD COLUMN IF NOT EXISTS image_data TEXT DEFAULT ''
  `);
  await pool.query(`
    ALTER TABLE use_cases
    ADD COLUMN IF NOT EXISTS video_url TEXT DEFAULT ''
  `);
  await pool.query(`
    ALTER TABLE use_cases
    ADD COLUMN IF NOT EXISTS area TEXT DEFAULT ''
  `);
  await pool.query(`
    ALTER TABLE use_cases
    ADD COLUMN IF NOT EXISTS technology TEXT DEFAULT ''
  `);
  await pool.query(`
    ALTER TABLE use_cases
    ADD COLUMN IF NOT EXISTS phase TEXT DEFAULT ''
  `);
  await pool.query(`
    ALTER TABLE use_cases
    ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT ''
  `);
  await pool.query(`
    ALTER TABLE use_cases
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'in_progress'
  `);
  await pool.query(`
    ALTER TABLE use_cases
    ADD COLUMN IF NOT EXISTS source_language TEXT DEFAULT 'pt'
  `);
  await pool.query(`
    ALTER TABLE use_cases
    ADD COLUMN IF NOT EXISTS title_pt TEXT DEFAULT ''
  `);
  await pool.query(`
    ALTER TABLE use_cases
    ADD COLUMN IF NOT EXISTS title_es TEXT DEFAULT ''
  `);
  await pool.query(`
    ALTER TABLE use_cases
    ADD COLUMN IF NOT EXISTS title_en TEXT DEFAULT ''
  `);
  await pool.query(`
    ALTER TABLE use_cases
    ADD COLUMN IF NOT EXISTS description_pt TEXT DEFAULT ''
  `);
  await pool.query(`
    ALTER TABLE use_cases
    ADD COLUMN IF NOT EXISTS description_es TEXT DEFAULT ''
  `);
  await pool.query(`
    ALTER TABLE use_cases
    ADD COLUMN IF NOT EXISTS description_en TEXT DEFAULT ''
  `);
}

function toTrimmedText(value) {
  return String(value || "").trim();
}

function normalizeStatus(value) {
  return String(value || "").trim() === "completed" ? "completed" : "in_progress";
}

function normalizeSourceLanguage(value) {
  const lang = String(value || "").trim().toLowerCase();
  if (lang === "es") return "es";
  if (lang === "en") return "en";
  return "pt";
}

function toCsvValue(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, "\"\"")}"`;
  }
  return text;
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => {
          if (response.statusCode < 200 || response.statusCode >= 300) {
            reject(new Error(`HTTP ${response.statusCode}`));
            return;
          }
          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(error);
          }
        });
      })
      .on("error", reject);
  });
}

async function translateViaGoogle(text, sourceLanguage, targetLanguage) {
  const clean = toTrimmedText(text);
  if (!clean) return "";
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(
      sourceLanguage
    )}&tl=${encodeURIComponent(targetLanguage)}&dt=t&q=${encodeURIComponent(clean)}`;
    const data = await getJson(url);
    const translated = Array.isArray(data?.[0])
      ? data[0].map((part) => (Array.isArray(part) ? part[0] : "")).join("")
      : clean;
    return toTrimmedText(translated) || clean;
  } catch (_error) {
    return clean;
  }
}

async function translateUseCaseText({ sourceLanguage, title, description }) {
  const src = normalizeSourceLanguage(sourceLanguage);
  const cleanTitle = toTrimmedText(title);
  const cleanDescription = toTrimmedText(description);
  const localized = {
    title_pt: src === "pt" ? cleanTitle : "",
    title_es: src === "es" ? cleanTitle : "",
    title_en: src === "en" ? cleanTitle : "",
    description_pt: src === "pt" ? cleanDescription : "",
    description_es: src === "es" ? cleanDescription : "",
    description_en: src === "en" ? cleanDescription : "",
  };

  if (!OPENAI_API_KEY) {
    const targets = ["pt", "es", "en"].filter((lang) => lang !== src);
    for (const lang of targets) {
      localized[`title_${lang}`] = await translateViaGoogle(cleanTitle, src, lang);
      localized[`description_${lang}`] = await translateViaGoogle(cleanDescription, src, lang);
    }
    if (!localized.title_pt) localized.title_pt = cleanTitle;
    if (!localized.title_es) localized.title_es = cleanTitle;
    if (!localized.title_en) localized.title_en = cleanTitle;
    if (!localized.description_pt) localized.description_pt = cleanDescription;
    if (!localized.description_es) localized.description_es = cleanDescription;
    if (!localized.description_en) localized.description_en = cleanDescription;
    return localized;
  }

  const targets = ["pt", "es", "en"].filter((lang) => lang !== src);
  if (!targets.length) return localized;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a translator for enterprise software catalog entries. Return only JSON with keys as requested.",
          },
          {
            role: "user",
            content: JSON.stringify({
              instruction:
                "Translate title and description to requested target languages. Keep technical terms and product names unchanged when appropriate.",
              source_language: src,
              targets,
              title: cleanTitle,
              description: cleanDescription,
              response_schema: {
                title_pt: "string",
                title_es: "string",
                title_en: "string",
                description_pt: "string",
                description_es: "string",
                description_en: "string",
              },
            }),
          },
        ],
      }),
    });
    if (!response.ok) throw new Error("translator unavailable");
    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw);
    ["pt", "es", "en"].forEach((lang) => {
      const tk = `title_${lang}`;
      const dk = `description_${lang}`;
      if (!localized[tk]) localized[tk] = toTrimmedText(parsed[tk] || cleanTitle);
      if (!localized[dk]) localized[dk] = toTrimmedText(parsed[dk] || cleanDescription);
    });
    return localized;
  } catch (_error) {
    ["pt", "es", "en"].forEach((lang) => {
      const tk = `title_${lang}`;
      const dk = `description_${lang}`;
      if (!localized[tk]) localized[tk] = cleanTitle;
      if (!localized[dk]) localized[dk] = cleanDescription;
    });
    return localized;
  }
}

app.get("/api/auth/status", (req, res) => {
  res.json({ authenticated: Boolean(req.session && req.session.isAuthenticated) });
});

app.post("/api/auth/login", (req, res) => {
  const { password = "" } = req.body || {};
  if (String(password) !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Senha invalida." });
  }
  req.session.isAuthenticated = true;
  return res.json({ ok: true });
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
});

app.get("/api/use-cases", async (_req, res) => {
  if (!hasDatabase) {
    return res.json([...memoryCases].sort((a, b) => b.created_at - a.created_at));
  }
  try {
    const { rows } = await pool.query("SELECT * FROM use_cases ORDER BY created_at DESC");
    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao listar casos." });
  }
});

app.post("/api/use-cases", async (req, res) => {
  const {
    title,
    category = "",
    area = "",
    technology = "",
    phase = "",
    theme = "",
    authorName = "",
    skillName = "",
    description = "",
    tags = [],
    status = "in_progress",
    sourceLanguage = "pt",
    imageData = "",
    videoUrl = "",
  } = req.body || {};

  if (!toTrimmedText(title)) {
    return res.status(400).json({ error: "Titulo e obrigatorio." });
  }
  if (!toTrimmedText(authorName)) {
    return res.status(400).json({ error: "Autor e obrigatorio." });
  }
  if (!toTrimmedText(technology)) {
    return res.status(400).json({ error: "Tecnologia e obrigatoria." });
  }
  if (!toTrimmedText(description)) {
    return res.status(400).json({ error: "Descricao e obrigatoria." });
  }

  const payload = {
    title: toTrimmedText(title),
    category: toTrimmedText(category),
    area: toTrimmedText(area),
    technology: toTrimmedText(technology),
    phase: toTrimmedText(phase),
    theme: toTrimmedText(theme),
    author_name: toTrimmedText(authorName),
    skill_name: toTrimmedText(skillName),
    description: toTrimmedText(description),
    tags: Array.isArray(tags)
      ? tags.map((tag) => toTrimmedText(tag)).filter(Boolean)
      : [],
    status: normalizeStatus(status),
    source_language: normalizeSourceLanguage(sourceLanguage),
    image_data: String(imageData || "").startsWith("data:image/")
      ? String(imageData)
      : "",
    video_url: toTrimmedText(videoUrl),
  };
  const localized = await translateUseCaseText({
    sourceLanguage: payload.source_language,
    title: payload.title,
    description: payload.description,
  });

  if (!hasDatabase) {
    const item = {
      id: memoryId++,
      ...payload,
      ...localized,
      is_favorite: false,
      status: payload.status,
      created_at: Date.now(),
    };
    memoryCases.push(item);
    return res.status(201).json(item);
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO use_cases (title, category, area, technology, phase, theme, author_name, skill_name, description, tags, status, source_language, image_data, video_url, title_pt, title_es, title_en, description_pt, description_es, description_en)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
       RETURNING *`,
      [
        payload.title,
        payload.category,
        payload.area,
        payload.technology,
        payload.phase,
        payload.theme,
        payload.author_name,
        payload.skill_name,
        payload.description,
        payload.tags,
        payload.status,
        payload.source_language,
        payload.image_data,
        payload.video_url,
        localized.title_pt,
        localized.title_es,
        localized.title_en,
        localized.description_pt,
        localized.description_es,
        localized.description_en,
      ]
    );
    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao criar caso." });
  }
});

app.put("/api/use-cases/:id", async (req, res) => {
  const {
    title,
    category = "",
    area = "",
    technology = "",
    phase = "",
    theme = "",
    authorName = "",
    skillName = "",
    description = "",
    tags = [],
    status = "in_progress",
    sourceLanguage = "pt",
    imageData = "",
    videoUrl = "",
  } = req.body || {};
  if (!toTrimmedText(title)) {
    return res.status(400).json({ error: "Titulo e obrigatorio." });
  }
  if (!toTrimmedText(authorName)) {
    return res.status(400).json({ error: "Autor e obrigatorio." });
  }
  if (!toTrimmedText(technology)) {
    return res.status(400).json({ error: "Tecnologia e obrigatoria." });
  }
  if (!toTrimmedText(description)) {
    return res.status(400).json({ error: "Descricao e obrigatoria." });
  }

  const sourceLanguageNormalized = normalizeSourceLanguage(sourceLanguage);
  const localized = await translateUseCaseText({
    sourceLanguage: sourceLanguageNormalized,
    title: toTrimmedText(title),
    description: toTrimmedText(description),
  });

  if (!hasDatabase) {
    const id = Number(req.params.id);
    const found = memoryCases.find((item) => item.id === id);
    if (!found) return res.status(404).json({ error: "Caso nao encontrado." });
    found.title = toTrimmedText(title);
    found.category = toTrimmedText(category);
    found.area = toTrimmedText(area);
    found.technology = toTrimmedText(technology);
    found.phase = toTrimmedText(phase);
    found.theme = toTrimmedText(theme);
    found.author_name = toTrimmedText(authorName);
    found.skill_name = toTrimmedText(skillName);
    found.description = toTrimmedText(description);
    found.tags = Array.isArray(tags)
      ? tags.map((tag) => toTrimmedText(tag)).filter(Boolean)
      : [];
    found.status = normalizeStatus(status);
    found.source_language = sourceLanguageNormalized;
    found.title_pt = localized.title_pt;
    found.title_es = localized.title_es;
    found.title_en = localized.title_en;
    found.description_pt = localized.description_pt;
    found.description_es = localized.description_es;
    found.description_en = localized.description_en;
    found.image_data = String(imageData || "").startsWith("data:image/")
      ? String(imageData)
      : found.image_data || "";
    found.video_url = toTrimmedText(videoUrl);
    return res.json(found);
  }

  try {
    const { rows } = await pool.query(
      `UPDATE use_cases
       SET title = $1, category = $2, area = $3, technology = $4, phase = $5, theme = $6,
           author_name = $7, skill_name = $8, description = $9, tags = $10, status = $11,
           source_language = $12, title_pt = $13, title_es = $14, title_en = $15,
           description_pt = $16, description_es = $17, description_en = $18,
           image_data = $19, video_url = $20
       WHERE id = $21
       RETURNING *`,
      [
        toTrimmedText(title),
        toTrimmedText(category),
        toTrimmedText(area),
        toTrimmedText(technology),
        toTrimmedText(phase),
        toTrimmedText(theme),
        toTrimmedText(authorName),
        toTrimmedText(skillName),
        toTrimmedText(description),
        Array.isArray(tags) ? tags.map((tag) => toTrimmedText(tag)).filter(Boolean) : [],
        normalizeStatus(status),
        sourceLanguageNormalized,
        localized.title_pt,
        localized.title_es,
        localized.title_en,
        localized.description_pt,
        localized.description_es,
        localized.description_en,
        String(imageData || "").startsWith("data:image/") ? String(imageData) : "",
        toTrimmedText(videoUrl),
        req.params.id,
      ]
    );
    if (!rows.length) return res.status(404).json({ error: "Caso nao encontrado." });
    return res.json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao editar caso." });
  }
});

app.delete("/api/use-cases/:id", requireAuth, async (req, res) => {
  if (!hasDatabase) {
    const id = Number(req.params.id);
    memoryCases = memoryCases.filter((item) => item.id !== id);
    return res.json({ ok: true });
  }
  try {
    await pool.query("DELETE FROM use_cases WHERE id = $1", [req.params.id]);
    return res.json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao excluir caso." });
  }
});

app.post("/api/use-cases/:id/image", requireAuth, upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Arquivo obrigatorio." });

  const dataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
  if (!hasDatabase) {
    const id = Number(req.params.id);
    const found = memoryCases.find((item) => item.id === id);
    if (!found) return res.status(404).json({ error: "Caso nao encontrado." });
    found.image_data = dataUrl;
    return res.json(found);
  }

  try {
    const { rows } = await pool.query(
      `UPDATE use_cases SET image_data = $1 WHERE id = $2 RETURNING *`,
      [dataUrl, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Caso nao encontrado." });
    return res.json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao enviar imagem." });
  }
});

app.post("/api/use-cases/:id/favorite", async (req, res) => {
  if (!hasDatabase) {
    const id = Number(req.params.id);
    const found = memoryCases.find((item) => item.id === id);
    if (!found) return res.status(404).json({ error: "Caso nao encontrado." });
    found.is_favorite = !found.is_favorite;
    return res.json(found);
  }

  try {
    const { rows } = await pool.query(
      `UPDATE use_cases SET is_favorite = NOT is_favorite WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Caso nao encontrado." });
    return res.json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao favoritar caso." });
  }
});

app.post("/api/use-cases/:id/status", async (req, res) => {
  const nextStatus = normalizeStatus(req.body?.status);
  if (!hasDatabase) {
    const id = Number(req.params.id);
    const found = memoryCases.find((item) => item.id === id);
    if (!found) return res.status(404).json({ error: "Caso nao encontrado." });
    found.status = nextStatus;
    return res.json(found);
  }

  try {
    const { rows } = await pool.query(
      `UPDATE use_cases SET status = $1 WHERE id = $2 RETURNING *`,
      [nextStatus, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Caso nao encontrado." });
    return res.json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao atualizar status do caso." });
  }
});

app.post("/api/use-cases/translate-all", requireAuth, async (_req, res) => {
  try {
    if (!hasDatabase) {
      let updated = 0;
      for (const item of memoryCases) {
        const localized = await translateUseCaseText({
          sourceLanguage: item.source_language || "pt",
          title: item.title,
          description: item.description,
        });
        Object.assign(item, localized);
        updated += 1;
      }
      return res.json({ ok: true, updated });
    }

    const { rows } = await pool.query("SELECT * FROM use_cases ORDER BY created_at DESC");
    let updated = 0;
    for (const row of rows) {
      const localized = await translateUseCaseText({
        sourceLanguage: row.source_language || "pt",
        title: row.title,
        description: row.description,
      });
      await pool.query(
        `UPDATE use_cases
         SET title_pt = $1, title_es = $2, title_en = $3,
             description_pt = $4, description_es = $5, description_en = $6
         WHERE id = $7`,
        [
          localized.title_pt,
          localized.title_es,
          localized.title_en,
          localized.description_pt,
          localized.description_es,
          localized.description_en,
          row.id,
        ]
      );
      updated += 1;
    }
    return res.json({ ok: true, updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao traduzir casos." });
  }
});

app.get("/api/use-cases/export.csv", requireAuth, async (_req, res) => {
  try {
    const rows = !hasDatabase
      ? [...memoryCases].sort((a, b) => b.created_at - a.created_at)
      : (await pool.query("SELECT * FROM use_cases ORDER BY created_at DESC")).rows;

    const headers = [
      "id",
      "status",
      "title",
      "category",
      "area",
      "technology",
      "phase",
      "theme",
      "author_name",
      "skill_name",
      "description",
      "video_url",
      "tags",
      "is_favorite",
      "created_at",
    ];

    const csvBody = rows
      .map((row) =>
        [
          row.id,
          row.status || "in_progress",
          row.title,
          row.category,
          row.area,
          row.technology,
          row.phase,
          row.theme,
          row.author_name,
          row.skill_name,
          row.description,
          row.video_url || "",
          Array.isArray(row.tags) ? row.tags.join(" | ") : "",
          row.is_favorite,
          row.created_at,
        ]
          .map(toCsvValue)
          .join(",")
      )
      .join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=\"use-cases-export.csv\"");
    return res.send(`${headers.join(",")}\n${csvBody}`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao exportar CSV." });
  }
});

app.get("/*splat", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

ensureSchema()
  .then(() => {
    if (!hasDatabase) {
      console.log("Rodando em modo local sem banco persistente.");
    }
    app.listen(PORT, () => {
      console.log(`Servidor iniciado na porta ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Falha ao iniciar aplicacao:", error);
    process.exit(1);
  });
