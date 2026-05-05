import fs from "node:fs/promises";

export const ensureDir = async (dirPath) => {
  await fs.mkdir(dirPath, { recursive: true });
};
