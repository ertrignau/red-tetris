export function clearLines(
	board
) {
	const width =
		board[0].length;

	const remainingRows =
		board.filter(
			(row) => {
				const isFull =
					row.every(
						(cell) =>
							cell !==
							null
					);

				const hasPenalty =
					row.some(
						(cell) =>
							cell ===
							"P"
					);

				/*
				 * Penalty rows are
				 * indestructible.
				 */
				return (
					!isFull ||
					hasPenalty
				);
			}
		);

	const clearedLines =
		board.length -
		remainingRows.length;

	const emptyRows =
		Array.from(
			{
				length:
					clearedLines
			},
			() =>
				Array(
					width
				).fill(
					null
				)
		);

	return {
		board: [
			...emptyRows,
			...remainingRows
		],

		clearedLines
	};
}