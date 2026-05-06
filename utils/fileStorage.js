import { exec } from "node:child_process";
import { createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { promisify } from "node:util";
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

const execPromise = promisify(exec);

const cleanupOldBackups = async (backupsDir, maxBackups) => {
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

export const createMysqlBackup = async ({
  host,
  port,
  user,
  password,
  database,
  backupsDir,
  maxBackups,
} = {}) => {
  if (!host || !port || !user || !database) {
    throw new Error(
      "Missing required MySQL configuration: host, port, user, database",
    );
  }

  await ensureDir(backupsDir);

  const timestamp = getTimestampFileName();
  const backupFile = path.join(backupsDir, `${timestamp}.gz`);

  const mysqldumpCmd = `mysqldump -h "${host}" -P ${port} -u "${user}" ${password ? `-p"${password}"` : ""} "${database}"`;

  try {
    const { stdout } = await execPromise(mysqldumpCmd);
    await pipeline(
      async function* () {
        yield stdout;
      },
      createGzip(),
      createWriteStream(backupFile),
    );

    await cleanupOldBackups(backupsDir, maxBackups);
  } catch (error) {
    await fs.rm(backupFile, { force: true });
    throw new Error(`MySQL backup failed: ${error.message}`, { cause: error });
  }
};
