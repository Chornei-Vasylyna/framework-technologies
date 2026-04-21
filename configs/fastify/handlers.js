import { ERROR_MESSAGES } from "#constants/errorMessages.js";

export const registerHandlers = async (fastify) => {
  fastify.setNotFoundHandler((request, reply) => {
    request.log.warn(
      {
        method: request.method,
        url: request.url,
        statusCode: 404,
      },
      "not found",
    );

    return reply.code(404).send({
      statusCode: 404,
      error: "Not Found",
      message: ERROR_MESSAGES.NOT_FOUND,
    });
  });

  fastify.setErrorHandler((error, request, reply) => {
    if (error.validation) {
      request.log.error(
        {
          method: request.method,
          url: request.url,
          statusCode: 400,
          validation: error.validation,
        },
        "validation error",
      );

      return reply.badRequest(ERROR_MESSAGES.VALIDATION_ERROR);
    }

    const statusCode = error.statusCode ?? 500;

    if (statusCode === 404) {
      request.log.warn(
        {
          method: request.method,
          url: request.url,
          statusCode,
        },
        "request not found",
      );

      return reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: ERROR_MESSAGES.NOT_FOUND,
      });
    }

    request.log.error(
      {
        err: error.message,
        method: request.method,
        url: request.url,
        statusCode,
      },
      "request error",
    );

    if (statusCode >= 400 && statusCode < 500) {
      return reply.code(statusCode).send(error);
    }

    return reply.internalServerError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  });
};
