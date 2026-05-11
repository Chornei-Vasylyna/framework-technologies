import { describe, expect, it } from "vitest";
import { buildImageUrl } from "#utils/imageUrl.js";

const makeRequest = ({ protocol = "http", host = "example.com" } = {}) => ({
  protocol,
  host,
  headers: { host },
});

describe("buildImageUrl", () => {
  it("returns null when no image path", () => {
    const result = buildImageUrl(makeRequest(), null);
    expect(result).toBeNull();
  });

  it("returns absolute url for relative image", () => {
    const result = buildImageUrl(makeRequest(), "1/image.jpg");
    expect(result).toBe("http://example.com/uploads/1/image.jpg");
  });

  it("returns absolute url as-is", () => {
    const result = buildImageUrl(makeRequest(), "https://cdn.test/img.png");
    expect(result).toBe("https://cdn.test/img.png");
  });

  it("returns raw path when host missing", () => {
    const result = buildImageUrl({ protocol: "http" }, "/uploads/1/img.png");
    expect(result).toBe("/uploads/1/img.png");
  });
});
