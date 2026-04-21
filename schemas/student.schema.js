export const insertStudentSchema = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 2 },
    grades: {
      type: "array",
      items: { type: "number", minimum: 1, maximum: 5 },
    },
    course: { type: "integer", minimum: 1, maximum: 6 },
    email: { type: "string", format: "email" },
    image: { type: "string", format: "uri" },
  },
  required: ["name", "grades", "course"],
  additionalProperties: false,
};

export const studentSchema = {
  type: "object",
  properties: {
    id: { type: "integer", minimum: 1 },
    name: { type: "string", minLength: 2 },
    grades: {
      type: "array",
      items: { type: "number", minimum: 1, maximum: 5 },
    },
    course: { type: "integer", minimum: 1, maximum: 6 },
    email: { type: "string", format: "email" },
    image: { type: "string", format: "uri" },
  },
  required: ["id", "name", "grades", "course"],
  additionalProperties: false,
};

export const studentsListSchema = {
  type: "array",
  items: studentSchema,
};

export const studentsQuerySchema = {
  type: "object",
  properties: {
    course: { type: "integer", minimum: 1, maximum: 6 },
  },
  additionalProperties: false,
};

export const updateStudentSchema = {
  type: "object",
  properties: {
    id: { not: {} },
    name: { type: "string", minLength: 2 },
    grades: {
      type: "array",
      items: { type: "number", minimum: 1, maximum: 5 },
    },
    email: { type: "string", format: "email" },
    course: { type: "integer", minimum: 1, maximum: 6 },
  },
  additionalProperties: false,
};

export const addStudentResponseSchema = {
  type: "object",
  properties: {
    message: { type: "string" },
    student: studentSchema,
  },
  required: ["message", "student"],
  additionalProperties: false,
};

export const updateStudentResponseSchema = {
  type: "object",
  properties: {
    message: { type: "string" },
    student: studentSchema,
  },
  required: ["message", "student"],
  additionalProperties: false,
};

export const deleteStudentResponseSchema = {
  type: "object",
  properties: {
    message: { type: "string" },
  },
  required: ["message"],
  additionalProperties: false,
};

export const updateStudentImageResponseSchema = {
  type: "object",
  properties: {
    student: studentSchema,
  },
  required: ["student"],
  additionalProperties: false,
};

export const errorSchema = {
  type: "object",
  properties: {
    statusCode: { type: "integer" },
    error: { type: "string" },
    message: { type: "string" },
  },
  required: ["statusCode", "error", "message"],
  additionalProperties: false,
};

export const notFoundSchema = errorSchema;

export const badRequestSchema = errorSchema;

export const exportResponseSchema = {
  type: "string",
  description: "CSV file content with headers",
};

export const importResponseSchema = {
  type: "object",
  properties: {
    imported: {
      type: "array",
      items: studentSchema,
    },
    rejected: {
      type: "array",
      items: {
        type: "object",
        properties: {
          rowNumber: { type: "integer" },
          reason: { type: "string" },
        },
        required: ["rowNumber", "reason"],
      },
    },
  },
  required: ["imported", "rejected"],
  additionalProperties: false,
};

export const unprocessableEntitySchema = {
  type: "object",
  properties: {
    imported: {
      type: "array",
      items: studentSchema,
    },
    rejected: {
      type: "array",
      items: {
        type: "object",
        properties: {
          rowNumber: { type: "integer" },
          reason: { type: "string" },
        },
        required: ["rowNumber", "reason"],
      },
    },
  },
  required: ["imported", "rejected"],
  additionalProperties: false,
};

export const paginationQuerySchema = {
  type: "object",
  properties: {
    page: { type: "integer", minimum: 1, default: 1 },
    limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
  },
  additionalProperties: false,
};

export const studentsListPaginatedSchema = {
  type: "object",
  properties: {
    data: {
      type: "array",
      items: studentSchema,
    },
    total: { type: "integer", minimum: 0 },
    page: { type: "integer", minimum: 1 },
    limit: { type: "integer", minimum: 1 },
    totalPages: { type: "integer", minimum: 0 },
  },
  required: ["data", "total", "page", "limit", "totalPages"],
  additionalProperties: false,
};

export const studentDetailsResponseSchema = {
  type: "object",
  properties: {
    id: { type: "integer", minimum: 1 },
    name: { type: "string", minLength: 2 },
    grades: {
      type: "array",
      items: { type: "number", minimum: 1, maximum: 5 },
    },
    course: { type: "integer", minimum: 1, maximum: 6 },
    email: { type: "string", format: "email" },
    image: {
      anyOf: [{ type: "string", format: "uri" }, { type: "null" }],
    },
    courseDetails: {
      type: "object",
      properties: {
        id: { anyOf: [{ type: "integer" }, { type: "null" }] },
        name: { anyOf: [{ type: "string" }, { type: "null" }] },
        credits: { anyOf: [{ type: "integer" }, { type: "null" }] },
      },
      required: ["id", "name", "credits"],
      additionalProperties: false,
    },
  },
  required: [
    "id",
    "name",
    "grades",
    "course",
    "email",
    "image",
    "courseDetails",
  ],
  additionalProperties: false,
};
