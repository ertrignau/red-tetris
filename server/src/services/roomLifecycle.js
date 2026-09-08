import {
	emitRoomState
} from "./roomState.js";

import {
	resolveGameAfterDeparture
} from "./gameResult.js";

export function removePlayerFromGame({
	io,
	gameManager,
	game,
	playerId
}) {
	const player =
		game.getPlayer(
			playerId
		);

	if (!player) {
		return {
			removed: false,
			finished: false
		};
	}

	const wasStarted =
		game.started;

	const wasHost =
		game.hostId ===
		playerId;

	/*
	 * Leaving during a match counts
	 * as finishing/elimination.
	 */
	if (
		wasStarted
	) {
		if (
			player.alive
		) {
			game.markPlayerDead(
				playerId
			);
		}

		game.recordDepartedPlayer(
			player
		);
	}

	game.removePlayer(
		playerId
	);

	/*
	 * Empty rooms do not stay in
	 * GameManager.
	 */
	if (
		game.getPlayers()
			.length === 0
	) {
		gameManager.removeGame(
			game.roomName
		);

		return {
			removed: true,
			finished: false,
			roomRemoved: true,
			wasHost
		};
	}

	let finished =
		false;

	if (
		wasStarted
	) {
		finished =
			resolveGameAfterDeparture(
				io,
				game
			);
	}

	if (!finished) {
		emitRoomState(
			io,
			game
		);
	}

	return {
		removed: true,
		finished,
		roomRemoved: false,
		wasHost
	};
}