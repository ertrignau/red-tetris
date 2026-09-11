import {
	describe,
	it,
	expect
} from "vitest";

import {
	TETRIMINOS,
	createPiece
} from "../../src/game/pieces.js";

describe("createPiece", () => {
	it("creates a piece with the requested type", () => {
		const type =
			Object.keys(
				TETRIMINOS
			)[0];

		const piece =
			createPiece(type);

		expect(
			piece.type
		).toBe(type);
	});

	it("uses the correct tetrimino shape", () => {
		const type =
			Object.keys(
				TETRIMINOS
			)[0];

		const piece =
			createPiece(type);

		expect(
			piece.shape
		).toBe(
			TETRIMINOS[type]
		);
	});

	it("spawns the piece at the expected position", () => {
		const type =
			Object.keys(
				TETRIMINOS
			)[0];

		const piece =
			createPiece(type);

		expect(piece.x).toBe(3);
		expect(piece.y).toBe(0);
	});

	it("starts with rotation zero", () => {
		const type =
			Object.keys(
				TETRIMINOS
			)[0];

		const piece =
			createPiece(type);

		expect(
			piece.rotation
		).toBe(0);
	});

	it("exports tetrimino definitions", () => {
		expect(
			Object.keys(
				TETRIMINOS
			).length
		).toBeGreaterThan(0);
	});
});