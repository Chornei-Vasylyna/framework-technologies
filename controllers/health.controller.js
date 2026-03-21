export const getHealth = (_, reply) => {
  return reply.status(200).send({ status: "ok" });
};

export const getHealthDetails = (_, reply) => {
  const healthData = {
    pid: process.pid,
    nodeVersion: process.version,
    platform: process.platform,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
  };

  return reply.status(200).send(healthData);
};
