import { drizzle } from "drizzle-orm/mysql2";
import fp from "fastify-plugin";
import * as schema from "#db/schema.js";

const drizzlePlugin = fp(async (fastify) => {
  if (!fastify.mysql) {
    throw new Error("MySQL pool is not registered");
  }

  const db = drizzle(fastify.mysql, { schema, mode: "default" });

  fastify.decorate("drizzle", db);
});

export default drizzlePlugin;
