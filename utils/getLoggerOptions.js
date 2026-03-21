export const getLoggerOptions = (nodeEnv) =>
  nodeEnv === "development"
    ? {
        level: "info",
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        },
      }
    : {
        level: "error",
      };
