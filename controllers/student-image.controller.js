import fs, { promises as fsPromises } from "node:fs";
import path from "node:path";
import { ERROR_MESSAGES } from "#constants/errorMessages.js";
import { UPLOADS_DIR } from "#constants/paths.js";
import { studentRepository } from "#repositories/student.repository.js";
import { ensureDir } from "#utils/fileStorage.js";
import { buildImageUrl } from "#utils/imageUrl.js";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
};

const writeStreamToFile = async (stream, filePath, maxBytes) => {
  await ensureDir(path.dirname(filePath));

  const writeStream = fs.createWriteStream(filePath);
  let totalBytes = 0;
  let tooLarge = false;

  try {
    for await (const chunk of stream) {
      totalBytes += chunk.length;

      if (totalBytes > maxBytes) {
        tooLarge = true;
        stream.destroy();
        break;
      }

      if (!writeStream.write(chunk)) {
        await new Promise((resolve) => writeStream.once("drain", resolve));
      }
    }

    await new Promise((resolve, reject) => {
      writeStream.end((error) => (error ? reject(error) : resolve()));
    });

    if (tooLarge) {
      await fsPromises.rm(filePath, { force: true });
      return { ok: false, error: "File size exceeds 5MB" };
    }

    return { ok: true };
  } catch (error) {
    writeStream.destroy();
    await fsPromises.rm(filePath, { force: true });
    throw error;
  }
};

export const uploadStudentImage = async (request, reply) => {
  const id = Number(request.params?.id);
  const data = await request.file();

  if (!data) {
    return reply.badRequest("File not provided");
  }

  const extension = ALLOWED_MIME_TYPES[data.mimetype];

  if (!extension) {
    data.file.resume();
    return reply.badRequest("Only image/jpeg and image/png are allowed");
  }

  const existing = await studentRepository.findById(id);

  if (!existing) {
    data.file.resume();
    return reply.notFound(ERROR_MESSAGES.STUDENT_NOT_FOUND);
  }

  const filename = `image${extension}`;
  const uploadDir = path.join(UPLOADS_DIR, String(id));
  const filePath = path.join(uploadDir, filename);
  const writeResult = await writeStreamToFile(
    data.file,
    filePath,
    MAX_IMAGE_SIZE,
  );

  if (!writeResult.ok) {
    return reply.badRequest(writeResult.error);
  }

  const relativePath = `/${id}/${filename}`;
  const updated = await studentRepository.update(id, { image: relativePath });

  if (!updated) {
    await fsPromises.rm(filePath, { force: true });
    return reply.notFound(ERROR_MESSAGES.STUDENT_NOT_FOUND);
  }

  return reply.status(200).send({
    student: {
      ...updated,
      image: buildImageUrl(request, updated.image),
    },
  });
};
