import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildSimilarity,
  headers,
  safeFetch,
} from "#utils/github-analytics.util.js";

describe("github-analytics.util", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("builds headers with token", () => {
    const result = headers("token");
    expect(result.Authorization).toBe("Bearer token");
  });

  it("buildSimilarity returns top ranked", () => {
    const repoLists = [
      [
        { fullName: "a/b", url: "u1", language: "JS", contributor: "x" },
        { fullName: "a/c", url: "u2", language: "TS", contributor: "x" },
      ],
      [{ fullName: "a/b", url: "u1", language: "JS", contributor: "y" }],
    ];

    const result = buildSimilarity("source/repo", repoLists);
    expect(result[0].fullName).toBe("a/b");
    expect(result[0].sharedContributors).toBe(2);
  });

  it("safeFetch returns null on failure", async () => {
    fetch.mockRejectedValue(new Error("fail"));
    const result = await safeFetch("http://example.com");
    expect(result).toBeNull();
  });
});
