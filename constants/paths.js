import path from "node:path";

export const BACKUPS_DIR = path.resolve(process.cwd(), "data", "backups");

export const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");
export const UPLOADS_PUBLIC_PATH = "/uploads";
