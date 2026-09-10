import {
	removePlayerFromGame
} from "../services/roomLifecycle.js";

import {
	connectedSockets
} from "../metrics/metrics.js";

const DISCONNECT_GRACE_MS =
	3000;

export function registerDisconnectHandlers({
	io,
	socket,
	gameManager,
	disconnectTimers
}) {
	socket.on(
		"disconnect",
		() => {
			connectedSockets.dec();

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
			 * Old socket disconnect after
			 * successful reconnect.
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

			disconnectTimers.schedule(
				room,
				playerId,
				DISCONNECT_GRACE_MS,
				() => {
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
					 * Player returned before
					 * the grace period ended.
					 */
					if (
						currentPlayer.socketId !==
							socket.id
					) {
						return;
					}

					const playerName =
						currentPlayer.name;

					const wasStarted =
						currentGame.started;

					removePlayerFromGame({
						io,
						gameManager,
						game:
							currentGame,
						playerId
					});

					if (
						wasStarted
					) {
						console.log(
							`Player ${playerName} eliminated by disconnect`
						);
					} else {
						console.log(
							`Player ${playerName} removed from ${room}`
						);
					}
				}
			);
		}
	);
}