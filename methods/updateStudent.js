const { STUDENTS } = require("../data/students");
const { getIdByPath } = require("../utils/getIdByPath");
const { validateId } = require("../validators/validateId");
const { validateUpdate } = require("../validators/validateStudent");

const updateStudent = (req, res, pathname) => {
  const id = getIdByPath(pathname);
  const validationMessage = validateId(id);

  if (validationMessage) {
    res.statusCode = 400;
    return res.end(JSON.stringify(validationMessage));
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
      } catch {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: "Not Found" }));
    }
  });
};

module.exports = { updateStudent };
