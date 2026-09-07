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

		this.players =
			new Map();

		this.hostId =
			null;

		this.started =
			false;

		this.roundId =
			0;

		this.pieces =
			[];

		/*
		 * Stores player snapshots
		 * instead of player ids.
		 *
		 * This allows disconnected
		 * players to remain present
		 * in the final ranking.
		 */
		this.eliminationOrder =
			[];

		/*
		 * Players removed during an
		 * active round are kept here
		 * for Points ranking.
		 */
		this.departedPlayers =
			[];

		this.mode =
			"battle-royale";

		this.activeMode =
			null;

		this.countdownEndsAt =
			null;
	}

	addPlayer(player) {
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

	findPlayerBySocket(socketId) {
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

	setMode(mode) {
		if (
			mode !==
				"battle-royale" &&
			mode !==
				"points"
		) {
			return false;
		}

		this.mode =
			mode;

		return true;
	}

	/*
	 * Create a small immutable
	 * representation of a player
	 * for rankings.
	 */
	createPlayerSnapshot(
		player
	) {
		return {
			id:
				player.id,

			name:
				player.name,

			score:
				player.score
		};
	}

	markPlayerDead(playerId) {
		const player =
			this.players.get(
				playerId
			);

		if (
			!player ||
			!player.alive
		) {
			return;
		}

		player.alive =
			false;

		this.eliminationOrder.push(
			this.createPlayerSnapshot(
				player
			)
		);
	}

	/*
	 * Keep disconnected players
	 * available for Points ranking
	 * after removing them from the
	 * active room.
	 */
	recordDepartedPlayer(
		player
	) {
		const alreadyRecorded =
			this.departedPlayers.some(
				(departed) =>
					departed.id ===
					player.id
			);

		if (alreadyRecorded)
			return;

		this.departedPlayers.push(
			this.createPlayerSnapshot(
				player
			)
		);
	}

	getAlivePlayers() {
		return this
			.getPlayers()
			.filter(
				(player) =>
					player.alive
			);
	}

	isFinished() {
		return (
			this
				.getAlivePlayers()
				.length ===
			0
		);
	}

	/*
	 * Battle Royale ranking.
	 *
	 * Last eliminated player is
	 * ranked higher than players
	 * eliminated before them.
	 */
	getRanking() {
		return [
			...this.eliminationOrder
		].reverse();
	}

	/*
	 * Points ranking includes both
	 * players still present and
	 * players that disconnected.
	 */
	getPointsRanking() {
		const players = [
			...this.getPlayers(),
			...this.departedPlayers
		];

		/*
		 * Prevent duplicates in case
		 * a player was already stored.
		 */
		const uniquePlayers =
			Array.from(
				new Map(
					players.map(
						(player) => [
							player.id,
							player
						]
					)
				).values()
			);

		return uniquePlayers.sort(
			(a, b) =>
				b.score -
				a.score
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
		this.pieces =
			[];

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
			] ??
			null
		);
	}
}

export default Game;