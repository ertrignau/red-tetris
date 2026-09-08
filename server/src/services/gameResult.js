import {
	emitRoomState
} from "./roomState.js";

export function buildRanking(
	game,
	players
) {
	return players.map(
		(
			player,
			index
		) => ({
			position:
				index + 1,

			playerId:
				player.id,

			name:
				player.name,

			score:
				player.score,

			isHost:
				player.id ===
				game.hostId
		})
	);
}

export function finishGame(
	io,
	game,
	rankingPlayers
) {
	game.started =
		false;

	game.countdownEndsAt =
		null;

	const ranking =
		buildRanking(
			game,
			rankingPlayers
		);

	io.to(
		game.roomName
	).emit(
		"game:finished",
		{
			mode:
				game.activeMode,

			ranking
		}
	);

	emitRoomState(
		io,
		game
	);

	console.log(
		`Game ${game.roomName} finished (${game.activeMode})`
	);
}

/*
 * Used after a player permanently
 * leaves an active match.
 */
export function resolveGameAfterDeparture(
	io,
	game
) {
	if (!game.started)
		return false;

	if (
		game.activeMode ===
		"battle-royale"
	) {
		const alivePlayers =
			game.getAlivePlayers();

		if (
			alivePlayers.length >
			1
		) {
			return false;
		}

		const winner =
			alivePlayers[0];

		const rankingPlayers = [
			...(winner
				? [winner]
				: []),

			...game.getRanking()
		];

		finishGame(
			io,
			game,
			rankingPlayers
		);

		return true;
	}

	if (
		game.activeMode ===
		"points"
	) {
		if (
			!game.isFinished()
		) {
			return false;
		}

		finishGame(
			io,
			game,
			game.getPointsRanking()
		);

		return true;
	}

	if (
		game.activeMode ===
		"solo" &&
		game.isFinished()
	) {
		finishGame(
			io,
			game,
			game.getRanking()
		);

		return true;
	}

	return false;
}