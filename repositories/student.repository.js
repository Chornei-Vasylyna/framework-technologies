import { promises as fs } from "node:fs";
import path from "node:path";
import { STUDENTS_DATA_DIR } from "#constants/paths.js";
import { studentModel } from "#src/models/student.model.js";
import { atomicWriteJson, ensureDir } from "#utils/fileStorage.js";

const dataDir = STUDENTS_DATA_DIR;

// Utility helpers
const filePathForId = (id) => path.join(dataDir, `${id}.json`);

const readFileJson = async (filePath) => {
  const content = await fs.readFile(filePath, "utf8");
  return JSON.parse(content);
};

const getNextId = async () => {
  const entries = await fs.readdir(dataDir, { withFileTypes: true });
  const ids = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => Number(path.basename(entry.name, ".json")))
    .filter((id) => Number.isFinite(id));

  return (ids.length ? Math.max(...ids) : 0) + 1;
};

// Repository methods
const findAll = async () => {
  await ensureDir(dataDir);
  const entries = await fs.readdir(dataDir, { withFileTypes: true });
  const files = entries.filter(
    (entry) => entry.isFile() && entry.name.endsWith(".json"),
  );

  const items = await Promise.all(
    files.map(async (entry) => {
      const filePath = path.join(dataDir, entry.name);
      return readFileJson(filePath);
    }),
  );

  return items.sort((a, b) => a.id - b.id);
};

const findById = async (id) => {
  await ensureDir(dataDir);
  const filePath = filePathForId(id);

  try {
    return await readFileJson(filePath);
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }

    throw error;
  }
};

const create = async (payload) => {
  await ensureDir(dataDir);
  const id = await getNextId();
  const student = { ...studentModel, ...payload, id };
  const filePath = filePathForId(id);

  await atomicWriteJson(filePath, student);
  return student;
};

const update = async (id, updates) => {
  const existing = await findById(id);

  if (!existing) {
    return null;
  }

  const updated = { ...studentModel, ...existing, ...updates, id };
  const filePath = filePathForId(id);

  await atomicWriteJson(filePath, updated);
  return updated;
};

const remove = async (id) => {
  await ensureDir(dataDir);
  const filePath = filePathForId(id);

  try {
    await fs.rm(filePath);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    }

    throw error;
  }
};

export const studentRepository = {
  findAll,
  findById,
  create,
  update,
  remove,
};
