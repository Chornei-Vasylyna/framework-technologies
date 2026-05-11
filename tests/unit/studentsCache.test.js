import { describe, expect, it, vi } from "vitest";
import { createStudentsCache } from "#utils/studentsCache.js";

const makeRedis = () => {
  const store = new Map();
  const sets = new Map();
  return {
    get: vi.fn(async (key) => store.get(key) ?? null),
    set: vi.fn(async (key, value) => {
      store.set(key, value);
      return "OK";
    }),
    sadd: vi.fn(async (key, value) => {
      const set = sets.get(key) ?? new Set();
      set.add(value);
      sets.set(key, set);
      return 1;
    }),
    smembers: vi.fn(async (key) => Array.from(sets.get(key) ?? [])),
    expire: vi.fn(async () => 1),
    del: vi.fn(async (...keys) => {
      for (const key of keys) store.delete(key);
      sets.delete(keys[0]);
      return 1;
    }),
  };
};

describe("studentsCache", () => {
  it("stores and reads cache", async () => {
    const redis = makeRedis();
    const cache = createStudentsCache({ redis });

    const payload = { data: [{ id: 1 }] };
    await cache.setCachedStudents({ page: 1, limit: 10, payload });
    const result = await cache.getCachedStudents({ page: 1, limit: 10 });

    expect(result).toEqual(payload);
  });

  it("returns null without redis", async () => {
    const cache = createStudentsCache({ redis: null });
    const result = await cache.getCachedStudents({ page: 1, limit: 10 });
    expect(result).toBeNull();
  });

  it("invalidates cache keys", async () => {
    const redis = makeRedis();
    const cache = createStudentsCache({ redis });

    await cache.setCachedStudents({
      page: 1,
      limit: 10,
      payload: { data: [] },
    });
    await cache.invalidateStudentsCache();

    const result = await cache.getCachedStudents({ page: 1, limit: 10 });
    expect(result).toBeNull();
  });
});
