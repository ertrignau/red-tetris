export function registerPenaltyHandlers({
	io,
	socket,
	gameManager
}) {
	socket.on(
		"penalty:send",
		({
			room,
			count
		}) => {
			const game =
				gameManager.getGame(
					room
				);

			if (
				!game ||
				!game.started
			) {
				return;
			}

			const attacker =
				game.findPlayerBySocket(
					socket.id
				);

			if (
				!attacker ||
				!attacker.alive
			) {
				return;
			}

			const penaltyCount =
				Math.max(
					0,
					Math.min(
						3,
						Number(
							count
						) || 0
					)
				);

			if (
				penaltyCount ===
				0
			) {
				return;
			}

			for (
				const target
				of game.players.values()
			) {
				if (
					target.id ===
						attacker.id ||
					!target.alive
				) {
					continue;
				}

				io.to(
					target.socketId
				).emit(
					"penalty:add",
					{
						count:
							penaltyCount,

						from:
							attacker.name
					}
				);
			}

			console.log(
				`${attacker.name} sent ${penaltyCount} penalty line(s)`
			);
		}
	);
}