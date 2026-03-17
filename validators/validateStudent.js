const { ajv } = require("../configs/ajv");
const {
  insertStudentSchema,
  updateStudentSchema,
} = require("../schemas/student.schema");

const validateInsertFn = ajv.compile(insertStudentSchema);
const validateUpdateFn = ajv.compile(updateStudentSchema);

const formatErrors = (errors) =>
  errors.map((e) => `${e.instancePath.substring(1)} ${e.message}`);

const validateInsert = (student) => {
  const valid = validateInsertFn(student);
  if (!valid) return formatErrors(validateInsertFn.errors);
  return null;
};

const validateUpdate = (student) => {
  const valid = validateUpdateFn(student);
  if (!valid) return formatErrors(validateUpdateFn.errors);
  return null;
};

module.exports = { validateInsert, validateUpdate };
