export const authCredentialsSchema = {
  type: "object",
  properties: {
    email: { type: "string", format: "email" },
    password: { type: "string", minLength: 6 },
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
    message: { type: "string" },
    user: authUserSchema,
  },
  required: ["message", "user"],
  additionalProperties: false,
};

export const loginResponseSchema = {
  type: "object",
  properties: {
    message: { type: "string" },
    user: authUserSchema,
  },
  required: ["message", "user"],
  additionalProperties: false,
};

export const authBadRequestSchema = {
  type: "object",
  properties: {
    statusCode: { type: "integer", const: 400 },
    error: { type: "string", const: "Bad Request" },
    message: { type: "string" },
  },
  required: ["statusCode", "error", "message"],
  additionalProperties: false,
};

export const authUnauthorizedSchema = {
  type: "object",
  properties: {
    statusCode: { type: "integer", const: 401 },
    error: { type: "string", const: "Unauthorized" },
    message: { type: "string" },
  },
  required: ["statusCode", "error", "message"],
  additionalProperties: false,
};

export const authConflictSchema = {
  type: "object",
  properties: {
    statusCode: { type: "integer", const: 409 },
    error: { type: "string", const: "Conflict" },
    message: { type: "string" },
  },
  required: ["statusCode", "error", "message"],
  additionalProperties: false,
};
