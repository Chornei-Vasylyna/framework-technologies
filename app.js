import path from "node:path";
import fastifyEnv from "@fastify/env";
import multipart from "@fastify/multipart";
import sensible from "@fastify/sensible";
import fastifyStatic from "@fastify/static";
import Fastify from "fastify";
import { loadNodeEnv } from "#configs/fastify/env.js";
import { registerHandlers } from "#configs/fastify/handlers.js";
import { registerHooks } from "#configs/fastify/hooks.js";
import { registerSecurityPlugins } from "#configs/fastify/security.js";
import { registerSwagger } from "#configs/fastify/swagger.js";
import { ENV_OPTIONS } from "#constants/index.js";
import { routes } from "#routes/index.js";
import { githubRoutesV1, githubRoutesV2 } from "#routes/github.routes.js";
import { studentRoutesV2 } from "#routes/student.routes.v2.js";
import { checkMigrationNeeded } from "#src/migrations/migrate.js";
import { getLoggerOptions } from "#utils/getLoggerOptions.js";

export const buildApp = async () => {
  const uploadsDir = path.resolve(process.cwd(), "uploads");
  const nodeEnv = await loadNodeEnv();
  const logger = getLoggerOptions(nodeEnv);

  const fastify = Fastify({
    logger,
    ajv: {
      customOptions: {
        coerceTypes: true,
      },
    },
  });

  if (await checkMigrationNeeded()) {
    fastify.log.warn(
      'Data schema changed. Run "npm run migrate" to update existing files.',
    );
  }

  // Plugins
  fastify.register(fastifyEnv, ENV_OPTIONS);
  fastify.register(sensible);
  fastify.register(multipart);
  fastify.register(fastifyStatic, { root: uploadsDir, prefix: "/uploads" });
  await registerSecurityPlugins(fastify);
  await registerSwagger(fastify);

  // Hooks
  await registerHooks(fastify);

  // Handlers
  await registerHandlers(fastify);

  // Routes
  fastify.register(routes, { prefix: "/api/v1" });
  fastify.register(githubRoutesV1, { prefix: "/api/v1" });
  fastify.register(githubRoutesV2, { prefix: "/api/v2" });
  fastify.register(studentRoutesV2, { prefix: "/api/v2" });

  return fastify;
};
