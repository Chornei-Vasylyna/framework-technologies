import { describe, expect, it } from "vitest";
import { getLoggerOptions } from "#utils/getLoggerOptions.js";

describe("getLoggerOptions", () => {
  it("returns pretty logger for development", () => {
    const options = getLoggerOptions("development");
    expect(options.level).toBe("info");
    expect(options.transport?.target).toBe("pino-pretty");
  });

  it("returns error logger for production", () => {
    const options = getLoggerOptions("production");
    expect(options.level).toBe("error");
    expect(options.transport).toBeUndefined();
  });
});
