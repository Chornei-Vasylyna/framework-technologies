import { Readable } from "node:stream";
import { studentModel } from "#src/models/student.model.js";

let repository = null;

const ensureRepository = () => {
  if (!repository) {
    throw new Error("Student repository is not initialized");
  }

  return repository;
};

const parseGrades = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
};

const mapRow = (row) => ({
  ...studentModel,
  ...row,
  id: Number(row.id),
  course: Number(row.course),
  grades: parseGrades(row.grades),
  email: row.email ?? studentModel.email,
  image: row.image ?? studentModel.image,
});

const createStudentRepository = (db) => {
  const findAll = async () => {
    const [rows] = await db.query(
      "SELECT id, name, grades, course, email, image FROM students ORDER BY id",
    );
    return rows.map(mapRow);
  };

  const findById = async (id) => {
    const [rows] = await db.query(
      "SELECT id, name, grades, course, email, image FROM students WHERE id = ?",
      [id],
    );

    if (rows.length === 0) {
      return null;
    }

    return mapRow(rows[0]);
  };

  const create = async (payload) => {
    const student = { ...studentModel, ...payload };
    const [result] = await db.query(
      "INSERT INTO students (name, grades, course, email, image) VALUES (?, ?, ?, ?, ?)",
      [
        student.name,
        JSON.stringify(student.grades ?? []),
        student.course,
        student.email ?? "",
        student.image ?? null,
      ],
    );

    return { ...student, id: Number(result.insertId) };
  };

  const update = async (id, updates) => {
    const existing = await findById(id);

    if (!existing) {
      return null;
    }

    const updated = { ...studentModel, ...existing, ...updates, id };

    await db.query(
      "UPDATE students SET name = ?, grades = ?, course = ?, email = ?, image = ? WHERE id = ?",
      [
        updated.name,
        JSON.stringify(updated.grades ?? []),
        updated.course,
        updated.email ?? "",
        updated.image ?? null,
        id,
      ],
    );

    return updated;
  };

  const remove = async (id) => {
    const [result] = await db.query("DELETE FROM students WHERE id = ?", [id]);
    return result.affectedRows > 0;
  };

  const createReadStream = async () => {
    const [rows] = await db.query(
      "SELECT id, name, grades, course, email, image FROM students ORDER BY id",
    );
    return Readable.from(rows.map(mapRow), { objectMode: true });
  };

  return {
    findAll,
    findById,
    create,
    update,
    remove,
    createReadStream,
  };
};

export const initStudentRepository = (db) => {
  repository = createStudentRepository(db);
  return repository;
};

export const studentRepository = {
  findAll: (...args) => ensureRepository().findAll(...args),
  findById: (...args) => ensureRepository().findById(...args),
  create: (...args) => ensureRepository().create(...args),
  update: (...args) => ensureRepository().update(...args),
  remove: (...args) => ensureRepository().remove(...args),
  createReadStream: (...args) => ensureRepository().createReadStream(...args),
};
