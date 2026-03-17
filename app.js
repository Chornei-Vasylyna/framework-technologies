const { createServer } = require("node:http");
const { config } = require("./configs/config");
const { addStudent } = require("./methods/addStudent");
const { deleteStudent } = require("./methods/deleteStudent");
const { getHealth } = require("./methods/getHealth");
const { getStudents } = require("./methods/getStudents");
const { updateStudent } = require("./methods/updateStudent");
const { gracefulShutdown } = require("./utils/gracefulShutdown");
const { logRequest } = require("./utils/logger");

const PORT = config.PORT;
const HOSTNAME = config.HOSTNAME;

const server = createServer((req, res) => {
  const method = req.method;
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  logRequest(req, res);

  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (method === "GET" && pathname === "/students") {
    getStudents(parsedUrl, res);
  } else if (method === "GET" && pathname === "/health") {
    getHealth(res);
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

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error.message);
  gracefulShutdown("uncaughtException");
});
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  gracefulShutdown("unhandledRejection");
});

server.listen(PORT, HOSTNAME, () => {
  console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
});

// Testing errors handling
// hello()
// setTimeout(() => {
// 	Promise.reject("Test unhandled rejection");
// }, 5000);

module.exports = { server };
