import { describe, expect, it, vi } from "vitest";
import { gracefulShutdown } from "#utils/gracefulShutdown.js";

describe("gracefulShutdown", () => {
  it("closes fastify and exits 0", async () => {
    const fastify = {
      log: { info: vi.fn() },
      close: vi.fn().mockResolvedValue(),
    };
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {});

    await gracefulShutdown(fastify, "SIGTERM");

    expect(fastify.close).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(0);
    exitSpy.mockRestore();
  });

  it("exits 1 on error", async () => {
    const fastify = {
      log: { info: vi.fn() },
      close: vi.fn().mockRejectedValue(new Error("fail")),
    };
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {});

    await gracefulShutdown(fastify, "SIGTERM");

    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });
});
