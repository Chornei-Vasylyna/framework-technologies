export const validateEnvVar = (name, value, validator) => {
    if (!validator(value)) {
		console.error(`Invalid or missing environment variable: ${name}`);
		process.exit(1);
	}
}