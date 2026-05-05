import { Transform } from "node:stream";

export class StudentTransform extends Transform {
  constructor(options = {}) {
    super({
      ...options,
      objectMode: true,
    });
  }

  _transform(student, _encoding, callback) {
    try {
      const transformed = {
        ...student,
        avgGrade:
          Array.isArray(student.grades) && student.grades.length > 0
            ? (
                student.grades.reduce((sum, grade) => sum + grade, 0) /
                student.grades.length
              ).toFixed(2)
            : 0,
      };

      delete transformed.grades;

      this.push(transformed);
      callback();
    } catch (error) {
      callback(error);
    }
  }
}
