import { Transform } from "node:stream";

export class NDJSONTransform extends Transform {
  constructor(options = {}) {
    super({
      ...options,
      objectMode: true,
    });
  }

  _transform(student, _encoding, callback) {
    try {
      const ndjsonLine = JSON.stringify(student) + "\n";
      callback(null, ndjsonLine);
    } catch (error) {
      callback(error);
    }
  }
}
