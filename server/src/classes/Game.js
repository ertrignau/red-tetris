const TETRIMINOS = [
	"I",
	"O",
	"T",
	"S",
	"Z",
	"J",
	"L"
];

class Game {
	constructor(roomName) {
		this.roomName =
			roomName;

		/*
		 * Map:
		 *
		 * playerId -> Player
		 */
		this.players =
			new Map();

		/*
		 * hostId is now a PLAYER ID,
		 * not a socket ID.
		 */
		this.hostId =
			null;

		this.started =
			false;

		this.pieces =
			[];
	}

	addPlayer(player) {
		/*
		 * Already registered:
		 * update network connection.
		 */
		const existingPlayer =
			this.players.get(
				player.id
			);

		if (existingPlayer) {
			existingPlayer.reconnect(
				player.socketId
			);

			existingPlayer.name =
				player.name;

			return existingPlayer;
		}

		this.players.set(
			player.id,
			player
		);

		/*
		 * First player becomes host.
		 */
		if (
			this.hostId === null
		) {
			this.hostId =
				player.id;

			player.isHost =
				true;
		}

		return player;
	}

	removePlayer(playerId) {
		const player =
			this.players.get(
				playerId
			);

		if (!player)
			return;

		const wasHost =
			this.hostId ===
			playerId;

		this.players.delete(
			playerId
		);

		if (wasHost) {
			this.assignNewHost();
		}
	}

	assignNewHost() {
		/*
		 * Reset host flags first.
		 */
		for (
			const player
			of this.players.values()
		) {
			player.isHost =
				false;
		}

		const nextPlayer =
			this.players
				.values()
				.next()
				.value;

		if (!nextPlayer) {
			this.hostId =
				null;

			return;
		}

		this.hostId =
			nextPlayer.id;

		nextPlayer.isHost =
			true;
	}

	getPlayer(playerId) {
		return this.players.get(
			playerId
		);
	}

	findPlayerBySocket(
		socketId
	) {
		for (
			const player
			of this.players.values()
		) {
			if (
				player.socketId ===
				socketId
			) {
				return player;
			}
		}

		return null;
	}

	getPlayers() {
		return Array.from(
			this.players.values()
		);
	}

	generateBag() {
		const bag = [
			...TETRIMINOS
		];

		for (
			let i =
				bag.length - 1;
			i > 0;
			i--
		) {
			const j =
				Math.floor(
					Math.random() *
						(i + 1)
				);

			[
				bag[i],
				bag[j]
			] = [
				bag[j],
				bag[i]
			];
		}

		return bag;
	}

	generateSequence(
		bagCount = 20
	) {
		this.pieces = [];

		for (
			let i = 0;
			i < bagCount;
			i++
		) {
			const bag =
				this.generateBag();

			this.pieces.push(
				...bag
			);
		}
	}

	getNextPiece(player) {
		const piece =
			this.pieces[
				player.pieceIndex
			];

		if (!piece)
			return null;

		player.pieceIndex++;

		return piece;
	}

	peekNextPiece(player) {
		return (
			this.pieces[
				player.pieceIndex
			] ?? null
		);
	}
}

export default Game;