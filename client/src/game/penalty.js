export function addPenaltyLines(
	board,
	count
) {
	if (
		!board ||
		count <= 0
	) {
		return board;
	}

	const width =
		board[0].length;

	const penaltyCount =
		Math.min(
			count,
			board.length
		);

	const remainingBoard =
		board
			.slice(
				penaltyCount
			)
			.map(
				(row) => [
					...row
				]
			);

	const penaltyRows =
		Array.from(
			{
				length:
					penaltyCount
			},
			() =>
				Array(
					width
				).fill(
					"P"
				)
		);

	return [
		...remainingBoard,
		...penaltyRows
	];
}
