let shuttingDown = false;

export const runShutdownOnce = async (task) => {
  if (shuttingDown) return;
  shuttingDown = true;
  await task();
};
