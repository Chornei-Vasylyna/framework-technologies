import { healthRoutes } from "./health.routes.js";
import { studentRoutes } from "./student.routes.js";

export const routes = async (fastify) => {
  await fastify.register(healthRoutes);
  await fastify.register(studentRoutes);
};
