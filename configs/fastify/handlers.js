import { ERROR_MESSAGES } from "#constants/errorMessages.js";

export const registerHandlers = async (fastify) => {
  fastify.setNotFoundHandler((request, reply) => {
    request.log.error(
      {
        method: request.method,
        url: request.url,
        statusCode: 404,
      },
      "not found",
    );

    return reply.notFound(ERROR_MESSAGES.NOT_FOUND);
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

    request.log.error(
      {
        err: error.message,
        method: request.method,
        url: request.url,
        statusCode,
      },
      "request error",
    );

    if (statusCode === 404) {
      return reply.notFound(ERROR_MESSAGES.NOT_FOUND);
    }

    if (statusCode >= 400 && statusCode < 500) {
      return reply.code(statusCode).send(error);
    }

    return reply.internalServerError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  });
};
