import { listBackups, streamBackup } from "#controllers/backup.controller.js";
import {
  backupStreamResponseSchema,
  backupsListSchema,
  backupTimestampParamSchema,
  badRequestBackupSchema,
  internalServerErrorBackupSchema,
  notFoundBackupSchema,
  unauthorizedBackupSchema,
} from "#schemas/backup.schema.js";

export const backupRoutes = async (fastify) => {
  fastify.get(
    "/backups",
    {
      onRequest: async (request, reply) => {
        const headerValue = request.headers["x-api-key"];
        const apiKey = Array.isArray(headerValue)
          ? headerValue[0]
          : headerValue;

        if (!apiKey || apiKey !== fastify.config.ADMIN_API_KEY) {
          return reply.unauthorized();
        }
      },
      schema: {
        tags: ["Backups"],
        summary: "List all available backups",
        security: [{ ApiKeyAuth: [] }],
        headers: {
          type: "object",
          properties: {
            "x-api-key": { type: "string" },
          },
          required: ["x-api-key"],
          additionalProperties: true,
        },
        response: {
          200: backupsListSchema,
          401: unauthorizedBackupSchema,
          500: internalServerErrorBackupSchema,
        },
      },
    },
    listBackups,
  );

  fastify.get(
    "/backups/:timestamp",
    {
      onRequest: async (request, reply) => {
        const headerValue = request.headers["x-api-key"];
        const apiKey = Array.isArray(headerValue)
          ? headerValue[0]
          : headerValue;

        if (!apiKey || apiKey !== fastify.config.ADMIN_API_KEY) {
          return reply.unauthorized();
        }
      },
      schema: {
        tags: ["Backups"],
        summary: "Stream backup file by timestamp",
        description:
          "Download backup file (gzip format). Requires admin API key.",
        security: [{ ApiKeyAuth: [] }],
        params: backupTimestampParamSchema,
        headers: {
          type: "object",
          properties: {
            "x-api-key": { type: "string" },
          },
          required: ["x-api-key"],
          additionalProperties: true,
        },
        response: {
          200: backupStreamResponseSchema,
          400: badRequestBackupSchema,
          401: unauthorizedBackupSchema,
          404: notFoundBackupSchema,
          500: internalServerErrorBackupSchema,
        },
      },
    },
    streamBackup,
  );
};
