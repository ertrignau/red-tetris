export function calculateSpectrum(board) {
	if (!board || board.length === 0)
		return [];

	const height = board.length;
	const width = board[0].length;

	return Array.from(
		{ length: width },
		(_, x) => {
			for (let y = 0; y < height; y++) {
				if (board[y][x] !== null) {
					return height - y;
				}
			}

			return 0;
		}
	);
}