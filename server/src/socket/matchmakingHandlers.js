import Player from "../classes/Player.js";

import {
	validatePlayerId,
	validateUsername
} from "../utils/validation.js";

import {
	generateMatchmakingRoom
} from "../utils/roomName.js";

import {
	emitRoomState
} from "../services/roomState.js";

import {
	removePlayerFromGame
} from "../services/roomLifecycle.js";

export function registerMatchmakingHandlers({
	io,
	socket,
	gameManager,
	disconnectTimers
}) {
	socket.on(
		"matchmaking:join",
		({
			player,
			playerId
		}) => {
			if (
				typeof player !==
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

			const playerIdError =
				validatePlayerId(
					playerId
				);

			if (
				playerIdError
			) {
				socket.emit(
					"matchmaking:error",
					{
						message:
							playerIdError
					}
				);

				return;
			}

			/*
			 * If the same socket was
			 * already registered in
			 * another Game, remove it.
			 */
			const previousRoom =
				socket.data.room;

			if (
				previousRoom
			) {
				const previousGame =
					gameManager.getGame(
						previousRoom
					);

				disconnectTimers.cancel(
					previousRoom,
					playerId
				);

				if (
					previousGame
				) {
					removePlayerFromGame({
						io,
						gameManager,
						game:
							previousGame,
						playerId
					});
				}

				socket.leave(
					previousRoom
				);

				socket.data.room =
					null;
			}

			let game =
				gameManager
					.findAvailableGame();

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
					gameManager.createGame(
						room
					);

				console.log(
					`Matchmaking room created: ${room}`
				);
			}

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
				io,
				game
			);

			console.log(
				`Matchmaking: ${cleanPlayer} joined ${game.roomName}`
			);
		}
	);
}