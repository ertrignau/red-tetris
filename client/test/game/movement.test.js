import {
	describe,
	it,
	expect
} from "vitest";

import {
	createBoard
} from "../../src/game/board.js";

import {
	movePiece,
	moveLeft,
	moveRight,
	moveDown
} from "../../src/game/movement.js";

describe("movement", () => {
	const createTestPiece = () => ({
		type: "X",
		shape: [[1]],
		x: 4,
		y: 5
	});

	it("moves a piece with dx and dy", () => {
		const board =
			createBoard();

		const piece =
			createTestPiece();

		const result =
			movePiece(
				board,
				piece,
				1,
				1
			);

		expect(result.x).toBe(5);
		expect(result.y).toBe(6);
	});

	it("moves a piece left", () => {
		const result =
			moveLeft(
				createBoard(),
				createTestPiece()
			);

		expect(result.x).toBe(3);
		expect(result.y).toBe(5);
	});

	it("moves a piece right", () => {
		const result =
			moveRight(
				createBoard(),
				createTestPiece()
			);

		expect(result.x).toBe(5);
		expect(result.y).toBe(5);
	});

	it("moves a piece down", () => {
		const result =
			moveDown(
				createBoard(),
				createTestPiece()
			);

		expect(result.x).toBe(4);
		expect(result.y).toBe(6);
	});

	it("does not mutate the original piece", () => {
		const piece =
			createTestPiece();

		moveRight(
			createBoard(),
			piece
		);

		expect(piece.x).toBe(4);
		expect(piece.y).toBe(5);
	});

	it("does not move through the left wall", () => {
		const piece = {
			...createTestPiece(),
			x: 0
		};

		const result =
			moveLeft(
				createBoard(),
				piece
			);

		expect(result).toBe(piece);
	});

	it("does not move through the right wall", () => {
		const piece = {
			...createTestPiece(),
			x: 9
		};

		const result =
			moveRight(
				createBoard(),
				piece
			);

		expect(result).toBe(piece);
	});

	it("does not move below the board", () => {
		const piece = {
			...createTestPiece(),
			y: 19
		};

		const result =
			moveDown(
				createBoard(),
				piece
			);

		expect(result).toBe(piece);
	});

	it("does not move into an occupied cell", () => {
		const board =
			createBoard();

		board[5][5] = "I";

		const piece =
			createTestPiece();

		const result =
			moveRight(
				board,
				piece
			);

		expect(result).toBe(piece);
	});
});