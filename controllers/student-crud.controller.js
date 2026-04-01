import { ERROR_MESSAGES } from "#constants/errorMessages.js";
import { studentRepository } from "#repositories/student.repository.js";
import { buildImageUrl } from "#utils/imageUrl.js";

const withImageUrl = (request, student) => ({
  ...student,
  image: buildImageUrl(request, student.image),
});

export const getStudents = async (request, reply) => {
  const { course } = request.query;
  const students = await studentRepository.findAll();

  if (course !== undefined) {
    const courseNumber = Number(course);
    const results = students.filter(
      (student) => student.course === courseNumber,
    );
    return reply
      .status(200)
      .send(results.map((student) => withImageUrl(request, student)));
  }

  return reply
    .status(200)
    .send(students.map((student) => withImageUrl(request, student)));
};

export const addStudent = async (request, reply) => {
  const data = request.body;
  const newStudent = await studentRepository.create(data);

  return reply.status(201).send({
    message: "New student was created",
    student: withImageUrl(request, newStudent),
  });
};

export const deleteStudent = async (request, reply) => {
  const id = Number(request.params?.id);
  const removed = await studentRepository.remove(id);

  if (!removed) {
    return reply.notFound(ERROR_MESSAGES.STUDENT_NOT_FOUND);
  }

  return reply.status(200).send({ message: "Deleted" });
};

export const updateStudent = async (request, reply) => {
  const id = Number(request.params?.id);
  const updates = request.body;
  const updated = await studentRepository.update(id, updates);

  if (!updated) {
    return reply.notFound(ERROR_MESSAGES.STUDENT_NOT_FOUND);
  }

  return reply
    .status(200)
    .send({ message: "Updated", student: withImageUrl(request, updated) });
};
