export const BOT_BOARD_WIDTH =
	10;

export const BOT_BOARD_HEIGHT =
	20;

export function createBotBoard() {
	return Array.from(
		{
			length:
				BOT_BOARD_HEIGHT
		},
		() =>
			Array(
				BOT_BOARD_WIDTH
			).fill(
				null
			)
	);
}

export function cloneBotBoard(
	board
) {
	return board.map(
		(row) => [
			...row
		]
	);
}

export function hasBotCollision(
	board,
	shape,
	x,
	y
) {
	for (
		let row = 0;
		row < shape.length;
		row++
	) {
		for (
			let col = 0;
			col <
				shape[row].length;
			col++
		) {
			if (
				!shape[row][col]
			) {
				continue;
			}

			const boardX =
				x + col;

			const boardY =
				y + row;

			if (
				boardX < 0 ||
				boardX >=
					BOT_BOARD_WIDTH ||
				boardY >=
					BOT_BOARD_HEIGHT
			) {
				return true;
			}

			if (
				boardY >= 0 &&
				board[
					boardY
				][
					boardX
				] !== null
			) {
				return true;
			}
		}
	}

	return false;
}

export function lockBotPiece(
	board,
	shape,
	type,
	x,
	y
) {
	const nextBoard =
		cloneBotBoard(
			board
		);

	for (
		let row = 0;
		row < shape.length;
		row++
	) {
		for (
			let col = 0;
			col <
				shape[row].length;
			col++
		) {
			if (
				!shape[row][col]
			) {
				continue;
			}

			const boardX =
				x + col;

			const boardY =
				y + row;

			if (
				boardY >= 0 &&
				boardY <
					BOT_BOARD_HEIGHT &&
				boardX >= 0 &&
				boardX <
					BOT_BOARD_WIDTH
			) {
				nextBoard[
					boardY
				][
					boardX
				] =
					type;
			}
		}
	}

	return nextBoard;
}

export function clearBotLines(
	board
) {
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

				return (
					!isFull ||
					hasPenalty
				);
			}
		);

	const clearedLines =
		BOT_BOARD_HEIGHT -
		remainingRows.length;

	const emptyRows =
		Array.from(
			{
				length:
					clearedLines
			},
			() =>
				Array(
					BOT_BOARD_WIDTH
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

export function addBotPenaltyLines(
	board,
	count
) {
	const penaltyCount =
		Math.max(
			0,
			Math.min(
				Math.floor(
					Number(
						count
					) || 0
				),
				BOT_BOARD_HEIGHT
			)
		);

	if (
		penaltyCount === 0
	) {
		return board;
	}

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
					BOT_BOARD_WIDTH
				).fill(
					"P"
				)
		);

	return [
		...remainingBoard,
		...penaltyRows
	];
}

export function calculateBotSpectrum(
	board
) {
	return Array.from(
		{
			length:
				BOT_BOARD_WIDTH
		},
		(_, x) => {
			for (
				let y = 0;
				y <
					BOT_BOARD_HEIGHT;
				y++
			) {
				if (
					board[y][x] !==
					null
				) {
					return (
						BOT_BOARD_HEIGHT -
						y
					);
				}
			}

			return 0;
		}
	);
}