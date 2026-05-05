import { createStudentModel } from "#db/models/student.model.js";

const toDto = (doc) => {
  if (!doc) {
    return null;
  }

  const { _id, ...rest } = doc;
  return { id: _id, ...rest };
};

export const createStudentRepository = (db) => {
  const Student = createStudentModel(db);

  const getNextId = async () => {
    const last = await Student.findOne()
      .sort({ _id: -1 })
      .select({ _id: 1 })
      .lean();

    return last ? last._id + 1 : 1;
  };

  const findAll = async () => {
    const items = await Student.find().sort({ _id: 1 }).lean();
    return items.map(toDto);
  };

  const findById = async (id) => {
    const doc = await Student.findById(id).lean();
    return toDto(doc);
  };

  const create = async (payload) => {
    const id = await getNextId();
    const student = { ...payload, _id: id };
    const created = await Student.create(student);
    return toDto(created.toObject());
  };

  const update = async (id, updates) => {
    const existing = await Student.findById(id).lean();

    if (!existing) {
      return null;
    }

    const updated = {
      ...existing,
      ...updates,
      _id: id,
    };

    await Student.replaceOne({ _id: id }, updated);
    return toDto(updated);
  };

  const remove = async (id) => {
    const result = await Student.deleteOne({ _id: id });
    return result.deletedCount > 0;
  };

  const createReadStream = async () =>
    Student.find().sort({ _id: 1 }).lean().cursor({
      transform: toDto,
    });

  return {
    findAll,
    findById,
    create,
    update,
    remove,
    createReadStream,
  };
};

let repositoryInstance = null;

export const initStudentRepository = (db) => {
  repositoryInstance = createStudentRepository(db);
};

export const studentRepository = new Proxy(
  {},
  {
    get(_target, prop) {
      if (!repositoryInstance) {
        throw new Error("studentRepository is not initialized");
      }

      return repositoryInstance[prop];
    },
  },
);
