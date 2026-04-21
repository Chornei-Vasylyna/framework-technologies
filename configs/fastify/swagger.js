import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";

export const registerSwagger = async (fastify) => {
  await fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Students API",
        version: "1.0.0",
      },
      components: {
        securitySchemes: {
          ApiKeyAuth: {
            type: "apiKey",
            name: "x-api-key",
            in: "header",
          },
        },
      },
    },
  });

  await fastify.register(fastifySwaggerUi, {
    routePrefix: "/",
  });

  fastify.get("/docs", { schema: { hide: true } }, async (_, reply) => {
    return reply.redirect("/");
  });

  fastify.get("/docs/", { schema: { hide: true } }, async (_, reply) => {
    return reply.redirect("/");
  });

  fastify.get("/docs/json", { schema: { hide: true } }, async (_, reply) => {
    return reply.redirect("/json");
  });

  fastify.get("/docs/yaml", { schema: { hide: true } }, async (_, reply) => {
    return reply.redirect("/yaml");
  });

  fastify.get(
    "/docs/static/*",
    { schema: { hide: true } },
    async (request, reply) => {
      return reply.redirect(`/static/${request.params["*"]}`);
    },
  );
};
