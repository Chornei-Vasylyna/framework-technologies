import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "#configs/fastify/env.js";
import { createMysqlPool } from "#db/mysql.js";

const SCHEMA_PATH = path.resolve(process.cwd(), "db", "schema.sql");

const getSchemaHash = (schemaSql) =>
  crypto.createHash("md5").update(schemaSql).digest("hex");

const readSchemaSql = async () => fs.readFile(SCHEMA_PATH, "utf8");

const ensureMigrationsTable = async (db) => {
  await db.query(
    "CREATE TABLE IF NOT EXISTS migrations (id INT AUTO_INCREMENT PRIMARY KEY, schema_hash CHAR(32) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
  );
};

const readStoredHash = async (db) => {
  await ensureMigrationsTable(db);
  const [rows] = await db.query(
    "SELECT schema_hash FROM migrations ORDER BY id DESC LIMIT 1",
  );
  return rows.length > 0 ? rows[0].schema_hash : null;
};

export const checkMigrationNeeded = async (db) => {
  const schemaSql = await readSchemaSql();
  const currentHash = getSchemaHash(schemaSql);
  const storedHash = await readStoredHash(db);
  return storedHash !== currentHash;
};

const migrateIfNeeded = async () => {
  const schemaSql = await readSchemaSql();
  const currentHash = getSchemaHash(schemaSql);
  const env = await loadEnvConfig();
  const db = createMysqlPool(env);

  try {
    const storedHash = await readStoredHash(db);

    if (storedHash === currentHash) {
      return { migrated: false };
    }

    await db.query(schemaSql);
    await db.query("INSERT INTO migrations (schema_hash) VALUES (?)", [
      currentHash,
    ]);

    return { migrated: true };
  } finally {
    await db.end();
  }
};

const runCli = async () => {
  const result = await migrateIfNeeded();

  if (result.migrated) {
    console.log("Migration complete.");
    return;
  }

  console.log("No migration needed.");
};

const isCli = process.argv[1] === import.meta.filename;

if (isCli) {
  runCli().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
