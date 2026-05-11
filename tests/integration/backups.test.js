import fs from "node:fs/promises";
import path from "node:path";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { BACKUPS_DIR } from "#constants/paths.js";
import { buildApp } from "../../app.js";
import { buildTestApp, closeTestApp } from "../helpers/testApp.js";

describe("backup endpoints", () => {
  let app;
  const timestamp = "2024-01-01T00-00-00-000Z";

  beforeAll(async () => {
    app = await buildTestApp(buildApp);
  });

  beforeEach(async () => {
    await fs.mkdir(BACKUPS_DIR, { recursive: true });
    await fs.writeFile(path.join(BACKUPS_DIR, `${timestamp}.gz`), "test");
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  it("requires api key for list", async () => {
    const res = await app.inject({ method: "GET", url: "/api/v1/backups" });
    expect(res.statusCode).toBe(401);
  });

  it("lists backups", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/backups",
      headers: { "x-api-key": process.env.ADMIN_API_KEY },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().count).toBeGreaterThan(0);
  });

  it("streams backup file", async () => {
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/backups/${timestamp}`,
      headers: { "x-api-key": process.env.ADMIN_API_KEY },
    });

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toContain("application/gzip");
  });

  it("rejects invalid timestamp", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/backups/invalid",
      headers: { "x-api-key": process.env.ADMIN_API_KEY },
    });

    expect(res.statusCode).toBe(400);
  });

  it("returns 404 for missing backup", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/backups/2023-01-01T00-00-00-000Z",
      headers: { "x-api-key": process.env.ADMIN_API_KEY },
    });

    expect(res.statusCode).toBe(404);
  });
});
