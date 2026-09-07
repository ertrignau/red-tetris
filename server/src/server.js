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

const USERNAME_MIN_LENGTH =
	3;

const USERNAME_MAX_LENGTH =
	16;

const ROOM_MIN_LENGTH =
	3;

const ROOM_MAX_LENGTH =
	20;

const ROOM_REGEX =
	/^[a-zA-Z0-9_-]+$/;

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

function generateMatchmakingRoom() {
	return `match-${Math.random()
		.toString(36)
		.slice(2, 10)}`;
}

function buildRoomState(
	game
) {
	const players =
		game.getPlayers();

	const mode =
		game.started
			? game.activeMode
			: players.length > 1
				? game.mode
				: "solo";

	return {
		room:
			game.roomName,

		started:
			game.started,

		roundId:
			game.roundId,

		hostId:
			game.hostId,

		mode,

		countdownEndsAt:
			game.countdownEndsAt,

		players:
			players.map(
				(player) => ({
					playerId:
						player.id,

					name:
						player.name,

					isHost:
						player.id ===
						game.hostId,

					alive:
						player.alive,

					score:
						player.score
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

function buildRanking(
	game,
	players
) {
	return players.map(
		(
			player,
			index
		) => ({
			position:
				index + 1,

			playerId:
				player.id,

			name:
				player.name,

			score:
				player.score,

			isHost:
				player.id ===
				game.hostId
		})
	);
}

function finishGame(
	game,
	rankingPlayers
) {
	game.started =
		false;

	game.countdownEndsAt =
		null;

	const ranking =
		buildRanking(
			game,
			rankingPlayers
		);

	io.to(
		game.roomName
	).emit(
		"game:finished",
		{
			mode:
				game.activeMode,

			ranking
		}
	);

	emitRoomState(
		game
	);

	console.log(
		`Game ${game.roomName} finished (${game.activeMode})`
	);
}

function validateUsername(
	username
) {
	if (
		username.length <
			USERNAME_MIN_LENGTH ||
		username.length >
			USERNAME_MAX_LENGTH
	) {
		return `Username must be between ${USERNAME_MIN_LENGTH} and ${USERNAME_MAX_LENGTH} characters`;
	}

	return null;
}

function validateRoom(
	room
) {
	if (
		room.length <
			ROOM_MIN_LENGTH ||
		room.length >
			ROOM_MAX_LENGTH
	) {
		return `Room name must be between ${ROOM_MIN_LENGTH} and ${ROOM_MAX_LENGTH} characters`;
	}

	if (
		!ROOM_REGEX.test(
			room
		)
	) {
		return "Room can only contain letters, numbers, - and _";
	}

	return null;
}

io.on(
	"connection",
	(socket) => {
		console.log(
			`Player connected: ${socket.id}`
		);

		/*
		 * MATCHMAKING
		 */
		socket.on(
			"matchmaking:join",
			({
				player,
				playerId
			}) => {
				if (
					typeof player !==
						"string" ||
					typeof playerId !==
						"string"
				) {
					socket.emit(
						"matchmaking:error",
						{
							message:
								"Invalid player"
						}
					);

					return;
				}

				const cleanPlayer =
					player.trim();

				const usernameError =
					validateUsername(
						cleanPlayer
					);

				if (
					usernameError
				) {
					socket.emit(
						"matchmaking:error",
						{
							message:
								usernameError
						}
					);

					return;
				}

				if (
					playerId.length >
					128
				) {
					socket.emit(
						"matchmaking:error",
						{
							message:
								"Invalid player id"
						}
					);

					return;
				}

				/*
				 * Search for a room whose
				 * game has not started.
				 */
				let game =
					gameManager
						.findAvailableGame();

				/*
				 * None found:
				 * create a new waiting room.
				 */
				if (!game) {
					let room;

					do {
						room =
							generateMatchmakingRoom();
					} while (
						gameManager.hasGame(
							room
						)
					);

					game =
						gameManager
							.createGame(
								room
							);

					console.log(
						`Matchmaking room created: ${room}`
					);
				}

				cancelDisconnect(
					game.roomName,
					playerId
				);

				let roomPlayer =
					game.getPlayer(
						playerId
					);

				if (
					roomPlayer
				) {
					roomPlayer.reconnect(
						socket.id
					);

					roomPlayer.name =
						cleanPlayer;
				} else {
					roomPlayer =
						new Player(
							playerId,
							socket.id,
							cleanPlayer
						);

					game.addPlayer(
						roomPlayer
					);
				}

				socket.join(
					game.roomName
				);

				socket.data.room =
					game.roomName;

				socket.data.playerId =
					playerId;

				socket.emit(
					"matchmaking:found",
					{
						room:
							game.roomName
					}
				);

				emitRoomState(
					game
				);

				console.log(
					`Matchmaking: ${cleanPlayer} joined ${game.roomName}`
				);
			}
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
					typeof room !==
						"string" ||
					typeof player !==
						"string" ||
					typeof playerId !==
						"string"
				) {
					socket.emit(
						"room:error",
						{
							message:
								"Invalid room or username"
						}
					);

					return;
				}

				const cleanRoom =
					room.trim();

				const cleanPlayer =
					player.trim();

				const usernameError =
					validateUsername(
						cleanPlayer
					);

				if (
					usernameError
				) {
					socket.emit(
						"room:error",
						{
							message:
								usernameError
						}
					);

					return;
				}

				const roomError =
					validateRoom(
						cleanRoom
					);

				if (
					roomError
				) {
					socket.emit(
						"room:error",
						{
							message:
								roomError
						}
					);

					return;
				}

				if (
					playerId.length >
					128
				) {
					socket.emit(
						"room:error",
						{
							message:
								"Invalid player id"
						}
					);

					return;
				}

				const previousRoom =
					socket.data.room;

				if (
					previousRoom &&
					previousRoom !==
						cleanRoom
				) {
					socket.leave(
						previousRoom
					);
				}

				const game =
					gameManager
						.getOrCreateGame(
							cleanRoom
						);

				const existingPlayer =
					game.getPlayer(
						playerId
					);

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
					cleanRoom,
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
						cleanPlayer;

					if (
						isRealReconnect
					) {
						console.log(
							`Player ${cleanPlayer} reconnected to ${cleanRoom}`
						);
					}
				} else {
					const roomPlayer =
						new Player(
							playerId,
							socket.id,
							cleanPlayer
						);

					game.addPlayer(
						roomPlayer
					);

					console.log(
						`Player ${cleanPlayer} joined room ${cleanRoom}`
					);
				}

				socket.join(
					cleanRoom
				);

				socket.data.room =
					cleanRoom;

				socket.data.playerId =
					playerId;

				emitRoomState(
					game
				);
			}
		);

		/*
		 * GAME MODE
		 */
		socket.on(
			"game:mode",
			({
				room,
				mode
			}) => {
				const game =
					gameManager.getGame(
						room
					);

				if (
					!game ||
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

				if (
					game.getPlayers()
						.length <= 1
				) {
					return;
				}

				if (
					!game.setMode(
						mode
					)
				) {
					return;
				}

				emitRoomState(
					game
				);

				console.log(
					`Game ${room} mode: ${mode}`
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

				if (
					!game ||
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

				game.roundId +=
					1;

				game.generateSequence();

				game.activeMode =
					game.getPlayers()
						.length > 1
						? game.mode
						: "solo";

				game.started =
					true;

				game.countdownEndsAt =
					Date.now() + 3000;

				game.eliminationOrder =
					[];

				game.departedPlayers =
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

					roomPlayer.score =
						0;
				}

				emitRoomState(
					game
				);

				console.log(
					`Game ${room} started by ${player.name} (${game.activeMode})`
				);
			}
		);

		/*
		 * SCORE
		 */
		socket.on(
			"score:update",
			({
				room,
				score
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

				const value =
					Number(
						score
					);

				if (
					!Number.isFinite(
						value
					) ||
					value < 0
				) {
					return;
				}

				player.score =
					Math.floor(
						value
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
					`Player ${player.name} finished with ${player.score} points`
				);

				emitRoomState(
					game
				);

				if (
					game.activeMode ===
					"battle-royale"
				) {
					const alivePlayers =
						game.getAlivePlayers();

					if (
						alivePlayers.length >
						1
					) {
						return;
					}

					const winner =
						alivePlayers[0];

					const rankingPlayers = [
						...(winner
							? [winner]
							: []),

						...game.getRanking()
					];

					finishGame(
						game,
						rankingPlayers
					);

					return;
				}

				if (
					game.activeMode ===
					"points"
				) {
					if (
						!game.isFinished()
					) {
						return;
					}

					finishGame(
						game,
						game.getPointsRanking()
					);

					return;
				}

				if (
					!game.isFinished()
				) {
					return;
				}

				finishGame(
					game,
					game.getRanking()
				);
			}
		);

		/*
		 * PENALTY
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
		 * RETURN TO LOBBY
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

				game.started =
					false;

				game.activeMode =
					null;

				game.countdownEndsAt =
					null;

				game.eliminationOrder =
					[];

				game.departedPlayers =
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

					roomPlayer.score =
						0;
				}

				io.to(
					room
				).emit(
					"game:restart"
				);

				emitRoomState(
					game
				);

				console.log(
					`Game ${room} returned to lobby by ${player.name}`
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

							if (
								currentPlayer.socketId !==
								socket.id
							) {
								return;
							}

							const wasStarted =
								currentGame.started;

							const mode =
								currentGame.activeMode;

							const wasHost =
								currentGame.hostId ===
								playerId;

							if (
								wasStarted
							) {
								if (
									currentPlayer.alive
								) {
									currentGame.markPlayerDead(
										playerId
									);

									console.log(
										`Player ${currentPlayer.name} eliminated by disconnect`
									);
								}

								currentGame.recordDepartedPlayer(
									currentPlayer
								);
							}

							currentGame.removePlayer(
								playerId
							);

							if (
								currentGame
									.getPlayers()
									.length === 0
							) {
								gameManager.removeGame(
									room
								);

								console.log(
									`Room ${room} removed`
								);

								return;
							}

							if (
								!wasStarted
							) {
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

								return;
							}

							if (
								mode ===
								"battle-royale"
							) {
								const alivePlayers =
									currentGame
										.getAlivePlayers();

								if (
									alivePlayers.length <=
									1
								) {
									const winner =
										alivePlayers[0];

									const rankingPlayers = [
										...(winner
											? [winner]
											: []),

										...currentGame
											.getRanking()
									];

									finishGame(
										currentGame,
										rankingPlayers
									);

									console.log(
										`Battle Royale ${room} finished after disconnect`
									);

									return;
								}
							}

							if (
								mode ===
									"points" &&
								currentGame.isFinished()
							) {
								finishGame(
									currentGame,
									currentGame
										.getPointsRanking()
								);

								console.log(
									`Points game ${room} finished after disconnect`
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