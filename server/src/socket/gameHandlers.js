import {
	emitRoomState
} from "../services/roomState.js";

import {
	finishGame
} from "../services/gameResult.js";

export function registerGameHandlers({
	io,
	socket,
	gameManager
}) {
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
				io,
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
				io,
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
				io,
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

				finishGame(
					io,
					game,
					[
						...(winner
							? [winner]
							: []),

						...game.getRanking()
					]
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
					io,
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
				io,
				game,
				game.getRanking()
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
				io,
				game
			);

			console.log(
				`Game ${room} returned to lobby by ${player.name}`
			);
		}
	);
}