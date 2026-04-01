import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import { STUDENTS_DATA_DIR, VERSION_FILE } from "#constants/paths.js";
import { studentModel } from "#src/models/student.model.js";
import { atomicWriteJson, ensureDir } from "#utils/fileStorage.js";

// Utility helpers
const getModelHash = () =>
  crypto.createHash("md5").update(JSON.stringify(studentModel)).digest("hex");

const readVersionHash = async () => {
  try {
    const content = await fs.readFile(VERSION_FILE, "utf8");
    const data = JSON.parse(content);
    return typeof data?.hash === "string" ? data.hash : null;
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }

    throw error;
  }
};

// Migration functions
export const checkMigrationNeeded = async () => {
  const currentHash = getModelHash();
  const storedHash = await readVersionHash();
  return storedHash !== currentHash;
};

const migrateIfNeeded = async () => {
  const currentHash = getModelHash();
  const storedHash = await readVersionHash();

  if (storedHash === currentHash) {
    return { migrated: false };
  }

  await ensureDir(STUDENTS_DATA_DIR);
  const entries = await fs.readdir(STUDENTS_DATA_DIR, { withFileTypes: true });
  const files = entries.filter(
    (entry) => entry.isFile() && entry.name.endsWith(".json"),
  );

  let updatedCount = 0;
  await Promise.all(
    files.map(async (entry) => {
      const filePath = path.join(STUDENTS_DATA_DIR, entry.name);
      const content = await fs.readFile(filePath, "utf8");
      const data = JSON.parse(content);
      const merged = { ...studentModel, ...data };
      const needsUpdate = Object.keys(studentModel).some(
        (key) => data[key] === undefined,
      );

      if (needsUpdate) {
        updatedCount += 1;
        await atomicWriteJson(filePath, merged);
      }
    }),
  );

  await ensureDir(path.dirname(VERSION_FILE));
  await atomicWriteJson(VERSION_FILE, { hash: currentHash });

  return { migrated: true, updatedCount };
};

const runCli = async () => {
  const result = await migrateIfNeeded();

  if (result.migrated) {
    console.log(
      `Migration complete. Updated files: ${result.updatedCount ?? 0}.`,
    );
    return;
  }

  console.log("No migration needed.");
};

// CLI entry
const isCli = process.argv[1] === import.meta.filename;

if (isCli) {
  runCli().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
