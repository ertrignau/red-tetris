const Player {
	constructor(socketId, name) {
		this.socketId = socketId;
		this.name = name;
		this.alive = true;
		this.pieceIndex = 0;
		this.spectrum = [];
		this.isHost = false;
	}
}

export default Player;