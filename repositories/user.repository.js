import { eq } from "drizzle-orm";
import { users } from "#db/schema.js";

let repository = null;

const ensureRepository = () => {
  if (!repository) {
    throw new Error("User repository is not initialized");
  }

  return repository;
};

const mapRowPublic = (row) => ({
  id: Number(row.id),
  email: row.email,
});

const createUserRepository = (db) => {
  const findByEmail = async (email) => {
    const rows = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (rows.length === 0) {
      return null;
    }

    return mapRowPublic(rows[0]);
  };

  const findByEmailWithPassword = async (email) => {
    const rows = await db
      .select({ id: users.id, email: users.email, password: users.password })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (rows.length === 0) {
      return null;
    }

    return {
      id: Number(rows[0].id),
      email: rows[0].email,
      password: rows[0].password,
    };
  };

  const findById = async (id) => {
    const rows = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (rows.length === 0) {
      return null;
    }

    return mapRowPublic(rows[0]);
  };

  const create = async ({ email, passwordHash }) => {
    const [result] = await db
      .insert(users)
      .values({ email, password: passwordHash })
      .$returningId();

    return { id: Number(result.id), email };
  };

  return {
    findByEmail,
    findByEmailWithPassword,
    findById,
    create,
  };
};

export const initUserRepository = (db) => {
  repository = createUserRepository(db);
  return repository;
};

export const userRepository = {
  findByEmail: (...args) => ensureRepository().findByEmail(...args),
  findByEmailWithPassword: (...args) =>
    ensureRepository().findByEmailWithPassword(...args),
  findById: (...args) => ensureRepository().findById(...args),
  create: (...args) => ensureRepository().create(...args),
};
