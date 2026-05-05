import { pipeline } from "node:stream";
import { stringify as stringifyStream } from "csv-stringify";
import { stringify } from "csv-stringify/sync";
import { studentRepository } from "#repositories/student.repository.js";
import { ImageTransform } from "#src/transforms/imageTransform.js";
import { NDJSONTransform } from "#src/transforms/ndjsonTransform.js";
import { StudentTransform } from "#src/transforms/studentTransform.js";
import { buildImageUrl } from "#utils/imageUrl.js";

export const exportStudents = async (request, reply) => {
  const shouldTransform = request.query.transform === "true";

  if (shouldTransform) {
    return streamingExport(request, reply);
  } else {
    return standardExport(request, reply);
  }
};

export const streamStudentsNDJSON = async (request, reply) => {
  const studentStream = await studentRepository.createReadStream();
  const imageTransform = new ImageTransform(request);
  const ndjsonTransform = new NDJSONTransform();

  reply.type("application/x-ndjson");

  pipeline(studentStream, imageTransform, ndjsonTransform, (err) => {
    if (err) console.error("Stream pipeline error:", err);
  });

  return reply.send(ndjsonTransform);
};

const standardExport = async (request, reply) => {
  const students = await studentRepository.findAll();
  const records = students.map((student) => ({
    ...student,
    image: buildImageUrl(request, student.image),
  }));

  const csv = stringify(records, {
    header: true,
    columns: ["id", "name", "email", "image", "course", "grades"],
  });

  reply.header("Content-Type", "text/csv; charset=utf-8");
  reply.header("Content-Disposition", 'attachment; filename="students.csv"');

  return reply.send(csv);
};

const streamingExport = async (request, reply) => {
  const csvStringifier = stringifyStream({
    header: true,
    columns: ["id", "name", "email", "image", "course", "avgGrade"],
  });

  const studentStream = await studentRepository.createReadStream();
  const imageTransform = new ImageTransform(request);
  const studentTransform = new StudentTransform();

  reply.header("Content-Type", "text/csv; charset=utf-8");
  reply.header("Content-Disposition", 'attachment; filename="students.csv"');

  pipeline(
    studentStream,
    imageTransform,
    studentTransform,
    csvStringifier,
    (err) => {
      if (err) console.error("CSV stream pipeline error:", err);
    },
  );

  return reply.send(csvStringifier);
};
