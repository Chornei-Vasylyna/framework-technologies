// Утиліти для details-логіки студентів
import { promises as fs } from "node:fs";
import path from "node:path";
import {
  CACHE_FILE_PATH,
  CACHE_TTL_MS,
  EXTERNAL_COURSES_URL,
  FETCH_TIMEOUT_MS,
  RETRY_DELAYS_MS,
} from "#constants/studentDetails.js";
import { ensureDir } from "#utils/fileStorage.js";
import { buildImageUrl } from "#utils/imageUrl.js";

export function withImageUrl(request, student) {
  return {
    ...student,
    image: buildImageUrl(request, student.image),
  };
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function readCache() {
  try {
    const content = await fs.readFile(CACHE_FILE_PATH, "utf8");
    const parsed = JSON.parse(content);
    if (
      !Array.isArray(parsed?.courses) ||
      typeof parsed?.cachedAt !== "number"
    ) {
      return null;
    }
    const isTtlActive = Date.now() - parsed.cachedAt < CACHE_TTL_MS;
    if (!isTtlActive) {
      return null;
    }
    return parsed.courses;
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

export async function writeCache(courses) {
  const cacheDir = path.dirname(CACHE_FILE_PATH);
  await ensureDir(cacheDir);
  await fs.writeFile(
    CACHE_FILE_PATH,
    JSON.stringify({ cachedAt: Date.now(), courses }, null, 2),
    "utf8",
  );
}

export async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`External service failed with status ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchCoursesWithRetry() {
  let lastError;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      return await fetchWithTimeout(EXTERNAL_COURSES_URL);
    } catch (error) {
      lastError = error;
      if (attempt < RETRY_DELAYS_MS.length) {
        await sleep(RETRY_DELAYS_MS[attempt]);
      }
    }
  }
  throw lastError;
}

export async function getCoursesReferenceData() {
  const cached = await readCache();
  if (cached) return cached;
  const courses = await fetchCoursesWithRetry();
  await writeCache(courses);
  return courses;
}
