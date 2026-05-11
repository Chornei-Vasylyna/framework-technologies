import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../app.js";
import { buildTestApp, closeTestApp } from "../helpers/testApp.js";

describe("health endpoints", () => {
  let app;

  beforeAll(async () => {
    app = await buildTestApp(buildApp);
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  it("GET /api/v1/health returns ok", async () => {
    const res = await app.inject({ method: "GET", url: "/api/v1/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: "ok" });
  });

  it("GET /api/v1/health/details requires api key", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/health/details",
    });
    expect(res.statusCode).toBe(401);
  });

  it("GET /api/v1/health/details returns details with api key", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/health/details",
      headers: { "x-api-key": process.env.ADMIN_API_KEY },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty("pid");
    expect(body).toHaveProperty("nodeVersion");
  });
});
