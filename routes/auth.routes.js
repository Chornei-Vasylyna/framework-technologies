import {
  loginUser,
  logoutUser,
  registerUser,
} from "#controllers/auth.controller.js";
import {
  authBadRequestSchema,
  authConflictSchema,
  authCredentialsSchema,
  authUnauthorizedSchema,
  loginResponseSchema,
  registerResponseSchema,
} from "#schemas/auth.schema.js";

export const authRoutes = async (fastify) => {
  fastify.post(
    "/auth/register",
    {
      schema: {
        tags: ["Auth"],
        summary: "Register",
        body: authCredentialsSchema,
        response: {
          201: registerResponseSchema,
          400: authBadRequestSchema,
          409: authConflictSchema,
        },
      },
    },
    registerUser,
  );

  fastify.post(
    "/auth/login",
    {
      schema: {
        tags: ["Auth"],
        summary: "Login",
        body: authCredentialsSchema,
        response: {
          200: loginResponseSchema,
          400: authBadRequestSchema,
          401: authUnauthorizedSchema,
        },
      },
    },
    loginUser,
  );

  fastify.post(
    "/auth/logout",
    {
      schema: {
        tags: ["Auth"],
        summary: "Logout",
        response: {
          204: { type: "null" },
        },
      },
    },
    logoutUser,
  );
};
