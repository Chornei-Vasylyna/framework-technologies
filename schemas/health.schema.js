export const healthResponseSchema = {
  type: "object",
  properties: {
    status: { type: "string", const: "ok" },
  },
  required: ["status"],
  additionalProperties: false,
};

export const healthDetailsResponseSchema = {
  type: "object",
  properties: {
    pid: { type: "integer" },
    nodeVersion: { type: "string" },
    platform: { type: "string" },
    uptime: { type: "number" },
    memoryUsage: {
      type: "object",
      properties: {
        rss: { type: "number" },
        heapTotal: { type: "number" },
        heapUsed: { type: "number" },
        external: { type: "number" },
        arrayBuffers: { type: "number" },
      },
      additionalProperties: true,
    },
  },
  required: ["pid", "nodeVersion", "platform", "uptime", "memoryUsage"],
  additionalProperties: false,
};
