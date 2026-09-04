import http from "http";

import {
	Server
} from "socket.io";

import app from "./app.js";

import Player from "./classes/Player.js";
import GameManager from "./managers/GameManager.js";

const PORT =
	process.env.PORT ||
	3000;

const DISCONNECT_GRACE_MS =
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

/*
 * room:playerId -> timeout
 */
const disconnectTimers =
	new Map();

function getDisconnectKey(
	room,
	playerId
) {
	return `${room}:${playerId}`;
}

function cancelDisconnect(
	room,
	playerId
) {
	const key =
		getDisconnectKey(
			room,
			playerId
		);

	const timeout =
		disconnectTimers.get(
			key
		);

	if (!timeout)
		return;

	clearTimeout(
		timeout
	);

	disconnectTimers.delete(
		key
	);
}

function buildRoomState(
	game
) {
	return {
		room:
			game.roomName,

		started:
			game.started,

		hostId:
			game.hostId,

		players:
			game
				.getPlayers()
				.map(
					(player) => ({
						playerId:
							player.id,

						name:
							player.name,

						isHost:
							player.id ===
							game.hostId,

						alive:
							player.alive
					})
				)
	};
}

function emitRoomState(
	game
) {
	io.to(
		game.roomName
	).emit(
		"room:state",
		buildRoomState(
			game
		)
	);
}

io.on(
	"connection",
	(socket) => {
		console.log(
			`Player connected: ${socket.id}`
		);

		/*
		 * JOIN / RECONNECT
		 */
		socket.on(
			"room:join",
			({
				room,
				player,
				playerId
			}) => {
				if (
					!room ||
					!player ||
					!playerId
				) {
					return;
				}

				const previousRoom =
					socket.data.room;

				if (
					previousRoom &&
					previousRoom !==
						room
				) {
					socket.leave(
						previousRoom
					);
				}

				const game =
					gameManager
						.getOrCreateGame(
							room
						);

				const existingPlayer =
					game.getPlayer(
						playerId
					);

				/*
				 * New players cannot join
				 * after the game has started.
				 *
				 * Existing players may reconnect.
				 */
				if (
					game.started &&
					!existingPlayer
				) {
					socket.emit(
						"room:error",
						{
							message:
								"Game already started"
						}
					);

					return;
				}

				cancelDisconnect(
					room,
					playerId
				);

				let roomPlayer;

				if (
					existingPlayer
				) {
					const isRealReconnect =
						existingPlayer.socketId !==
						socket.id;

					existingPlayer.reconnect(
						socket.id
					);

					existingPlayer.name =
						player;

					roomPlayer =
						existingPlayer;

					if (
						isRealReconnect
					) {
						console.log(
							`Player ${player} reconnected to ${room}`
						);
					}
				} else {
					roomPlayer =
						new Player(
							playerId,
							socket.id,
							player
						);

					game.addPlayer(
						roomPlayer
					);

					console.log(
						`Player ${player} joined room ${room}`
					);
				}

				socket.join(
					room
				);

				socket.data.room =
					room;

				socket.data.playerId =
					playerId;

				emitRoomState(
					game
				);
			}
		);

		/*
		 * START GAME
		 */
		socket.on(
			"game:start",
			({ room }) => {
				const game =
					gameManager.getGame(
						room
					);

				if (!game)
					return;

				if (
					game.started
				) {
					return;
				}

				const player =
					game.findPlayerBySocket(
						socket.id
					);

				if (!player)
					return;

				if (
					game.hostId !==
					player.id
				) {
					return;
				}

				game.generateSequence();

				game.started =
					true;

				game.eliminationOrder =
					[];

				for (
					const roomPlayer
					of game.players.values()
				) {
					roomPlayer.alive =
						true;

					roomPlayer.pieceIndex =
						0;

					roomPlayer.spectrum =
						[];
				}

				emitRoomState(
					game
				);

				console.log(
					`Game ${room} started by ${player.name}`
				);
			}
		);

		/*
		 * NEXT PIECE
		 */
		socket.on(
			"piece:next",
			({ room }) => {
				const game =
					gameManager.getGame(
						room
					);

				if (!game)
					return;

				if (
					!game.started
				) {
					return;
				}

				const player =
					game.findPlayerBySocket(
						socket.id
					);

				if (!player)
					return;

				if (
					!player.alive
				) {
					return;
				}

				const piece =
					game.getNextPiece(
						player
					);

				if (!piece)
					return;

				const nextPiece =
					game.peekNextPiece(
						player
					);

				socket.emit(
					"piece:next",
					{
						piece,
						nextPiece
					}
				);

				console.log(
					`Next piece for ${player.name}: ${piece} (index ${player.pieceIndex})`
				);
			}
		);

		/*
		 * PLAYER DEAD
		 */
		socket.on(
			"player:dead",
			({ room }) => {
				const game =
					gameManager.getGame(
						room
					);

				if (
					!game ||
					!game.started
				) {
					return;
				}

				const player =
					game.findPlayerBySocket(
						socket.id
					);

				if (!player)
					return;

				if (
					!player.alive
				) {
					return;
				}

				game.markPlayerDead(
					player.id
				);

				console.log(
					`Player ${player.name} finished`
				);

				emitRoomState(
					game
				);

				/*
				 * For now:
				 *
				 * ranking is displayed only
				 * when EVERY player has
				 * finished.
				 */
				if (
					!game.isFinished()
				) {
					return;
				}

				game.started =
					false;

				const ranking =
					game
						.getRanking()
						.map(
							(
								rankedPlayer,
								index
							) => ({
								position:
									index + 1,

								playerId:
									rankedPlayer.id,

								name:
									rankedPlayer.name,

								isHost:
									rankedPlayer.id ===
									game.hostId
							})
						);

				io.to(room).emit(
					"game:finished",
					{
						ranking
					}
				);

				emitRoomState(
					game
				);

				console.log(
					`Game ${room} finished`
				);
			}
		);

		/*
		 * SPECTRUM
		 */
		socket.on(
			"spectrum:update",
			({
				room,
				spectrum
			}) => {
				const game =
					gameManager.getGame(
						room
					);

				if (!game)
					return;

				const player =
					game.findPlayerBySocket(
						socket.id
					);

				if (!player)
					return;

				player.spectrum =
					spectrum;

				socket
					.to(room)
					.emit(
						"spectrum:update",
						{
							playerId:
								player.id,

							playerName:
								player.name,

							spectrum:
								player.spectrum
						}
					);
			}
		);

		/*
		 * RESTART
		 */
		socket.on(
			"game:restart",
			({ room }) => {
				const game =
					gameManager.getGame(
						room
					);

				if (!game)
					return;

				const player =
					game.findPlayerBySocket(
						socket.id
					);

				if (!player)
					return;

				if (
					game.hostId !==
					player.id
				) {
					return;
				}

				game.generateSequence();

				game.started =
					true;

				game.eliminationOrder =
					[];

				for (
					const roomPlayer
					of game.players.values()
				) {
					roomPlayer.alive =
						true;

					roomPlayer.pieceIndex =
						0;

					roomPlayer.spectrum =
						[];
				}

				io.to(room).emit(
					"game:restart"
				);

				emitRoomState(
					game
				);

				console.log(
					`Game ${room} restarted by ${player.name}`
				);
			}
		);

		/*
		 * DISCONNECT
		 */
		socket.on(
			"disconnect",
			() => {
				const room =
					socket.data.room;

				const playerId =
					socket.data.playerId;

				if (
					!room ||
					!playerId
				) {
					console.log(
						`Player disconnected: ${socket.id}`
					);

					return;
				}

				const game =
					gameManager.getGame(
						room
					);

				if (!game)
					return;

				const player =
					game.getPlayer(
						playerId
					);

				if (!player)
					return;

				/*
				 * If this old socket disconnects
				 * after the player already
				 * reconnected with a new socket,
				 * ignore it.
				 */
				if (
					player.socketId !==
					socket.id
				) {
					return;
				}

				console.log(
					`Player ${player.name} disconnected, waiting for reconnect...`
				);

				const key =
					getDisconnectKey(
						room,
						playerId
					);

				const timeout =
					setTimeout(
						() => {
							disconnectTimers.delete(
								key
							);

							const currentGame =
								gameManager.getGame(
									room
								);

							if (!currentGame)
								return;

							const currentPlayer =
								currentGame.getPlayer(
									playerId
								);

							if (!currentPlayer)
								return;

							/*
							 * Player reconnected.
							 */
							if (
								currentPlayer.socketId !==
								socket.id
							) {
								return;
							}

							const wasHost =
								currentGame.hostId ===
								playerId;

							currentGame.removePlayer(
								playerId
							);

							if (
								currentGame
									.getPlayers()
									.length ===
								0
							) {
								gameManager.removeGame(
									room
								);

								console.log(
									`Room ${room} removed`
								);

								return;
							}

							emitRoomState(
								currentGame
							);

							if (
								wasHost
							) {
								console.log(
									`New host for ${room}: ${currentGame.hostId}`
								);
							}

							console.log(
								`Player ${playerId} removed from ${room}`
							);
						},
						DISCONNECT_GRACE_MS
					);

				disconnectTimers.set(
					key,
					timeout
				);
			}
		);
	}
);

server.listen(
	PORT,
	"0.0.0.0",
	() => {
		console.log(
			`Server running on port ${PORT}`
		);
	}
);