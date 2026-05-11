import { errorSchema } from "#schemas/student.schema.js";

export const authCredentialsSchema = {
  type: "object",
  properties: {
    email: { type: "string", format: "email" },
    password: { type: "string", minLength: 8 },
  },
  required: ["email", "password"],
  additionalProperties: false,
};

export const authUserSchema = {
  type: "object",
  properties: {
    id: { type: "integer", minimum: 1 },
    email: { type: "string", format: "email" },
  },
  required: ["id", "email"],
  additionalProperties: false,
};

export const registerResponseSchema = {
  type: "object",
  properties: {
    user: authUserSchema,
  },
  required: ["user"],
  additionalProperties: false,
};

export const tokenResponseSchema = {
  type: "object",
  properties: {
    accessToken: { type: "string", minLength: 20 },
  },
  required: ["accessToken"],
  additionalProperties: false,
};

export const unauthorizedSchema = errorSchema;
export const badRequestSchema = errorSchema;
