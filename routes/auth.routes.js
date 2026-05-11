import {
  login,
  logout,
  refresh,
  register,
} from "#controllers/auth.controller.js";
import {
  authCredentialsSchema,
  badRequestSchema,
  registerResponseSchema,
  tokenResponseSchema,
  unauthorizedSchema,
} from "#schemas/auth.schema.js";

export const authRoutes = async (fastify) => {
  fastify.post(
    "/register",
    {
      schema: {
        tags: ["Auth"],
        summary: "Register",
        body: authCredentialsSchema,
        response: {
          201: registerResponseSchema,
          400: badRequestSchema,
        },
      },
    },
    register,
  );

  fastify.post(
    "/login",
    {
      schema: {
        tags: ["Auth"],
        summary: "Login",
        description:
          "Returns access token in response body and sets refresh token in httpOnly cookie.",
        body: authCredentialsSchema,
        response: {
          200: tokenResponseSchema,
          401: unauthorizedSchema,
          400: badRequestSchema,
        },
      },
    },
    login,
  );

  fastify.post(
    "/refresh",
    {
      schema: {
        tags: ["Auth"],
        summary: "Refresh access token",
        description:
          "Reads refresh token from httpOnly cookie and returns a new access token.",
        response: {
          200: tokenResponseSchema,
          401: unauthorizedSchema,
        },
      },
    },
    refresh,
  );

  fastify.post(
    "/logout",
    {
      onRequest: async (request) => request.jwtVerify(),
      schema: {
        tags: ["Auth"],
        summary: "Logout",
        description:
          "Adds access token to Redis blacklist until it expires and deletes refresh token from Redis.",
        security: [{ BearerAuth: [] }],
        response: {
          204: { type: "null" },
          401: unauthorizedSchema,
        },
      },
    },
    logout,
  );
};
