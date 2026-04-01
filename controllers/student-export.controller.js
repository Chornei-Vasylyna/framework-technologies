import { stringify } from "csv-stringify/sync";
import { studentRepository } from "#repositories/student.repository.js";
import { buildImageUrl } from "#utils/imageUrl.js";

export const exportStudents = async (request, reply) => {
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
