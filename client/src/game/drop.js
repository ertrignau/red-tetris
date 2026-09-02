import { hasCollision } from "./collision.js";

export function hardDrop(board, piece) {
	let droppedPiece = {
		...piece
	};

	while (true) {
		const nextPiece = {
			...droppedPiece,
			y: droppedPiece.y + 1
		};

		if (hasCollision(board, nextPiece))
			break;

		droppedPiece = nextPiece;
	}

	return droppedPiece;
}