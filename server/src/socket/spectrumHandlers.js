export function registerSpectrumHandlers({
	socket,
	gameManager
}) {
	socket.on(
		"spectrum:update",
		({
			room,
			spectrum
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

			const player =
				game.findPlayerBySocket(
					socket.id
				);

			if (
				!player ||
				!player.alive
			) {
				return;
			}

			player.spectrum =
				spectrum;

			socket
				.to(room)
				.emit(
					"spectrum:update",
					{
						playerId:
							player.id,

						playerName:
							player.name,

						spectrum:
							player.spectrum
					}
				);
		}
	);
}