import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../app.js";
import { buildTestApp, closeTestApp } from "../helpers/testApp.js";

describe("websocket endpoint", () => {
  let app;

  beforeAll(async () => {
    app = await buildTestApp(buildApp);
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  it("responds to websocket route without crashing", async () => {
    const res = await app.inject({ method: "GET", url: "/ws" });
    expect([400, 404, 426]).toContain(res.statusCode);
  });
});
