import fastifyEnv from "@fastify/env";
import Fastify from "fastify";
import { ENV_OPTIONS } from "#constants/index.js";

export const loadNodeEnv = async () => {
  const configLoader = Fastify({ logger: false });

  await configLoader.register(fastifyEnv, ENV_OPTIONS);
  await configLoader.ready();

  const nodeEnv = configLoader.config.NODE_ENV;

  await configLoader.close();

  return nodeEnv;
};
