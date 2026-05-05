import fastifyEnv from "@fastify/env";
import Fastify from "fastify";
import mongoose from "mongoose";
import { ENV_OPTIONS } from "#constants/index.js";
import { studentModel } from "#src/models/student.model.js";
import { createStudentModel } from "../../db/models/student.model.js";

const loadEnv = async () => {
  const configLoader = Fastify({ logger: false });
  await configLoader.register(fastifyEnv, ENV_OPTIONS);
  await configLoader.ready();
  const config = {
    MONGO_URL: configLoader.config.MONGO_URL,
    MONGO_DB_NAME: configLoader.config.MONGO_DB_NAME,
  };
  await configLoader.close();
  return config;
};

const students = [
  { id: 1, name: "Ivan", grades: [5, 4, 5], course: 2 },
  { id: 2, name: "Olena", grades: [4, 5, 5], course: 1 },
];

const seed = async ({ force, mongoUrl, mongoDbName }) => {
  if (!mongoUrl || !mongoDbName) {
    throw new Error("MONGO_URL and MONGO_DB_NAME must be set");
  }

  const connection = mongoose.createConnection(mongoUrl, {
    dbName: mongoDbName,
  });

  await connection.asPromise();

  try {
    const Student = createStudentModel(connection);
    const count = await Student.countDocuments();

    if (count > 0 && !force) {
      console.log("Database is not empty. Seed skipped.");
      return;
    }

    if (force) {
      await Student.deleteMany({});
    }

    const records = students.map((student) => ({
      ...studentModel,
      ...student,
      _id: student.id,
    }));

    await Student.insertMany(records);
    console.log(`Successfully seeded ${records.length} students.`);
  } finally {
    await connection.close();
  }
};

const force = process.argv.includes("--force");

loadEnv()
  .then((config) =>
    seed({
      force,
      mongoUrl: config.MONGO_URL,
      mongoDbName: config.MONGO_DB_NAME,
    }),
  )
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
