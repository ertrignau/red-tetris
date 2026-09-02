export function clearLines(board) {
	const width = board[0].length;

	const remainingRows = board.filter((row) =>
		row.some((cell) => cell === null)
	);

	const clearedLines = board.length - remainingRows.length;

	const emptyRows = Array.from(
		{ length: clearedLines },
		() => Array(width).fill(null)
	);

	return {
		board: [
			...emptyRows,
			...remainingRows
		],
		clearedLines
	};
}