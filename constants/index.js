import { envSchema } from "#schemas/env.schema.js";

export const ENV_OPTIONS = {
  schema: envSchema,
  dotenv: true,
};

export const API_METHODS = ["GET", "POST", "PATCH", "DELETE"];
export const CORS_ALLOWED_HEADERS = ["Content-Type", "X-API-Key"];
