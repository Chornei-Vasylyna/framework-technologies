import { getStudentsPaginated } from "#controllers/student-crud.controller.js";
import {
  paginationQuerySchema,
  studentsListPaginatedSchema,
} from "#schemas/student.schema.js";

export const studentRoutesV2 = async (fastify) => {
  fastify.get(
    "/students",
    {
      schema: {
        tags: ["Students"],
        summary: "List students (paginated)",
        querystring: paginationQuerySchema,
        response: {
          200: studentsListPaginatedSchema,
        },
      },
    },
    getStudentsPaginated,
  );
};
