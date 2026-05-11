import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "#src/services/auth.service.js";

describe("auth.service", () => {
  it("hashes and verifies password", async () => {
    const password = "secret123";
    const hash = await hashPassword(password);

    expect(hash).toBeTypeOf("string");
    expect(hash).not.toBe(password);

    const valid = await verifyPassword(hash, password);
    expect(valid).toBe(true);
  });

  it("returns false for wrong password", async () => {
    const hash = await hashPassword("right-password");
    const valid = await verifyPassword(hash, "wrong-password");
    expect(valid).toBe(false);
  });
});
