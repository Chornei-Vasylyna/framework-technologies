import { config } from "../config.js";

const logMessage = ({ method, url, status, agent, ip }) => {
	let level;

	if (status >= 100 && status <= 199) {
		level = "INFO";
	} else if (status >= 200 && status <= 299) {
		level = "SUCCESS";
	} else if (status >= 300 && status <= 399) {
		level = "REDIRECTION";
	} else if (status >= 400 && status <= 499) {
		level = "CLIENT ERROR";
	} else if (status >= 500 && status <= 599) {
		level = "SERVER ERROR";
	} else {
		level = "UNKNOWN";
	}

	console.log(
		`[${level}] ${method} ${url} | Status: ${status} | Agent: ${agent} | IP: ${ip}`,
	);
};

const getClientIp = (req) => {
	const forwarded = req.headers["x-forwarded-for"];
	const ip = forwarded
		? forwarded.split(",").at(0).trim()
		: req.socket.remoteAddress;

	if (!ip) return "";
	if (ip === "::1") return "127.0.0.1";
	if (ip.startsWith("::ffff:")) return ip.split(":").pop();

	return ip;
};

export const logRequest = (req, res) => {
	res.on("finish", () => {
		const status = res.statusCode;
		const ip = getClientIp(req);
		const { method, url, headers } = req;
		const agent = headers["user-agent"] ?? "Unknown";

		if (
			config.NODE_ENV === "development" ||
			(config.NODE_ENV === "production" && status >= 400 && status <= 599)
		) {
			logMessage({ method, url, status, agent, ip });
		}
	});
};
