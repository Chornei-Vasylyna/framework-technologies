import fastifyEnv from "@fastify/env";
import Fastify from "fastify";
import { ENV_OPTIONS } from "#constants/index.js";

export const loadEnvConfig = async () => {
  const configLoader = Fastify({ logger: false });

  await configLoader.register(fastifyEnv, ENV_OPTIONS);
  await configLoader.ready();

  const config = configLoader.config;

  await configLoader.close();

  return config;
};
