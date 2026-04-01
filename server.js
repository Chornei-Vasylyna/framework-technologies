import { BACKUPS_DIR, STUDENTS_DATA_DIR } from "#constants/paths.js";
import { runShutdownOnce } from "#state/shutdownState.js";
import { createBackup } from "#utils/fileStorage.js";
import { gracefulShutdown } from "#utils/gracefulShutdown.js";
import { buildApp } from "./app.js";

const server = await buildApp();

const shutdown = (signal) => {
  runShutdownOnce(() => gracefulShutdown(server, signal));
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("uncaughtException", (error) => {
  server.log.error({ error }, "Uncaught Exception");
  shutdown("uncaughtException");
});

process.on("unhandledRejection", (reason) => {
  server.log.error({ reason }, "Unhandled Rejection");
  shutdown("unhandledRejection");
});

try {
  await createBackup({
    sourceDir: STUDENTS_DATA_DIR,
    backupsDir: BACKUPS_DIR,
    maxBackups: 5,
  });
  await server.ready();
  await server.listen({
    port: Number(server.config.PORT),
    host: server.config.HOSTNAME,
  });
} catch (error) {
  server.log.error({ error }, "Failed to start server");
  process.exit(1);
}
