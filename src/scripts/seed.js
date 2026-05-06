import { loadEnvConfig } from "#configs/fastify/env.js";
import { createMysqlPool } from "#db/mysql.js";
import { studentModel } from "#src/models/student.model.js";

const students = [
  { id: 1, name: "Ivan", grades: [5, 4, 5], course: 2 },
  { id: 2, name: "Olena", grades: [4, 5, 5], course: 1 },
];

const seed = async () => {
  const force = process.argv.includes("--force");
  const env = await loadEnvConfig();
  const pool = createMysqlPool(env);

  try {
    const [countRows] = await pool.query(
      "SELECT COUNT(*) AS total FROM students",
    );
    const total = Number(countRows[0]?.total ?? 0);

    if (!force && total > 0) {
      console.log("Database is not empty. Seed skipped.");
      return;
    }

    if (force) {
      await pool.query("TRUNCATE TABLE students");
    }

    const values = students.map((student) => {
      const record = { ...studentModel, ...student };
      return [
        record.name,
        JSON.stringify(record.grades ?? []),
        record.course,
        record.email ?? "",
        record.image ?? null,
      ];
    });

    if (values.length > 0) {
      await pool.query(
        "INSERT INTO students (name, grades, course, email, image) VALUES ?",
        [values],
      );
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
