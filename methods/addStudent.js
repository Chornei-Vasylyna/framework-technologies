import { STUDENTS } from "#data/students.js";
import { validateInsert } from "#validators/validateStudent.js";

export const addStudent = (req, res) => {
	let body = "";

	req.on("data", (chunk) => {
		body += chunk.toString();
	});

	req.on("end", () => {
		try {
			const data = JSON.parse(body);
			const validationMessage = validateInsert(data);

			if (validationMessage) {
				res.statusCode = 400;
				return res.end(JSON.stringify(validationMessage));
			}

			const nextId =
				STUDENTS.length > 0
					? Math.max(...STUDENTS.map((student) => student.id)) + 1
					: 1;

			const { name, grades, course } = data;
			const newStudent = { id: nextId, name, grades, course };
			STUDENTS.push(newStudent);

			res.statusCode = 201;
			res.end(
				JSON.stringify({
					message: "New student was created",
					student: newStudent,
				}),
			);
		} catch {
			res.statusCode = 400;
			res.end(JSON.stringify({ error: "Invalid JSON" }));
		}
	});
};
