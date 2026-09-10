import Game from "../classes/Game.js";

import {
	MAX_PLAYERS
} from "../../../shared/constants.js";

import {
	activeRooms
} from "../metrics/metrics.js";

class GameManager {
	constructor() {
		this.games =
			new Map();
	}

	createGame(
		roomName
	) {
		const game =
			new Game(
				roomName
			);

		this.games.set(
			roomName,
			game
		);

		activeRooms.set(
			this.games.size
		);

		return game;
	}

	getGame(
		roomName
	) {
		return this.games.get(
			roomName
		);
	}

	getOrCreateGame(
		roomName
	) {
		let game =
			this.getGame(
				roomName
			);

		if (!game) {
			game =
				this.createGame(
					roomName
				);
		}

		return game;
	}

	removeGame(
		roomName
	) {
		this.games.delete(
			roomName
		);

		activeRooms.set(
			this.games.size
		);
	}

	findGameBySocket(
		socketId
	) {
		for (
			const game
			of this.games.values()
		) {
			if (
				game.findPlayerBySocket(
					socketId
				)
			) {
				return game;
			}
		}

		return null;
	}

	findAvailableGame() {
		for (
			const game
			of this.games.values()
		) {
			if (
				!game.started &&
				game.getPlayers().length <
					MAX_PLAYERS
			) {
				return game;
			}
		}

		return null;
	}

	hasGame(
		roomName
	) {
		return this.games.has(
			roomName
		);
	}
}

export default GameManager;