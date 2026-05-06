import { count, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { loadEnvConfig } from "#configs/fastify/env.js";
import { createMysqlPool } from "#db/mysql.js";
import { students } from "#db/schema.js";
import { studentModel } from "#src/models/student.model.js";

const SEED_DATA = [
  { id: 1, name: "Ivan", grades: [5, 4, 5], course: 2 },
  { id: 2, name: "Olena", grades: [4, 5, 5], course: 1 },
];

const seed = async () => {
  const force = process.argv.includes("--force");
  const env = await loadEnvConfig();
  const pool = createMysqlPool(env);
  const db = drizzle(pool);

  try {
    const countRows = await db.select({ total: count() }).from(students);
    const total = Number(countRows[0]?.total ?? 0);

    if (!force && total > 0) {
      console.log("Database is not empty. Seed skipped.");
      return;
    }

    if (force) {
      await db.execute(sql`TRUNCATE TABLE students`);
    }

    const payload = SEED_DATA.map((student) => {
      const record = { ...studentModel, ...student };
      return {
        name: record.name,
        grades: record.grades ?? [],
        course: record.course,
        email: record.email ?? "",
        image: record.image ?? null,
      };
    });

    if (payload.length > 0) {
      await db.insert(students).values(payload);
    }

    console.log("Seed complete.");
  } finally {
    await pool.end();
  }
};

seed().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
