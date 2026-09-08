export function buildRoomState(
	game
) {
	const players =
		game.getPlayers();

	const mode =
		game.started
			? game.activeMode
			: players.length > 1
				? game.mode
				: "solo";

	return {
		room:
			game.roomName,

		started:
			game.started,

		roundId:
			game.roundId,

		hostId:
			game.hostId,

		mode,

		countdownEndsAt:
			game.countdownEndsAt,

		players:
			players.map(
				(player) => ({
					playerId:
						player.id,

					name:
						player.name,

					isHost:
						player.id ===
						game.hostId,

					alive:
						player.alive,

					score:
						player.score
				})
			)
	};
}

export function emitRoomState(
	io,
	game
) {
	io.to(
		game.roomName
	).emit(
		"room:state",
		buildRoomState(
			game
		)
	);
}