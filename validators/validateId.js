import { ajv } from "#configs/ajv.js";
import { idSchema } from "#schemas/id.schema.js";

const validateIdFn = ajv.compile(idSchema);

export const validateId = (id) => {
	const valid = validateIdFn({ id });

	if (!valid) {
		return validateIdFn.errors.map(
			(e) => `${e.instancePath.substring(1)} ${e.message}`,
		);
	}

	return null;
};
