import { createReadStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { BACKUPS_DIR } from "#constants/paths.js";

export const streamBackup = async (request, reply) => {
  const { timestamp } = request.params;

  try {
    if (!isValidTimestamp(timestamp)) {
      return reply.badRequest("Invalid timestamp format");
    }

    const backupFilePath = path.join(BACKUPS_DIR, `${timestamp}.gz`);

    try {
      await fs.access(backupFilePath);
    } catch {
      return reply.notFound(`Backup file not found: ${timestamp}`);
    }

    const stats = await fs.stat(backupFilePath);

    reply.header("Content-Type", "application/gzip");
    reply.header(
      "Content-Disposition",
      `attachment; filename="backup-${timestamp}.gz"`,
    );
    reply.header("Content-Length", stats.size);

    const stream = createReadStream(backupFilePath);

    return reply.send(stream);
  } catch (error) {
    request.log.error(`Error streaming backup: ${error.message}`);
    return reply.internalServerError("Failed to stream backup file");
  }
};

export const listBackups = async (request, reply) => {
  try {
    const files = await fs.readdir(BACKUPS_DIR, { withFileTypes: true });

    const backups = files
      .filter((file) => file.isFile() && file.name.endsWith(".gz"))
      .map((file) => ({
        timestamp: file.name.replace(".gz", ""),
        filename: file.name,
      }))
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

    return reply.send({
      count: backups.length,
      backups,
    });
  } catch (error) {
    request.log.error(`Error listing backups: ${error.message}`);
    return reply.internalServerError("Failed to list backups");
  }
};

function isValidTimestamp(timestamp) {
  const timestampRegex = /^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z$/;
  return timestampRegex.test(timestamp);
}
