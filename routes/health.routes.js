import { getHealth, getHealthDetails } from "#controllers/health.controller.js";
import {
  healthDetailsResponseSchema,
  healthResponseSchema,
  unauthorizedSchema,
} from "#schemas/health.schema.js";

export const healthRoutes = async (fastify) => {
  fastify.get(
    "/health",
    {
      schema: {
        tags: ["Health"],
        summary: "Health check",
        response: {
          200: healthResponseSchema,
        },
      },
    },
    getHealth,
  );

  fastify.get(
    "/health/details",
    {
      onRequest: async (request, reply) => {
        const headerValue = request.headers["x-api-key"];
        const apiKey = Array.isArray(headerValue)
          ? headerValue[0]
          : headerValue;

        if (!apiKey || apiKey !== fastify.config.ADMIN_API_KEY) {
          return reply.unauthorized();
        }
      },
      schema: {
        tags: ["Health"],
        summary: "Detailed health info (admin)",
        security: [{ ApiKeyAuth: [] }],
        headers: {
          type: "object",
          properties: {
            "x-api-key": { type: "string" },
          },
          required: ["x-api-key"],
          additionalProperties: true,
        },
        response: {
          200: healthDetailsResponseSchema,
          401: unauthorizedSchema,
        },
      },
    },
    getHealthDetails,
  );
};
