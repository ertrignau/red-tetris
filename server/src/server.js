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
				 * a game already running.
				 *
				 * Existing players may
				 * reconnect.
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

					if (
						isRealReconnect
					) {
						console.log(
							`Player ${player} reconnected to ${room}`
						);
					}
				} else {
					const roomPlayer =
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
		 * START
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

				/*
				 * Host only.
				 */
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

				if (
					!player ||
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

				if (
					!player ||
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
				 * Current mode:
				 *
				 * wait for EVERY player
				 * to finish before ranking.
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
		 * PENALTY
		 *
		 * n cleared lines
		 * => n - 1 penalty lines.
		 *
		 * Client sends count already
		 * calculated.
		 */
		socket.on(
			"penalty:send",
			({
				room,
				count
			}) => {
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

				const attacker =
					game.findPlayerBySocket(
						socket.id
					);

				if (
					!attacker ||
					!attacker.alive
				) {
					return;
				}

				/*
				 * Maximum possible from
				 * a normal Tetris:
				 *
				 * 4 cleared => 3 penalties.
				 */
				const penaltyCount =
					Math.max(
						0,
						Math.min(
							3,
							Number(
								count
							) || 0
						)
					);

				if (
					penaltyCount ===
					0
				) {
					return;
				}

				for (
					const target
					of game.players.values()
				) {
					/*
					 * Don't attack yourself
					 * or dead players.
					 */
					if (
						target.id ===
							attacker.id ||
						!target.alive
					) {
						continue;
					}

					io.to(
						target.socketId
					).emit(
						"penalty:add",
						{
							count:
								penaltyCount,

							from:
								attacker.name
						}
					);
				}

				console.log(
					`${attacker.name} sent ${penaltyCount} penalty line(s)`
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

				if (
					!player ||
					!player.alive
				) {
					return;
				}

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
				 * Ignore an old socket
				 * if player already
				 * reconnected.
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
							 * Reconnected during
							 * grace period.
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