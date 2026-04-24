// Runs Drizzle SQL migrations sequentially against DATABASE_URL.
// Idempotent: tracks applied migrations in `__drizzle_migrations` table.
// Invoked from Dockerfile CMD before the server boots.
import { createConnection } from "mysql2/promise";
import { readdir, readFile } from "fs/promises";
import { createHash } from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("[migrate] DATABASE_URL not set — skipping migrations");
  process.exit(0);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, "..", "drizzle");

async function main() {
  const conn = await createConnection(DATABASE_URL);

  // Table to track applied migrations (compatible with Drizzle's own format).
  await conn.query(`
    CREATE TABLE IF NOT EXISTS __drizzle_migrations (
      id SERIAL PRIMARY KEY,
      hash TEXT NOT NULL,
      created_at BIGINT
    )
  `);

  const [appliedRows] = await conn.query("SELECT hash FROM __drizzle_migrations");
  const appliedHashes = new Set(appliedRows.map(r => r.hash));

  const files = (await readdir(MIGRATIONS_DIR))
    .filter(f => f.endsWith(".sql"))
    .sort();

  let applied = 0;
  for (const file of files) {
    const content = await readFile(path.join(MIGRATIONS_DIR, file), "utf8");
    const hash = createHash("sha256").update(content).digest("hex");

    if (appliedHashes.has(hash)) {
      continue;
    }

    console.log(`[migrate] applying ${file}`);
    // Drizzle migrations use `--> statement-breakpoint` as separator.
    const statements = content
      .split("--> statement-breakpoint")
      .map(s => s.trim())
      .filter(s => s.length > 0);

    try {
      for (const stmt of statements) {
        await conn.query(stmt);
      }
      await conn.query(
        "INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)",
        [hash, Date.now()]
      );
      applied++;
    } catch (err) {
      console.error(`[migrate] FAILED on ${file}:`, err.message);
      throw err;
    }
  }

  console.log(`[migrate] ok — ${applied} new migrations applied, ${files.length - applied} already up-to-date`);
  await conn.end();
}

main().catch((err) => {
  console.error("[migrate] fatal:", err);
  process.exit(1);
});

// Esperar a promise principal terminar
// (process.exit não é necessário — node sai naturalmente quando loop vazio)
