import { createServer } from "http";
import { getStudents } from "./methods/getStudents.js";
import { addStudent } from "./methods/addStudent.js";
import { updateStudent } from "./methods/updateStudent.js";
import { deleteStudent } from "./methods/deleteStudent.js";

const PORT = process.env.PORT || 8000;
const HOSTNAME = process.env.HOSTNAME || "localhost";

const server = createServer((req, res) => {
  const method = req.method;
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (method === "GET" && pathname === "/students") {
    getStudents(parsedUrl, res);
  } else if (method === "POST" && pathname === "/students") {
    addStudent(req, res);
  } else if (method === "PATCH" && pathname.startsWith("/students/")) {
    updateStudent(req, res, pathname);
  } else if (method === "DELETE" && pathname.startsWith("/students/")) {
    deleteStudent(res, pathname);
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: "Route not found" }));
  }
});

server.listen(PORT, HOSTNAME, () => {
  console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
});
