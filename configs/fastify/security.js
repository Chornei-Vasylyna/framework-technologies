import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { API_METHODS, CORS_ALLOWED_HEADERS } from "#constants/index.js";

export const registerSecurityPlugins = async (fastify) => {
  fastify.register(helmet, { global: true });

  fastify.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
    errorResponseBuilder: () => ({
      statusCode: 429,
      error: "Too Many Requests",
      message: "Rate limit exceeded. Maximum 100 requests per minute allowed.",
    }),
  });

  fastify.register(cors, {
    origin: (origin, cb) => {
      if (fastify.config.NODE_ENV === "development") {
        return cb(null, "*");
      }

      const allowedOrigin = fastify.config.CORS_ORIGIN;

      if (!allowedOrigin) {
        return cb(null, false);
      }

      if (!origin) {
        return cb(null, true);
      }

      return cb(null, origin === allowedOrigin ? allowedOrigin : false);
    },
    methods: API_METHODS,
    allowedHeaders: CORS_ALLOWED_HEADERS,
  });
};
