import http from "http";

import { Server } from "socket.io";

import app from "./app.js";
import Player from "./classes/Player.js";
import GameManager from "./managers/GameManager.js";

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
	cors: {
		origin: "http://localhost:5173"
	}
});

const gameManager = new GameManager();

io.on("connection", (socket) => {
	console.log(`Player connected: ${socket.id}`);

	socket.on("room:join", ({ room, player }) => {
		const game = gameManager.getOrCreateGame(room);

		if (game.started) {
			socket.emit("room:error", {
				message: "Game already started"
			});

			return ;
		}

		const newPlayer = new Player(socket.id, player);

		game.addPlayer(newPlayer);

		socket.join(room);

		const roomState = {
			room: game.roomName,
			started: game.started,
			hostId: game.hostId,
			players: game.getPlayers().map((p) => ({
				name: p.name,
				isHost: p.isHost,
				alive: p.alive
			}))
		};

		io.to(room).emit("room:state", roomState);

		console.log(`Player ${player} joined room ${room}`);
	});

	socket.on("game:start", ({ room }) => {
		const game = gameManager.getGame(room);

		if (!game)
			return;

		if (game.hostId !== socket.id)
			return;

		game.generateSequence();

		game.started = true;

		io.to(room).emit("room:state", {
			room: game.roomName,
			started: game.started,
			hostId: game.hostId,
			players: game.getPlayers().map((p) => ({
				name: p.name,
				isHost: p.isHost,
				alive: p.alive
			}))
		});

		console.log(`Game ${room} started`);
		console.log("Piece sequence:", game.pieces);
	});

	socket.on("piece:next", ({ room }) => {
		const game = gameManager.getGame(room);

		if (!game)
			return ;

		const player = game.players.get(socket.id);

		if (!player)
			return ;

		const piece = game.getNextPieces(player);

		if (!piece)
			return ;

		socket.emit("piece:next", {
			piece
		});

		console.log(
			`Next piece for ${player.name}: ${piece} (index ${player.pieceIndex})`
		);
	});

	socket.on("disconnect", () => {
		const game = gameManager.findGameByPlayer(socket.id);

		if (game) {
			game.removePlayer(socket.id);

			if (game.getPlayers().length === 0) {
				gameManager.removeGame(game.roomName);
			} else {
				io.to(game.roomName).emit("room:state", {
					room: game.roomName,
					started: game.started,
					hostId: game.hostId,
					players: game.getPlayers().map((p) => ({
						name: p.name,
						isHost: p.isHost,
						alive: p.alive
					}))
				});
			}
		}

		console.log(`Player disconnected: ${socket.id}`);
	});
});

server.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});