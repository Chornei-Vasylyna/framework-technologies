import { STUDENTS } from "../students.js";

export const deleteStudent = (res, pathname) => {
  const id = parseInt(pathname.split("/")[2]);
  if (isNaN(id) || id <= 0) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: "Invalid id" }));
  }

  const index = STUDENTS.findIndex((student) => student.id === id);

  if (index !== -1) {
    STUDENTS.splice(index, 1);
    res.statusCode = 200;
    res.end(JSON.stringify({ message: "Deleted" }));
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: "Not found" }));
  }
};
