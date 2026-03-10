import { STUDENTS } from "../students.js";
import { validateUpdate } from "../utils/validateStudent.js";

export const updateStudent = (req, res, pathname) => {
  const id = parseInt(pathname.split("/")[2]);

  if (isNaN(id) || id <= 0) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: "Invalid id" }));
  }

  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    const index = STUDENTS.findIndex((student) => student.id === id);

    if (index !== -1) {
      try {
        const updates = JSON.parse(body);

        const validationMessage = validateUpdate(updates);

        if (validationMessage) {
          res.statusCode = 400;
          return res.end(JSON.stringify(validationMessage));
        }

        STUDENTS[index] = { ...STUDENTS[index], ...updates };
        res.statusCode = 200;
        res.end(
          JSON.stringify({ message: "Updated", student: STUDENTS[index] }),
        );
      } catch (error) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: "Not Found" }));
    }
  });
};
