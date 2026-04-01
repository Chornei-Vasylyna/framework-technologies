import {
  addStudent,
  deleteStudent,
  getStudents,
  updateStudent,
} from "#controllers/student-crud.controller.js";
import { exportStudents } from "#controllers/student-export.controller.js";
import { uploadStudentImage } from "#controllers/student-image.controller.js";
import { importStudents } from "#controllers/student-import.controller.js";
import { idSchema } from "#schemas/id.schema.js";
import {
  addStudentResponseSchema,
  deleteStudentResponseSchema,
  insertStudentSchema,
  studentsListSchema,
  studentsQuerySchema,
  updateStudentImageResponseSchema,
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

  fastify.get("/students/export", exportStudents);

  fastify.post("/students/import", importStudents);

  fastify.post(
    "/students/:id/image",
    {
      schema: {
        params: idSchema,
        response: {
          200: updateStudentImageResponseSchema,
        },
      },
    },
    uploadStudentImage,
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
