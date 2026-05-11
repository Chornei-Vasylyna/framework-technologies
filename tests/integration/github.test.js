import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { buildTestApp, closeTestApp } from "../helpers/testApp.js";

vi.mock("#utils/github-analytics.util.js", () => ({
  buildSimilarity: vi.fn(() => [
    {
      rank: 1,
      fullName: "org/repo",
      url: "https://github.com/org/repo",
      language: "JS",
      sharedContributors: 2,
    },
  ]),
  getRepoContributors: vi.fn(async () => ["a", "b"]),
  getUserRepos: vi.fn(async (login) => [
    {
      fullName: "org/repo",
      url: "https://github.com/org/repo",
      language: "JS",
      contributor: login,
    },
  ]),
  getUserReposGraphQLBatch: vi.fn(async () => [
    [
      {
        fullName: "org/repo",
        url: "https://github.com/org/repo",
        language: "JS",
        contributor: "a",
      },
    ],
  ]),
}));

import { buildApp } from "../../app.js";

describe("github endpoints", () => {
  let app;

  beforeAll(async () => {
    app = await buildTestApp(buildApp);
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  it("returns v1 shared repos", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/github/shared-repos?repo=org/source",
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().version).toBe("v1");
  });

  it("returns v2 shared repos", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v2/github/shared-repos?repo=org/source",
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().version).toBe("v2");
  });

  it("rejects missing repo", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/github/shared-repos",
    });

    expect(res.statusCode).toBe(400);
  });
});
