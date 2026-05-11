import { Readable } from "node:stream";
import { describe, expect, it } from "vitest";
import { ImageTransform } from "#src/transforms/imageTransform.js";
import { NDJSONTransform } from "#src/transforms/ndjsonTransform.js";
import { StudentTransform } from "#src/transforms/studentTransform.js";

const collectStream = async (stream) => {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return chunks;
};

describe("transforms", () => {
  it("ImageTransform adds image url", async () => {
    const request = { protocol: "http", host: "example.com" };
    const input = Readable.from([{ id: 1, image: "/1/img.png" }], {
      objectMode: true,
    });

    const output = input.pipe(new ImageTransform(request));
    const [result] = await collectStream(output);

    expect(result.image).toBe("http://example.com/uploads/1/img.png");
  });

  it("NDJSONTransform outputs json lines", async () => {
    const input = Readable.from([{ id: 1 }], { objectMode: true });
    const output = input.pipe(new NDJSONTransform());
    const [line] = await collectStream(output);

    expect(String(line)).toBe('{"id":1}\n');
  });

  it("StudentTransform computes avgGrade", async () => {
    const input = Readable.from([{ id: 1, grades: [3, 5] }], {
      objectMode: true,
    });

    const output = input.pipe(new StudentTransform());
    const [result] = await collectStream(output);

    expect(result.avgGrade).toBe("4.00");
    expect(result.grades).toBeUndefined();
  });
});
