import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../../app.js";
import {
  buildTestApp,
  closeTestApp,
  extractCookie,
  initializeTestDatabase,
  resetDatabase,
  resetRedis,
} from "../helpers/testApp.js";

describe("auth endpoints", () => {
  let app;

  beforeAll(async () => {
    app = await buildTestApp(buildApp);
    await initializeTestDatabase(app);
  });

  beforeEach(async () => {
    await resetDatabase(app);
    await resetRedis(app);
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  it("registers a user", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({
        email: "test@example.com",
        password: "secret123",
      }),
    });

    expect(res.statusCode).toBe(201);
    expect(res.json().user.email).toBe("test@example.com");
  });

  it("rejects duplicate register", async () => {
    await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({
        email: "test@example.com",
        password: "secret123",
      }),
    });

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({
        email: "test@example.com",
        password: "secret123",
      }),
    });

    expect(res.statusCode).toBe(409);
  });

  it("logs in and sets session cookie", async () => {
    await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({
        email: "login@example.com",
        password: "secret123",
      }),
    });

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({
        email: "login@example.com",
        password: "secret123",
      }),
    });

    expect(res.statusCode).toBe(200);
    const cookie = extractCookie(res);
    expect(cookie).toContain("sid=");
  });

  it("rejects invalid credentials", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({
        email: "missing@example.com",
        password: "secret123",
      }),
    });

    expect(res.statusCode).toBe(401);
  });

  it("logs out", async () => {
    await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({
        email: "logout@example.com",
        password: "secret123",
      }),
    });

    const loginRes = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({
        email: "logout@example.com",
        password: "secret123",
      }),
    });

    const cookie = extractCookie(loginRes);

    const res = await app.inject({
      method: "POST",
      url: "/api/v1/auth/logout",
      headers: { cookie },
    });

    expect(res.statusCode).toBe(204);
  });
});
