import path from "node:path";
import { STUDENTS_DATA_DIR } from "#constants/paths.js";
import { studentModel } from "#src/models/student.model.js";
import { atomicWriteJson, ensureDir } from "#utils/fileStorage.js";

const dataDir = STUDENTS_DATA_DIR;

const students = [
  { id: 1, name: "Ivan", grades: [5, 4, 5], course: 2 },
  { id: 2, name: "Olena", grades: [4, 5, 5], course: 1 },
];

const seed = async () => {
  await ensureDir(dataDir);

  await Promise.all(
    students.map(async (student) => {
      const filePath = path.join(dataDir, `${student.id}.json`);
      const record = { ...studentModel, ...student, id: student.id };
      await atomicWriteJson(filePath, record);
    }),
  );
};

seed().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
