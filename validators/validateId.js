const { ajv } = require("../configs/ajv");
const { idSchema } = require("../schemas/id.schema");

const validateIdFn = ajv.compile(idSchema);

const validateId = (id) => {
  const valid = validateIdFn({ id });

  if (!valid) {
    return validateIdFn.errors.map(
      (e) => `${e.instancePath.substring(1)} ${e.message}`,
    );
  }

  return null;
};

module.exports = { validateId };
