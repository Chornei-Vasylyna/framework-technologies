import fastifyRedis from "@fastify/redis";
import fp from "fastify-plugin";

const redisPlugin = fp(async (fastify) => {
  await fastify.register(fastifyRedis, {
    host: fastify.config.REDIS_HOST,
    port: Number(fastify.config.REDIS_PORT),
    lazyConnect: true,
    connectTimeout: 1000,
    maxRetriesPerRequest: 1,
    retryStrategy: () => null,
  });
});

export default redisPlugin;
