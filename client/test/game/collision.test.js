import {
	describe,
	it,
	expect
} from "vitest";

import {
	createBoard
} from "../../src/game/board.js";

import {
	hasCollision
} from "../../src/game/collision.js";

describe("hasCollision", () => {
	const createTestPiece = () => ({
		type: "X",
		shape: [[1]],
		x: 4,
		y: 5
	});

	it("returns false when the piece is in a valid position", () => {
		const board =
			createBoard();

		const piece =
			createTestPiece();

		expect(
			hasCollision(
				board,
				piece
			)
		).toBe(false);
	});

	it("detects collision with the left wall", () => {
		const board =
			createBoard();

		const piece = {
			...createTestPiece(),
			x: -1
		};

		expect(
			hasCollision(
				board,
				piece
			)
		).toBe(true);
	});

	it("detects collision with the right wall", () => {
		const board =
			createBoard();

		const piece = {
			...createTestPiece(),
			x: 10
		};

		expect(
			hasCollision(
				board,
				piece
			)
		).toBe(true);
	});

	it("detects collision with the bottom", () => {
		const board =
			createBoard();

		const piece = {
			...createTestPiece(),
			y: 20
		};

		expect(
			hasCollision(
				board,
				piece
			)
		).toBe(true);
	});

	it("allows a piece to be partially above the board", () => {
		const board =
			createBoard();

		const piece = {
			...createTestPiece(),
			y: -1
		};

		expect(
			hasCollision(
				board,
				piece
			)
		).toBe(false);
	});

	it("detects collision with an occupied cell", () => {
		const board =
			createBoard();

		board[5][4] = "T";

		const piece =
			createTestPiece();

		expect(
			hasCollision(
				board,
				piece
			)
		).toBe(true);
	});

	it("ignores empty cells in the piece shape", () => {
		const board =
			createBoard();

		board[5][4] = "T";

		const piece = {
			type: "X",
			shape: [[0, 1]],
			x: 4,
			y: 5
		};

		expect(
			hasCollision(
				board,
				piece
			)
		).toBe(false);
	});

	it("detects collision with a penalty block", () => {
		const board =
			createBoard();

		board[5][4] = "P";

		const piece =
			createTestPiece();

		expect(
			hasCollision(
				board,
				piece
			)
		).toBe(true);
	});
});