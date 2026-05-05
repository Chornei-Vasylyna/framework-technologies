import { BACKUPS_DIR } from "#constants/paths.js";
import { createMongoBackup } from "#utils/mongoBackup.js";

export const registerHooks = async (fastify) => {
  fastify.addHook("onReady", async () => {
    if (
      fastify.config.NODE_ENV === "production" &&
      !fastify.config.CORS_ORIGIN
    ) {
      throw new Error("CORS_ORIGIN must be set in production");
    }

    try {
      const backupService = createMongoBackup(fastify.db);
      const result = await backupService.createBackup(BACKUPS_DIR);
      fastify.log.info(
        `Automatic backup created on startup: ${result.timestamp}`,
      );
    } catch (error) {
      fastify.log.warn(`Failed to create backup on startup: ${error.message}`);
    }
  });

  fastify.addHook("onClose", async (instance) => {
    instance.log.info("Fastify server is closing");
  });
};
