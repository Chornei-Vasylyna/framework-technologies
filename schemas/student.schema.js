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
