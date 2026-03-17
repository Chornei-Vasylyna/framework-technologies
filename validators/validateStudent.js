import { ajv } from "#configs/ajv.js";
import {
	insertStudentSchema,
	updateStudentSchema,
} from "#schemas/student.schema.js";

const validateInsertFn = ajv.compile(insertStudentSchema);
const validateUpdateFn = ajv.compile(updateStudentSchema);

const formatErrors = (errors) =>
	errors.map((e) => `${e.instancePath.substring(1)} ${e.message}`);

export const validateInsert = (student) => {
	const valid = validateInsertFn(student);
	if (!valid) return formatErrors(validateInsertFn.errors);
	return null;
};

export const validateUpdate = (student) => {
	const valid = validateUpdateFn(student);
	if (!valid) return formatErrors(validateUpdateFn.errors);
	return null;
};
