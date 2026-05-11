import { describe, expect, it, vi } from "vitest";
import { registerSecurityPlugins } from "#configs/fastify/security.js";

const resolveOrigin = async ({ config, origin }) => {
  const fastify = {
    config,
    redis: {},
    register: vi.fn(),
  };

  await registerSecurityPlugins(fastify);

  const corsOptions = fastify.register.mock.calls[2][1];

  return new Promise((resolve) => {
    corsOptions.origin(origin, (_error, value) => {
      resolve(value);
    });
  });
};

describe("registerSecurityPlugins", () => {
  it("allows all origins in development", async () => {
    await expect(
      resolveOrigin({
        config: { NODE_ENV: "development", CORS_ORIGIN: "https://example.com" },
        origin: "https://other.example.com",
      }),
    ).resolves.toBe("*");
  });

  it("blocks cors when no allowed origin is configured", async () => {
    await expect(
      resolveOrigin({
        config: { NODE_ENV: "production", CORS_ORIGIN: undefined },
        origin: "https://example.com",
      }),
    ).resolves.toBe(false);
  });

  it("allows requests without an origin header", async () => {
    await expect(
      resolveOrigin({
        config: { NODE_ENV: "production", CORS_ORIGIN: "https://example.com" },
        origin: undefined,
      }),
    ).resolves.toBe(true);
  });

  it("only allows the configured origin", async () => {
    await expect(
      resolveOrigin({
        config: { NODE_ENV: "production", CORS_ORIGIN: "https://example.com" },
        origin: "https://example.com",
      }),
    ).resolves.toBe("https://example.com");

    await expect(
      resolveOrigin({
        config: { NODE_ENV: "production", CORS_ORIGIN: "https://example.com" },
        origin: "https://other.example.com",
      }),
    ).resolves.toBe(false);
  });
});
