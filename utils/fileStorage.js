import { createReadStream, createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { createGzip } from "node:zlib";

export const ensureDir = async (dirPath) => {
  await fs.mkdir(dirPath, { recursive: true });
};

export const atomicWriteJson = async (filePath, data) => {
  const dir = path.dirname(filePath);
  const baseName = path.basename(filePath, ".json");
  const tempPath = path.join(dir, `${baseName}.tmp.json`);
  const json = JSON.stringify(data, null, 2);

  try {
    await fs.writeFile(tempPath, json, "utf8");
    await fs.rename(tempPath, filePath);
  } catch (error) {
    if (
      error.code === "EEXIST" ||
      error.code === "EPERM" ||
      error.code === "EACCES"
    ) {
      await fs.rm(filePath, { force: true });
      await fs.rename(tempPath, filePath);
      return;
    }

    await fs.rm(tempPath, { force: true });
    throw error;
  }
};

const getTimestampFileName = () =>
  new Date().toISOString().replace(/[:.]/g, "-");

export const createBackup = async ({ sourceDir, backupsDir, maxBackups }) => {
  await ensureDir(sourceDir);
  await ensureDir(backupsDir);

  const timestamp = getTimestampFileName();
  const backupFile = path.join(backupsDir, `${timestamp}.gz`);

  const entries = await fs.readdir(sourceDir, { withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile()).sort();

  if (files.length === 0) {
    return;
  }

  async function* fileGenerator() {
    for (const file of files) {
      const stream = createReadStream(path.join(sourceDir, file.name));

      for await (const chunk of stream) {
        yield chunk;
      }
    }
  }

  await pipeline(fileGenerator(), createGzip(), createWriteStream(backupFile));

  const backupEntries = await fs.readdir(backupsDir, { withFileTypes: true });
  const backups = backupEntries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".gz"))
    .map((entry) => entry.name)
    .sort();

  const limit = Number.isFinite(maxBackups) ? maxBackups : 5;
  const toDelete = backups.slice(0, Math.max(0, backups.length - limit));

  await Promise.all(
    toDelete.map((name) => fs.rm(path.join(backupsDir, name), { force: true })),
  );
};
