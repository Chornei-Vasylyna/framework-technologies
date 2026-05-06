import path from "node:path";
import fastifyEnv from "@fastify/env";
import multipart from "@fastify/multipart";
import sensible from "@fastify/sensible";
import fastifyStatic from "@fastify/static";
import websocket from "@fastify/websocket";
import Fastify from "fastify";
import { loadEnvConfig } from "#configs/fastify/env.js";
import { registerHandlers } from "#configs/fastify/handlers.js";
import { registerHooks } from "#configs/fastify/hooks.js";
import { registerSecurityPlugins } from "#configs/fastify/security.js";
import { registerSwagger } from "#configs/fastify/swagger.js";
import { ENV_OPTIONS } from "#constants/index.js";
import mysqlPlugin from "#db/mysql.js";
import { initStudentRepository } from "#repositories/student.repository.js";
import { githubRoutesV1, githubRoutesV2 } from "#routes/github.routes.js";
import { routes } from "#routes/index.js";
import { studentRoutesV2 } from "#routes/student.routes.v2.js";
import { websocketRoutes } from "#routes/websocket.routes.js";
import { checkMigrationNeeded } from "#src/migrations/migrate.js";
import { getLoggerOptions } from "#utils/getLoggerOptions.js";

export const buildApp = async () => {
  const uploadsDir = path.resolve(process.cwd(), "uploads");
  const config = await loadEnvConfig();
  const nodeEnv = config.NODE_ENV;
  const logger = getLoggerOptions(nodeEnv);

  const fastify = Fastify({
    logger,
    ajv: {
      customOptions: {
        coerceTypes: true,
      },
    },
  });

  // Plugins
  await fastify.register(fastifyEnv, ENV_OPTIONS);
  await fastify.register(mysqlPlugin);
  initStudentRepository(fastify.db);
  fastify.register(sensible);
  fastify.register(multipart);
  fastify.register(fastifyStatic, { root: uploadsDir, prefix: "/uploads" });
  fastify.register(websocket);
  await registerSecurityPlugins(fastify);
  await registerSwagger(fastify);

  if (await checkMigrationNeeded(fastify.db)) {
    fastify.log.warn(
      'Data schema changed. Run "npm run migrate" to update existing data.',
    );
  }

  // Hooks
  await registerHooks(fastify);

  // Handlers
  await registerHandlers(fastify);

  // Routes
  fastify.register(routes, { prefix: "/api/v1" });
  fastify.register(githubRoutesV1, { prefix: "/api/v1" });
  fastify.register(githubRoutesV2, { prefix: "/api/v2" });
  fastify.register(studentRoutesV2, { prefix: "/api/v2" });
  fastify.register(websocketRoutes);

  return fastify;
};
