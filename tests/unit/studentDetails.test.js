import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as studentDetails from "#utils/studentDetails.js";

const makeRedis = () => {
  const store = new Map();
  return {
    get: vi.fn(async (key) => store.get(key) ?? null),
    set: vi.fn(async (key, value) => {
      store.set(key, value);
      return "OK";
    }),
    del: vi.fn(async (key) => {
      store.delete(key);
      return 1;
    }),
  };
};

describe("studentDetails utilities", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("withImageUrl maps image", () => {
    const request = { protocol: "http", host: "localhost" };
    const student = { id: 1, image: "/1/img.png" };
    const result = studentDetails.withImageUrl(request, student);
    expect(result.image).toBe("http://localhost/uploads/1/img.png");
  });

  it("fetchWithTimeout returns json on success", async () => {
    const json = vi.fn(async () => [{ id: 1 }]);
    fetch.mockResolvedValue({ ok: true, json });

    const data = await studentDetails.fetchWithTimeout("http://example.com");
    expect(data).toEqual([{ id: 1 }]);
  });

  it("fetchCoursesWithRetry retries and succeeds", async () => {
    const json = vi.fn(async () => [{ id: 1 }]);
    fetch
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({ ok: true, json });

    const data = await studentDetails.fetchCoursesWithRetry();
    expect(data).toEqual([{ id: 1 }]);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("getCoursesReferenceData uses cache", async () => {
    const redis = makeRedis();
    const cached = [{ id: 7, name: "A" }];
    await redis.set("courses:reference", JSON.stringify(cached));

    const data = await studentDetails.getCoursesReferenceData({ redis });
    expect(data).toEqual(cached);
    expect(redis.get).toHaveBeenCalled();
  });

  it("getCoursesReferenceData fetches and caches when empty", async () => {
    const redis = makeRedis();
    const json = vi.fn(async () => [{ id: 2 }]);
    fetch.mockResolvedValue({ ok: true, json });

    const data = await studentDetails.getCoursesReferenceData({ redis });
    expect(data).toEqual([{ id: 2 }]);
    expect(redis.set).toHaveBeenCalled();
  });
});
