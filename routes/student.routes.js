import {
  addStudent,
  deleteStudent,
  getStudents,
  updateStudent,
} from "#controllers/student.controller.js";
import { idSchema } from "#schemas/id.schema.js";
import {
  addStudentResponseSchema,
  deleteStudentResponseSchema,
  insertStudentSchema,
  studentsListSchema,
  studentsQuerySchema,
  updateStudentResponseSchema,
  updateStudentSchema,
} from "#schemas/student.schema.js";

export const studentRoutes = async (fastify) => {
  fastify.get(
    "/students",
    {
      schema: {
        querystring: studentsQuerySchema,
        response: {
          200: studentsListSchema,
        },
      },
    },
    getStudents,
  );

  fastify.post(
    "/students",
    {
      schema: {
        body: insertStudentSchema,
        response: {
          201: addStudentResponseSchema,
        },
      },
    },
    addStudent,
  );

  fastify.patch(
    "/students/:id",
    {
      schema: {
        params: idSchema,
        body: updateStudentSchema,
        response: {
          200: updateStudentResponseSchema,
        },
      },
    },
    updateStudent,
  );

  fastify.delete(
    "/students/:id",
    {
      schema: {
        params: idSchema,
        response: {
          200: deleteStudentResponseSchema,
        },
      },
    },
    deleteStudent,
  );
};
