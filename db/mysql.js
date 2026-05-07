import fp from "fastify-plugin";
import mysql from "mysql2/promise";

export const getMysqlConfigFromEnv = (env) => ({
  host: env.MYSQL_HOST,
  port: Number(env.MYSQL_PORT ?? 3306),
  user: env.MYSQL_USER,
  password: env.MYSQL_PASSWORD,
  database: env.MYSQL_DB,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
});

export const createMysqlPool = (env) =>
  mysql.createPool(getMysqlConfigFromEnv(env));

const mysqlPlugin = fp(async (fastify) => {
  const pool = createMysqlPool(fastify.config);

  try {
    await pool.query("SELECT 1");
  } catch (error) {
    fastify.log.error({ error }, "MySQL connection failed");
    process.exit(1);
  }

  fastify.decorate("mysql", pool);

  fastify.addHook("onClose", async () => {
    await pool.end();
  });
});

export default mysqlPlugin;
