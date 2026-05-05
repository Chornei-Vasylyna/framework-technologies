import { Transform } from "node:stream";
import { buildImageUrl } from "#utils/imageUrl.js";

export class ImageTransform extends Transform {
  constructor(request, options = {}) {
    super({
      ...options,
      objectMode: true,
    });
    this.request = request;
  }

  _transform(student, _encoding, callback) {
    try {
      const transformed = {
        ...student,
        image: buildImageUrl(this.request, student.image),
      };
      callback(null, transformed);
    } catch (error) {
      callback(error);
    }
  }
}
