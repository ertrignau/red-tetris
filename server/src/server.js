import http from "http";

import {
	Server
} from "socket.io";

import app from "./app.js";

import GameManager from "./managers/GameManager.js";

import {
	registerSocketHandlers
} from "./socket/connection.js";

const PORT =
	process.env.PORT ||
	3000;

const server =
	http.createServer(
		app
	);

const io =
	new Server(
		server
	);

const gameManager =
	new GameManager();

registerSocketHandlers({
	io,
	gameManager
});

server.listen(
	PORT,
	"0.0.0.0",
	() => {
		console.log(
			`Server running on port ${PORT}`
		);
	}
);