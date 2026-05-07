import { REDIS_KEYS, REDIS_TTL_SECONDS } from "#constants/redis.js";

export const createStudentsCache = ({ redis }) => {
  const getCacheKey = (page, limit) =>
    REDIS_KEYS.studentsCacheKey({ page, limit });

  const getCachedStudents = async ({ page, limit }) => {
    if (!redis) {
      return null;
    }

    const key = getCacheKey(page, limit);
    const cached = await redis.get(key);

    if (!cached) {
      return null;
    }

    try {
      return JSON.parse(cached);
    } catch {
      await redis.del(key);
      return null;
    }
  };

  const setCachedStudents = async ({ page, limit, payload }) => {
    if (!redis) {
      return;
    }

    const key = getCacheKey(page, limit);
    await redis.set(
      key,
      JSON.stringify(payload),
      "EX",
      REDIS_TTL_SECONDS.studentsCache,
    );
    await redis.sadd(REDIS_KEYS.studentsCacheIndex, key);
    await redis.expire(
      REDIS_KEYS.studentsCacheIndex,
      REDIS_TTL_SECONDS.studentsCache,
    );
  };

  const invalidateStudentsCache = async () => {
    if (!redis) {
      return;
    }

    const keys = await redis.smembers(REDIS_KEYS.studentsCacheIndex);

    if (keys.length > 0) {
      await redis.del(...keys);
    }

    await redis.del(REDIS_KEYS.studentsCacheIndex);
  };

  return {
    getCachedStudents,
    setCachedStudents,
    invalidateStudentsCache,
  };
};
