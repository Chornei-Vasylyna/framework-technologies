export const getHealth = (res) => {
	const healthData = {
        pid: process.pid,
        nodeVersion: process.nodeVersion,
        platform: process.platform,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage()
    }

	res.statusCode = 200;
	res.end(JSON.stringify(healthData));
};
