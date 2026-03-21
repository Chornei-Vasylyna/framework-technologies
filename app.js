import fastifyEnv from "@fastify/env";
import sensible from "@fastify/sensible";
import Fastify from "fastify";

import { loadNodeEnv } from "#configs/fastify/env.js";
import { registerHandlers } from "#configs/fastify/handlers.js";
import { registerHooks } from "#configs/fastify/hooks.js";
import { registerSecurityPlugins } from "#configs/fastify/security.js";
import { ENV_OPTIONS } from "#constants/index.js";
import { routes } from "#routes/index.js";
import { getLoggerOptions } from "#utils/getLoggerOptions.js";

export const buildApp = async () => {
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

  // Plugins
  fastify.register(fastifyEnv, ENV_OPTIONS);
  fastify.register(sensible);
  await registerSecurityPlugins(fastify);

  // Hooks
  await registerHooks(fastify);

  // Handlers
  await registerHandlers(fastify);

  // Routes
  fastify.register(routes);

  return fastify;
};
