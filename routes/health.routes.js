import { getHealth, getHealthDetails } from "#controllers/health.controller.js";
import {
  healthDetailsResponseSchema,
  healthResponseSchema,
} from "#schemas/health.schema.js";

export const healthRoutes = async (fastify) => {
  fastify.get(
    "/health",
    {
      schema: {
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
        response: {
          200: healthDetailsResponseSchema,
        },
      },
    },
    getHealthDetails,
  );
};
