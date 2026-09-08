function getColumnHeight(
	board,
	x
) {
	for (
		let y = 0;
		y < board.length;
		y++
	) {
		if (
			board[y][x] !==
			null
		) {
			return (
				board.length -
				y
			);
		}
	}

	return 0;
}

function countHoles(
	board
) {
	let holes =
		0;

	for (
		let x = 0;
		x < board[0].length;
		x++
	) {
		let blockSeen =
			false;

		for (
			let y = 0;
			y < board.length;
			y++
		) {
			if (
				board[y][x] !==
				null
			) {
				blockSeen =
					true;

				continue;
			}

			if (
				blockSeen
			) {
				holes++;
			}
		}
	}

	return holes;
}

function getAggregateHeight(
	board
) {
	let total =
		0;

	for (
		let x = 0;
		x < board[0].length;
		x++
	) {
		total +=
			getColumnHeight(
				board,
				x
			);
	}

	return total;
}

function getBumpiness(
	board
) {
	const heights =
		Array.from(
			{
				length:
					board[0].length
			},
			(_, x) =>
				getColumnHeight(
					board,
					x
				)
		);

	let bumpiness =
		0;

	for (
		let i = 0;
		i <
			heights.length - 1;
		i++
	) {
		bumpiness +=
			Math.abs(
				heights[i] -
				heights[
					i + 1
				]
			);
	}

	return bumpiness;
}

export function evaluateBotBoard({
	board,
	clearedLines,
	weights
}) {
	const holes =
		countHoles(
			board
		);

	const height =
		getAggregateHeight(
			board
		);

	const bumpiness =
		getBumpiness(
			board
		);

	return (
		clearedLines *
			weights.lines +
		holes *
			weights.holes +
		height *
			weights.height +
		bumpiness *
			weights.bumpiness
	);
}