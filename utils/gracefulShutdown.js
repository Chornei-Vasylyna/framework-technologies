import { server } from "../app.js";

export const gracefulShutdown = (signal) => {
	console.log(`Received ${signal}. Shutting down gracefully...`);

	const forceTimeout = setTimeout(() => {
		console.error("Could not close connections in time, forcing shutdown");
		process.exit(1);
	}, 10000);

	server.close((error) => {
		clearTimeout(forceTimeout);

		if (error) {
			console.error(`Error closing server: ${error.message}`);
			process.exit(1);
		}

		console.log("Server closed. Exiting process.");
		process.exit(0);
	});
};
