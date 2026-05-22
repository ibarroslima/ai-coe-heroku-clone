const path = require("path");
const express = require("express");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

const hasDatabase = Boolean(process.env.DATABASE_URL);
const pool = hasDatabase
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    })
  : null;
let memoryCases = [];
let memoryId = 1;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

async function ensureSchema() {
  if (!hasDatabase) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS use_cases (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT DEFAULT '',
      author_name TEXT DEFAULT '',
      skill_name TEXT DEFAULT '',
      description TEXT DEFAULT '',
      tags TEXT[] DEFAULT ARRAY[]::TEXT[],
      is_favorite BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

app.get("/api/use-cases", async (_req, res) => {
  if (!hasDatabase) {
    return res.json([...memoryCases].sort((a, b) => b.created_at - a.created_at));
  }
  try {
    const { rows } = await pool.query(
      "SELECT * FROM use_cases ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao listar casos." });
  }
});

app.post("/api/use-cases", async (req, res) => {
  const {
    title,
    category = "",
    authorName = "",
    skillName = "",
    description = "",
    tags = [],
  } = req.body || {};

  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: "Titulo e obrigatorio." });
  }

  if (!hasDatabase) {
    const item = {
      id: memoryId++,
      title: String(title).trim(),
      category: String(category).trim(),
      author_name: String(authorName).trim(),
      skill_name: String(skillName).trim(),
      description: String(description).trim(),
      tags: Array.isArray(tags)
        ? tags.map((tag) => String(tag).trim()).filter(Boolean)
        : [],
      is_favorite: false,
      created_at: Date.now(),
    };
    memoryCases.push(item);
    return res.status(201).json(item);
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO use_cases (title, category, author_name, skill_name, description, tags)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        String(title).trim(),
        String(category).trim(),
        String(authorName).trim(),
        String(skillName).trim(),
        String(description).trim(),
        Array.isArray(tags)
          ? tags.map((tag) => String(tag).trim()).filter(Boolean)
          : [],
      ]
    );
    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao criar caso." });
  }
});

app.post("/api/use-cases/:id/favorite", async (req, res) => {
  if (!hasDatabase) {
    const id = Number(req.params.id);
    const found = memoryCases.find((item) => item.id === id);
    if (!found) {
      return res.status(404).json({ error: "Caso nao encontrado." });
    }
    found.is_favorite = !found.is_favorite;
    return res.json(found);
  }

  try {
    const { rows } = await pool.query(
      `UPDATE use_cases
       SET is_favorite = NOT is_favorite
       WHERE id = $1
       RETURNING *`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Caso nao encontrado." });
    }

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
