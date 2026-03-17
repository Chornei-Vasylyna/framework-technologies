export const insertStudentSchema = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 2 },
    grades: {
      type: "array",
      items: { type: "number", minimum: 1, maximum: 5 },
    },
    course: { type: "integer", minimum: 1, maximum: 6 },
  },
  required: ["name", "grades", "course"],
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
    course: { type: "integer", minimum: 1, maximum: 6 },
  },
  additionalProperties: false,
};
