export const envSchema = {
  type: "object",
  properties: {
    HOSTNAME: { type: "string", minLength: 2 },
    PORT: { type: "string", pattern: "^[0-9]+$" },
    NODE_ENV: { type: "string", enum: ["development", "production"] },
    ADMIN_API_KEY: { type: "string", minLength: 8 },
    CORS_ORIGIN: { type: "string", minLength: 1 },
    GITHUB_TOKEN: { type: "string" },
  },
  required: ["HOSTNAME", "PORT", "NODE_ENV", "ADMIN_API_KEY"],
  additionalProperties: false,
};
