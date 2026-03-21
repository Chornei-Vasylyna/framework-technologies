import { ERROR_MESSAGES } from "#constants/errorMessages.js";
import { STUDENTS } from "#data/students.js";

export const getStudents = (request, reply) => {
  const { course } = request.query;

  if (course !== undefined) {
    const courseNumber = Number(course);
    const results = STUDENTS.filter(
      (student) => student.course === courseNumber,
    );
    return reply.status(200).send(results);
  }

  return reply.status(200).send(STUDENTS);
};

export const addStudent = (request, reply) => {
  const data = request.body;

  const nextId =
    STUDENTS.length > 0
      ? Math.max(...STUDENTS.map((student) => student.id)) + 1
      : 1;

  const { name, grades, course } = data;
  const newStudent = { id: nextId, name, grades, course };
  STUDENTS.push(newStudent);

  return reply.status(201).send({
    message: "New student was created",
    student: newStudent,
  });
};

export const deleteStudent = (request, reply) => {
  const id = Number(request.params?.id);

  const index = STUDENTS.findIndex((student) => student.id === id);

  if (index === -1) {
    return reply.notFound(ERROR_MESSAGES.STUDENT_NOT_FOUND);
  }

  STUDENTS.splice(index, 1);
  return reply.status(200).send({ message: "Deleted" });
};

export const updateStudent = (request, reply) => {
  const id = Number(request.params?.id);

  const index = STUDENTS.findIndex((student) => student.id === id);

  if (index === -1) {
    return reply.notFound(ERROR_MESSAGES.STUDENT_NOT_FOUND);
  }

  const updates = request.body;

  STUDENTS[index] = { ...STUDENTS[index], ...updates };
  return reply
    .status(200)
    .send({ message: "Updated", student: STUDENTS[index] });
};
