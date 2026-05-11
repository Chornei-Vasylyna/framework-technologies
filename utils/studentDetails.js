import { REDIS_KEYS, REDIS_TTL_SECONDS } from "#constants/redis.js";
import {
  EXTERNAL_COURSES_URL,
  FETCH_TIMEOUT_MS,
  RETRY_DELAYS_MS,
} from "#constants/studentDetails.js";
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

const readCache = async (redis) => {
  if (!redis) {
    return null;
  }

  const cached = await redis.get(REDIS_KEYS.coursesReference);

  if (!cached) {
    return null;
  }

  try {
    const parsed = JSON.parse(cached);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    await redis.del(REDIS_KEYS.coursesReference);
    return null;
  }
};

const writeCache = async (redis, courses) => {
  if (!redis) {
    return;
  }

  await redis.set(
    REDIS_KEYS.coursesReference,
    JSON.stringify(courses),
    "EX",
    REDIS_TTL_SECONDS.coursesReference,
  );
};

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

export async function getCoursesReferenceData({ redis } = {}) {
  const cached = await readCache(redis);
  if (cached) return cached;
  const courses = await fetchCoursesWithRetry();
  await writeCache(redis, courses);
  return courses;
}
