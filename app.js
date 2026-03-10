import { createServer } from "http";
import { config } from "./config.js";
import { addStudent } from "./methods/addStudent.js";
import { deleteStudent } from "./methods/deleteStudent.js";
import { getHealth } from "./methods/getHealth.js";
import { getStudents } from "./methods/getStudents.js";
import { updateStudent } from "./methods/updateStudent.js";
import { gracefulShutdown } from "./utils/gracefulShutdown.js";
import { logRequest } from "./utils/logger.js";

const PORT = config.PORT;
const HOSTNAME = config.HOSTNAME;

export const server = createServer((req, res) => {
	const method = req.method;
	const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
	const pathname = parsedUrl.pathname;

	logRequest(req, res);

	res.setHeader("Content-Type", "application/json; charset=utf-8");

	if (method === "GET") {
		if (pathname === "/students") getStudents(parsedUrl, res);
		if (pathname === "/health") getHealth(res);
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
