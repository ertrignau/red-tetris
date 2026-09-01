import Game from "../classes/Game.js";

class GameManager {
	constructor() {
		this.games = new Map();
	}

	createGame(roomName) {
		const game = new Game(roomName);

		this.games.set(roomName, game);
		
		return game;
	}
	
	getGame(roomName) {
		return this.games.get(roomName);
	}

	getOrCreateGame(roomName) {
		let game = this.getGame(roomName);

		if (!game) {
			game = this.createGame(roomName);
		}
		return game;
	}

	removeGame(roomName) {
		this.games.delete(roomName);
	}

	findGameByPlayer(socketId) {
		for (const game of this.games.values()) {
			if (game.players.has(socketId))
				return game;
		}
		return null;
	}
	

	hasGame(roomName) {
		return this.games.has(roomName);
	}
}

export default GameManager;