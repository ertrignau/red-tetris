export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export function createBoard() {
	return Array.from(
		{ length: BOARD_HEIGHT },
		() => Array(BOARD_WIDTH).fill(null)
	);
}

export function lockPiece(board, piece) {
	const nextBoard = board.map((row) => [...row]);

	piece.shape.forEach((row, y) => {
		row.forEach((cell, x) => {
			if (!cell)
				return;

			const boardX = piece.x + x;
			const boardY = piece.y + y;

			if (
				boardY >= 0 &&
				boardY < nextBoard.length &&
				boardX >= 0 &&
				boardX < nextBoard[0].length
			) {
				nextBoard[boardY][boardX] = piece.type;
			}
		});
	});

	return nextBoard;
}