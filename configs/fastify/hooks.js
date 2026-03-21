export const registerHooks = async (fastify) => {
  fastify.addHook("onReady", async () => {
    if (
      fastify.config.NODE_ENV === "production" &&
      !fastify.config.CORS_ORIGIN
    ) {
      throw new Error("CORS_ORIGIN must be set in production");
    }
  });

  fastify.addHook("onClose", async (instance) => {
    instance.log.info("Fastify server is closing");
  });
};
