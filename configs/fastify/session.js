import cookie from "@fastify/cookie";
import session from "@fastify/session";
import fp from "fastify-plugin";
import RedisStore from "fastify-session-redis-store";

const SESSION_TTL_SECONDS = 60 * 60 * 24;

const sessionPlugin = fp(async (fastify) => {
  await fastify.register(cookie);

  await fastify.register(session, {
    secret: fastify.config.SESSION_SECRET,
    cookieName: "sid",
    saveUninitialized: false,
    cookie: {
      maxAge: SESSION_TTL_SECONDS * 1000,
      httpOnly: true,
      sameSite: "lax",
      secure: fastify.config.NODE_ENV === "production",
    },
    store: new RedisStore({
      client: fastify.redis,
      ttl: SESSION_TTL_SECONDS,
    }),
  });
});

export default sessionPlugin;
