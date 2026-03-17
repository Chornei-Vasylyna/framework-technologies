export const envSchema = {
  type: "object",
  properties: {
    HOSTNAME: { type: "string", minLength: 2 },
    PORT: { type: "string", pattern: "^[0-9]+$" },
    NODE_ENV: { type: "string", enum: ["development", "production"] },
  },
  required: ["HOSTNAME", "PORT", "NODE_ENV"],
  additionalProperties: false,
};
