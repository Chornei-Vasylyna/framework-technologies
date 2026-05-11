export const buildTestApp = async (buildApp) => {
  const app = await buildApp();
  await app.ready();
  return app;
};

export const resetDatabase = async (app) => {
  if (!app?.mysql) return;
  await app.mysql.query("DELETE FROM students");
  await app.mysql.query("DELETE FROM users");
  await app.mysql.query("ALTER TABLE students AUTO_INCREMENT = 1");
  await app.mysql.query("ALTER TABLE users AUTO_INCREMENT = 1");
};

export const resetRedis = async (app) => {
  if (!app?.redis) return;
  const keys = await app.redis.smembers("students:v2:keys");
  if (keys.length > 0) {
    await app.redis.del(...keys);
  }
  await app.redis.del("students:v2:keys");
};

export const closeTestApp = async (app) => {
  if (!app) return;
  await app.close();
};

export const initializeTestDatabase = async (app) => {
  if (!app?.mysql) return;

  try {
    const [[result]] = await app.mysql.query(
      "SELECT COUNT(*) as count FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?",
      [process.env.MYSQL_DB, "students"],
    );

    if (!result?.count) {
      await app.mysql.query(
        `CREATE TABLE students (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(255) NOT NULL,
          grades JSON NOT NULL,
          course INT NOT NULL,
          email VARCHAR(255) NOT NULL DEFAULT '',
          image VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
      );

      await app.mysql.query(
        `CREATE TABLE users (
          id INT PRIMARY KEY AUTO_INCREMENT,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL
        )`,
      );
    }
  } catch (error) {
    console.error("Database initialization error:", error.message);
  }
};

export const extractCookie = (response) => {
  const setCookie = response.headers["set-cookie"];
  if (!setCookie) return "";
  if (Array.isArray(setCookie)) return setCookie[0].split(";")[0];
  return setCookie.split(";")[0];
};
