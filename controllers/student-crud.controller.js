import { ERROR_MESSAGES } from "#constants/errorMessages.js";
import { NULL_COURSE_DETAILS } from "#constants/studentDetails.js";
import { studentRepository } from "#repositories/student.repository.js";
import {
  getCoursesReferenceData,
  withImageUrl,
} from "#utils/studentDetails.js";

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

export const getStudentsPaginated = async (request, reply) => {
  const page = Number(request.query?.page) || 1;
  const limit = Number(request.query?.limit) || 10;

  const students = await studentRepository.findAll();
  const total = students.length;
  const totalPages = Math.ceil(total / limit) || 0;

  const start = (page - 1) * limit;
  const end = start + limit;

  const data = students
    .slice(start, end)
    .map((student) => withImageUrl(request, student));
  return reply.status(200).send({
    data,
    total,
    page,
    limit,
    totalPages,
  });
};

export const getStudentDetails = async (request, reply) => {
  const id = Number(request.params?.id);
  const student = await studentRepository.findById(id);

  if (!student) {
    return reply.notFound(ERROR_MESSAGES.STUDENT_NOT_FOUND);
  }

  const baseStudent = withImageUrl(request, student);
  try {
    const courses = await getCoursesReferenceData();
    const course = courses.find(
      (item) => Number(item?.id) === Number(student.course),
    );
    if (!course) {
      return reply.status(200).send({
        ...baseStudent,
        courseDetails: NULL_COURSE_DETAILS,
      });
    }
    return reply.status(200).send({
      ...baseStudent,
      courseDetails: {
        id: course.id ?? null,
        name: course.name ?? null,
        credits: course.credits ?? null,
      },
    });
  } catch {
    return reply.status(200).send({
      ...baseStudent,
      courseDetails: NULL_COURSE_DETAILS,
    });
  }
};
