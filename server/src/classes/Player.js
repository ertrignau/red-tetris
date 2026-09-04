class Player {
	constructor(
		playerId,
		socketId,
		name
	) {
		this.id = playerId;
		this.socketId = socketId;
		this.name = name;

		this.alive = true;
		this.pieceIndex = 0;
		this.spectrum = [];
		this.score = 0;

		this.isHost = false;
	}

	reconnect(socketId) {
		this.socketId =
			socketId;
	}
}

export default Player;