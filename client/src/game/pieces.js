export const TETRIMINOS = {
	I: [
		[1, 1, 1, 1]
	],

	O: [
		[1, 1],
		[1, 1]
	],

	T: [
		[0, 1, 0],
		[1, 1, 1]
	],

	S: [
		[0, 1, 1],
		[1, 1, 0]
	],

	Z: [
		[1, 1, 0],
		[0, 1, 1]
	],

	J: [
		[1, 0, 0],
		[1, 1, 1]
	],

	L: [
		[0, 0, 1],
		[1, 1, 1]
	]
};

export function createPiece(type) {
	return {
		type,
		shape: TETRIMINOS[type],
		x: 3,
		y: 0,
		rotation: 0
	};
}