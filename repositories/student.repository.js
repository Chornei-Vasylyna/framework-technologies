import { Readable } from "node:stream";
import { asc, eq } from "drizzle-orm";
import { students } from "#db/schema.js";
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
  const baseSelect = () =>
    db
      .select({
        id: students.id,
        name: students.name,
        grades: students.grades,
        course: students.course,
        email: students.email,
        image: students.image,
      })
      .from(students);

  const findAll = async () => {
    const rows = await baseSelect().orderBy(asc(students.id));
    return rows.map(mapRow);
  };

  const findById = async (id) => {
    const rows = await baseSelect().where(eq(students.id, id)).limit(1);

    if (rows.length === 0) {
      return null;
    }

    return mapRow(rows[0]);
  };

  const create = async (payload) => {
    const student = { ...studentModel, ...payload };
    const [result] = await db
      .insert(students)
      .values({
        name: student.name,
        grades: student.grades ?? [],
        course: student.course,
        email: student.email ?? "",
        image: student.image ?? null,
      })
      .$returningId();

    return { ...student, id: Number(result.id) };
  };

  const update = async (id, updates) => {
    const existing = await findById(id);

    if (!existing) {
      return null;
    }

    const updated = { ...studentModel, ...existing, ...updates, id };

    await db
      .update(students)
      .set({
        name: updated.name,
        grades: updated.grades ?? [],
        course: updated.course,
        email: updated.email ?? "",
        image: updated.image ?? null,
      })
      .where(eq(students.id, id));

    return updated;
  };

  const remove = async (id) => {
    const result = await db.delete(students).where(eq(students.id, id));
    return result.affectedRows > 0;
  };

  const createReadStream = async () => {
    const rows = await baseSelect().orderBy(asc(students.id));
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
