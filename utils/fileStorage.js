import { promises as fs } from "node:fs";
import path from "node:path";

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

const getTimestampDirName = () =>
  new Date().toISOString().replace(/[:.]/g, "-");

export const createBackup = async ({ sourceDir, backupsDir, maxBackups }) => {
  await ensureDir(sourceDir);
  await ensureDir(backupsDir);

  const timestamp = getTimestampDirName();
  const backupDir = path.join(backupsDir, timestamp);
  await ensureDir(backupDir);

  const entries = await fs.readdir(sourceDir, { withFileTypes: true });
  await Promise.all(
    entries
      .filter((entry) => entry.isFile())
      .map((entry) =>
        fs.copyFile(
          path.join(sourceDir, entry.name),
          path.join(backupDir, entry.name),
        ),
      ),
  );

  const backupEntries = await fs.readdir(backupsDir, { withFileTypes: true });
  const backups = backupEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  const limit = Number.isFinite(maxBackups) ? maxBackups : 5;
  const toDelete = backups.slice(0, Math.max(0, backups.length - limit));

  await Promise.all(
    toDelete.map((name) =>
      fs.rm(path.join(backupsDir, name), { recursive: true, force: true }),
    ),
  );
};
