// Константи для details-логіки студентів
import path from "node:path";

export const EXTERNAL_COURSES_URL = "http://localhost:3001/courses";
export const FETCH_TIMEOUT_MS = 5000;
export const RETRY_DELAYS_MS = [1000, 2000, 4000];
export const CACHE_TTL_MS = 120_000;
export const CACHE_FILE_PATH = path.resolve(
  process.cwd(),
  "data",
  "cache",
  "reference.json",
);
export const NULL_COURSE_DETAILS = { id: null, name: null, credits: null };
