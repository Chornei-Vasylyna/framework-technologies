import { parse } from "csv-parse/sync";
import { studentRepository } from "#repositories/student.repository.js";
import { insertStudentSchema } from "#schemas/student.schema.js";

// Formatting
const formatValidationErrors = (errors) =>
  errors.map((error) => {
    if (error.keyword === "required" && error.params?.missingProperty) {
      return `${error.params.missingProperty} is required`;
    }

    const path = error.instancePath?.replace(/^\//, "");
    return `${path || "record"} ${error.message || "is invalid"}`.trim();
  });

// Parsing
const transformCSVRow = (row) => {
  let grades;
  let parseError;

  if (row.grades !== undefined && row.grades !== "") {
    try {
      grades = JSON.parse(row.grades);
    } catch {
      grades = undefined;
      parseError = "grades is not valid JSON";
    }
  }

  return {
    name: row.name,
    email: row.email,
    course: row.course ? Number(row.course) : undefined,
    grades,
    image: row.image ? row.image : undefined,
    __parseError: parseError,
  };
};

const parseCSVContent = (content) => {
  const parsed = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
  return parsed.map(transformCSVRow);
};

const parseJSONContent = (content) => {
  let records = JSON.parse(content);
  if (!Array.isArray(records)) {
    records = [records];
  }
  return records;
};

const parseFileContent = (filename, content) => {
  if (filename.endsWith(".csv")) {
    return parseCSVContent(content);
  }

  if (filename.endsWith(".json")) {
    return parseJSONContent(content);
  }

  return null;
};

// Validation
const createValidateRecord = (validateStudent) => (record) => {
  if (record.__parseError) {
    return { isValid: false, errors: [record.__parseError] };
  }

  const isValid = validateStudent(record);

  if (isValid) {
    return { isValid: true, errors: [] };
  }

  return {
    isValid: false,
    errors: formatValidationErrors(validateStudent.errors || []),
  };
};

// Processing
const processRecords = async (records, validateRecord) => {
  const imported = [];
  const rejected = [];

  for (let i = 0; i < records.length; i += 1) {
    const record = records[i];
    const valid = validateRecord(record);

    if (valid.isValid) {
      try {
        const { __parseError, ...safeRecord } = record;
        const student = await studentRepository.create(safeRecord);
        imported.push(student);
      } catch (error) {
        rejected.push({
          rowNumber: i + 1,
          reason: `Save error: ${error.message}`,
        });
      }
    } else {
      rejected.push({
        rowNumber: i + 1,
        reason: valid.errors.join("; "),
      });
    }
  }

  return { imported, rejected };
};

// Controller
export const importStudents = async (request, reply) => {
  const data = await request.file();

  if (!data) {
    return reply.badRequest("File not provided");
  }

  const filename = data.filename;
  const chunks = [];
  for await (const chunk of data.file) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);
  const content = buffer.toString("utf-8");

  let records;

  try {
    records = parseFileContent(filename, content);

    if (records === null) {
      return reply.badRequest("Only CSV and JSON formats supported");
    }
  } catch (error) {
    const errorType = filename.endsWith(".csv") ? "CSV" : "JSON";
    return reply.badRequest(`${errorType} parsing error: ${error.message}`);
  }

  const validatorCompiler = request.server.validatorCompiler;

  if (!validatorCompiler) {
    return reply.internalServerError("Schema validator not configured");
  }

  const validateStudent = validatorCompiler({
    schema: insertStudentSchema,
    method: request.method,
    url: request.routerPath ?? request.url,
    httpPart: "body",
  });
  const validateRecord = createValidateRecord(validateStudent);

  const { imported, rejected } = await processRecords(records, validateRecord);

  if (imported.length === 0) {
    return reply.status(422).send({
      imported,
      rejected,
    });
  }

  return reply.status(200).send({
    imported,
    rejected,
  });
};
