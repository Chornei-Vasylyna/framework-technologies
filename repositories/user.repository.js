import { eq } from "drizzle-orm";
import { users } from "#db/schema.js";

let repository = null;

const ensureRepository = () => {
  if (!repository) {
    throw new Error("User repository is not initialized");
  }

  return repository;
};

const mapRow = (row) => ({
  id: Number(row.id),
  email: row.email,
  password: row.password,
});

const createUserRepository = (db) => {
  const baseSelect = () =>
    db
      .select({
        id: users.id,
        email: users.email,
        password: users.password,
      })
      .from(users);

  const findByEmail = async (email) => {
    const rows = await baseSelect().where(eq(users.email, email)).limit(1);

    if (rows.length === 0) {
      return null;
    }

    return mapRow(rows[0]);
  };

  const create = async ({ email, password }) => {
    const [result] = await db
      .insert(users)
      .values({ email, password })
      .$returningId();

    return { id: Number(result.id), email };
  };

  return {
    findByEmail,
    create,
  };
};

export const initUserRepository = (db) => {
  repository = createUserRepository(db);
  return repository;
};

export const userRepository = {
  findByEmail: (...args) => ensureRepository().findByEmail(...args),
  create: (...args) => ensureRepository().create(...args),
};
