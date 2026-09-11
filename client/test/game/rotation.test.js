import {
	describe,
	it,
	expect
} from "vitest";

import {
	createBoard
} from "../../src/game/board.js";

import {
	rotatePiece
} from "../../src/game/rotation.js";

describe("rotatePiece", () => {
	it("rotates a piece clockwise", () => {
		const board =
			createBoard();

		const piece = {
			type: "X",
			shape: [
				[1, 0],
				[1, 1]
			],
			x: 4,
			y: 4,
			rotation: 0
		};

		const result =
			rotatePiece(
				board,
				piece
			);

		expect(
			result.shape
		).toEqual([
			[1, 1],
			[1, 0]
		]);

		expect(
			result.rotation
		).toBe(1);
	});

	it("increments rotation", () => {
		const piece = {
			type: "X",
			shape: [[1]],
			x: 4,
			y: 4,
			rotation: 1
		};

		const result =
			rotatePiece(
				createBoard(),
				piece
			);

		expect(
			result.rotation
		).toBe(2);
	});

	it("wraps rotation from 3 back to 0", () => {
		const piece = {
			type: "X",
			shape: [[1]],
			x: 4,
			y: 4,
			rotation: 3
		};

		const result =
			rotatePiece(
				createBoard(),
				piece
			);

		expect(
			result.rotation
		).toBe(0);
	});

	it("refuses a rotation that collides with the wall", () => {
		const piece = {
			type: "I",
			shape: [
				[1],
				[1],
				[1],
				[1]
			],
			x: 8,
			y: 5,
			rotation: 0
		};

		const result =
			rotatePiece(
				createBoard(),
				piece
			);

		expect(
			result
		).toBe(piece);
	});

	it("refuses a rotation into an occupied cell", () => {
		const board =
			createBoard();

		board[4][5] = "Z";

		const piece = {
			type: "X",
			shape: [
				[1, 0],
				[1, 1]
			],
			x: 4,
			y: 4,
			rotation: 0
		};

		const result =
			rotatePiece(
				board,
				piece
			);

		expect(
			result
		).toBe(piece);
	});

	it("does not mutate the original piece", () => {
		const piece = {
			type: "X",
			shape: [
				[1, 0],
				[1, 1]
			],
			x: 4,
			y: 4,
			rotation: 0
		};

		rotatePiece(
			createBoard(),
			piece
		);

		expect(
			piece.rotation
		).toBe(0);

		expect(
			piece.shape
		).toEqual([
			[1, 0],
			[1, 1]
		]);
	});
});