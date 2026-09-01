const TETRIMINOS = ["I", "O", "T", "S", "Z", "J", "L"];

class Game {
	constructor (roomName) {
		this.roomName = roomName;
		this.players = new Map();
		this.hostId = null;
		this.started = false;

		this.pieces = [];
	}

	addPlayer(player) {
		this.players.set(player.socketId, player);

		if (this.hostId === null) {
			this.hostId = player.socketId;
			player.isHost = true;
		}
	}

	removePlayer(socketId) {
		this.players.delete(socketId);

		if (this.hostId === socketId)
			this.assignNewHost();
	}

	assignNewHost() {
		const nextPlayer = this.players.values().next().value;

		if (!nextPlayer) {
			this.hostId = null;
			return;
		}

		this.hostId = nextPlayer.socketId;
		nextPlayer.isHost = true;
	}

	getPlayers() {
		return Array.from(this.players.values());
	}

	generateBag() {
		const bag = [...TETRIMINOS];

		for (let i = bag.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));

			[bag[i], bag[j]] = [bag[j], bag[i]];
		}

		return bag;
	}

	generateSequence(bagCount = 20) {
		this.pieces = [];

		for (let i = 0; i < bagCount; i++) {
			const bag = this.generateBag();

			this.pieces.push(...bag);
		}
	}

	getNextPieces(player) {
		const piece = this.pieces[player.pieceIndex];

		if (!piece)
			return null;

		player.pieceIndex++;

		return piece;
	}
}

export default Game;