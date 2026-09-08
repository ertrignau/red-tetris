import {
	TETRIMINOS
} from "../../../shared/constants.js";

export {
	TETRIMINOS
};

export function createPiece(type) {
	return {
		type,

		shape:
			TETRIMINOS[
				type
			],

		x: 3,
		y: 0,

		rotation: 0
	};
}