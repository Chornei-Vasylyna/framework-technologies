export const gracefulShutdown = async (fastify, signal) => {
  fastify.log.info({ signal }, "Shutting down gracefully...");

  const forceTimeout = setTimeout(() => {
    console.error("Could not close connections in time, forcing shutdown");
    process.exit(1);
  }, 10000);

  try {
    await fastify.close();
    clearTimeout(forceTimeout);
    process.exit(0);
  } catch (error) {
    clearTimeout(forceTimeout);
    console.error("Error closing server:", error);
    process.exit(1);
  }
};
