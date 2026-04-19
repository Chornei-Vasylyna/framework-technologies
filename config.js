import { validateEnvVar } from "./utils/validateEnvVariable.js";

const HOSTNAME = process.env.HOSTNAME;
const PORT = process.env.PORT;
const NODE_ENV = process.env.NODE_ENV;

validateEnvVar("HOSTNAME", HOSTNAME, v => typeof v === "string" && v.length > 0);
validateEnvVar("PORT", PORT, v => /^\d+$/.test(v) && Number(v) > 0);
validateEnvVar("NODE_ENV", NODE_ENV, v => ["development", "production"].includes(v));

export const config = {
	HOSTNAME,
	PORT: Number(PORT),
	NODE_ENV,
};