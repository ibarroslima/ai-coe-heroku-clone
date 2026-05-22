const path = require("path");
const express = require("express");
const session = require("express-session");
const multer = require("multer");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const SESSION_SECRET = process.env.SESSION_SECRET || "change-me";

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
}

function toTrimmedText(value) {
  return String(value || "").trim();
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
  } = req.body || {};

  if (!toTrimmedText(title)) {
    return res.status(400).json({ error: "Titulo e obrigatorio." });
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
  };

  if (!hasDatabase) {
    const item = {
      id: memoryId++,
      ...payload,
      image_data: "",
      is_favorite: false,
      created_at: Date.now(),
    };
    memoryCases.push(item);
    return res.status(201).json(item);
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO use_cases (title, category, area, technology, phase, theme, author_name, skill_name, description, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
      ]
    );
    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao criar caso." });
  }
});

app.put("/api/use-cases/:id", requireAuth, async (req, res) => {
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
  } = req.body || {};
  if (!toTrimmedText(title)) {
    return res.status(400).json({ error: "Titulo e obrigatorio." });
  }

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
    return res.json(found);
  }

  try {
    const { rows } = await pool.query(
      `UPDATE use_cases
       SET title = $1, category = $2, area = $3, technology = $4, phase = $5, theme = $6,
           author_name = $7, skill_name = $8, description = $9, tags = $10
       WHERE id = $11
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
