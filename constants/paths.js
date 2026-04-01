import path from "node:path";

export const STUDENTS_DATA_DIR = path.resolve(
  process.cwd(),
  "data",
  "students",
);

export const BACKUPS_DIR = path.resolve(process.cwd(), "data", "backups");

export const VERSION_FILE = path.resolve(process.cwd(), "data", "version.json");

export const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");
export const UPLOADS_PUBLIC_PATH = "/uploads";
