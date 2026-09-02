import { hasCollision } from "./collision.js";

export function movePiece(board, piece, dx, dy) {
	const nextPiece = {
		...piece,
		x: piece.x + dx,
		y: piece.y + dy
	};

	if (hasCollision(board, nextPiece))
		return piece;

	return nextPiece;
}

export function moveLeft(board, piece) {
	return movePiece(board, piece, -1, 0);
}

export function moveRight(board, piece) {
	return movePiece(board, piece, 1, 0);
}

export function moveDown(board, piece) {
	return movePiece(board, piece, 0, 1);
}
