import { envSchema } from "../schemas/env.schema.js";
import { ajv } from "./ajv.js";

const HOSTNAME = process.env.HOSTNAME;
const PORT = process.env.PORT;
const NODE_ENV = process.env.NODE_ENV;

const validateEnv = ajv.compile(envSchema);

const valid = validateEnv({ HOSTNAME, PORT, NODE_ENV });

if (!valid) {
  console.error("Invalid environment variables:", validateEnv.errors);
  process.exit(1);
}

export const config = {
  HOSTNAME,
  PORT: Number(PORT),
  NODE_ENV,
};
