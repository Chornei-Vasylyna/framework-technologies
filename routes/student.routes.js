import {
  addStudent,
  deleteStudent,
  getStudentDetails,
  getStudents,
  updateStudent,
} from "#controllers/student-crud.controller.js";
import {
  exportStudents,
  streamStudentsNDJSON,
} from "#controllers/student-export.controller.js";
import { uploadStudentImage } from "#controllers/student-image.controller.js";
import { importStudents } from "#controllers/student-import.controller.js";
import { idSchema } from "#schemas/id.schema.js";
import {
  addStudentResponseSchema,
  badRequestSchema,
  deleteStudentResponseSchema,
  exportResponseSchema,
  exportStudentsQuerySchema,
  importResponseSchema,
  insertStudentSchema,
  notFoundSchema,
  studentDetailsResponseSchema,
  studentsListSchema,
  studentsQuerySchema,
  unprocessableEntitySchema,
  updateStudentImageResponseSchema,
  updateStudentResponseSchema,
  updateStudentSchema,
} from "#schemas/student.schema.js";

export const studentRoutes = async (fastify) => {
  fastify.get(
    "/students",
    {
      schema: {
        tags: ["Students"],
        summary: "List students",
        querystring: studentsQuerySchema,
        response: {
          200: studentsListSchema,
        },
      },
    },
    getStudents,
  );

  fastify.get(
    "/students/:id/details",
    {
      schema: {
        tags: ["Students"],
        summary: "Get student details",
        params: idSchema,
        response: {
          200: studentDetailsResponseSchema,
          404: notFoundSchema,
        },
      },
    },
    getStudentDetails,
  );

  fastify.get(
    "/students/export",
    {
      schema: {
        tags: ["Students"],
        summary: "Export students (CSV)",
        description:
          "Export students as CSV. Use ?transform=true to transform grades array to avgGrade",
        querystring: exportStudentsQuerySchema,
        response: {
          200: exportResponseSchema,
        },
      },
    },
    exportStudents,
  );

  fastify.get(
    "/students/stream",
    {
      schema: {
        tags: ["Students"],
        summary: "Stream students (NDJSON)",
        description:
          "Stream students as NDJSON (JSON Lines) format. Records are sent immediately as they are read without loading all data into memory.",
        response: {
          200: {
            description: "Stream of students in NDJSON format",
            type: "string",
          },
        },
      },
    },
    streamStudentsNDJSON,
  );

  fastify.post(
    "/students/import",
    {
      onRequest: async (request) => request.jwtVerify(),
      schema: {
        tags: ["Students"],
        summary: "Import students (CSV)",
        security: [{ BearerAuth: [] }],
        response: {
          200: importResponseSchema,
          400: badRequestSchema,
          422: unprocessableEntitySchema,
        },
      },
    },
    importStudents,
  );

  fastify.post(
    "/students/:id/image",
    {
      onRequest: async (request) => request.jwtVerify(),
      schema: {
        tags: ["Students"],
        summary: "Upload student image",
        security: [{ BearerAuth: [] }],
        params: idSchema,
        response: {
          200: updateStudentImageResponseSchema,
          400: badRequestSchema,
          404: notFoundSchema,
        },
      },
    },
    uploadStudentImage,
  );

  fastify.post(
    "/students",
    {
      onRequest: async (request) => request.jwtVerify(),
      schema: {
        tags: ["Students"],
        summary: "Create student",
        security: [{ BearerAuth: [] }],
        body: insertStudentSchema,
        response: {
          201: addStudentResponseSchema,
          400: badRequestSchema,
        },
      },
    },
    addStudent,
  );

  fastify.patch(
    "/students/:id",
    {
      onRequest: async (request) => request.jwtVerify(),
      schema: {
        tags: ["Students"],
        summary: "Update student",
        security: [{ BearerAuth: [] }],
        params: idSchema,
        body: updateStudentSchema,
        response: {
          200: updateStudentResponseSchema,
          400: badRequestSchema,
          404: notFoundSchema,
        },
      },
    },
    updateStudent,
  );

  fastify.delete(
    "/students/:id",
    {
      onRequest: async (request) => request.jwtVerify(),
      schema: {
        tags: ["Students"],
        summary: "Delete student",
        security: [{ BearerAuth: [] }],
        params: idSchema,
        response: {
          200: deleteStudentResponseSchema,
          404: notFoundSchema,
        },
      },
    },
    deleteStudent,
  );
};
