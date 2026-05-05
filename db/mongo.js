import fp from "fastify-plugin";
import mongoose from "mongoose";
import { initStudentRepository } from "../repositories/student.repository.js";
import { createStudentModel } from "./models/student.model.js";

const mongoPlugin = async (fastify) => {
  const { MONGO_URL, MONGO_DB_NAME } = fastify.config;

  if (!MONGO_URL || !MONGO_DB_NAME) {
    fastify.log.error("MongoDB configuration is missing");
    process.exit(1);
  }

  let connection;

  try {
    connection = mongoose.createConnection(MONGO_URL, {
      dbName: MONGO_DB_NAME,
    });

    connection.on("error", (error) => {
      fastify.log.error({ error }, "MongoDB connection error");
      process.exit(1);
    });

    await connection.asPromise();
  } catch (error) {
    fastify.log.error({ error }, "Failed to connect to MongoDB");
    process.exit(1);
  }

  createStudentModel(connection);
  fastify.decorate("db", connection);
  initStudentRepository(connection);

  fastify.addHook("onClose", async (instance) => {
    await instance.db.close();
  });
};

export default fp(mongoPlugin, { name: "mongo" });
