import { createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { createGzip } from "node:zlib";

const MAX_BACKUPS = 5;

const getTimestampFileName = () => {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, "-");
};

const cleanupOldBackups = async (backupsDir) => {
  try {
    const files = await fs.readdir(backupsDir, { withFileTypes: true });

    const backupFiles = files
      .filter((file) => file.isFile() && file.name.endsWith(".gz"))
      .sort((a, b) => b.name.localeCompare(a.name));

    if (backupFiles.length > MAX_BACKUPS) {
      const filesToDelete = backupFiles.slice(MAX_BACKUPS);

      for (const file of filesToDelete) {
        await fs.unlink(path.join(backupsDir, file.name));
      }
    }
  } catch (error) {
    throw new Error(`Failed to cleanup old backups: ${error.message}`, {
      cause: error,
    });
  }
};

export const createMongoBackup = (db) => {
  return {
    async createBackup(backupsDir) {
      try {
        const timestamp = getTimestampFileName();
        const fileName = `${timestamp}.gz`;
        const filePath = path.join(backupsDir, fileName);

        await fs.mkdir(backupsDir, { recursive: true });

        const Student = db.model("Student");
        const students = await Student.find().lean();

        const backupData = {
          timestamp,
          version: "1.0",
          exportedAt: new Date().toISOString(),
          collections: {
            students,
          },
        };

        const jsonData = JSON.stringify(backupData, null, 2);
        const gzip = createGzip();
        const writeStream = createWriteStream(filePath);

        await pipeline(
          async function* () {
            yield jsonData;
          },
          gzip,
          writeStream,
        );

        // Cleanup old backups, keeping only the last 5
        await cleanupOldBackups(backupsDir);

        return { timestamp, path: filePath };
      } catch (error) {
        throw new Error(`Failed to create backup: ${error.message}`, {
          cause: error,
        });
      }
    },
  };
};
