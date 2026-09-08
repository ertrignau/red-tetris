export function registerPieceHandlers({
	socket,
	gameManager
}) {
	socket.on(
		"piece:next",
		({ room }) => {
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

			const piece =
				game.getNextPiece(
					player
				);

			if (!piece)
				return;

			const nextPiece =
				game.peekNextPiece(
					player
				);

			socket.emit(
				"piece:next",
				{
					piece,
					nextPiece
				}
			);

			console.log(
				`Next piece for ${player.name}: ${piece} (index ${player.pieceIndex})`
			);
		}
	);
}