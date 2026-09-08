import Player from "../classes/Player.js";

import {
	validatePlayerId,
	validateRoom,
	validateUsername
} from "../utils/validation.js";

import {
	emitRoomState
} from "../services/roomState.js";

import {
	removePlayerFromGame
} from "../services/roomLifecycle.js";

export function registerRoomHandlers({
	io,
	socket,
	gameManager,
	disconnectTimers
}) {
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

			if (usernameError) {
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

			if (roomError) {
				socket.emit(
					"room:error",
					{
						message:
							roomError
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
					"room:error",
					{
						message:
							playerIdError
					}
				);

				return;
			}

			/*
			 * Check destination BEFORE
			 * leaving the previous room.
			 */
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

			const previousRoom =
				socket.data.room;

			/*
			 * Actual room switching.
			 *
			 * The old Game must also
			 * lose the player, not only
			 * the Socket.IO room.
			 */
			if (
				previousRoom &&
				previousRoom !==
					cleanRoom
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
			}

			disconnectTimers.cancel(
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
				io,
				game
			);
		}
	);
}