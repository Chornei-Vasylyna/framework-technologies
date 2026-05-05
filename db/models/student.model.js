import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    _id: { type: Number, required: true },
    name: { type: String, required: true },
    grades: { type: [Number], required: true, default: [] },
    course: { type: Number, required: true },
    email: { type: String, default: "" },
    image: { type: String, default: null },
  },
  {
    versionKey: false,
  },
);

export const createStudentModel = (connection) => {
  if (connection.models.Student) {
    return connection.models.Student;
  }

  return connection.model("Student", studentSchema);
};
