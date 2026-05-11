import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import fp from "fastify-plugin";
import { AUTH } from "#constants/auth.js";

const authPlugin = fp(async (fastify) => {
  await fastify.register(cookie, {
    hook: "onRequest",
  });

  await fastify.register(jwt, {
    secret: fastify.config.JWT_SECRET,
    trusted: async (_request, decodedToken) => {
      const jti = decodedToken?.jti;

      if (!jti) {
        return true;
      }

      const key = `${AUTH.redis.blacklistPrefix}${jti}`;
      const blacklisted = await fastify.redis.exists(key);

      return blacklisted === 0;
    },
    sign: {
      expiresIn: AUTH.accessTokenTtlSeconds,
    },
  });
});

export default authPlugin;
