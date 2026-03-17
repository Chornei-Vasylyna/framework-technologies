const { STUDENTS } = require("../data/students");
const { getIdByPath } = require("../utils/getIdByPath");
const { validateId } = require("../validators/validateId");

const deleteStudent = (res, pathname) => {
  const id = getIdByPath(pathname);
  const validationMessage = validateId(id);

  if (validationMessage) {
    res.statusCode = 400;
    return res.end(JSON.stringify(validationMessage));
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

module.exports = { deleteStudent };
