import { isPlainObject, error } from "./index.js";

const validateStudent = (student, mode) => {
  if (!isPlainObject(student)) {
    return error("Student must be an object");
  }

  if (!Object.keys(student).length) {
    return error("Student object cannot be empty");
  }

  if (mode === "update" && "id" in student) {
    return error("Id cannot be modified");
  }

  const { name, grades, course } = student;

  // name
  if (
    (mode === "insert" || "name" in student) &&
    (typeof name !== "string" || !name.trim())
  ) {
    return error("Name must be non-empty string");
  }

  // grades
  if (mode === "insert" || "grades" in student) {
    if (!Array.isArray(grades)) {
      return error("Grades must be an array");
    }

    if (
      !grades.every(
        (grade) => typeof grade === "number" && grade >= 1 && grade <= 5,
      )
    ) {
      return error("Grades must contain only numbers between 1 and 5");
    }
  }

  // course
  if (
    (mode === "insert" || "course" in student) &&
    (!Number.isInteger(course) || course <= 0)
  ) {
    return error("Course must be a whole number greater than 0");
  }

  return null;
};

export const validateInsert = (student) => validateStudent(student, "insert");

export const validateUpdate = (student) => validateStudent(student, "update");
