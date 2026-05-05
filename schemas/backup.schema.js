export const backupTimestampParamSchema = {
  type: "object",
  properties: {
    timestamp: {
      type: "string",
      pattern: "^\\d{4}-\\d{2}-\\d{2}T\\d{2}-\\d{2}-\\d{2}-\\d{3}Z$",
      description: "Backup file timestamp in format YYYY-MM-DDTHH-mm-ss-SSSZ",
    },
  },
  required: ["timestamp"],
};

export const backupStreamResponseSchema = {
  description: "Backup file stream (gzip format)",
  type: "string",
};

export const backupsListSchema = {
  type: "object",
  properties: {
    count: {
      type: "integer",
      description: "Total number of backups",
    },
    backups: {
      type: "array",
      items: {
        type: "object",
        properties: {
          timestamp: {
            type: "string",
            description: "Backup timestamp",
          },
          filename: {
            type: "string",
            description: "Backup filename",
          },
        },
      },
    },
  },
};

export const badRequestBackupSchema = {
  type: "object",
  properties: {
    statusCode: { type: "number", const: 400 },
    error: { type: "string", const: "Bad Request" },
    message: { type: "string" },
  },
};

export const notFoundBackupSchema = {
  type: "object",
  properties: {
    statusCode: { type: "number", const: 404 },
    error: { type: "string", const: "Not Found" },
    message: { type: "string" },
  },
};

export const unauthorizedBackupSchema = {
  type: "object",
  properties: {
    statusCode: { type: "number", const: 401 },
    error: { type: "string", const: "Unauthorized" },
    message: { type: "string" },
  },
};

export const internalServerErrorBackupSchema = {
  type: "object",
  properties: {
    statusCode: { type: "number", const: 500 },
    error: { type: "string", const: "Internal Server Error" },
    message: { type: "string" },
  },
};
