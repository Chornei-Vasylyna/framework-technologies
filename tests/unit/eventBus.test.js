import { describe, expect, it } from "vitest";
import { eventBus } from "#utils/eventBus.js";

describe("eventBus", () => {
  it("emits and listens", () => {
    return new Promise((resolve) => {
      eventBus.once("test.event", (payload) => {
        expect(payload).toEqual({ ok: true });
        resolve();
      });

      eventBus.emit("test.event", { ok: true });
    });
  });
});
