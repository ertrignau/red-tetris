import { hasCollision } from "./collision.js";

function rotateShape(shape) {
	const height = shape.length;
	const width = shape[0].length;

	const rotated = Array.from(
		{ length: width },
		() => Array(height).fill(0)
	);

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			rotated[x][height - 1 - y] = shape[y][x];
		}
	}

	return rotated;
}

export function rotatePiece(board, piece) {
	const rotatedShape = rotateShape(piece.shape);

	const rotatedPiece = {
		...piece,
		shape: rotatedShape,
		rotation: (piece.rotation + 1) % 4
	};

	if (hasCollision(board, rotatedPiece))
		return piece;

	return rotatedPiece;
}
