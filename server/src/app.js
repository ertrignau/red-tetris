import express from "express";

import {
	registry
} from "./metrics/metrics.js";

import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename =
	fileURLToPath(import.meta.url);

const __dirname =
	path.dirname(__filename);

const clientDistPath =
	path.resolve(
		__dirname,
		"../../client/dist"
	);

app.get(
	"/health",
	(req, res) => {
		res.json({
			status: "ok"
		});
	}
);

app.get(
	"/metrics",
	async (req, res) => {
		res.set(
			"Content-Type",
			registry.contentType
		);

		res.end(
			await registry.metrics()
		);
	}
);

app.use(
	express.static(
		clientDistPath
	)
);

/*
 * SPA fallback.
 *
 * Important for URLs such as:
 *
 * /test/eric
 *
 * If somebody refreshes this URL,
 * Node must return React's index.html.
 */
app.use((req, res, next) => {
	if (req.method !== "GET") {
		next();
		return;
	}

	res.sendFile(
		path.join(
			clientDistPath,
			"index.html"
		),
		(error) => {
			if (error)
				next(error);
		}
	);
});

export default app;