export function hasCollision(board, piece) {
	const { shape, x, y } = piece;

	for (let row = 0; row < shape.length; row++) {
		for (let col = 0; col < shape[row].length; col++) {
			if (!shape[row][col])
				continue;

			const boardX = x + col;
			const boardY = y + row;

			if (
				boardX < 0 ||
				boardX >= board[0].length ||
				boardY >= board.length
			) {
				return true;
			}

			if (
				boardY >= 0 &&
				board[boardY][boardX] !== null
			) {
				return true;
			}
		}
	}

	return false;
}